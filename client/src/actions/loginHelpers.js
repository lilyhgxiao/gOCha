import { setState, setEmptyState } from "./helpers";
// getState is used to get the value of a state path
import { getState } from "statezero";

const fetch = require('node-fetch');

/**TODO: get rid of most console.logs */

export const updateLoginForm = field => {
    const { name, value } = field;
    setState(`loginForm.${name}`, value);
};

export const readSession = async function () {
    //const url = "/users/check-session";
    const url = "http://localhost:3001/users/check-session";

    try {
        const res = await fetch(url, { 
            method: 'GET',
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            credentials: "include",
        });
        const json = await res.json();
        let msg;
        if (res.status === 401) { //unauthorized
            msg = "You are not logged in, or your session has expired.";
        }
        return { status: res.status, currUser: json.currUser, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, currUser: null, msg: "Could not read session.", 
            err: "readSession failed: " + err };
    }
};

export const updateSession = async function () {
    //const url = "/users/update-session";
    const url = "http://localhost:3001/users/update-session";

    try {
        const res = await fetch(url, { 
            method: 'GET',
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            credentials: "include",
        });
        const json = await res.json();
        let msg;
        if (res.status === 401) { //unauthorized
            msg = "You are not logged in, or your session has expired.";
        } else if (res.status === 404) {
            msg = "The current logged in user could not be found.";
        } else if (res.status === 500) {
            msg = "Could not update the user.";
        }
        return { status: res.status, currUser: json.currUser, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, currUser: null, msg: "Could not update session.", 
            err: "updateSession failed: " + err };
    }
}

export const login = async function (body) {
    //const url = "/users/login";
    const url = "http://localhost:3001/users/login";

    // Send the request with fetch()
    try {
        const res = await fetch(url, { 
            method: 'POST', 
            body: JSON.stringify(body),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            credentials: "include",
        });
        const json = await res.json();
        let msg;
        if (res.status === 400) { //unauthorized
            msg = "Invalid username/password combination. Please try again.";
        } else if (res.status === 500) {
            msg = "Could not login in. Please check your connection.";
        }
        return { status: res.status, currUser: json.currUser, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, currUser: null, msg: "Could not login.", err: "login failed: " + err};
    }
};

export const logout = async function () {
    //const url = "/users/logout";
    const url = "http://localhost:3001/users/logout";

    try {
        const res = await fetch(url);
        if (res.status === 200) {
            setEmptyState();
        }
    } catch (err) {
        console.log('fetch failed, ', err);
    }
};
