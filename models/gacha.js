/* Gacha model */
'use strict';
const log = console.log

const { minGachaNameLength, maxGachaNameLength, maxGachaDescLength, 
    maxStatsLength } = require('../client/src/constants');

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
        validate: [statsLimit, '{PATH} exceeds the limit of ' + maxStatsLength],
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

function statsLimit(val) {
	return val.length <= maxStatsLength;
}

// make a model using the Gacha schema
const Gacha = mongoose.model('Gacha', GachaSchema, 'Gachas')

/* Gacha resource API methods *****************/
exports.createGacha = async function(req, res) {
    if (!req.session.user) {
        //not logged in
        res.status(401).send({ gacha: null, err: "createGacha failed: session can't be found"}); 
        return;
    }

    //create new gacha with Gacha model
    const gachaBody = cleanNewGachaBody(req);
    if (!gachaBody.name) {
        res.status(400).send({ gacha: null, err: "createGacha failed: gacha requires a name"});
        return;
    } 
    if (!gachaBody.creator)  {
        res.status(400).send({ gacha: null, err: "createGacha failed: gacha requires a creator"});
        return;
    } 
    const gacha = new Gacha(gachaBody);

    try {
        if (!ObjectID.isValid(req.body.creator)) {
            res.status(404).send({ gacha: null, 
                err: "createGacha failed: mongodb id not valid"}); //check for a valid mongodb id
        }
        //check if the creator exists
        const user = await userModel.User.findById(req.body.creator).exec();
        if (!user) {
            res.status(404).send({ gacha: null, err: "createGacha failed: could not find creator"});
            return;
        } 
        //check if user is allowed to create gacha
        if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ gacha: null, 
                err: "createGacha failed: user does not have permissions"}); // unauthorized
            return;
        }
        //save the gacha
        const newGacha = await gacha.save();

        //send result
        res.status(200).send({gacha: newGacha, err: null});

    } catch(err) {
        res.status(500).send({ gacha: null, err: "createGacha failed: " + err }); // server error
    }

};

exports.getAllGachas = function(req, res) {
    Gacha.find().then(
        result => {
            res.status(200).send({ gachas: result, err: null });
        },
        err => {
            res.status(500).send({ gachas: null, err: "getAllGachas failed: " + err }); // server error
        }
    );
};

exports.getGachaById = function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send({ gacha: null, err: "getGachaById failed: mongodb id not valid"}); //not found error
    }

    // Otherwise, findById
    Gacha.findById(id)
        .then(result => {
            if (!result) {
                res.status(404).send({ gacha: null, 
                    err: "getGachaById failed: could not find creator"}); // could not find this gacha
            } else {
                //send result
                res.status(200).send({ gacha: result, err: null });
            }
        })
        .catch(err => {
            res.status(500).send({ gacha: null, err: "getGachaById failed: " + err }); // server error
        });
};

exports.getGachasByCreator = function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send({ gacha: null, 
            err: "getGachasByCreator failed: mongodb id not valid"}); //send 404 not found error if id is invalid
    }

    Gacha.find({ creator: id }).then(
        result => {
            res.status(200).send({ gachas: result, err: null });
        },
        err => {
            res.status(500).send({ gachas: null, err: "getGachasByCreator failed: " + err }); // server error
        }
    );
}

exports.updateGachaInfo = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send({ gacha: null, 
            err: "updateGachaInfo failed: session can't be found"}); //send 401 unauthorized error if not logged in
        return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) {
        res.status(404).send({ gacha: null, 
            err: "updateGachaInfo failed: mongodb id not valid"}); //send 404 not found error if id is invalid
    }

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send({ gacha: null, 
                err: "updateGachaInfo failed: could not find gacha"}); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ gacha: null, 
                err: "updateGachaInfo failed: user does not have permissions"}); // unauthorized
            return;
        }

        //edit gacha
        if (req.body.active) gacha.active = req.body.active;
        if (req.body.name) gacha.name = req.body.name;
        if (req.body.desc) gacha.desc = req.body.desc;
        if (req.body.coverPic) gacha.coverPic = req.body.coverPic;
        if (req.body.iconPic) gacha.iconPic = req.body.iconPic;
        if (req.body.creator) {
            const user = await userModel.User.findById(req.body.creator).exec();
            if (!user) {
                res.status(404).send({ gacha: null, err: "updateGachaInfo failed: could not find creator"});
                return;
            }
            gacha.creator = req.body.creator;
        }

        //save gacha to database
        const result = await gacha.save();
        //send result
        res.status(200).send({ gacha: result, err: null});

    } catch(err) {
        res.status(500).send({ gacha: null, err: "updateGachaInfo failed: " + err });
    }
};

