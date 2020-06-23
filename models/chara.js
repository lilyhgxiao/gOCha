/* Chara model */
'use strict';
const log = console.log

const { minCharaNameLength, maxCharaNameLength, maxCharaDescLength, 
    maxStatsLength, maxWelcPhrLength, maxSummPhrLength } = require('../client/src/constants');

const user = require("./user");
const gacha = require("./gacha");

const mongoose = require('mongoose')
const { ObjectID } = require("mongodb");

const CharaStatSchema = mongoose.Schema({
    name: { 
        type: String, 
        req: true ,
        default: "New Stat",
    },
    value: { 
        type: Number, 
        req: true,
        enum: [ 0, 1, 2, 3, 4, 5 ],
        default: 0
    }
});

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
		type: [ CharaStatSchema ],
		default: []
    },
    welcomePhrase: {
        type: String,
        maxlength: maxWelcPhrLength,
        default: ""
    }, 
    summonPhrase: {
        type: String,
        maxlength: maxSummPhrLength,
        default: ""
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

    gacha.Gacha.findById(id).then(gacha => {
        if (!gacha) {
            res.status(404).send();
        } else {
            chara.save().then(
                chara => {
                    if (chara.rarity == 3) {
                        gacha.threeStars.push(chara._id);
                    } else if (chara.rarity == 4) {
                        gacha.fourStars.push(chara._id);
                    } else if (chara.rarity == 5) {
                        gacha.fiveStars.push(chara._id);
                    } else {
                        res.status(400).send();
                    }
                    gacha.save().then(result => {
                        res.status(200).send({chara: chara, gacha: result});
                    }).catch((err) => {
                        res.status(400).send(err);
                    })
                },
                err => {
                    res.status(500).send(err);
                }
            )
        }
    })


    //Save the chara
    
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

    Chara.findById(id).then(chara => {
        if (!chara) {
            res.status(404).send();
        } else {
            if (chara.creator != req.session.user._id && !req.session.user.isAdmin) {
                res.status(401).send(); // unauthorized
            } else {
                const oldRarity = chara.rarity;

                //clean request body
                if (req.body.name) chara.name = req.body.name;
                if (req.body.rarity) chara.rarity = req.body.rarity;
                if (req.body.desc) chara.desc = req.body.desc;
                if (req.body.stats) chara.stats = req.body.stats;
                if (req.body.mainPic) chara.mainPic = req.body.mainPic;
                if (req.body.iconPic) chara.iconPic = req.body.iconPic;
                if (req.body.gacha) chara.gacha = req.body.gacha;
                if (req.body.creator) chara.creator = req.body.creator;

                chara.save().then(newChara => {
                    if (oldRarity != newChara.rarity) {
                        gacha.Gacha.findById(newChara.gacha).then(gacha => {
                            //remove old rarity
                            if (oldRarity == 3) {
                                gacha.threeStars = gacha.threeStars.filter(charas => charas != chara._id.toString());
                            } else if (oldRarity == 4) {
                                gacha.fourStars = gacha.fourStars.filter(charas => charas != chara._id.toString())
                            } else if (oldRarity == 5) {
                                gacha.fiveStars = gacha.fiveStars.filter(charas => charas != chara._id.toString())
                            } else {
                                console.log("Error. Character has invalid rarity");
                            }
                            //add new rarity
                            if (newChara.rarity == 3) {
                                gacha.threeStars.push(chara._id);
                            } else if (newChara.rarity == 4) {
                                gacha.fourStars.push(chara._id);
                            } else if (newChara.rarity == 5) {
                                gacha.fiveStars.push(chara._id);
                            } else {
                                console.log("Error. Character has invalid rarity");
                            }

                            gacha.save().then(newGacha => {
                                res.status(200).send({chara: newChara, gacha: newGacha});
                            }).catch((err) => {
                                res.status(500).send(err);
                            })
                        }).catch((err) => {
                            res.status(500).send(err);
                        });
                    } else {
                        res.status(200).send(newChara);
                    }
                }).catch((err) => {
                    console.log(err);
                    res.status(400).send(err);
                })
            }
        }
    });
/*
    const reqBody = cleanCharaUpdateReq(req, false);
    Chara.findByIdAndUpdate(id, { $set: reqBody }, { new: true }).then((chara) => {
        if (!chara) {
            res.status(404).send();
        } else {
            if (req.body.oldRarity) {
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
            } else {
                res.status(200).send(chara);
            }
        }
            
    }).catch((err) => {
        res.status(500).send(err);
    }); */
};

exports.pushCharaInfo = function (req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    Chara.findById(id).then(chara => {
        if (!chara) {
            res.status(404).send();
        } else {
            if (chara.creator != req.session.user._id && !req.session.user.isAdmin) {
                res.status(401).send(); // unauthorized
            } else {
                //clean request body
                if (req.body.stats) chara.stats,push(req.body.stats);

                chara.save().then(result => {
                    res.status(200).send(result);
                }).catch((err) => {
                    res.status(400).send(err);
                })
            }
        }
    });
    /*

    const reqBody = cleanCharaUpdateReq(req, true);

    Chara.findByIdAndUpdate(id, { $push: reqBody }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });*/
};

exports.deleteChara = function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    // Delete a chara by their id
    Chara.findById(id).then(chara => {
        if (!chara) {
            res.status(404).send();
        } else {
            if (chara.creator != req.session.user._id && !req.session.user.isAdmin) {
                res.status(401).send(); // unauthorized
            } else {
                chara.remove().then(chara => {
                    gacha.Gacha.findById(chara.gacha).then(gacha => {
                        //remove old rarity
                        if (chara.rarity == 3) {
                            gacha.threeStars = gacha.threeStars.filter(charas => charas != chara._id.toString());
                        } else if (chara.rarity == 4) {
                            gacha.fourStars = gacha.fourStars.filter(charas => charas != chara._id.toString())
                        } else if (chara.rarity == 5) {
                            gacha.fiveStars = gacha.fiveStars.filter(charas => charas != chara._id.toString())
                        } else {
                            console.log("Error. Character has invalid rarity");
                        }
                        console.log(gacha);
                        gacha.save().then(newGacha => {
                            user.User.updateMany({"inventory._id": chara._id }, { $pull: {"inventory": { "_id": chara._id }} }).then((users) => {
                                res.status(200).send({chara: chara, gacha: newGacha, usersUpdated: users});
                            });
                        }).catch((err) => {
                            res.status(500).send(err);
                        })
                    }).catch((err) => {
                        res.status(500).send(err);
                    });
                }).catch((err) => {
                    res.status(400).send(err);
                })
            }
        }
    });
    /*
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
                        user.User.updateMany({"inventory._id": id }, { $pull: {"inventory": { "_id": id }} }).then((users) => {
                            res.status(200).send({chara: chara, gacha: gacha1, usersUpdated: users});
                        });
					}
				}).catch((err) => {
					res.status(500).send(err);
				});
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error, could not delete.
        });*/
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