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

var cors = require('cors')
app.use(cors())

mongoose.set('useFindAndModify', false);

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
    user.User.findByUsernamePassword(username, password)
        .then(user => {
            // Add the user's id to the session cookie.
            // We can check later if this exists to ensure we are logged in.
            req.session.user = user._id;
            log(user)
            res.status(200).send({ currUser: user });
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
        res.status(200).send({ currUser: req.session.user });
    } else {
        res.status(401).send();
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

//a DELETE route to remove a user from the database
app.delete('/users/:id', user.deleteUser);



/* Gacha routes */
// a POST route to *create* a gacha
app.post("/gachas", gacha.createGacha);

// a GET route to get all gachas
app.get("/gachas", gacha.getAllGachas);

/// a GET route to get a gacha by its id.
app.get("/gachas/:id", gacha.getGachaById);

//a PATCH route to update gacha info
app.patch('/gachas/:id', gacha.updateGachaInfo);

//a PATCH route to push new elements onto gacha info
app.patch('/gachas/push/:id', gacha.pushGachaInfo);

/// a DELETE route to remove a gacha by its id.
app.delete("/gachas/:id", gacha.deleteGacha);



/* Character routes */
//a POST route to create a character in a specified gacha
app.post("/charas/:id", chara.createChara);

//a GET route to get all characters that belong to a specified gacha
app.get("/charas/ingacha/:id", chara.getCharasByGacha);

//a GET route to retrieve details on a particular chara
app.get('/charas/:id', chara.getCharaById);

//a PATCH route to change chara details
app.patch("/charas/:id", chara.updateCharaInfo);

//a PATCH route to push new elements onto chara info
app.patch('/charas/push/:id', chara.pushCharaInfo);

/// a DELETE route to remove a chara by its id.
app.delete("/charas/:id", chara.deleteChara);


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
