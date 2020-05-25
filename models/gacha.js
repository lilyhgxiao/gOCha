/* Gacha model */
'use strict';

import { minGachaNameLength, maxGachaNameLength, maxGachaDescLength } from './../constants';

const mongoose = require('mongoose')

const GachaSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
        minlength: minGachaNameLength,
        maxlength: maxGachaNameLength,
		trim: true,
		unique: true,
	},
	desc: { //short description of gacha
		type: String,
        trim: true,
        maxlength: maxGachaDescLength
    }, 
    coverPic: { //title pic of gacha on summon page
		data: Buffer, 
        contentType: String
    },
    iconPic: { //icon pic of gacha on lists
		data: Buffer, 
        contentType: String
    },
    stats: { //stats to compare the characters in gacha
		type: Array,
		default: []
    }, 
	threeStars: { //id list of charas w 3 stars
		type: Array,
		default: []
	},
	fourStars: { //id list of charas w 4 stars
		type: Array,
		default: []
	},
	fiveStars: { //id list of charas w 5 stars
		type: Array,
		default: []
	},
	creator: { //creator of gacha
        type: ObjectId
    }
})


// make a model using the Gacha schema
const Gacha = mongoose.model('Gacha', GachaSchema)
module.exports = { Gacha }