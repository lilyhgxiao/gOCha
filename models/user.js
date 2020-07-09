/* User model */
'use strict';
const log = console.log

const { minUserLength, maxUserLength, minEmailLength, minPassLength, 
	maxPassLength, defaultStars, defaultSilvers } = require('../client/src/constants');

const gachaModel = require("./gacha");
const charaModel = require("./chara");

const mongoose = require('mongoose')
const { ObjectID } = require("mongodb");
const validator = require('validator');
const bcrypt = require('bcryptjs');

/**TODO: change all id comparisons to use toString() */
/**TODO: delete most console.log */
/**TODO: have all catch errors send the error */
/**TODO: check that all properties respect each other */

const CharaMiniSchema = mongoose.Schema({
    _id: { 
        type: ObjectID, 
        req: true
    },
    gacha: { 
        type: ObjectID, 
        req: true
	},
	creator: { 
        type: ObjectID, 
        req: true
	}
});


const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		minlength: minUserLength,
		maxlength: maxUserLength,
		trim: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		minlength: minEmailLength,
		trim: true,
		unique: true,
		validate: {
			validator: validator.isEmail,   // custom validator
			message: 'Not valid email'
		}
	}, 
	password: {
		type: String,
		required: true,
		minlength: minPassLength,
		maxlength: maxPassLength
	},
	isAdmin: {
		type: Boolean,
		required: true,
		default: false
	},
	iconPic: {
		type: String,
        default: ""
	},
	starFrags: { //gacha currency
		type: Number,
		default: defaultStars
	},
	silvers: { //store currency
		type: Number,
		default: defaultSilvers
	},
	bio: {
		type: String,
        default: ""
	},
	favGachas: { //id list of user's favourited gachas
		type: Array,
		default: []
	},
	inventory: { //id list of user's owned characters
		type: [ CharaMiniSchema ],
		default: []
	},
	lastLoginDate: { //last login date used to calculate login bonuses
		type: Date
	}
})

// An example of Mongoose middleware.
// This function will run immediately prior to saving the document
// in the database.
UserSchema.pre('save', function(next) {
	const user = this; // binds this to User document instance

	// checks to ensure we don't hash password more than once
	if (user.isModified('password')) {
		// generate salt and hash the password
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash
				next()
			})
		})
	} else {
		next()
	}
})

// A static method on the document model.
// Allows us to find a User document by comparing the hashed password
//  to a given one, for example when logging in.
UserSchema.statics.findByUsernamePassword = function(username, password) {
	const User = this // binds this to the User model

	// First find the user by their email
	return User.findOne({ username: username }).then((user) => {
		if (!user) {
			resolve(false)  // a rejected promise
		}
		// if the user exists, make sure their password is correct
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, result) => {
				if (result) {
					resolve(user)
				} else {
					resolve(false)
				}
			})
		})
	})
}

const User = mongoose.model('User', UserSchema, 'Users')

/* User resource API methods *****************/
exports.createUser = async function(req, res) {
	//create new gacha with Gacha model
    const userBody = cleanNewUserBody(req);
    if (!userBody.username) {
        res.status(400).send({ user: null, err: "createUser failed: user requires a name"});
        return;
    } 
    if (!userBody.email)  {
        res.status(400).send({ user: null, err: "createUser failed: user requires a creator"});
        return;
	} 
	if (!userBody.password)  {
        res.status(400).send({ user: null, err: "createUser failed: user requires a password"});
        return;
	} 
	const user = new User(userBody);

	// Save the user
	try {
		const result = await user.save();
		res.status(200).send({ user: result, err: null });
	} catch (err) {
		res.status(400).send({ user: null, err: "createUser failed: " + err});
	}
};

exports.getAllUsers = async function(req, res) {
	try {
		const result = await User.find().exec();
		res.status(200).send({ users: result, err: null });
	} catch (err) {
		res.status(500).send({ users: null, err: "getAllUsers failed: " + err});
	}
};

exports.getUserById = async function(req, res) {
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) {
		res.status(404).send({ user: null, 
			err: "getUserById failed: mongodb id not valid"}); //send 404 not found error if id is invalid
		return;
	}

	try {
		const result = await User.findById(id).exec();
		if (!result) {
            res.status(404).send({ user: null, 
				err: "getUserById failed: could not find user"});
        } else {
            res.status(200).send({ user: result, err: null});
        }
	} catch (err) {
		res.status(500).send({ user: null, err: "getUserById failed: " + err});
	}
};

