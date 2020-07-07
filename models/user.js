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
		required: true
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
			return Promise.reject()  // a rejected promise
		}
		// if the user exists, make sure their password is correct
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, result) => {
				if (result) {
					resolve(user)
				} else {
					reject()
				}
			})
		})
	})
}

const User = mongoose.model('User', UserSchema, 'Users')

/* User resource API methods *****************/
exports.createUser = async function(req, res) {
	const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        isAdmin: req.body.isAdmin,
        lastLoginDate: new Date()
    });

	// Save the user
	try {
		const result = await user.save();
		res.status(200).send(result);
	} catch (err) {
		res.status(400).send(err);
	}
};

exports.getAllUsers = async function(req, res) {
	try {
		const result = await User.find().exec();
		res.status(200).send({ result });
	} catch (err) {
		res.status(500).send(err);
	}
};

exports.getUserById = async function(req, res) {
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid
	
	try {
		const result = await User.findById(id).exec();
		if (!result) {
            res.status(404).send(/**TODO: send error */);
        } else {
            res.status(200).send(result);
        }
	} catch (err) {
		res.status(500).send(err);
	}
};

exports.getUserByUsername = async function(req, res) {
	const username = req.params.username;
	
	try {
		const result = await User.findOne({ username: username }).exec();
		if (!result) {
            res.status(404).send(/**TODO: send error */);
        } else {
            res.status(200).send(result);
        }
	} catch (err) {
		res.status(500).send(err);
	}
};

exports.getUserByEmail = async function(req, res) {
	const email = req.params.email;
	
	try {
		const result = await User.findOne({ email: email }).exec();
		if (!result) {
            res.status(404).send(/**TODO: send error */);
        } else {
            res.status(200).send(result);
        }
	} catch (err) {
		res.status(500).send(err);
	}
};


exports.updateUserInfo = async function(req, res) {
    if (!req.session.user) {
		res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send(/**TODO: send error */);
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send(/**TODO: send error */);
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
		res.status(200).send(result);
	} catch (err) {
		res.status(500).send(err);
	}

};

exports.incCurrency = async function(req, res) {
	if (!req.session.user) {
		res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send(/**TODO: send error */);
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send(/**TODO: send error */);
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
		res.status(200).send(result);

	} catch(err) {
		res.status(500).send(err);
	}
};

exports.summonChara = async function(req, res) {	
	if (!req.session.user) {
		res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send(/**TODO: send error */);
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send(/**TODO: send error */);
			return;
		}

		//clean request body
		const updateQuery = { "$inc": {}, "$push": {} };
		let requestValid = true;
		if (req.body.starFrags) {
			updateQuery.$inc.starFrags = req.body.starFrags;
		} else {
			requestValid = false; //not valid request, there is no price on the character
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
							inventory.push({_id: req.body.chara[i]._id, 
								creator: req.body.chara[i].creator, 
								gacha: req.body.chara[i].gacha});
						} else {
							console.log("The user already has this character.")
						}
					} else {
						requestValid = false; //not valid request, chara does not have the required fields
						console.log(validCharaCheck.msg)
						break;
					}

				}
			} else {
				if (checkIfInInventory(req.body.chara, user.inventory) === -1) {
					validCharaCheck = await checkIfCharaValid(req.body.chara);
					if (validCharaCheck.valid === true) {
						inventory.push({_id: req.body.chara._id, 
							creator: req.body.chara.creator, 
							gacha: req.body.chara.gacha});
					} else {
						requestValid = false; //not valid request, chara does not have the required fields
						console.log(validCharaCheck.msg)
					}
				} else {
					console.log("The user already has this character.");
					requestValid = false;
				}
			}
			updateQuery.$push.inventory = inventory;
		} else {
			requestValid = false;
		}
		
		if (!requestValid) {
			res.status(400).send(/**TODO: send error */); //bad request
			return;
		}

		//update user
		const result = await User.findByIdAndUpdate(id, updateQuery, {new: true}).exec();
		if (user._id.toString() === req.session.user._id.toString()) {
			req.session.user = result;
		}
		res.status(200).send(result);

	} catch(err) {
		console.log(err);
		res.status(500).send(err);
	}
};

exports.pushUserInfo = async function(req, res) {
	if (!req.session.user) {
		res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send(/**TODO: send error */);
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send(/**TODO: send error */);
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
		res.status(200).send(result);

	} catch(err) {
		res.status(500).send(err);
	}
};

exports.pullUserInfo = async function(req, res) {
	if (!req.session.user) {
		res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
		return;
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) res.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send(/**TODO: send error */);
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send(/**TODO: send error */);
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
		res.status(200).send(result);

	} catch(err) {
		res.status(500).send(err);
	}
};

exports.deleteUser = async function(req, res) {
	if (!req.session.user) {
		res.status(401).send(/**TODO: send error */); //send 401 unauthorized error if not logged in
		return;
	}
	
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) response.status(404).send(/**TODO: send error */); //send 404 not found error if id is invalid
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send(/**TODO: send error */);
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id.toString() !== req.session.user._id.toString() && !req.session.user.isAdmin) {
			res.status(401).send(/**TODO: send error */);
			return;
		}

		//remove user
		const result = await user.remove();
		//remove all gachas this user created
		const gacha = await gachaModel.Gacha.deleteMany({creator: id}).exec();
		//remove all characters this user created
		const chara = await charaModel.Chara.deleteMany({creator: id}).exec();
		//remove all characters this user created in the inventory of all users
		const usersInventory = await User.updateMany({"inventory.creator": id }, { $pull: {"inventory": { "creator": id }} }).exec();
		//remove all gachas this user created in the favourite gachas of all users
		const usersFavGachas = await User.updateMany({"favGachas.creator": id }, { $pull: {"favGachas": { "creator": id }} }).exec();

		//send result
		res.status(200).send({user: result, 
			gachasDeleted: gacha, 
			charasDeleted: chara,
			usersUpdated: {
				inventory: usersInventory, 
				favGachas: usersFavGachas}
			});

	} catch(err) {
		res.status(500).send(err);
	}
	
};

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

exports.User = User;