/* Gacha model */
'use strict';
const log = console.log

const { minGachaNameLength, maxGachaNameLength, maxGachaDescLength, maxStatsLength, s3URL } = require('../client/src/constants');

const userModel = require("./user.js");
const charaModel = require("./chara");

const mongoose = require('mongoose');
const { ObjectID } = require("mongodb");

/**TODO: delete most console.log */
/**TODO: have all catch errors send the error */
/**TODO: check that all properties respect each other */

const GachaStatSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true ,
        default: "New Stat",
    }
});

const GachaSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
        minlength: minGachaNameLength,
        maxlength: maxGachaNameLength,
		trim: true
	},
	desc: { //short description of gacha
		type: String,
        trim: true,
        maxlength: maxGachaDescLength
    }, 
    coverPic: { //title pic of gacha on summon page
        type: String,
        default: ""
    },
    iconPic: { //icon pic of gacha on lists
        type: String,
        default: ""
    },
    stats: { //stats to compare the characters in gacha
		type: [ GachaStatSchema ],
		default: [],
        validate: [arrayLimit, '{PATH} exceeds the limit of ' + maxStatsLength],
    }, 
	threeStars: { //id list of charas w 3 stars
		type: Array,
        default: [],
	},
	fourStars: { //id list of charas w 4 stars
		type: Array,
        default: [],
	},
	fiveStars: { //id list of charas w 5 stars
		type: Array,
        default: [],
	},
	creator: { //creator of gacha
        type: ObjectID,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    }
});

function arrayLimit(val) {
	return val.length <= maxStatsLength;
}

// make a model using the Gacha schema
const Gacha = mongoose.model('Gacha', GachaSchema, 'Gachas')

/* Gacha resource API methods *****************/
exports.createGacha = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
        return;
    }

    //create new gacha with Gacha model
    const gachaBody = {};

    //clean body
    gachaBody._id = mongoose.Types.ObjectId();
    if (req.body.name) {
        gachaBody.name = req.body.name;
    } else {
        res.status(400).send({message: "Failed to create gacha: A gacha requires a name."})
    }
    if (req.body.desc) gachaBody.desc = req.body.desc || "";
    if (req.body.threeStars) gachaBody.threeStars = req.body.threeStars || [];
    if (req.body.fourStars) gachaBody.fourStars = req.body.fourStars || [];
    if (req.body.fiveStars) gachaBody.fiveStars = req.body.fiveStars || [];
    if (req.body.creator)  {
        if (req.body.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }    
        gachaBody.creator = req.body.creator;
    } else {
        res.status(400).send({message: "Failed to create gacha: A gacha requires a creator."})
    }
    if (req.body.stats) {
        const stats = [];
        let i;
            for (i = 0; i < req.body.stats.length; i++) {
                let statId = mongoose.Types.ObjectId();
                stats.push({ name: req.body.stats[i], _id: statId })
        }
        gachaBody.stats = stats;
    }
    if (req.body.active) gachaBody.active = req.body.active || false;

    const gacha = new Gacha(gachaBody);

    try {
        if (!ObjectID.isValid(req.body.creator)) res.status(404).send(/**TODO: send error */); //check for a valid mongodb id
        //check if the creator exists
        const user = await userModel.User.findById(req.body.creator).exec();
        if (!user) {
            res.status(404).send(/**TODO: send error */);
            return;
        } 
        //save the gacha
        const newGacha = await gacha.save();
        
        //push the gacha onto user's own gachas
        user.ownGachas.push(newGacha._id);
        const result = await user.save();
        if (result._id.toString() === req.session.user._id.toString()) {
			req.session.user = result;
        }

        //send result
        res.status(200).send({gacha: newGacha, user: result});

    } catch(err) {
        res.status(500).send(err); // server error
    }

};

exports.getAllGachas = function(req, res) {
    Gacha.find().then(
        result => {
            res.status(200).send({ result }); // can wrap in object if want to add more properties
        },
        err => {
            res.status(500).send(err); // server error
        }
    );
};

exports.getGachaById = function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    // Otherwise, findById
    Gacha.findById(id)
        .then(result => {
            if (!result) {
                res.status(404).send(/**TODO: send error */); // could not find this gacha
            } else {
                //send result
                res.status(200).send(result);
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error
        });
};

exports.updateGachaInfo = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
        return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send(/**TODO: send error */); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }

        //edit gacha
        /**TODO: check if creator exists */
        if (req.body.threeStars) gacha.threeStars = req.body.threeStars;
        if (req.body.fourStars) gacha.fourStars = req.body.fourStars;
        if (req.body.fiveStars) gacha.fiveStars = req.body.fiveStars;
        if (req.body.active) gacha.active = req.body.active;
        if (req.body.name) gacha.name = req.body.name;
        if (req.body.desc) gacha.desc = req.body.desc;
        if (req.body.coverPic) gacha.coverPic = req.body.coverPic;
        if (req.body.iconPic) gacha.iconPic = req.body.iconPic;
        if (req.body.creator) gacha.creator = req.body.creator;

        //save gacha to database
        const result = await gacha.save();
        //send result
        res.status(200).send(result);

    } catch(err) {
        res.status(500).send(err);
    }
};

