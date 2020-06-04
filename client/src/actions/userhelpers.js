import { setState, setEmptyState, convertJSON } from "./helpers";
import { getState } from "statezero";

export const signup = async function (newUser) {
    const url = "http://localhost:3001/users"
    //const url = "/users"

    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(convertJSON(newUser)),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        });
        if (res.status === 200) {
            const user = await res.json();
            if (user !== undefined) {
                setState("currUser", user);
                return { signupSuccess: true, msg: "Successful signup" };
            }
        } else if (res.status === 400) {
            const json = await res.json();
            return {signupSuccess: false, msg: json.message};
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return {signupSuccess: false, msg: err};
    }
}

export const getUserByUsername = async function (username) {
    const url = "http://localhost:3001/users/username/" + username
    //const url = "/users/username/" + username 

    try {
        const res = await fetch(url);
        if (res.status === 200) {
            const user = await res.json();
            return user;
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const getUserByEmail = async function (email) {
    const url = "http://localhost:3001/users/email/" + email
    //const url = "/users/email/" + email

    try {
        const res = await fetch(url);
        if (res.status === 200) {
            const user = await res.json();
            return user;
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}