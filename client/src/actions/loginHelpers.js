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
        if (res.status === 401) { //unauthorized
            /**TODO: handle 401 error */
            return null;
        }
        const json = await res.json();
        if (json && json.currUser) {
            setState("currUser", json.currUser);
            return { currUser: json.currUser };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
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
        if (res.status === 401) { //unauthorized
            /**TODO: handle 401 error */
            return null;
        }
        const json = await res.json();
        if (json && json.currUser) {
            setState("currUser", json.currUser);
            return { currUser: json.currUser };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
    }
}

export const login = async function () {
    //const url = "/users/login";
    const url = "http://localhost:3001/users/login";
    const reqBody = JSON.stringify(getState("loginForm"));

    // Send the request with fetch()
    try {
        const res = await fetch(url, { 
            method: 'POST', 
            body: reqBody,
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            credentials: "include",
        });

        if (res.status === 400) {
            /**TODO: handle 400 error */
            return { isAdmin: null, loginSuccessful: false};
        }
        const json = await res.json();
        const currUser = json.currUser;
        if (currUser !== undefined) {
            await setState("currUser", currUser);
            return { isAdmin: currUser.isAdmin, loginSuccessful: true };
        }
        return { isAdmin: null, loginSuccessful: false};
    } catch (err) {
        console.log('fetch failed, ', err);
        return { isAdmin: null, loginSuccessful: false};
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
