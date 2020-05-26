/* Chara model */
'use strict';

import { minCharaNameLength, maxCharaNameLength, maxCharaDescLength } from './../constants';

const mongoose = require('mongoose')

const CharaSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
        minlength: minCharaNameLength,
        maxlength: maxCharaNameLength,
		trim: true,
		unique: true,
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
		type: Array,
		default: []
    }, 
    gacha: { //gacha the chara can be summoned from
        type: ObjectId
    }
    ,
	creator: { //creator of chara
        type: ObjectId
    }
})


// make a model using the Chara schema
const Chara = mongoose.model('Chara', CharaSchema, 'Charas')
module.exports = { Chara }