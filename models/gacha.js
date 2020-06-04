/* Gacha model */
'use strict';
const log = console.log

const { minGachaNameLength, maxGachaNameLength, maxGachaDescLength, maxStatsLength } = require('../client/src/constants');

const user = require("./user");
const { Chara } = require("./chara");

const mongoose = require('mongoose');
const { ObjectID } = require("mongodb");

const GachaSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
        minlength: minGachaNameLength,
        maxlength: maxGachaNameLength,
		trim: true,
		unique: true,
	},
	desc: { //short description of gacha
		type: String,
        trim: true,
        maxlength: maxGachaDescLength
    }, 
    coverPic: { //title pic of gacha on summon page
		data: Buffer, 
        contentType: String
    },
    iconPic: { //icon pic of gacha on lists
		data: Buffer, 
        contentType: String
    },
    stats: { //stats to compare the characters in gacha
		type: Array,
		default: [],
		validate: [arrayLimit, '{PATH} exceeds the limit of ' + maxStatsLength]
    }, 
	threeStars: { //id list of charas w 3 stars
		type: Array,
		default: []
	},
	fourStars: { //id list of charas w 4 stars
		type: Array,
		default: []
	},
	fiveStars: { //id list of charas w 5 stars
		type: Array,
		default: []
	},
	creator: { //creator of gacha
        type: ObjectID
    }
});

function arrayLimit(val) {
	return val.length <= maxStatsLength;
}

// make a model using the Gacha schema
const Gacha = mongoose.model('Gacha', GachaSchema, 'Gachas')
exports.Gacha = Gacha;

/* Gacha resource API methods *****************/
exports.createGacha = function(req, res) {
    //create new gacha with Gacha model
    const gacha = new Gacha({
        name: req.body.name,
        desc: req.body.desc,
        coverPic: req.body.coverPic,
        iconPic: req.body.iconPic,
        stats: req.body.stats,
        threeStars: req.body.threeStars,
        fourStars: req.body.fourStars,
        fiveStars: req.body.fiveStars,
        creator: req.body.creator
    });

    // Save gacha to the database
    gacha.save().then(
        gacha => {
			const update = { ownGachas: gacha._id }
			user.User.findByIdAndUpdate(req.body.creator, { $push: update }, { new: true }).then((user) => {
				if (!user) {
					res.status(404).send();
				} else {
					res.status(200).send({gacha: gacha, user: user});
				}
			}).catch((err) => {
				res.status(500).send(err);
			});
        },
        err => {
            res.status(400).send(err); // 400 for bad request
        }
    );
};

exports.getAllGachas = function(req, res) {
    Gacha.find().then(
        result => {
            log();
            res.status(200).send({ result }); // can wrap in object if want to add more properties
        },
        err => {
            res.status(500).send(err); // server error
        }
    );
};

exports.getGachaById = function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    // Otherwise, findById
    Gacha.findById(id)
        .then(result => {
            if (!result) {
                res.status(404).send(); // could not find this gacha
            } else {
                if (req.body.purpose) {
					if (req.body.purpose === constant.displayPurpose) req.session.gachaDisplayed = id;
				} 
                res.status(200).send(result);
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error
        });
};

exports.updateGachaInfo = function(req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    const reqBody = cleanGachaUpdateReq(req, false);

    Gacha.findByIdAndUpdate(id, { $set: reqBody }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.pushGachaInfo = function(req, res) {
	if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    const reqBody = cleanGachaUpdateReq(req, true);

    Gacha.findByIdAndUpdate(id, { $push: reqBody }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.deleteGacha = function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    // Delete a gacha by their id
    Gacha.findByIdAndRemove(id)
        .then(gacha => {
            if (!gacha) {
                res.status(404).send();
            } else {
				const update = { ownGachas: gacha._id }
				user.User.findByIdAndUpdate(gacha.creator, { $pull: update }, { new: true }).then((user) => {
					if (!user) {
						res.status(404).send();
					} else {
						Chara.deleteMany({gacha: id}).then((chara) => {
							res.status(200).send({gacha: gacha, 
								user: user, 
								charasDeleted: chara});
						});
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

/*Helpers */
function cleanGachaUpdateReq(req, push) {
    const reqBody = {};
    if (req.body) {
		if (req.body.stats) reqBody.stats = req.body.stats;
        if (req.body.threeStars) reqBody.threeStars = req.body.threeStars;
        if (req.body.fourStars) reqBody.fourStars = req.body.fourStars;
		if (req.body.fiveStars) reqBody.fiveStars = req.body.fiveStars;
		
		if (!push) {
			if (req.body.name) reqBody.name = req.body.name;
			if (req.body.desc) reqBody.desc = req.body.desc;
			if (req.body.coverPic) reqBody.coverPic = req.body.coverPic;
			if (req.body.iconPic) reqBody.iconPic = req.body.iconPic;
			if (req.body.creator) reqBody.creator = req.body.creator;
		}
    }
    return reqBody;
};