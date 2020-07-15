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
    if (!req.session.user) { //send 401 unauthorized error if not logged in
        res.status(401).send({ chara: null, err: "createChara failed: session cannot be found"}); 
        return;
    }

    const id = req.params.id;
    if (!ObjectID.isValid(id)) { //check for a valid mongodb id
        res.status(404).send({ chara: null, err: "createChara failed: gacha id not valid"}); 
        return;
    }
    if (!req.body.name) {
        res.status(400).send({ chara: null, err: "createChara failed: chara requires a name"});
        return;
    } 
    if (!req.body.creator)  {
        res.status(400).send({ chara: null, err: "createChara failed: chara requires a creator"});
        return;
    } 
    if (!req.body.rarity)  {
        res.status(400).send({ chara: null, err: "createChara failed: chara requires a rarity"});
        return;
    } 

    try {
        if (!ObjectID.isValid(req.body.creator)) { //check for a valid mongodb id
            res.status(404).send({ chara: null, err: "createChara failed: creator id not valid"}); 
            return;
        }
        //check if the creator exists
        const user = await userModel.User.findById(req.body.creator).exec();
        if (!user) {
            res.status(404).send({ chara: null, err: "createChara failed: could not find creator"});
            return;
        } 
        // check if nauthorized
        if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ chara: null, err: "createChara failed: user does not have permissions"});
            return; 
        }
        //check if gacha this chara belongs to exists
        const gacha = await gachaModel.Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send({ chara: null, err: "createChara failed: could not find gacha"});
            return;
        }
        const chara = new Chara(cleanNewCharaBody(req, id, gacha));
        //save the character
        const newChara = await chara.save();
        //send result
        res.status(200).send({ chara: newChara, err: null});
    } catch (err) {
        res.status(500).send({ chara: null, err: "createChara failed: " + err });
    }
};

exports.getCharasByGacha = async function (req, res) {
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) {
        res.status(404).send({ charas: null, err: "getCharasByGacha failed: gacha id not valid" });
        return;
    }
    try {
        const gacha = await gachaModel.Gacha.findById(id).exec();
        if (!gacha) {
            res.status(404).send({ charas: null, err: "getCharasByGacha failed: could not find gacha" });
            return;
        }

        const charas = await Chara.find({ gacha: id }).exec();
        res.status(200).send({ charas: charas, err: null });
    } catch (err) {
        res.status(500).send({ charas: null, err: "getCharasByGacha failed: " + err })
    }
};

exports.getCharasByCreator = async function (req, res) {
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) {
        res.status(404).send({ charas: null, err: "getCharasByCreator failed: creator id not valid" });
        return;
    }

    try {
        const user = await userModel.User.findById(id).exec();
        if (!user) {
            res.status(404).send({ charas: null, err: "getCharasByCreator failed: could not find creator" });
            return;
        } 

        const charas = await Chara.find({ creator: id }).exec();
        res.status(200).send({ charas: charas, err: null });
    } catch (err) {
        res.status(500).send({ charas: null, err: "getCharasByGacha failed: " + err })
    }
}

exports.getCharaById = function(req, res) {
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) {
        res.status(404).send({ chara: null, err: "getCharaById failed: chara id not valid" });
        return;
    }

    Chara.findById(id).then((result) => {
        if (!result) {
            res.status(404).send({ chara: null, err: "getCharaById failed: could not find chara" });
        } else {
            res.status(200).send({ chara: result, err: null });
        }
    }).catch((err) => {
        res.status(500).send({ chara: null, err: "getCharaById failed: " + err });
    });
};

exports.updateCharaInfo = async function (req, res) {
    if (!req.session.user) { //send 401 unauthorized error if not logged in
        res.status(401).send({ chara: null, err: "updateCharaInfo failed: session cannot be found"}); 
        return;
    }
    const id = req.params.id; //get id from the url
    if (!ObjectID.isValid(id)) { //check for a valid mongodb id
        res.status(404).send({ chara: null, err: "updateCharaInfo failed: chara id not valid"}); 
        return;
    }

    try {
        const chara = await Chara.findById(id).exec(); //find chara by id
        if (!chara) {
            res.status(404).send({ chara: null, err: "updateCharaInfo failed: could not find chara" }); // could not find this chara
            return;
        }
        //check if authorized
        if (chara.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ chara: null, err: "updateCharaInfo failed: user does not have permissions"}); // unauthorized
            return;
        }

        //edit chara
        if (req.body.name) chara.name = req.body.name;
        if (req.body.rarity) chara.rarity = req.body.rarity;
        if (req.body.desc) chara.desc = req.body.desc;
        if (req.body.stats) chara.stats = req.body.stats;
        if (req.body.coverPic) chara.coverPic = req.body.coverPic;
        if (req.body.iconPic) chara.iconPic = req.body.iconPic;
        if (req.body.welcomePhrase) chara.welcomePhrase = req.body.welcomePhrase;
        if (req.body.summonPhrase) chara.summonPhrase = req.body.summonPhrase;
        if (req.body.gacha) { //check if gacha exists
            const gacha = await gachaModel.Gacha.findById(id).exec();
            if (!gacha) {
                res.status(404).send({ chara: null, err: "updateCharaInfo failed: could not find gacha"});
                return;
            } else {
                chara.gacha = req.body.gacha;
            }
        }
        if (req.body.creator) { //check if creator exists
            const user = await userModel.User.findById(req.body.creator).exec();
            if (!user) {
                res.status(404).send({ chara: null, err: "updateCharaInfo failed: could not find creator"});
                return;
            } else {
                chara.creator = req.body.creator;
            }
        }

        const result = await chara.save(); //save chara
        res.status(200).send({chara: result, err: null}); //send result
    } catch (err) {
        res.status(500).send({ chara: null, err: "updateCharaInfo failed: " + err });
    }
};