exports.getUserByUsername = async function(req, res) {
	const username = req.params.username;
	
	try {
		const result = await User.findOne({ username: username }).exec();
		if (!result) {
            res.status(404).send({ user: null, 
				err: "getUserByUsername failed: could not find user"});
        } else {
            res.status(200).send({ user: result, err: null});
        }
	} catch (err) {
		res.status(500).send({ user: null, err: "getUserByUsername failed: " + err});
	}
};

exports.getUserByEmail = async function(req, res) {
	const email = req.params.email;
	
	try {
		const result = await User.findOne({ email: email }).exec();
		if (!result) {
            res.status(404).send({ user: null, 
				err: "getUserByEmail failed: could not find user"});
        } else {
            res.status(200).send({ user: result, err: null});
        }
	} catch (err) {
		res.status(500).send({ user: null, err: "getUserByEmail failed: " + err});
	}
};


exports.updateUserInfo = async function(req, res) {
    if (!req.session.user) {
		res.status(401).send({ user: null, 
            err: "updateUserInfo failed: session can't be found"}); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) {
		res.status(404).send({ user: null, 
			err: "updateUserInfo failed: mongodb id not valid"}); //send 404 not found error if id is invalid
		return;
	}

	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send({ user: null, 
				err: "updateUserInfo failed: could not find user"});
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send({ user: null, 
				err: "updateUserInfo failed: user does not have permissions"});
			return;
		}

		//clean request body
		if (req.body.username) user.username = req.body.username;
		if (req.body.email) user.email = req.body.email;
		if (req.body.password) user.password = req.body.password;
		if (req.body.isAdmin) user.isAdmin = req.body.isAdmin;
		if (req.body.iconPic) user.iconPic = req.body.iconPic;
		if (req.body.starFrags) user.starFrags = req.body.starFrags;
		if (req.body.silvers) user.silvers = req.body.silvers;
		if (req.body.lastLoginDate) user.lastLoginDate = req.body.lastLoginDate;
		if (req.body.favGachas) user.favGachas = req.body.favGachas;
		if (req.body.inventory) user.inventory = req.body.inventory;
		if (req.body.bio) user.bio = req.body.bio;

		//save the user
		const result = await user.save();
		if (user._id.toString() === req.session.user._id.toString()) {
			req.session.user = result;
		}
		res.status(200).send({ user: result, err: null});
	} catch (err) {
		res.status(500).send({ user: null, err: "updateUserInfo failed: " + err});
	}

};

exports.incCurrency = async function(req, res) {
	if (!req.session.user) {
		res.status(401).send({ user: null, 
            err: "incCurrency failed: session can't be found"}); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) {
		res.status(404).send({ user: null, 
			err: "incCurrency failed: mongodb id not valid"}); //send 404 not found error if id is invalid
		return;
	} 
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send({ user: null, 
				err: "incCurrency failed: could not find user"});
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send({ user: null, 
				err: "incCurrency failed: user does not have permissions"});
			return;
		}

		//clean request body
		const updateQuery = { "$inc": {} };
		if (req.body.starFrags) updateQuery.$inc.starFrags = req.body.starFrags;
		if (req.body.silvers) updateQuery.$inc.silvers = req.body.silvers;

		//update user
		const result = await User.findByIdAndUpdate(id, updateQuery, {new: true}).exec();
		if (user._id.toString() === req.session.user._id.toString()) {
			req.session.user = result;
		}
		res.status(200).send({ user: result, err: null});

	} catch(err) {
		res.status(500).send({ user: null, err: "incCurrency failed: " + err});
	}
};

exports.summonChara = async function(req, res) {
	const fullCharaIdList = [];
	if (req.body.chara) {
		if (typeof req.body.chara[0] !== 'undefined') {
			req.body.chara.forEach(chara => fullCharaIdList.push(chara._id ? chara._id : "No id"));
		} else {
			fullCharaIdList.push(req.body.chara._id ? req.body.chara._id : "No id");
		}
	}
	
	if (!req.session.user) {
		res.status(401).send({ user: null, 
			err: "summonChara failed: session can't be found",
			failedCharas: fullCharaIdList }); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) {
		res.status(404).send({ user: null, 
			err: "summonChara failed: mongodb id not valid",
			failedCharas: fullCharaIdList }); //send 404 not found error if id is invalid
		return;
	}
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send({ user: null, 
				err: "summonChara failed: could not find user",
				failedCharas: fullCharaIdList});
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send({ user: null, 
				err: "summonChara failed: user does not have permissions",
				failedCharas: fullCharaIdList});
			return;
		}

		//clean request body
		const prep = await prepareSummon(req, user);
		if (prep.err) {
			res.status(prep.status).send({ user: null, err: prep.err, failedCharas: fullCharaIdList });
		}
		const { updateQuery, failedCharas } = prep;

		//update user
		const result = await User.findByIdAndUpdate(id, updateQuery, {new: true}).exec();
		if (user._id.toString() === req.session.user._id.toString()) {
			req.session.user = result;
		}
		res.status(200).send({ user: result, err: null, failedCharas: failedCharas });
	} catch(err) {
		res.status(500).send({ user: null, err: "summonChara failed:" + err, failedCharas: fullCharaIdList });
	}
};

