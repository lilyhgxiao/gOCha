/* Gacha model */
'use strict';
const log = console.log

const { minGachaNameLength, maxGachaNameLength, maxGachaDescLength, maxStatsLength } = require('../client/src/constants');

const user = require("./user");
const { Chara } = require("./chara");

const mongoose = require('mongoose');
const { ObjectID } = require("mongodb");

const GachaStatSchema = mongoose.Schema({
    name: { 
        type: String, 
        req: true ,
        default: "New Stat",
    }
});

const GachaSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
        minlength: minGachaNameLength,
        maxlength: maxGachaNameLength,
		trim: true
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
		type: [ GachaStatSchema ],
		default: [],
		validate: [arrayLimit, '{PATH} exceeds the limit of ' + maxStatsLength]
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
        type: ObjectID
    },
    active: {
        type: Boolean,
        default: false
    }
});

function arrayLimit(val) {
	return val.length <= maxStatsLength;
}

// make a model using the Gacha schema
const Gacha = mongoose.model('Gacha', GachaSchema, 'Gachas')
exports.Gacha = Gacha;

/* Gacha resource API methods *****************/
exports.createGacha = function(req, res) {
    //create new gacha with Gacha model
    const gacha = new Gacha({
        name: req.body.name,
        desc: req.body.desc,
        coverPic: req.body.coverPic,
        iconPic: req.body.iconPic,
        stats: req.body.stats,
        threeStars: req.body.threeStars,
        fourStars: req.body.fourStars,
        fiveStars: req.body.fiveStars,
        creator: req.body.creator
    });

    // Save gacha to the database
    user.User.findById(req.body.creator).then(user => {
        if (!user) {
            res.status(404).send();
        } else {
            gacha.save().then(gacha => {
                user.ownGachas.push(gacha._id);
                delete user.password;
                user.save().then(result => {
                    res.status(200).send({gacha: gacha, user: result});
                })
            });
        }         
    }).catch(err => {
        res.status(500).send(err); // server error
    });
};

exports.getAllGachas = function(req, res) {
    Gacha.find().then(
        result => {
            log();
            res.status(200).send({ result }); // can wrap in object if want to add more properties
        },
        err => {
            res.status(500).send(err); // server error
        }
    );
};

exports.getGachaById = function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    // Otherwise, findById
    Gacha.findById(id)
        .then(result => {
            if (!result) {
                res.status(404).send(); // could not find this gacha
            } else {
                res.status(200).send(result);
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error
        });
};

