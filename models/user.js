/* User model */
'use strict';
const log = console.log

const { minUserLength, maxUserLength, minEmailLength, minPassLength, 
	maxPassLength, defaultStars, defaultSilvers } = require('../client/src/constants');

const gachaModel = require("./gacha");
const charaModel = require("./chara");

const mongoose = require('mongoose')
const { ObjectID } = require("mongodb");
const validator = require('validator')
const bcrypt = require('bcryptjs')

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
	profilePic: {
		data: Buffer, 
        contentType: String
	},
	starFrags: { //gacha currency
		type: Number,
		default: defaultStars
	},
	silvers: { //store currency
		type: Number,
		default: defaultSilvers
	},
	ownGachas: { //id list of the user's created gachas
		type: Array,
		default: []
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
		res.status(400).send(err)
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
	if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid
	
	try {
		const result = await User.findById(id).exec();
		if (!result) {
            res.status(404).send();
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
            res.status(404).send();
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
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
	} catch (err) {
		res.status(500).send(err);
	}
};

exports.updateUserInfo = async function(req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send();
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id != req.session.user._id && !req.session.user.isAdmin) {
			res.status(401).send();
			return;
		}

		//clean request body
		if (req.body.username) user.username = req.body.username;
		if (req.body.email) user.email = req.body.email;
		if (req.body.password) user.password = req.body.password;
		if (req.body.isAdmin) user.isAdmin = req.body.isAdmin;
		if (req.body.profilePic) user.profilePic = req.body.profilePic;
		if (req.body.starFrags) user.starFrags = req.body.starFrags;
		if (req.body.silvers) user.silvers = req.body.silvers;
		if (req.body.lastLoginDate) user.lastLoginDate = req.body.lastLoginDate;
		if (req.body.ownGachas) user.ownGachas = req.body.ownGachas;
		if (req.body.favGachas) user.favGachas = req.body.favGachas;
		if (req.body.inventory) user.inventory = req.body.inventory;

		//save the user
		const result = await user.save();
		res.status(200).send(result);
	} catch (err) {
		res.status(500).send(err);
	}

};

exports.pushUserInfo = async function(req, res) {
	if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
	if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send();
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id != req.session.user._id && !req.session.user.isAdmin) {
			res.status(401).send();
			return;
		}

		//clean request body
		const updateQuery = {};
		if (req.body.ownGachas) updateQuery.ownGachas = req.body.ownGachas;
		if (req.body.favGachas) updateQuery.favGachas = req.body.favGachas;
		if (req.body.inventory) updateQuery.inventory = req.body.inventory;

		//update user
		const result = await User.findByIdAndUpdate(id, {$push: updateQuery}, {new: true}).exec();
		res.status(200).send(result);

	} catch(err) {
		res.status(500).send(err);
	}
};

exports.deleteUser = async function(req, res) {
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) response.status(404).send(); //send 404 not found error if id is invalid
	
	try {
		//find user by id
		const user = await User.findById(id).exec();
		//if user doesn't exist, return 404
		if (!user) {
			res.status(404).send();
			return;
		}
		//if current user on session does not match user to be edited, AND the user is not an admin
		if (user._id != req.session.user._id && !req.session.user.isAdmin) {
			res.status(401).send();
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

exports.User = User;