/* Chara model */
'use strict';
const log = console.log

const { minCharaNameLength, maxCharaNameLength, maxCharaDescLength, 
    maxStatsLength, maxWelcPhrLength, maxSummPhrLength, summonCost } = require('../client/src/constants');

const userModel = require("./user");
const gachaModel = require("./gacha");

const mongoose = require('mongoose')
const { ObjectID } = require("mongodb");

/**TODO: delete most console.log */
/**TODO: have all errors send the error */
/**TODO: check that all properties respect each other */

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
        enum: [3, 4, 5],
        required: true
    },
	desc: { //short description of chara
		type: String,
        trim: true,
        maxlength: maxCharaDescLength
    }, 
    coverPic: { //title pic of chara on summon page
		type: String,
        default: ""
    },
    iconPic: { //icon pic of chara on lists
		type: String,
        default: ""
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
        type: ObjectID,
        required: true
    },
	creator: { //creator of chara
        type: ObjectID,
        required: true
    }
});


// make a model using the Chara schema
const Chara = mongoose.model('Chara', CharaSchema, 'Charas');

/* Chara resource API methods *****************/

exports.createChara = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
        return;
    }

    const id = req.params.id;

    //create a new Chara
    /**TODO: clean request body */
    /**TODO: set 401 error if logged in user is not the one creating it */
    const chara = new Chara({
        name: req.body.name, 
        rarity: req.body.rarity,
        desc: req.body.desc,
        coverPic: req.body.coverPic,
        iconPic: req.body.iconPic,
        stats: req.body.stats,
        welcomePhrase: req.body.welcomePhrase,
        summonPhrase: req.body.summonPhrase,
        gacha: mongoose.Types.ObjectId(id),
        creator: mongoose.Types.ObjectId(req.body.creator)
    })

    try {
        if (!ObjectID.isValid(req.body.creator)) res.status(404).send(/**TODO: send error */); //check for a valid mongodb id
        //check if the creator exists
        const user = await userModel.User.findById(req.body.creator).exec();
        if (!user) {
            res.status(404).send(/**TODO: send error */);
            return;
        } 
        //check if gacha this chara belongs to exists
        const gacha = await gachaModel.Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send({msg: "The gacha this character belongs to does not exist."});
            return;
        }
        /**TODO: if stats are not added to the character, add stats from the gacha to the character with value of 0 */

        //save the character
        const newChara = await chara.save();

        //send result
        res.status(200).send({chara: newChara});

    } catch (err) {
        res.status(500).send(err);
    }
    
};

exports.getCharasByGacha = function(req, res) {
    const id = req.params.id; 
    
    //check for a valid mongodb id
     if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

     /**TODO: check if gacha exists */

     Chara.find({ gacha: id }).then(
        result => {
             res.status(200).send({ result });
        },
        err => {
            res.status(500).send(err)
        }
     );
};

exports.getCharasByCreator = function(req, res) {
    const id = req.params.id; 
    
    //check for a valid mongodb id
     if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

     /**TODO: check if gacha exists */

     Chara.find({ creator: id }).then(
        result => {
             res.status(200).send({ result });
        },
        err => {
            res.status(500).send(err)
        }
     );
}

exports.getCharaById = function(req, res) {
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    Chara.findById(id).then((result) => {
        if (!result) {
            res.status(404).send(/**TODO: send error */);
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.updateCharaInfo = async function (req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
        return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    try {
        //find chara by id
        const chara = await Chara.findById(id).exec();
        if (!chara) {
            res.status(404).send(/**TODO: send error */); // could not find this chara
            return;
        }

        //if current user on session does not match creator on chara to be edited, AND the user is not an admin
        if (chara.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }

        //save rarity in case character needs to change rarity lists on gacha
        const oldRarity = chara.rarity;
        //edit chara
        if (req.body.name) chara.name = req.body.name;
        if (req.body.rarity) chara.rarity = req.body.rarity;
        if (req.body.desc) chara.desc = req.body.desc;
        if (req.body.stats) chara.stats = req.body.stats;
        if (req.body.coverPic) chara.coverPic = req.body.coverPic;
        if (req.body.iconPic) chara.iconPic = req.body.iconPic;
        /**TODO: check if gacha exists */
        if (req.body.gacha) chara.gacha = req.body.gacha;
        /**TODO: check if creator exists */
        if (req.body.creator) chara.creator = req.body.creator;
        if (req.body.welcomePhrase) chara.welcomePhrase = req.body.welcomePhrase;
        if (req.body.summonPhrase) chara.summonPhrase = req.body.summonPhrase;

        //save chara
        const newChara = await chara.save();
        res.status(200).send({result: newChara});
        //if chara changed rarities, gacha needs to change rarity lists
    } catch (err) {
        res.status(500).send(err);
    }

};

exports.pushCharaInfo = async function (req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
        return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    try {
        //find chara by id
        const chara = await Chara.findById(id).exec();
        if (!chara) {
            res.status(404).send(/**TODO: send error */); // could not find this chara
            return;
        }

        //if current user on session does not match creator on chara to be edited, AND the user is not an admin
        if (chara.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }

        //edit chara
        if (req.body.stats) chara.stats.push(req.body.stats);

        //save chara
        const result = await chara.save();
        //send result
        res.status(200).send(result);
 
    } catch (err) {
        res.status(500).send(err);
    }

};

exports.deleteChara = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
        return;
    }
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid

    try {
        //find chara by id
        const chara = await Chara.findById(id).exec();
        if (!chara) {
            res.status(404).send(/**TODO: send error */); // could not find this chara
            return;
        }

        //if current user on session does not match creator on chara to be edited, AND the user is not an admin
        if (chara.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send(/**TODO: send error */); // unauthorized
            return;
        }

        //remove chara
        const removedChara = await chara.remove();

        //pull character from the inventories of the users
        const users = await userModel.User.updateMany({"inventory._id": removedChara._id }, 
            { $pull: {"inventory": { "_id": removedChara._id } }, $inc: {"starFrags": summonCost} }).exec();

        //send result
        res.status(200).send({chara: removedChara, usersUpdated: users});
 
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.Chara = Chara;