exports.updateGachaInfo = function(req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    Gacha.findById(id)
        .then(gacha => {
            if (!gacha) {
                res.status(404).send(); // could not find this gacha
            } else {
                if (gacha.creator != req.session.user._id && !req.session.user.isAdmin) {
                    res.status(401).send(); // unauthorized
                } else {
                    
                    //clean request body
                    if (req.body.threeStars) gacha.threeStars = req.body.threeStars;
                    if (req.body.fourStars) gacha.fourStars = req.body.fourStars;
                    if (req.body.fiveStars) gacha.fiveStars = req.body.fiveStars;
                    if (req.body.active) gacha.active = req.body.active;
                    if (req.body.name) gacha.name = req.body.name;
                    if (req.body.desc) gacha.desc = req.body.desc;
                    if (req.body.coverPic) gacha.coverPic = req.body.coverPic;
                    if (req.body.iconPic) gacha.iconPic = req.body.iconPic;
                    if (req.body.creator) gacha.creator = req.body.creator;

                    gacha.save().then(result => {
                        res.status(200).send(result);
                    }).catch((err) => {
                        res.status(400).send(err);
                    })
                }
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error
        });

    /* Elegant but incomplete solution
    const updateQuery = cleanGachaUpdateReq(req, false);
    const searchQuery = { _id: id };
    if (!req.session.user.isAdmin) {
        searchQuery.creator = req.session.user;
    } 

    Gacha.findOneAndUpdate(searchQuery, { $set: updateQuery }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
     */
    
};

exports.pushGachaInfo = function(req, res) {
	if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    Gacha.findById(id)
        .then(gacha => {
            if (!gacha) {
                res.status(404).send(); // could not find this gacha
            } else {
                if (gacha.creator != req.session.user._id && !req.session.user.isAdmin) {
                    res.status(401).send(); // unauthorized
                } else {
                    //clean request body
                    if (req.body.stats) gacha.stats.push(req.body.stats);
                    if (req.body.threeStars) gacha.threeStars.push(req.body.threeStars);
                    if (req.body.fourStars) gacha.fourStars.push(req.body.fourStars);
                    if (req.body.fiveStars) gacha.fiveStars.push(req.body.fiveStars);

                    gacha.save().then(result => {
                        res.status(200).send(result);
                    }).catch((err) => {
                        res.status(400).send(err);
                    })
                }
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error
        });
    
    /* Elegant but incomplete solution
    const updateQuery = cleanGachaUpdateReq(req, true);
    const searchQuery = { _id: id };
    if (!req.session.user.isAdmin) {
        searchQuery.creator = req.session.user;
    } 

    Gacha.findOneAndUpdate(searchQuery, { $push: updateQuery }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
    */
};

exports.addStats = function(req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    Gacha.findById(id)
        .then(gacha => {
            if (!gacha) {
                res.status(404).send(); // could not find this gacha
            } else {
                if (gacha.creator != req.session.user._id && !req.session.user.isAdmin) {
                    res.status(401).send(); // unauthorized
                } else {
                    const charaUpdateQuery = { stats: [] };
                    if (req.body.stats) {
                        let i;
                        for (i = 0; i < req.body.stats.length; i++) {
                            let statId = mongoose.Types.ObjectId();
                            gacha.stats.push({name: req.body.stats[i], _id: statId})
                            charaUpdateQuery.stats.push({ name: req.body.stats[i], value: 0, _id: statId });
                        }
                    }
                    
                    gacha.save().then(result => {
                        Chara.updateMany({gacha: id}, {$push: charaUpdateQuery}).then((writeResult) => {
                            if (writeResult.writeConcernError) {
                                res.status(500).send(writeResult.writeConcernError);
                            } else {
                                res.status(200).send({gacha: result, charaWriteResult: writeResult});
                            }
                        });
                    }).catch((err) => {
                        res.status(400).send(err);
                    })
                }
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error
        });

    /* Elegant but incomplete solution
    const updateQuery = { stats: [] };
    const newCharaStats = { stats: [] };
    let i;
    for (i = 0; i < req.body.stats.length; i++) {
        let statId = mongoose.Types.ObjectId();
        updateQuery.stats.push({name: req.body.stats[i], _id: statId})
        newCharaStats.stats.push({ name: req.body.stats[i], value: 0, _id: statId });
    }
    const searchQuery = { _id: id };
    if (!req.session.user.isAdmin) {
        searchQuery.creator = req.session.user;
    } 

    Gacha.findOneAndUpdate(searchQuery, { $push: updateQuery }, { new: true }).then((gacha) => {
        if (!gacha) {
            res.status(404).send();
        } else {
            Chara.updateMany({gacha: id}, {$push: newCharaStats}).then((writeResult) => {
                if (writeResult.writeConcernError) {
                    res.status(500).send(writeResult.writeConcernError);
                } else {
                    res.status(200).send({gacha: gacha, charaWriteResult: writeResult});
                }
            });
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
    */
};

exports.updateStat = function(req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id) || !ObjectID.isValid(req.body._id)) res.status(404).send(); //send 404 not found error if id is invalid

    Gacha.findById(id)
        .then(gacha => {
            if (!gacha) {
                res.status(404).send(); // could not find this gacha
            } else {
                if (gacha.creator != req.session.user._id && !req.session.user.isAdmin) {
                    res.status(401).send(); // unauthorized
                } else {
                    const charaUpdateQuery = {"stats.$.name": "" };
                    if (req.body) {
                        charaUpdateQuery["stats.$.name"] = req.body.name;
                        const statIndex = gacha.stats.findIndex(stat => stat._id == req.body._id);
                        gacha.stats[statIndex].name = req.body.name;
                    }
                    
                    gacha.save().then(result => {
                        Chara.updateMany({gacha: id, "stats._id": req.body._id }, {$set: charaUpdateQuery }).then((writeResult) => {
                            if (writeResult.writeConcernError) {
                                res.status(500).send(writeResult.writeConcernError);
                            } else {
                                res.status(200).send({gacha: result, charaWriteResult: writeResult});
                            }
                        });
                    }).catch((err) => {
                        res.status(400).send(err);
                    })
                }
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error
        });

    /* Elegant but incomplete solution
    const updateQuery = {"stats.$.name": req.body.name }
    const searchQuery = { _id: id, "stats._id": req.body._id };
    if (!req.session.user.isAdmin) {
        searchQuery.creator = req.session.user;
    } 

    Gacha.update(searchQuery, { $set: updateQuery }, { new: true }).then((gacha) => {
        if (!gacha) {
            res.status(404).send();
        } else {
            console.log("Chara.updateMany")
            Chara.updateMany({gacha: id, "stats._id": req.body._id }, {$set: updateQuery }).then((writeResult) => {
                if (writeResult.writeConcernError) {
                    res.status(500).send(writeResult.writeConcernError);
                } else {
                    console.log("succeeded")
                    res.status(200).send({gacha: gacha, charaWriteResult: writeResult});
                }
            });
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
    */
};

exports.deleteStats = function(req, res) {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = req.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    Gacha.findById(id)
        .then(gacha => {
            if (!gacha) {
                res.status(404).send(); // could not find this gacha
            } else {
                if (gacha.creator != req.session.user._id && !req.session.user.isAdmin) {
                    res.status(401).send(); // unauthorized
                } else {
                    const charaUpdateQuery = {};
                    if (req.body.stats) {
                        charaUpdateQuery["stats"] = {_id: {$in: req.body.stats}};
                        req.body.stats.forEach(statToDelete => { gacha.stats = gacha.stats.filter(stat => statToDelete._id != stat._id) })
                    }
                    
                    gacha.save().then(result => {
                        Chara.updateMany({gacha: id}, {$pull: charaUpdateQuery }).then((writeResult) => {
                            if (writeResult.writeConcernError) {
                                res.status(500).send(writeResult.writeConcernError);
                            } else {
                                res.status(200).send({gacha: result, charaWriteResult: writeResult});
                            }
                        });
                    }).catch((err) => {
                        res.status(400).send(err);
                    })
                }
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err); // server error
        });

    /*
    const updateQuery = {"stats": {_id: {$in: req.body.stats}}}
    const searchQuery = { _id: id };
    if (!req.session.user.isAdmin) {
        searchQuery.creator = req.session.user;
    } 

    Gacha.findOneAndUpdate(searchQuery, { $pull: updateQuery }, { new: true }).then((gacha) => {
        if (!gacha) {
            res.status(404).send();
        } else {
            Chara.updateMany({gacha: id}, {$pull: updateQuery }).then((writeResult) => {
                if (writeResult.writeConcernError) {
                    res.status(500).send(writeResult.writeConcernError);
                } else {
                    res.status(200).send({gacha: gacha, charaWriteResult: writeResult});
                }
            });
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
    */
};

exports.deleteGacha = function(req, res) {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    Gacha.findById(id)
        .then(gacha => {
            if (!gacha) {
                res.status(404).send(); // could not find this gacha
            } else {
                if (gacha.creator != req.session.user._id && !req.session.user.isAdmin) {
                    res.status(401).send(); // unauthorized
                } else {
                    gacha.remove().then(result => {
                        const update = { ownGachas: gacha._id }
                        user.User.findByIdAndUpdate(gacha.creator, { $pull: update }, { new: true }).then((creator) => {
                            if (!creator) {
                                res.status(404).send();
                            } else {
                                user.User.updateMany({"inventory.gacha": id }, { $pull: {"inventory": { "gacha": id }} }).then((users) => {
                                    Chara.deleteMany({gacha: id}).then((chara) => {
                                        res.status(200).send({gacha: gacha, 
                                            creator: user, 
                                            users: users,
                                            charasDeleted: chara});
                                    });
                                });
                                
                            }
                        }).catch((err) => {
                            res.status(500).send(err);
                        });
                    }).catch((err) => {
                        res.status(400).send(err);
                    })
                }
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error
        });

    /* Elegant but incomplete solution
    const searchQuery = { _id: id };
    if (!req.session.user.isAdmin) {
        searchQuery.creator = req.session.user;
    } 

    // Delete a gacha by their id
    Gacha.findOneAndRemove(searchQuery)
        .then(gacha => {
            if (!gacha) {
                res.status(404).send();
            } else {
				const update = { ownGachas: gacha._id }
				user.User.findByIdAndUpdate(gacha.creator, { $pull: update }, { new: true }).then((creator) => {
					if (!creator) {
						res.status(404).send();
					} else {
                        user.User.updateMany({"inventory.gacha": id }, { $pull: {"inventory": { "gacha": id }} }).then((users) => {
                            Chara.deleteMany({gacha: id}).then((chara) => {
                                res.status(200).send({gacha: gacha, 
                                    creator: user, 
                                    users: users,
                                    charasDeleted: chara});
                            });
                        });
						
					}
				}).catch((err) => {
					res.status(500).send(err);
				});
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error, could not delete.
        });
        */
};

/*Helpers */
function cleanGachaUpdateReq(req, push) {
    const updateQuery = {};
    if (req.body) {
		if (req.body.stats) updateQuery.stats = req.body.stats;
        if (req.body.threeStars) updateQuery.threeStars = req.body.threeStars;
        if (req.body.fourStars) updateQuery.fourStars = req.body.fourStars;
		if (req.body.fiveStars) updateQuery.fiveStars = req.body.fiveStars;
		
		if (!push) {
            if (req.body.active) updateQuery.active = req.body.active;
			if (req.body.name) updateQuery.name = req.body.name;
			if (req.body.desc) updateQuery.desc = req.body.desc;
			if (req.body.coverPic) updateQuery.coverPic = req.body.coverPic;
			if (req.body.iconPic) updateQuery.iconPic = req.body.iconPic;
			if (req.body.creator) updateQuery.creator = req.body.creator;
		}
    }
    return updateQuery;
};
