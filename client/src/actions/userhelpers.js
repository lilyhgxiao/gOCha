import { setState, setEmptyState, convertJSON, coverFileName, iconFileName } from "./helpers";

import { uploadFile, deleteFile } from "./fileHelpers";

import { s3URL } from "./../constants";

const fetch = require('node-fetch');

/**TODO: delete most console.logs */

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
        if (res.status === 400) { //bad request error
            /**TODO: handle 400 error */
            const json = await res.json();
            return {signupSuccess: false, msg: json.message};
        }
        const user = await res.json();
        if (user !== undefined) {
            setState("currUser", user);

            //create session to login user upon creation
            /**TODO: move this to the signup page. */
            const loginBody = { username: newUser.username, password: newUser.password }
            const loginRes = await fetch("http://localhost:3001/users/login", {
                method: 'POST',
                body: JSON.stringify(convertJSON(loginBody)),
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            });
            if (loginRes.status === 400) {
                /**TODO: handle 400 error */
                console.log("login unsuccessful")
            } else {
                console.log("login succeeded")
            }
            return { signupSuccess: true, msg: "Successful signup" };
        }
        return { signupSuccess: true, msg: "Successful signup" };
        /**TODO: handle if user is undefined */
    } catch (err) {
        /**TODO: handle error */
        console.log('fetch failed, ', err);
        return {signupSuccess: false, msg: err};
    }
}

export const getUserById = async function (id) {
    const url = "http://localhost:3001/users/id/" + id;
    //const url = "/users/id/" + id;

    try {
        const res = await fetch(url);
        if (res.status === 404) { //resource not found
             /**TODO: handle 404 error */
             return null;
        } else if (res.status === 500) { //internal server error
            /**TODO: handle 500 error */
            return null;
        }
        const user = await res.json();
        return user;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const getUserByUsername = async function (username) {
    const url = "http://localhost:3001/users/username/" + username
    //const url = "/users/username/" + username 

    try {
        const res = await fetch(url);
        if (res.status === 404) { //resource not found
             /**TODO: handle 404 error */
             return null;
        } else if (res.status === 500) { //internal server error
            /**TODO: handle 500 error */
            return null;
        }
        const user = await res.json();
        return user;
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
        if (res.status === 404) { //resource not found
             /**TODO: handle 404 error */
             return null;
        } else if (res.status === 500) { //internal server error
            /**TODO: handle 500 error */
            return null;
        }
        const user = await res.json();
        return user;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const editUser = async function (id, body) {
    const url = "http://localhost:3001/users/" + id;
    //const url = "/gachas/" + id; 

    const editBody = Object.assign({}, body);

    //upload pictures
    let iconPicUpload = null;
    let newIconVer = 0;
    if (body.iconPic) {
        const oldIconVer = parseInt(body.iconPic.oldURL.substring(body.iconPic.oldURL.lastIndexOf("_v") + 2, body.iconPic.oldURL.lastIndexOf(".")));
        newIconVer = isNaN(oldIconVer) ? 0 : (oldIconVer + 1) % 50;
        iconPicUpload = body.iconPic ? await uploadFile(body.iconPic.raw, iconFileName(id, body.iconPic.raw, newIconVer)) : null;
        if (!iconPicUpload.message) {
            editBody.iconPic = s3URL + iconFileName(id, body.iconPic.raw, newIconVer);
            const iconPicDelete = deleteFile(body.iconPic.oldURL.replace(s3URL,""));
        } else {
            console.log("Error with uploading icon pic."); //icon pic failed
        }
    }

    //patch res
    const res = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(convertJSON(editBody)),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        credentials: "include",
    });
    if (res.status === 401) { //unauthorized
        /**TODO: handle 401 error */
        console.log(res)
        return null;
    } else if (res.status === 404) { //resource not found
        /**TODO: handle 404 error */
        console.log(res)
        return null;
    } else if (res.status === 500) { //internal server error
        /**TODO: handle 500 error */
        console.log(res)
        return null;
    }

    const json = await res.json();
    if (json === undefined) { //patch failed
        return null;
    } else {
        return { user: json };
    }
}

export const summonChara = async function (id, chara, cost) {
    const url = "http://localhost:3001/users/summonChara/" + id;
    //const url = "/users/summonChara/" + id

    const body = {starFrags: cost * (-1), chara: {_id: chara._id, gacha: chara.gacha, creator: chara.creator}};

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        if (res.status === 400) {
            /**TODO: handle 400 error */
            return null;
        } else if  (res.status === 404) {
            /**TODO: handle 404 error */
            return null;
        } else if  (res.status === 401) {
            /**TODO: handle 401 error */
            return null;
        } else if (res.status === 500) {
            /**TODO: handle 500 error */
            return null;
        }
        const user = await res.json();
        if (user !== undefined) {
            console.log(user)
            setState("currUser", user);
            return true;
        }
        /**TODO: handle user undefined case */
        return null;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const incCurrency = async function (id, starFrags, silvers) {
    const url = "http://localhost:3001/users/incCurrency/" + id;
    //const url = "/users/incCurrency/" + id

    const body = {starFrags: starFrags, silvers: silvers};
    try {
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        if (res.status === 404) {
            /**TODO: handle 404 error */
            return null;
        } else if  (res.status === 401) {
            /**TODO: handle 401 error */
            return null;
        } else if (res.status === 500) {
            /**TODO: handle 500 error */
            return null;
        }
        const user = await res.json();
        if (user !== undefined) {
            console.log(user)
            setState("currUser", user);
            return true;
        }
        /**TODO: handle user undefined case */
        return null;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
} 

export const pushUserInfo = async function (id, body) {
    const url = "http://localhost:3001/users/push/" + id;

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        if (res.status === 404) {
            /**TODO: handle 404 error */
            return null;
        } else if  (res.status === 401) {
            /**TODO: handle 401 error */
            return null;
        } else if (res.status === 500) {
            /**TODO: handle 500 error */
            return null;
        }
        const user = await res.json();
        if (user !== undefined) {
            setState("currUser", user);
            return true;
        }
        /**TODO: handle user undefined case */
        return null;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const pullUserInfo = async function (id, body) {
    const url = "http://localhost:3001/users/pull/" + id;

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        if (res.status === 404) {
            /**TODO: handle 404 error */
            return null;
        } else if  (res.status === 401) {
            /**TODO: handle 401 error */
            return null;
        } else if (res.status === 500) {
            /**TODO: handle 500 error */
            return null;
        }
        const user = await res.json();
        if (user !== undefined) {
            setState("currUser", user);
            return true;
        }
        /**TODO: handle user undefined case */
        return null;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const deleteUser = async function (id) {
    const url = "http://localhost:3001/users/" + id;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        if (res.status === 404) {
            /**TODO: handle 404 error */
            return null;
        } else if  (res.status === 401) {
            /**TODO: handle 401 error */
            return null;
        } else if (res.status === 500) {
            /**TODO: handle 500 error */
            return null;
        }
        const user = await res.json();
        if (user !== undefined) {
            setEmptyState();
            return true;
        }
        /**TODO: handle user undefined case */
        return null;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}