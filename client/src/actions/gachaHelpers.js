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
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, gacha: json.gacha, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, gacha: null, msg: "Failed to get Gacha.", err: err };
    }
}

export const getGachasByCreator = async (id) => {
    const url = "http://localhost:3001/gachas/bycreator/" + id
    //const url = "/gachas/" + id 

    try {
        const res = await fetch(url);
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, gachas: json.gachas, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, gachas: null, msg: "Failed to get Gachas.", err: err };
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
        return { status: res.status, gacha: json.gacha, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, gacha: null, msg: "Failed to create Gacha.", err: err };
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
        return { status: res.status, gacha: json.gacha, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, gacha: null, msg: "Failed to patch Gacha.", err: err };
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

        const gacha = postRes.gacha;

        if (body.coverPic || body.iconPic) {
            const uploadRes = await uploadPicsForNewObj(gachaFolder, gacha._id, body);

            if (!uploadRes.coverPic || !uploadRes.iconPic) {
                msg.push("There was an error uploading the ");
                if (!uploadRes.coverPic) msg.push("cover image");
                if (!uploadRes.coverPic && !uploadRes.iconPic) msg.push(" and ");
                if (!uploadRes.iconPic) msg.push("icon image");
                msg.push(". Please reupload the image in the edit page.");
            }

            const patchRes = await fetchPatchGacha(gacha._id, uploadRes);
            if (patchRes.status !== 200 || patchRes.gacha === null) {
                msg.push(patchRes.msg);
                return { status: postRes.status, msg: msg, 
                    err: "fetchPatchGacha failed" + (patchRes.err ? ": " + patchRes.err : "."),
                    gacha: gacha };
            } else {
                return { status: postRes.status, msg: msg, err: null,
                    gacha: patchRes.gacha };
            }
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, msg: "Failed to create Gacha.", err: err, gacha: null };
    }
}

export const editGacha = async (id, body) => {
    const msg = [];
    const editBody = Object.assign({}, body);

    try {
        //upload pictures
        let coverPicUpload = null;
        let iconPicUpload = null;
        if (body.coverPic) {
            coverPicUpload = await replaceFile(body.coverPic, id, gachaFolder, true);
            if (coverPicUpload.newURL !== null) {
                editBody.coverPic = coverPicUpload.newURL;
            }
        }
        if (body.iconPic) {
            iconPicUpload = await replaceFile(body.iconPic, id, gachaFolder, false);
            if (iconPicUpload.newURL !== null) {
                editBody.iconPic = iconPicUpload.newURL;
            }
        }

        //patch res
        const patchRes = await fetchPatchGacha(id, editBody);
        if (patchRes.status !== 200 || patchRes.gacha === null) {
            msg.push(patchRes.msg);
            return { status: patchRes.status, msg: msg, 
                err: "fetchPatchGacha failed" + (patchRes.err ? ": " + patchRes.err : "."),
                gacha: patchRes.gacha, deleteCoverPic: null, deleteIconPic: null };
        } else {
            let deleteCoverPic;
            let deleteIconPic;
            if (body.coverPic && coverPicUpload.newURL !== null) {
                deleteCoverPic = await deleteFile(body.coverPic.oldURL.replace(s3URL, ""));
            }
            if (body.iconPic && iconPicUpload.newURL !== null) {
                deleteIconPic = await deleteFile(body.iconPic.oldURL.replace(s3URL, ""));
            }
            return { status: patchRes.status, msg: msg, err: null,
                gacha: patchRes.gacha,
                deleteCoverPic: deleteCoverPic, 
                deleteIconPic: deleteIconPic };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, gacha: null, msg: "Failed to patch Gacha.", err: err, deleteCoverPic: null,
            deleteIconPic: null };
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
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, gacha: json.gacha, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, gacha: null, msg: "Failed to add stats to gacha.", err: err };
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
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, gacha: json.gacha, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, gacha: null, msg: "Failed to update stats on gacha.", err: err };
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
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, gacha: json.gacha, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, gacha: null, msg: "Failed to delete stats on gacha.", err: err };
    }
}