exports.pushGachaInfo = async function(req, res) {
	if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send(/**TODO: send error */); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }

        //edit gacha
        /**TODO: make sure characters in threestars, fourstars, and fivestars exist */
        if (req.body.stats) gacha.stats.push(req.body.stats);
        if (req.body.threeStars) gacha.threeStars.push(req.body.threeStars);
        if (req.body.fourStars) gacha.fourStars.push(req.body.fourStars);
        if (req.body.fiveStars) gacha.fiveStars.push(req.body.fiveStars);

        //save gacha to database
        const result = await gacha.save();
        
        //send result
        res.status(200).send(result);

    } catch (err) {
        res.status(500).send(err);
    }
};

exports.addStats = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send(/**TODO: send error */); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }

        //prepare to add new stat to characters and gacha
        const charaUpdateQuery = { stats: [] };
        if (req.body.stats) {
            let i;
            for (i = 0; i < req.body.stats.length; i++) {
                let statId = mongoose.Types.ObjectId();
                gacha.stats.push({ name: req.body.stats[i], _id: statId })
                charaUpdateQuery.stats.push({ name: req.body.stats[i], value: 0, _id: statId });
            }
        }

        //save stat to gacha
        const result = await gacha.save();
        //save stat to all characters in gacha
        const writeResult = await charaModel.Chara.updateMany({gacha: id}, {$push: charaUpdateQuery}).exec();
        res.status(200).send({gacha: result, charaWriteResult: writeResult});

    } catch (err) {
        res.status(500).send(err);
    }

};

exports.updateStat = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id) || !ObjectID.isValid(req.body._id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send(/**TODO: send error */); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }

        //prepare to update stat for characters and gacha
        const charaUpdateQuery = { "stats.$.name": "" };
        if (req.body) {
            charaUpdateQuery["stats.$.name"] = req.body.name;
            const statIndex = gacha.stats.findIndex(stat => stat._id.toString() === req.body._id.toString());
            gacha.stats[statIndex].name = req.body.name;
        } else {
            res.status(400).send(/**TODO: send error */);
            return;
        }

        //save stat to gacha
        const result = await gacha.save();
        //save stat to all characters in gacha
        const writeResult = await charaModel.Chara.updateMany({gacha: id, "stats._id": req.body._id }, {$set: charaUpdateQuery }).exec();
        res.status(200).send({gacha: result, charaWriteResult: writeResult});

    } catch (err) {
        res.status(500).send(err);
    }
};

exports.deleteStats = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send(/**TODO: send error */); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }

        //prepare to delete stat from characters and gacha
        const charaUpdateQuery = {};
        if (req.body.stats) {
            charaUpdateQuery["stats"] = { _id: { $in: req.body.stats } };
            req.body.stats.forEach(statToDelete => { gacha.stats = gacha.stats.filter(stat => statToDelete._id.toString() !== stat._id.toString()) })
        }

        //save gacha
        const result = await gacha.save();
        //pull stat to all characters in gacha
        const writeResult = await charaModel.Chara.updateMany({gacha: id}, {$pull: charaUpdateQuery }).exec();
        res.status(200).send({gacha: result, charaWriteResult: writeResult});

    } catch (err) {
        res.status(500).send(err);
    }

};

exports.deleteGacha = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send(/**TODO: send error */); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }

        //remove gacha
        const result = await gacha.remove();
        //pull gacha from ownGachas of the user
        const update = { ownGachas: gacha._id }
        const creator = await userModel.User.findByIdAndUpdate(gacha.creator, { $pull: update }, { new: true }).exec();

        //delete all characters belonging to the gacha
        const chara = await charaModel.Chara.deleteMany({gacha: id}).exec();
        //pull all characters belonging to the gacha from the inventories of users
        const usersInventory = await userModel.User.updateMany({"inventory.gacha": id }, { $pull: {"inventory": { "gacha": id }} }).exec();
        //pull gacha from all favGacha lists of users
        const usersFavGachas = await userModel.User.updateMany({"favGachas._id": id }, { $pull: {"favGachas": { "_id": id }} }).exec();
        
        if (!creator) { //if creator doesn't exist for some reason
            /**TODO: send all the other results */
            res.status(404).send(/**TODO: send error */);
            return;
        }
        /**TODO: if creator = session user, change user */

        //send result
        res.status(200).send({gacha: result, 
            creator: creator, 
            charasDeleted: chara, 
            usersUpdated: {
				inventory: usersInventory, 
                favGachas: usersFavGachas
            }});

    } catch (err) {
        res.status(500).send(err);
    }
};

exports.Gacha = Gacha;