exports.pushUserInfo = async function(req, res) {
	if (!req.session.user) {
		res.status(401).send({ user: null, 
            err: "pushUserInfo failed: session can't be found"}); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) {
		res.status(404).send({ user: null, 
			err: "pushUserInfo failed: mongodb id not valid"}); //send 404 not found error if id is invalid
		return;
	}

	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send({ user: null, 
				err: "pushUserInfo failed: could not find user"});
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send({ user: null, 
				err: "pushUserInfo failed: user does not have permissions"});
			return;
		}

		//clean request body
		const updateQuery = {};
		if (req.body.favGachas) updateQuery.favGachas = req.body.favGachas;
		if (req.body.inventory) updateQuery.inventory = req.body.inventory;

		//update user
		const result = await User.findByIdAndUpdate(id, {$push: updateQuery}, {new: true}).exec();
		if (user._id.toString() === req.session.user._id.toString()) {
			req.session.user = result;
		}
		res.status(200).send({ user: result, err: null});

	} catch(err) {
		res.status(500).send({ user: null, err: "pushUserInfo failed: " + err});
	}
};

exports.pullUserInfo = async function(req, res) {
	if (!req.session.user) {
		res.status(401).send({ user: null, 
            err: "pullUserInfo failed: session can't be found"}); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) {
		res.status(404).send({ user: null, 
			err: "pullUserInfo failed: mongodb id not valid"}); //send 404 not found error if id is invalid
		return;
	}
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send({ user: null, 
				err: "pullUserInfo failed: could not find user"});
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send({ user: null, 
				err: "pullUserInfo failed: user does not have permissions"});
			return;
		}

		//clean request body
		const updateQuery = {};
		if (req.body.favGachas) updateQuery.favGachas = req.body.favGachas;
		if (req.body.inventory) updateQuery.inventory = req.body.inventory;

		//update user
		const result = await User.findByIdAndUpdate(id, {$pull: updateQuery}, {new: true}).exec();
		if (user._id.toString() === req.session.user._id.toString()) {
			req.session.user = result;
		}
		res.status(200).send({ user: result, err: null});

	} catch(err) {
		res.status(500).send({ user: null, err: "pullUserInfo failed: " + err});
	}
};

exports.deleteUser = async function(req, res) {
	if (!req.session.user) {
		res.status(401).send({ user: null, gachasDeleted: null, charasDeleted: null, 
			usersUpdated: { inventory: null, favGachas: null },
            err: "deleteUser failed: session can't be found"}); //send 401 unauthorized error if not logged in
		return;
	}
    //get id from the url
    const id = req.params.id;
    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) {
		res.status(404).send({ user: null, gachasDeleted: null, charasDeleted: null, 
			usersUpdated: { inventory: null, favGachas: null },
			err: "deleteUser failed: mongodb id not valid"}); //send 404 not found error if id is invalid
		return;
	}

	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send({ user: null, gachasDeleted: null, charasDeleted: null, 
				usersUpdated: { inventory: null, favGachas: null },
				err: "deleteUser failed: could not find user"});
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send({ user: null, gachasDeleted: null, charasDeleted: null, 
				usersUpdated: { inventory: null, favGachas: null },
				err: "deleteUser failed: user does not have permissions"});
			return;
		}

		//remove user
		const result = await user.remove();
		//remove all gachas this user created
		const gacha = await gachaModel.Gacha.deleteMany({creator: id}).exec();
		//remove all characters this user created
		const chara = await charaModel.Chara.deleteMany({creator: id}).exec();
		//remove all characters this user created in the inventory of all users
		/**TODO: find a way to add star fragments to the users */
		const usersInventory = await User.updateMany({"inventory.creator": id }, 
			{ $pull: {"inventory": { "creator": id }} }).exec();
		//remove all gachas this user created in the favourite gachas of all users
		const usersFavGachas = await User.updateMany({"favGachas.creator": id }, 
			{ $pull: {"favGachas": { "creator": id }} }).exec();

		//send result
		res.status(200).send({user: result, 
			gachasDeleted: gacha, 
			charasDeleted: chara,
			usersUpdated: {
				inventory: usersInventory, 
				favGachas: usersFavGachas}
			});

	} catch(err) {
		res.status(500).send({ user: null, gachasDeleted: null, charasDeleted: null, 
			usersUpdated: { inventory: null, favGachas: null },
			err: "deleteUser failed: " + err});
	}
};