/**TODO: may delete this as it is not used anywhere yet */
exports.pushGachaInfo = async function(req, res) {
	if (!req.session.user) {
        res.status(401).send({ gacha: null, 
            err: "pushGachaInfo failed: session can't be found"}); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) {
        res.status(404).send({ gacha: null, 
            err: "pushGachaInfo failed: mongodb id not valid"}); //send 404 not found error if id is invalid
    }

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send({ gacha: null, 
                err: "pushGachaInfo failed: could not find gacha"}); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ gacha: null, 
                err: "pushGachaInfo failed: user does not have permissions"}); // unauthorized
            return;
        }

        //edit gacha
        if (req.body.stats) gacha.stats.push(req.body.stats);

        //save gacha to database
        const result = await gacha.save();
        
        //send result
        res.status(200).send({ gacha: result, err: err });
    } catch (err) {
        res.status(500).send({ gacha: null, err: "pushGachaInfo failed: " + err });
    }
};

exports.addStats = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send({ gacha: null, charaWriteResult: null, 
            err: "addStats failed: session can't be found"}); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) {
        res.status(404).send({ gacha: null, charaWriteResult: null, 
            err: "addStats failed: mongodb id not valid"}); //send 404 not found error if id is invalid
    }

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send({ gacha: null, charaWriteResult: null, 
                err: "addStats failed: could not find gacha"}); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ gacha: null, charaWriteResult: null, 
                err: "addStats failed: user does not have permissions"}); // unauthorized
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
        } else {
            res.status(400).send({ gacha: null, charaWriteResult: null, 
                err: "addStats failed: no stats in request body"}); // unauthorized
            return;
        }

        //save stat to gacha
        const result = await gacha.save();
        //save stat to all characters in gacha
        const writeResult = await charaModel.Chara.updateMany({gacha: id}, {$push: charaUpdateQuery}).exec();
        res.status(200).send({gacha: result, charaWriteResult: writeResult, err: null});

    } catch (err) {
        res.status(500).send({ gacha: null, charaWriteResult: null, err: "addStats failed: " + err});
    }

};

exports.updateStat = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send({ gacha: null, charaWriteResult: null,
             err: "updateStat failed: session can't be found"}); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) {
        res.status(404).send({ gacha: null, charaWriteResult: null,
             err: "updateStat failed: mongodb id not valid"}); //send 404 not found error if id is invalid
        return;
    }

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send({ gacha: null, charaWriteResult: null, 
                err: "updateStat failed: could not find gacha"}); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ gacha: null, charaWriteResult: null, 
                err: "updateStat failed: user does not have permissions"}); // unauthorized
            return;
        }

        //prepare to update stat for characters and gacha
        const charaUpdateQuery = { "stats.$.name": "" };
        if (req.body.stats) {
            charaUpdateQuery["stats.$.name"] = req.body.stats.name;
            /**TODO: if stat doesnt exist, send 404 error */
            const statIndex = gacha.stats.findIndex(stat => stat._id.toString() === req.body.stats._id.toString());
            gacha.stats[statIndex].name = req.body.stats.name;
        } else {
            res.status(400).send({ gacha: null, charaWriteResult: null, 
                err: "updateStat failed: no stats in request body"}); // unauthorized
            return;
        }

        //save stat to gacha
        const result = await gacha.save();
        //save stat to all characters in gacha
        const writeResult = await charaModel.Chara.updateMany({
            gacha: id,
            "stats._id": req.body.stats._id
        }, { $set: charaUpdateQuery }).exec();
        res.status(200).send({gacha: result, charaWriteResult: writeResult, err: null});

    } catch (err) {
        res.status(500).send({ gacha: null, charaWriteResult: null, err: "updateStat failed: " + err});
    }
};

