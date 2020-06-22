/* User model */
'use strict';
const log = console.log

const { minUserLength, maxUserLength, minEmailLength, minPassLength, 
	maxPassLength, defaultStars, defaultSilvers } = require('../client/src/constants');

const { Gacha } = require("./gacha");
const { Chara } = require("./chara");

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
	if (user.password) {
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
exports.User = User;

/* User resource API methods *****************/
exports.createUser = function(req, res) {
	const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        isAdmin: req.body.isAdmin,
        lastLoginDate: new Date()
    });

    // Save the user
    user.save().then(
        result => {
            res.status(200).send(result);
        },
        err => {
            res.status(400).send(err); // 400 for bad request
        }
    );
};

exports.getAllUsers = function(req, res) {
    User.find().then(
        result => {
            res.status(200).send({ result }); // can wrap in object if want to add more properties
        },
        err => {
            res.status(500).send(err); // server error
        }
    );
};

exports.getUserById = function(req, res) {
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    User.findById(id).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.getUserByUsername = function(req, res) {
    const username = req.params.username;

    User.findOne({ username: username }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.getUserByEmail = function(req, res) {
    const email = req.params.email;

    User.findOne({ email: email }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.updateUserInfo = function(req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

	const reqBody = cleanUserUpdateReq(req);

    User.findByIdAndUpdate(id, { $set: reqBody }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
			if (reqBody.password) {
				result.password = reqBody.password;
				result.save(function (err, user) {
					if (err) res.status(400).send(err);
					res.status(200).send(user);
				});
			} else {
				res.status(200).send(result);
			}
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.pushUserInfo = function(req, res) {
	if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

	const reqBody = cleanUserUpdateReq(req);

	User.findByIdAndUpdate(id, { $push: reqBody}, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
};

exports.deleteUser = function(req, res) {
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) response.status(404).send(); //send 404 not found error if id is invalid
    
    // Attempt to remove the pet with the specefied id
    User.findByIdAndRemove(id).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
			Gacha.deleteMany({creator: id}).then((gacha) => {
				Chara.deleteMany({creator: id}).then((chara) => {
					res.status(200).send({user: result, 
						gachasDeleted: gacha, 
						charasDeleted: chara});
				});
			});
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    })
};

/* Helpers */
function cleanUserUpdateReq(req, push) {
    const reqBody = {};

    if (req.body) {
		if (req.body.ownGachas) reqBody.ownGachas = req.body.ownGachas;
        if (req.body.favGachas) reqBody.favGachas = req.body.favGachas;
		if (req.body.inventory) reqBody.inventory = req.body.inventory;
		
		if (!push) {
			if (req.body.username) reqBody.username = req.body.username;
			if (req.body.email) reqBody.email = req.body.email;
			if (req.body.password) reqBody.password = req.body.password;
			if (req.body.isAdmin) reqBody.isAdmin = req.body.isAdmin;
			if (req.body.profilePic) reqBody.profilePic = req.body.profilePic;
			if (req.body.starFrags) reqBody.starFrags = req.body.starFrags;
			if (req.body.silvers) reqBody.silvers = req.body.silvers;
			if (req.body.lastLoginDate) reqBody.lastLoginDate = req.body.lastLoginDate;
		} 
    }
    return reqBody;
};