exports.User = User;

/*Helpers */
async function checkIfCharaValid(chara) {
	if (!(chara._id && chara.creator && chara.gacha)) {
		return { valid: false, msg: "The character does not contain all of its required fields."};
	}
	if (!(ObjectID.isValid(chara._id) && ObjectID.isValid(chara.creator) && ObjectID.isValid(chara.gacha))) {
		return { valid: false, msg: "One or more ids on the character are not valid."};
	}

	const charaExists = charaModel.Chara.findById(chara._id);
	const gachaExists = gachaModel.Gacha.findById(chara.gacha);
	const creatorExists = User.findById(chara.creator);

	return Promise.all([charaExists, gachaExists, creatorExists]).then(res => {
		if (res[0] === null || res[1] === null || res[2] === null) {
			return { valid: false, msg: "Either the character, gacha or creator does not exist." };
		}
		if (res[0].gacha.toString() !== chara.gacha.toString()) {
			return { valid: false, msg: "The gacha on the rolled character does not match the actual character." };
		}
		if (res[0].creator.toString() !== chara.creator.toString()) {
			return { valid: false, msg: "The creator on the rolled character does not match the actual character." };
		}
		return { valid: true, msg: "The character is valid." };
	}).catch((err) => {
		console.log("Error with Promise.all in checkIfCharaValid: " + err);
		return { valid: false, msg: "Error with Promise.all in checkIfCharaValid: " + err };
	});
}

function checkIfInInventory(chara, inventory) {
	const charaToCompare = { _id: chara._id, gacha: chara.gacha, creator: chara.creator };
	const compareResult = inventory.findIndex(charaInInv => {
		const charaInInvTemp = { _id: charaInInv._id, gacha: charaInInv.gacha, creator: charaInInv.creator };
		return (JSON.stringify(charaInInvTemp) === JSON.stringify(charaToCompare));
	});
	return compareResult;
}

function cleanNewUserBody(req) {
	const userBody = {};

    userBody.username = req.body.username || null;
    userBody.email = req.body.email || null;
	userBody.password = req.body.password || null;
	userBody.isAdmin = req.body.isAdmin || false;
	userBody.iconPic = req.body.iconPic || "";
	userBody.starFrags = req.body.starFrags || defaultStars;
	userBody.silvers = req.body.silvers || defaultSilvers;
	userBody.bio = req.body.bio || "";
	userBody.favGachas = req.body.favGachas || [];
	userBody.inventory = req.body.inventory || [];
	userBody.lastLoginDate = req.body.lastLoginDate || new Date();

    return userBody;
}

async function prepareSummon(req, user) {
	const failedCharas = [];
	const updateQuery = { "$inc": {}, "$push": {} };
	if (req.body.starFrags) {
		updateQuery.$inc.starFrags = req.body.starFrags;
	} else {
		return { status: 400, 
			err: "summonChara failed: body requires starFrags" };
	}
	if (req.body.chara) {
		//check if the user already has the character or not.
		const inventory = [];
		let validCharaCheck;
		if (typeof req.body.chara[0] !== 'undefined') {
			let i;
			for (i = 0; i < req.body.chara.length; i++) {
				validCharaCheck = await checkIfCharaValid(req.body.chara[i]);
				if (validCharaCheck.valid === true) {
					if (checkIfInInventory(req.body.chara[i], user.inventory) === -1) {
						inventory.push({
							_id: req.body.chara[i]._id,
							creator: req.body.chara[i].creator,
							gacha: req.body.chara[i].gacha
						});
					}
				} else {
					failedCharas.push((req.body.chara[i]._id ? req.body.chara[i]._id : "No id"));
				}
			}
		} else {
			if (checkIfInInventory(req.body.chara, user.inventory) === -1) {
				validCharaCheck = await checkIfCharaValid(req.body.chara);
				if (validCharaCheck.valid === true) {
					inventory.push({
						_id: req.body.chara._id,
						creator: req.body.chara.creator,
						gacha: req.body.chara.gacha
					});
				} else {
					return { status: 400, 
						err: "summonChara failed: chara doesn't have required fields" };
				}
			} else {
				return { status: 200, 
					err: "summonChara not executed: user has chara" };
			}
		}
		updateQuery.$push.inventory = inventory;
	} else {
		return { status: 400, 
			err: "summonChara failed: body requires chara" };
	}
	return { updateQuery, failedCharas };
}