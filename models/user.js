/* User model */
'use strict';

import { minUserLength, maxUserLength, minPassLength, 
	maxPassLength, defaultStars, defaultSilvers } from './../constants';

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

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
		minlength: 1,
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
	stars: { //gacha currency
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
	favGaches: { //id list of user's favourited gachas
		type: Array,
		default: []
	},
	inventory: { //id list of user's owned characters
		type: Array,
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

// make a model using the User schema
const User = mongoose.model('User', UserSchema)
module.exports = { User }

