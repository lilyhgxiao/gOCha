/* Chara model */
'use strict';
const log = console.log

const { minCharaNameLength, maxCharaNameLength, maxCharaDescLength, 
    maxStatsLength, maxWelcPhrLength, maxSummPhrLength } = require('./../constants');

const user = require("./user");
const gacha = require("./gacha");

const mongoose = require('mongoose')
const { ObjectID } = require("mongodb");

const CharaSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
        minlength: minCharaNameLength,
        maxlength: maxCharaNameLength,
		trim: true
    },
    rarity: {
        type: Number,
        enum: [3, 4, 5]
    },
	desc: { //short description of chara
		type: String,
        trim: true,
        maxlength: maxCharaDescLength
    }, 
    mainPic: { //title pic of chara on summon page
		data: Buffer, 
        contentType: String
    },
    iconPic: { //icon pic of chara on lists
		data: Buffer, 
        contentType: String
    },
    stats: { //stats to compare the characters in gacha
		type: Array,
		default: [0] * maxStatsLength
    },
    welcomePhrase: {
        type: String,
        maxlength: maxWelcPhrLength
    }, 
    summonPhrase: {
        type: String,
        maxlength: maxSummPhrLength
    }, 
    gacha: { //gacha the chara can be summoned from
        type: ObjectID
    },
	creator: { //creator of chara
        type: ObjectID
    }
});


// make a model using the Chara schema
const Chara = mongoose.model('Chara', CharaSchema, 'Charas');
exports.Chara = Chara;

/* Chara resource API methods *****************/

exports.createChara = function(req, res) {
    const id = req.params.id;

    //create a new Chara
    const chara = new Chara({
        name: req.body.name, 
        rarity: req.body.rarity,
        desc: req.body.desc,
        mainPic: req.body.mainPic,
        iconPic: req.body.iconPic,
        stats: req.body.stats,
        gacha: mongoose.Types.ObjectId(id),
        creator: mongoose.Types.ObjectId(req.body.creator)
    })

    //Save the chara
    chara.save().then(
        chara => {
            const update = {};
            if (chara.rarity == 3) {
                update.threeStars = chara._id;
            } else if (chara.rarity == 4) {
                update.fourStars = chara._id;
            } else if (chara.rarity == 5) {
                update.fiveStars = chara._id;
            } else {
                res.status(400).send();
            }
			gacha.Gacha.findByIdAndUpdate(id, { $push: update }, { new: true }).then((gacha) => {
				if (!gacha) {
					res.status(404).send();
				} else {
					res.status(200).send({chara: chara, gacha: gacha});
				}
			}).catch((err) => {
				res.status(500).send(err);
			});
            res.status(200).send(result);
        },
        err => {
            res.status(500).send(err);
        }
    )
};

exports.getCharasByGacha = function(req, res) {
    const id = req.params.id; 
    
    //check for a valid mongodb id
     if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

     Chara.find({ gacha: id }).then(
        result => {
             res.status(200).send({ result });
        },
        err => {
            res.status(400).send(err)
        }
     );
};

exports.getCharaById = function(req, res) {
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    Chara.findById(id).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.updateCharaInfo = function (req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    const reqBody = cleanCharaUpdateReq(req, false);

    Chara.findByIdAndUpdate(id, { $set: reqBody }, { new: true }).then((chara) => {
        if (!chara) {
            res.status(404).send();
        } else {
            if (req.body.oldRarity !== chara.rarity) {
                const toDelete = { threeStars: id, fourStars: id, fiveStars: id};
                const update = {};
                if (chara.rarity == 3) {
                    update.threeStars = id;
                } else if (chara.rarity == 4) {
                    update.fourStars = id;
                } else if (chara.rarity == 5) {
                    update.fiveStars = id;
                } else {
                    res.status(400).send();
                }
                gacha.Gacha.findByIdAndUpdate(chara.gacha, { $pull: toDelete }, { new: true }).then((gacha1) => {
					if (!gacha1) {
						res.status(404).send();
					} else {
                        gacha.Gacha.findByIdAndUpdate(chara.gacha, { $push: update }, { new: true }).then((gacha2) => {
                            if (!gacha2) {
                                res.status(404).send();
                            } else {
                                res.status(200).send({chara: chara, gacha: gacha2});
                            }
                        }).catch((err) => {
                            res.status(500).send(err);
                        });
					}
				}).catch((err) => {
					res.status(500).send(err);
				});
            } else {
                res.status(200).send(chara);
            }
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.pushCharaInfo = function (req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    const reqBody = cleanCharaUpdateReq(req, true);

    Chara.findByIdAndUpdate(id, { $push: reqBody }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.deleteChara = function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    // Delete a chara by their id
    Chara.findByIdAndRemove(id)
        .then(chara => {
            if (!chara) {
                res.status(404).send();
            } else {
                const update = {};
                if (chara.rarity == 3) {
                    update.threeStars = chara._id;
                } else if (chara.rarity == 4) {
                    update.fourStars = chara._id;
                } else if (chara.rarity == 5) {
                    update.fiveStars = chara._id;
                } else {
                    res.status(400).send();
                }
                gacha.Gacha.findByIdAndUpdate(chara.gacha, { $pull: update }, { new: true }).then((gacha1) => {
					if (!gacha1) {
						res.status(404).send();
					} else {
						res.status(200).send({chara: chara, gacha: gacha1});
					}
				}).catch((err) => {
					res.status(500).send(err);
				});
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error, could not delete.
        });
};

/* Helpers */
function cleanCharaUpdateReq(req, push) {
    const reqBody = {};
    if (req.body) {
        if (req.body.stats) reqBody.stats = req.body.stats;

        if (!push) {
            if (req.body.name) reqBody.name = req.body.name;
            if (req.body.rarity) reqBody.rarity = req.body.rarity;
            if (req.body.desc) reqBody.desc = req.body.desc;
            if (req.body.mainPic) reqBody.mainPic = req.body.mainPic;
            if (req.body.iconPic) reqBody.iconPic = req.body.iconPic;
            if (req.body.gacha) reqBody.gacha = req.body.gacha;
            if (req.body.creator) reqBody.creator = req.body.creator;
        }
    }
    return reqBody;
};