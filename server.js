/* server.js nov 20 */
"use strict";
const log = console.log;

import { displayPurpose } from './constants';
import { cleanCharaUpdateReq, cleanGachaUpdateReq, cleanUserUpdateReq } from './serverHelpers';

const express = require("express");
// starting the express server
const app = express();

// mongoose and mongo connection
const { mongoose } = require("./db/mongoose");

// import the mongoose models
const { User } = require("./models/user");
const { Gacha } = require("./models/gacha");
const { Chara } = require("./models/chara");

// to validate object IDs
const { ObjectID } = require("mongodb");

// body-parser: middleware for parsing HTTP JSON body into a usable object
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// express-session for managing user sessions
const session = require("express-session");
app.use(bodyParser.urlencoded({ extended: true }));

/*** Session handling **************************************/
// Create a session cookie
app.use(
    session({
        secret: "oursecret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 600000,
            httpOnly: true
        }
    })
);

// A route to login and create a session
app.post("/users/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    log(username, password);
    // Use the static method on the User model to find a user
    // by their email and password
    User.findByUsernamePassword(username, password)
        .then(user => {
            // Add the user's id to the session cookie.
            // We can check later if this exists to ensure we are logged in.
            req.session.username = user.username;
            res.status(200).send({ currUser: user.username });
        })
        .catch(error => {
            res.status(400).send()
        });
});

// A route to logout a user
app.get("/users/logout", (req, res) => {
    // Remove the session
    req.session.destroy(error => {
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send()
        }
    });
});

// A route to check if a use is logged in on the session cookie
app.get("/users/check-session", (req, res) => {
    if (req.session.user) {
        res.status(200).send({ currentUser: req.session.email });
    } else {
        res.status(401).send();
    }
});

/*********************************************************/

/*** API Routes below ************************************/

/** User resource routes **/

/* Gacha routes */
// a POST route to *create* a gacha
app.post("/gachas", (req, res) => {
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
    gacha.save().then(
        result => {
            res.status(200).send(result);
        },
        err => {
            res.status(400).send(err); // 400 for bad request
        }
    );
});

// a GET route to get all gachas
app.get("/gachas", (req, res) => {
    Gacha.find().then(
        result => {
            log();
            res.status(200).send({ result }); // can wrap in object if want to add more properties
        },
        err => {
            res.status(500).send(err); // server error
        }
    );
});

/// a GET route to get a gacha by its id.
app.get("/gachas/:id", (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    // Otherwise, findById
    Gacha.findById(id)
        .then(result => {
            if (!result) {
                res.status(404).send(); // could not find this gacha
            } else {
                if (req.body.purpose === displayPurpose) req.session.gachaDisplayed = id;
                res.status(200).send(result);
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error
        });
});

//a PATCH route to update gacha info
app.patch('/gachas/:id', (req, res) => {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = request.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    const reqBody = cleanGachaUpdateReq(req);

    Gacha.findByIdAndUpdate(id, { $set: reqBody }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
});

/// a DELETE route to remove a gacha by its id.
app.delete("/gachas/:id", (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    // Delete a gacha by their id
    Gacha.findByIdAndRemove(id)
        .then(result => {
            if (!result) {
                res.status(404).send();
            } else {
                res.status(200).send(result);
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error, could not delete.
        });
});


/* Character routes */
//a POST route to create a character in a specified gacha
app.post("/charas/:id", (req, res) => {
    const id = req.params.id;

    //create a new Chara
    const chara = new Chara({
        name: req.body.username, 
        rarity: req.body.rarity,
        desc: req.body.desc,
        mainPic: req.body.mainPic,
        iconPic: req.body.iconPic,
        stats: req.body.stats,
        gacha: mongoose.Types.ObjectId(id),
        creator: mongoose.Types.ObjectId(req.body.creator)
    })

    //Save the chara
    chara.save().then(
        result => {
            res.status(200).send(result);
        },
        err => {
            res.status(500).send(err);
        }
    )
});

//a GET route to get all characters that belong to a specified gacha
app.get("/charas/ingacha/:id", (req, res) => {
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

});

//a GET route to retrieve details on a particular chara
app.get('/charas/:id', (req, res) => {
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
});

//a PATCH route to change chara details
app.patch("/charas/:id", (req, res) => {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = request.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    const reqBody = cleanCharaUpdateReq(req);

    Chara.findByIdAndUpdate(id, { $set: reqBody }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
});

/// a DELETE route to remove a chara by its id.
app.delete("/gachas/:id", (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    // Delete a chara by their id
    Chara.findByIdAndRemove(id)
        .then(result => {
            if (!result) {
                res.status(404).send();
            } else {
                res.status(200).send(result);
            }
        })
        .catch(err => {
            res.status(500).send(err); // server error, could not delete.
        });
});


/** User routes below **/
//a POST route to *create* a user
app.post("/users", (req, res) => {
    // Create a new user
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
});

// a GET route to get all users
app.get("/users", (req, res) => {
    User.find().then(
        result => {
            res.status(200).send({ result }); // can wrap in object if want to add more properties
        },
        err => {
            res.status(500).send(err); // server error
        }
    );
});

//a GET route to retrieve details on a particular user
app.get('users/:id', (req, res) => {
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
})

//a PATCH route to update user info
app.patch('/users/:id', (req, res) => {
    if (!req.session.user) {
        res.status(401).send(); //send 401 unauthorized error if not logged in
    }
    //get id from the url
    const id = request.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) res.status(404).send(); //send 404 not found error if id is invalid

    const reqBody = cleanUserUpdateReq(req);

    User.findByIdAndUpdate(id, { $set: reqBody }, { new: true }).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
});

//a DELETE route to remove a user from the database
app.delete('/users/:id', (req, res) => {
    //get id from the url
    const id = request.params.id;

    //check for a valid mongodb id
    if (!ObjectID.isValid(id)) response.status(404).send(); //send 404 not found error if id is invalid
    

    // Attempt to remove the pet with the specefied id
    User.findByIdAndRemove(id).then((result) => {
        if (!result) {
            res.status(404).send();
        } else {
            res.status(200).send(result);
        }
    }).catch((err) => {
        res.status(500).send(err);
    })
})

/*** Webpage routes below **********************************/
// Serve the build
app.use(express.static(__dirname + "/client/build"));

// All routes other than above will go to index.html
app.get("*", (req, res) => {
    res.sendFile(__dirname + "/client/build/index.html");
});

/*************************************************/
// Express server listening...
const port = process.env.PORT || 3001;
app.listen(port, () => {
    log(`Listening on port ${port}...`);
});
