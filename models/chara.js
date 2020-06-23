/* Chara model */
'use strict';
const log = console.log

const { minCharaNameLength, maxCharaNameLength, maxCharaDescLength, 
    maxStatsLength, maxWelcPhrLength, maxSummPhrLength } = require('../client/src/constants');

const userModel = require("./user");
const gachaModel = require("./gacha");

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

/* Chara resource API methods *****************/

exports.createChara = async function(req, res) {
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

    try {
        //check if gacha this chara belongs to exists
        const gacha = await gachaModel.Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send();
            return;
        }

        //save the character
        const newChara = await chara.save();

        //prepare to add the character to the rarity lists of the gacha
        if (newChara.rarity == 3) {
            gacha.threeStars.push(newChara._id);
        } else if (newChara.rarity == 4) {
            gacha.fourStars.push(newChara._id);
        } else if (newChara.rarity == 5) {
            gacha.fiveStars.push(newChara._id);
        } else {
            res.status(400).send();
        }

        //save the gacha
        const result = await gacha.save();
        //send result
        res.status(200).send({chara: newChara, gacha: result});

    } catch (err) {
        res.status(500).send(err);
    }
    
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

exports.updateCharaInfo = async function (req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    try {
        //find chara by id
        const chara = await Chara.findById(id).exec();
        if (!chara) {
            res.status(404).send(); // could not find this chara
            return;
        }

        //if current user on session does not match creator on chara to be edited, AND the user is not an admin
        if (chara.creator != req.session.user._id && !req.session.user.isAdmin) {
            res.status(401).send(); // unauthorized
            return;
        }

        //save rarity in case character needs to change rarity lists on gacha
        const oldRarity = chara.rarity;
        //edit chara
        if (req.body.name) chara.name = req.body.name;
        if (req.body.rarity) chara.rarity = req.body.rarity;
        if (req.body.desc) chara.desc = req.body.desc;
        if (req.body.stats) chara.stats = req.body.stats;
        if (req.body.mainPic) chara.mainPic = req.body.mainPic;
        if (req.body.iconPic) chara.iconPic = req.body.iconPic;
        if (req.body.gacha) chara.gacha = req.body.gacha;
        if (req.body.creator) chara.creator = req.body.creator;
        if (req.body.welcomePhrase) chara.welcomePhrase = req.body.welcomePhrase;
        if (req.body.summonPhrase) chara.summonPhrase = req.body.summonPhrase;

        //save chara
        const newChara = await chara.save();
        //if chara changed rarities, gacha needs to change rarity lists
        if (oldRarity != newChara.rarity) {
            const gacha = await gachaModel.Gacha.findById(newChara.gacha).exec();
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

            //save gacha
            const newGacha = await gacha.save();
            //send result
            res.status(200).send({chara: newChara, gacha: newGacha});

        } else {
            //if no changes to gacha, send result
            res.status(200).send({result: newChara});
        }
    } catch (err) {
        res.status(500).send(err);
    }

};

exports.pushCharaInfo = async function (req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    try {
        //find chara by id
        const chara = await Chara.findById(id).exec();
        if (!chara) {
            res.status(404).send(); // could not find this chara
            return;
        }

        //if current user on session does not match creator on chara to be edited, AND the user is not an admin
        if (chara.creator != req.session.user._id && !req.session.user.isAdmin) {
            res.status(401).send(); // unauthorized
            return;
        }

        //edit chara
        if (req.body.stats) chara.stats,push(req.body.stats);

        //save chara
        const result = await chara.save();
        //send result
        res.status(200).send(result);
 
    } catch (err) {
        res.status(500).send(err);
    }

};

exports.deleteChara = async function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    try {
        //find chara by id
        const chara = await Chara.findById(id).exec();
        if (!chara) {
            res.status(404).send(); // could not find this chara
            return;
        }

        //if current user on session does not match creator on chara to be edited, AND the user is not an admin
        if (chara.creator != req.session.user._id && !req.session.user.isAdmin) {
            res.status(401).send(); // unauthorized
            return;
        }

        //remove chara
        const removedChara = await chara.remove();

        //edit gacha rarity list
        const gacha = await gachaModel.Gacha.findById(removedChara.gacha).exec();
        //remove old rarity
        if (removedChara.rarity == 3) {
            gacha.threeStars = gacha.threeStars.filter(charas => charas != removedChara._id.toString());
        } else if (removedChara.rarity == 4) {
            gacha.fourStars = gacha.fourStars.filter(charas => charas != removedChara._id.toString())
        } else if (removedChara.rarity == 5) {
            gacha.fiveStars = gacha.fiveStars.filter(charas => charas != removedChara._id.toString())
        } else {
            console.log("Error. Character has invalid rarity");
        }
        //save gacha
        const newGacha = await gacha.save();

        //pull character from the inventories of the users
        const users = await userModel.User.updateMany({"inventory._id": removedChara._id }, { $pull: {"inventory": { "_id": removedChara._id }} }).exec();

        //send result
        res.status(200).send({chara: removedChara, gacha: newGacha, usersUpdated: users});
 
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }

};

exports.Chara = Chara;