exports.deleteStats = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send({ gacha: null, charaWriteResult: null, 
            err: "deleteStats failed: session can't be found"}); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) {
        res.status(404).send({ gacha: null, charaWriteResult: null, 
            err: "deleteStats failed: mongodb id not valid"}); //send 404 not found error if id is invalid
    }

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send({ gacha: null, charaWriteResult: null, 
                err: "deleteStats failed: could not find gacha"}); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ gacha: null, charaWriteResult: null, 
                err: "deleteStats failed: user does not have permissions"}); // unauthorized
            return;
        }

        //prepare to delete stat from characters and gacha
        const charaUpdateQuery = {};
        if (req.body.stats) {
            charaUpdateQuery["stats"] = { _id: { $in: req.body.stats } };
            req.body.stats.forEach(statToDelete => { 
                gacha.stats = gacha.stats.filter(stat => statToDelete._id.toString() !== stat._id.toString()) 
            });
        } else {
            res.status(400).send({ gacha: null, charaWriteResult: null, 
                err: "deleteStats failed: no stats in request body"}); // unauthorized
            return;
        }

        //save gacha
        const result = await gacha.save();
        //pull stat to all characters in gacha
        const writeResult = await charaModel.Chara.updateMany({gacha: id}, {$pull: charaUpdateQuery }).exec();
        res.status(200).send({gacha: result, charaWriteResult: writeResult, err: null});

    } catch (err) {
        res.status(500).send({ gacha: null, charaWriteResult: null, err: "deleteStats failed: " + err});
    }

};

exports.deleteGacha = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send({ gacha: null, charasDeleted: null, 
            err: "deleteGacha failed: session can't be found",
            usersUpdated: {
				inventory: null, 
                favGachas: null
            }}); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        res.status(404).send({ gacha: null, charasDeleted: null, 
            err: "deleteGacha failed: mongodb id not valid",
            usersUpdated: {
				inventory: null, 
                favGachas: null
            }}); //send 404 not found error if id is invalid
    }

    try {
        //find gacha by id
        const gacha = await Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send({ gacha: null, charasDeleted: null, 
                err: "deleteGacha failed: could not find gacha",
                usersUpdated: {
                    inventory: null, 
                    favGachas: null
                }}); // could not find this gacha
            return;
        }

        //if current user on session does not match creator on gacha to be edited, AND the user is not an admin
        if (gacha.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ gacha: null, charasDeleted: null, 
                err: "deleteGacha failed: user does not have permissions",
                usersUpdated: {
                    inventory: null, 
                    favGachas: null
                }}); // unauthorized
            return;
        }

        //remove gacha
        const result = await gacha.remove();

        //delete all characters belonging to the gacha
        const chara = await charaModel.Chara.deleteMany({gacha: id}).exec();
        //pull all characters belonging to the gacha from the inventories of users
        const usersInventory = await userModel.User.updateMany(
            {"inventory.gacha": id }, 
            { $pull: {"inventory": { "gacha": id }} 
        }).exec();
        //pull gacha from all favGacha lists of users
        const usersFavGachas = await userModel.User.updateMany(
            {"favGachas._id": id }, 
            { $pull: {"favGachas": { "_id": id }} 
        }).exec();

        //send result
        res.status(200).send({gacha: result, charasDeleted: chara, err: null,
            usersUpdated: {
				inventory: usersInventory, 
                favGachas: usersFavGachas
            }});

    } catch (err) {
        console.log(err);
        res.status(500).send({ gacha: null, charasDeleted: null, 
            err: "deleteGacha failed: " + err,
            usersUpdated: {
                inventory: null, 
                favGachas: null
            }});
    }
};

exports.Gacha = Gacha;

/**Helper functions */
function cleanNewGachaBody(req) {
    const gachaBody = {};

    gachaBody.name = req.body.name || null;
    gachaBody.creator = req.body.creator || null;
    gachaBody.desc = req.body.desc || "";
    gachaBody.coverPic = req.body.coverPic || "";
    gachaBody.iconPic = req.body.iconPic || "";
    gachaBody.active = req.body.active || false;
    if (req.body.stats) {
        const stats = [];
        let i;
            for (i = 0; i < req.body.stats.length; i++) {
                let statId = mongoose.Types.ObjectId();
                stats.push({ name: req.body.stats[i], _id: statId })
        }
        gachaBody.stats = stats;
    }

    return gachaBody;
}