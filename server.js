/* server.js nov 20 */
"use strict";
const log = console.log;

const constant = require("./client/src/constants");

const express = require("express");
// starting the express server
const app = express();

// mongoose and mongo connection
const { mongoose } = require("./db/mongoose");

// import the mongoose models
const user = require("./models/user");
const gacha = require("./models/gacha");
const chara = require("./models/chara");

// to validate object IDs
const { ObjectID } = require("mongodb");

const multer = require('multer')
var fs = require('fs');

mongoose.set('useFindAndModify', false);

// body-parser: middleware for parsing HTTP JSON body into a usable object
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// express-session for managing user sessions
const session = require("express-session");
app.use(bodyParser.urlencoded({ extended: true }));

const {
    generateGetUrl,
    generatePutUrl,
    deleteAWSObject
  } = require('./AWSPresigner');

  /**TODO: change all id comparisons to use toString() */


/*** Session handling **************************************/
app.use(function(req, res, next) {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        console.log(origin);
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
  });

// Create a session cookie
app.use(
    session({
        secret: "oursecret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 60000000,
            httpOnly: true
        }
    })
);

// A route to login and create a session
app.post("/users/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    user.User.findByUsernamePassword(username, password)
        .then(user => {
            if (!user) {
                res.status(400).send({ currUser: user, err: "login failed: incorrect username/password combination"});
            } else {
                req.session.user = user;
                res.status(200).send({ currUser: user, err: null });
            }
        })
        .catch(err => {
            res.status(500).send({ currUser: user, err: "login failed: " + err });
        });
});

// A route to logout a user
app.get("/users/logout", (req, res) => {
    // Remove the session
    req.session.destroy(error => {
        if (error) {
            res.status(500).send({ err: error });
        } else {
            res.status(200).send({ err: null });
        }
    });
});

// A route to check if a use is logged in on the session cookie
app.get("/users/check-session", (req, res) => {
    if (req.session.user) {
        res.status(200).send({ currUser: req.session.user, err: null });
    } else {
        res.status(401).send({ currUser: null, err: "check-session failed: no session" });
    }
});

app.get("/users/update-session", async (req, res) => {
    if (req.session.user) {
		try {
			const result = await user.User.findById(req.session.user._id).exec();
			if (!result) {
				res.status(404).send({ currUser: null, err: "update-session failed: could not find user" });
			} else {
				req.session.user = result;
				res.status(200).send({ currUser: req.session.user, err: null });
			}
		} catch (err) {
			res.status(500).send({ currUser: null, err: "update-session failed: could not update user" });
		}
    } else {
        res.status(401).send({ currUser: null, err: "update-session failed: no session" });
    }
});

/*********************************************************/

/*** API Routes below ************************************/

/** User resource routes **/

/** User routes below **/
//a POST route to *create* a user
app.post("/users", user.createUser);

// a GET route to get all users
app.get("/users", user.getAllUsers);

//a GET route to retrieve details on a particular user's id
app.get('/users/id/:id', user.getUserById);

//a GET route to retrieve details on a particular user's username
app.get('/users/username/:username', user.getUserByUsername);

//a GET route to retrieve details on a particular user's email
app.get('/users/email/:email', user.getUserByEmail);

//a PATCH route to update user info
app.patch('/users/:id', user.updateUserInfo);

//a PATCH route to push new elements onto user info
app.patch('/users/push/:id', user.pushUserInfo);

//a PATCH route to pull elements from user info
app.patch('/users/pull/:id', user.pullUserInfo);

//a PATCH route to change user currency
app.patch('/users/incCurrency/:id', user.incCurrency);

//a PATCH route to summon a character by deducting star frags and pushing a new character onto the inventory
app.patch('/users/summonChara/:id', user.summonChara);

//a DELETE route to remove a user from the database
app.delete('/users/:id', user.deleteUser);



/* Gacha routes */
// a POST route to *create* a gacha
app.post("/gachas", gacha.createGacha);

// a GET route to get all gachas
app.get("/gachas", gacha.getAllGachas);

/// a GET route to get a gacha by its id.
app.get("/gachas/:id", gacha.getGachaById);

/// a GET route to get all gachas by their creator.
app.get("/gachas/bycreator/:id", gacha.getGachasByCreator);

//a PATCH route to update gacha info
app.patch('/gachas/:id', gacha.updateGachaInfo);

//a PATCH route to push new elements onto gacha info
app.patch('/gachas/push/:id', gacha.pushGachaInfo);

//a PATCH route to add new stats to the gacha
app.patch('/gachas/stats/new/:id', gacha.addStats);

//a PATCH route to update stat names
app.patch('/gachas/stats/update/:id', gacha.updateStat);

//a PATCH route to delete stats from the gacha
app.patch('/gachas/stats/delete/:id', gacha.deleteStats);

/// a DELETE route to remove a gacha by its id.
app.delete("/gachas/:id", gacha.deleteGacha);



/* Character routes */
//a POST route to create a character in a specified gacha
app.post("/charas/:id", chara.createChara);

//a GET route to get all characters that belong to a specified gacha
app.get("/charas/ingacha/:id", chara.getCharasByGacha);

//a GET route to get all characters that belong to a specified gacha
app.get("/charas/bycreator/:id", chara.getCharasByCreator);

//a GET route to retrieve details on a particular chara
app.get('/charas/:id', chara.getCharaById);

//a PATCH route to change chara details
app.patch("/charas/:id", chara.updateCharaInfo);

//a PATCH route to push new elements onto chara info
app.patch('/charas/push/:id', chara.pushCharaInfo);

/// a DELETE route to remove a chara by its id.
app.delete("/charas/:id", chara.deleteChara);


/* AWS get/put URL routes */
// GET URL
app.get('/generate-get-url', (req, res) => {
    // Both Key and ContentType are defined in the client side.
    // Key refers to the remote name of the file.
    const { Key } = req.query;
    generateGetUrl(Key)
        .then(getURL => {
            res.send(getURL);
        })
        .catch(err => {
            res.send(err);
        });
});

// PUT URL
app.get('/generate-put-url', (req, res) => {
    // Both Key and ContentType are defined in the client side.
    // Key refers to the remote name of the file.
    // ContentType refers to the MIME content type, in this case image/jpeg
    const { Key, ContentType } = req.query;
    generatePutUrl(Key, ContentType).then(putURL => {
        res.send({ putURL });
    })
        .catch(err => {
            res.send(err);
        });
});

app.delete('/delete-object', (req, res) => {
    const { Key } = req.query;
    deleteAWSObject(Key).then(data => {
        res.status(200).send({data});
    }).catch(err => {
        res.status(500).send(err);
    })
});

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
