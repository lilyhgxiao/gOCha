import { setState, convertJSON, coverFileName, iconFileName, errorMatch } from "./helpers";

import { uploadFile, deleteFile, replaceFile, uploadPicsForNewObj } from "./fileHelpers";

import { s3URL, gachaFolder } from "./../constants";

const fetch = require('node-fetch');

/**TODO: delete most console.logs */

export const getGachaById = async (id) => {
    const url = "http://localhost:3001/gachas/" + id
    //const url = "/gachas/" + id 

    try {
        const res = await fetch(url);
        if (res.status === 200) {
            const gacha = await res.json();
            return gacha;
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const getGachasByCreator = async (id) => {
    const url = "http://localhost:3001/gachas/bycreator/" + id
    //const url = "/gachas/" + id 

    try {
        const res = await fetch(url);
        if (res.status === 200) {
            const gachas = await res.json();
            return { gachas: gachas };
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const fetchNewGacha = async (body) => {
    const url = "http://localhost:3001/gachas";
    //const url = "/gachas";

    const postBody = {};
    if (body.name) postBody.name = body.name;
    if (body.desc) postBody.desc = body.desc;
    if (body.stats) postBody.stats = body.stats;
    if (body.gacha) postBody.gacha = body.gacha;
    if (body.creator) postBody.creator = body.creator;

    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(postBody),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, json: json, msg: msg, err: null };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, json: null, msg: "Failed to create Gacha.", err: err };
    }
}

export const fetchPatchGacha = async (id, body) => {
    const url = "http://localhost:3001/gachas/" + id;
    //const url = "/gachas";

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
        return { status: res.status, json: json, msg: msg, err: msg };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, json: null, msg: "Failed to patch Gacha.", err: err };
    }
}


export const createNewGacha = async (body) => {
    const url = "http://localhost:3001/gachas";
    //const url = "/gachas"
    const msg = [];

    try {
        //post request
        const postRes = await fetchNewGacha(body);
        if (postRes.status !== 200) {
            return { status: postRes.status, 
                msg: postRes.msg,
                err: ["fetchNewGacha failed" + (postRes.err ? ": " + postRes.err : ".")] , 
                gacha: null };
        }

        const gacha = postRes.json.gacha;
        console.log(body)

        if (body.coverPic || body.iconPic) {
            const uploadRes = await uploadPicsForNewObj(gachaFolder, gacha._id, body);
            console.log(uploadRes);

            if (!uploadRes.coverPic || !uploadRes.iconPic) {
                msg.push("There was an error uploading the ");
                if (!uploadRes.coverPic) msg.push("cover image");
                if (!uploadRes.coverPic && !uploadRes.iconPic) msg.push(" and ");
                if (!uploadRes.iconPic) msg.push("icon image");
                msg.push(". Please reupload the image in the edit page.");
            }

            const patchRes = await fetchPatchGacha(gacha._id, uploadRes);
            if (patchRes.status !== 200 || patchRes.json === undefined) {
                msg.push(patchRes.msg);
                console.log(msg);
                return { status: postRes.status, 
                    msg: msg, 
                    err: "fetchPatchGacha failed" + (patchRes.err ? ": " + patchRes.err : "."),
                    gacha: gacha };
            } else {
                console.log(msg);
                return { status: postRes.status, 
                    msg: msg, 
                    err: null,
                    gacha: patchRes.json };
            }
        }
    } catch (err) {
        /**TODO: handle error with catch */
        console.log('fetch failed, ', err);
        return null;
    }
}

/**TODO: edit gacha*/
export const editGacha = async (id, body) => {
    const url = "http://localhost:3001/gachas/" + id;
    //const url = "/gachas/" + id; 

    const editBody = Object.assign({}, body);

    try {
        //upload pictures
        let coverPicUpload = null;
        let iconPicUpload = null;
        /**TODO: make this a helper method in filehelpers */
        if (body.coverPic) {
            coverPicUpload = replaceFile(body.coverPic, id, gachaFolder, true);
            if (coverPicUpload.newURL !== null) {
                editBody.coverPic = coverPicUpload.newURL;
            }
        }
        if (body.iconPic) {
            iconPicUpload = replaceFile(body.iconPic, id, gachaFolder, false);
            if (iconPicUpload.newURL !== null) {
                editBody.iconPic = iconPicUpload.newURL;
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
            let deleteCoverPic;
            let deleteIconPic;
            if (body.coverPic && coverPicUpload.newURL !== null) {
                deleteCoverPic = await deleteFile(body.coverPic.oldURL.replace(s3URL, ""));
            }
            if (body.iconPic && iconPicUpload.newURL !== null) {
                deleteIconPic = await deleteFile(body.coverPic.oldURL.replace(s3URL, ""));
            }
            return { gacha: json, deleteCoverPic: deleteCoverPic, deleteIconPic: deleteIconPic };
        }
    } catch (err) {
        /**TODO: handle error with catch */
        console.log('fetch failed, ', err);
        return null;
    }
}

/**TODO: add stat */
export const addStatsToGacha = async (id, body) => {
    const url = "http://localhost:3001/gachas/stats/new/" + id;
    //const url = "/gachas/stats/new/" + id; 

    try {
        //patch res
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
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
            /**TODO: handle json undefined */
            return null;
        }
        /**TODO: check # of characters changed...? */
        if (json.gacha === undefined) {
            return { gacha: json.gacha };
        }
    } catch (err) {
        /**TODO: handle error with catch */
        console.log('fetch failed, ', err);
        return null;
    }
}

/**TODO: update stat */
export const updateStatsOnGacha = async (id, body) => {
    const url = "http://localhost:3001/gachas/stats/update/" + id;
    //const url = "/gachas/stats/update/" + id; 

    try {
        //patch res
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
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
            /**TODO: handle json undefined */
            return null;
        }
        /**TODO: check # of characters changed...? */
        if (json.gacha === undefined) {
            return { gacha: json.gacha };
        }
    } catch (err) {
        /**TODO: handle error with catch */
        console.log('fetch failed, ', err);
        return null;
    }
}

/**TODO: delete stat */
export const deleteStatsOnGacha = async (id, body) => {
    const url = "http://localhost:3001/gachas/stats/delete/" + id;
    //const url = "/gachas/stats/delete/" + id; 

    try {
        //patch res
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
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
            /**TODO: handle json undefined */
            return null;
        }
        /**TODO: check # of characters changed...? */
        if (json.gacha === undefined) {
            return { gacha: json.gacha };
        }
    } catch (err) {
        /**TODO: handle error with catch */
        console.log('fetch failed, ', err);
        return null;
    }
}
