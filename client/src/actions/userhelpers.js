import { setState, setEmptyState, errorMatch } from "./helpers";

import { deleteFile, replaceFile } from "./fileHelpers";

import { s3URL, userFolder } from "./../constants";

const fetch = require('node-fetch');

/**TODO: delete most console.logs */
export const fetchNewUser = async (body) => {
    const url = "http://localhost:3001/users";
    //const url = "/users";

    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, user: json.user, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, user: null, msg: "Failed to create User.", err: err };
    }
}

export const fetchPatchUser = async (id, body) => {
    const url = "http://localhost:3001/users" + id;
    //const url = "/users" + id;

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
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, user: json.user, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, user: null, msg: "Failed to patch User.", err: err };
    }
}

export const signup = async function (newUser) {
    try {
        const postRes = await fetchNewUser(newUser);
        if (postRes.status !== 200) {
            return { status: postRes.status, 
                msg: postRes.msg,
                err: "signup failed: " + (postRes.err ? ": " + postRes.err : "."),
                user: null };
        } else {
            return { status: postRes.status, 
                msg: postRes.msg,
                err: null,
                user: postRes.user };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, 
            msg: "Failed to create User.",
            err: "signup failed: " + err,
            user: null };
    }
}

export const getUserById = async function (id) {
    const url = "http://localhost:3001/users/id/" + id;
    //const url = "/users/id/" + id;

    try {
        const res = await fetch(url);
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, user: json.user, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, user: null, msg: "Failed to get User.", err: err };
    }
}

export const getUserByUsername = async function (username) {
    const url = "http://localhost:3001/users/username/" + username
    //const url = "/users/username/" + username 

    try {
        const res = await fetch(url);
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, user: json.user, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, user: null, msg: "Failed to get User.", err: err };
    }
}

export const getUserByEmail = async function (email) {
    const url = "http://localhost:3001/users/email/" + email
    //const url = "/users/email/" + email

    try {
        const res = await fetch(url);
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, user: json.user, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, user: null, msg: "Failed to get User.", err: err };
    }
}

export const editUser = async function (id, body) {
    const msg = [];
    const editBody = Object.assign({}, body);

    try {
        //upload pictures
        let iconPicUpload = null;
        if (body.iconPic) {
            iconPicUpload = await replaceFile(body.iconPic, id, userFolder, false);
            if (iconPicUpload.newURL !== null) {
                editBody.iconPic = iconPicUpload.newURL;
            }
        }

        //patch res
        const patchRes = await fetchNewUser(editBody);
        if (patchRes.status !== 200 || patchRes.user === null) {
            msg.push(patchRes.msg);
            return { status: patchRes.status, msg: msg, 
                err: "editUser failed" + (patchRes.err ? ": " + patchRes.err : "."),
                user: patchRes.user, deleteIconPic: null };
        } else {
            let deleteIconPic;
            if (body.iconPic && iconPicUpload.newURL !== null) {
                deleteIconPic = await deleteFile(body.iconPic.oldURL.replace(s3URL, ""));
            }
            return { status: patchRes.status, msg: msg, err: null,
                user: patchRes.user,
                deleteIconPic: deleteIconPic };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, user: null, msg: "Failed to edit User.", err: err, 
            deleteIconPic: null };
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
        const json = await res.json();
        let msg = errorMatch(res);
        console.log(json);
        if (res.status !== 200 || json.user === null) {
            
            return { status: res.status, user: null, msg: msg, err: json.err };
        } else {
            setState("currUser", json.user);
            return { status: res.status, user: json.user, msg: msg, err: null };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, user: null, msg: "Failed to summon.", err: err };
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
        const json = await res.json();
        let msg = errorMatch(res);
        if (res.status !== 200 || json.user === null) {
            return { status: res.status, user: null, msg: msg, err: json.err };
        } else {
            setState("currUser", json.user);
            return { status: res.status, user: json.user, msg: msg, err: null };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, user: null, msg: "Failed to increase currency.", err: err };
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
        const json = await res.json();
        let msg = errorMatch(res);
        if (res.status !== 200 || json.user === null) {
            return { status: res.status, user: null, msg: msg, err: json.err };
        } else {
            setState("currUser", json.user);
            return { status: res.status, user: json.user, msg: msg, err: null };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, user: null, msg: "Failed to patch user.", err: err };
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
        const json = await res.json();
        let msg = errorMatch(res);
        if (res.status !== 200 || json.user === null) {
            return { status: res.status, user: null, msg: msg, err: json.err };
        } else {
            setState("currUser", json.user);
            return { status: res.status, user: json.user, msg: msg, err: null };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, user: null, msg: "Failed to patch user.", err: err };
    }
}

export const deleteUser = async function (id) {
    const url = "http://localhost:3001/users/" + id;

    try {
        //get all gachas and charas created by the user to delete their pictures from amazon s3
        const getGachasURL = "http://localhost:3001/gachas/bycreator/" + id;
        const getCharasURL = "http://localhost:3001/charas/bycreator/" + id;
        const getGachasRes = await fetch(getGachasURL);
        const getCharasRes = await fetch(getCharasURL);

        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        const json = await res.json();
        let msg = errorMatch(res);
        if (res.status !== 200 || json.user === null) {
            return { status: res.status, user: null, msg: msg, err: json.err };
        } else {
            setEmptyState();
            const toDeletePics = getGachasRes.gachas.concat(getCharasRes.charas);
            toDeletePics.forEach(obj => {
                deleteFile(obj.coverPic.replace(s3URL, ""));
                deleteFile(obj.iconPic.replace(s3URL, ""));
            });
            return { status: res.status, user: json.user, msg: msg, err: null };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, user: null, msg: "Failed to delete user.", err: err };
    }
}