exports.pushCharaInfo = async function (req, res) {
    if (!req.session.user) { //send 401 unauthorized error if not logged in
        res.status(401).send({ chara: null, err: "pushCharaInfo failed: session cannot be found"}); 
        return;
    }
    
    const id = req.params.id; //get id from the url
    if (!ObjectID.isValid(id)) { //check for a valid mongodb id
        res.status(404).send({ chara: null, err: "pushCharaInfo failed: chara id not valid"}); 
        return
    }

    try {
        const chara = await Chara.findById(id).exec(); //find chara by id
        if (!chara) { // could not find this chara
            res.status(404).send({ chara: null, err: "pushCharaInfo failed: could not find chara" }); 
            return;
        }
        //check if authorized
        if (chara.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ chara: null, err: "pushCharaInfo failed: user does not have permissions"}); // unauthorized
            return;
        }

        //edit chara
        /**TODO: verify stat on gacha? */
        if (req.body.stats) chara.stats.push(req.body.stats);

        const result = await chara.save(); //save chara
        res.status(200).send({ chara: result , err: null}); //send result
 
    } catch (err) {
        res.status(500).send({ chara: null, err: "pushCharaInfo failed: " + err });
    }

};

exports.deleteChara = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send({ chara: null, usersUpdated: null, 
            err: "createChara failed: session cannot be found"}); //send 401 unauthorized error if not logged in
        return;
    }
    const id = req.params.id;

    if (!ObjectID.isValid(id)) { //check for a valid mongodb id
        res.status(404).send({ chara: null, usersUpdated: null, 
            err: "createChara failed: chara id not valid"}); 
        return;
    }
    try {
        //find chara by id
        const chara = await Chara.findById(id).exec();
        if (!chara) { // could not find this chara
            res.status(404).send({ chara: null, usersUpdated: null, 
                err: "pushCharaInfo failed: could not find chara" }); 
            return;
        }

        //check if authorized
        if (chara.creator.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
            res.status(401).send({ chara: null, usersUpdated: null, 
                err: "createChara failed: user does not have permissions"});
            return;
        }

        const removedChara = await chara.remove(); //remove chara

        //pull character from the inventories of the users
        const users = await userModel.User.updateMany({"collec._id": removedChara._id }, 
            { $pull: {"collec": { "_id": removedChara._id } }, $inc: {"starFrags": summonCost} }).exec();

        //send result
        res.status(200).send({chara: removedChara, usersUpdated: users, err: null});
 
    } catch (err) {
        res.status(500).send({ chara: null, usersUpdated: null, err: "pushCharaInfo failed: " + err });
    }
};

exports.Chara = Chara;

/**Helpers */
function cleanNewCharaBody(req, id, gacha) {
    const charaBody = {};

    charaBody.name = req.body.name || null;
    charaBody.creator = req.body.creator || null;
    charaBody.gacha = id || null;
    charaBody.rarity = req.body.rarity || null;
    charaBody.desc = req.body.desc || "";
    charaBody.coverPic = req.body.coverPic || "";
    charaBody.iconPic = req.body.iconPic || "";
    charaBody.welcomePhrase = req.body.welcomePhrase || "";
    charaBody.summonPhrase = req.body.summonPhrase || "";
    charaBody.stats = [];

    let checkStat;
    let newStat;
    gacha.stats.forEach(gachaStat => {
        newStat = {};
        checkStat = req.body.stats.filter(charaStat => 
            { return charaStat._id.toString() === gachaStat._id.toString()});
        if (checkStat.length < 1) {
            newStat = { _id: gachaStat._id, name: gachaStat.name, value: 0 };
        } else {
            newStat._id = gachaStat._id;
            newStat.name = gachaStat.name;
            if (!checkStat[0].value || checkStat[0].value < 0 || checkStat[0].value > 5) {
                newStat.value = 0;
            } else {
                newStat.value = checkStat[0].value;
            }
        }
        charaBody.stats.push(newStat);
    });

    return charaBody;
}