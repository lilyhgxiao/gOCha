import { setState, convertJSON, errorMatch } from "./helpers";

import { uploadPicsForNewObj, deleteFile, replaceFile } from "./fileHelpers";

import { s3URL, charaFolder } from "./../constants";

const fetch = require('node-fetch');

export const getCharaById = async (id) => {
    const url = "http://localhost:3001/charas/" + id
    //const url = "/charas/" + id 

    try {
        const res = await fetch(url);
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, chara: json.chara, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, chara: null, msg: "Failed to get Chara.", err: err };
    }
}

export const getAllCharasInGacha = async (id) => {
    const url = "http://localhost:3001/charas/ingacha/" + id
    //const url = "/charas/ingacha/" + id 

    try {
        const res = await fetch(url);
        const json = await res.json();
        let msg = errorMatch(res);
        return { status: res.status, charas: json.charas, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, charas: null, msg: "Failed to get Charas.", err: err };
    }
}

export const fetchNewChara = async (id, body) => {
    const url = "http://localhost:3001/charas/" + id;
    //const url = "/charas/" + id;

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
        return { status: res.status, chara: json.chara, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, chara: null, msg: "Failed to create Chara.", err: err };
    }
}

export const fetchPatchChara = async (id, body) => {
    const url = "http://localhost:3001/charas/" + id;
    //const url = "/charas/" + id;

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
        return { status: res.status, chara: json.chara, msg: msg, err: json.err };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, chara: null, msg: "Failed to patch Chara.", err: err };
    }
}

export const createNewChara = async (id, body) => {
    const msg = [];

    const postBody = {};
    if (body.name) postBody.name = body.name;
    if (body.creator) postBody.creator = body.creator;
    if (body.rarity) postBody.rarity = body.rarity;
    if (body.desc) postBody.desc = body.desc;
    if (body.stats) postBody.stats = body.stats;
    if (body.welcomePhrase) postBody.welcomePhrase = body.welcomePhrase;
    if (body.summonPhrase) postBody.summonPhrase = body.summonPhrase;

    try {
        //post request
        const postRes = await fetchNewChara(id, postBody);
        if (postRes.status !== 200) {
            return { status: postRes.status, 
                msg: postRes.msg,
                err: ["fetchNewChara failed" + (postRes.err ? ": " + postRes.err : ".")] , 
                chara: null };
        }

        /**TODO: handle if coverPic and iconPic don't exist */
        const chara = postRes.chara;
        if (body.coverPic || body.iconPic) {
            const uploadRes = await uploadPicsForNewObj(charaFolder, chara._id, body);

            if (!uploadRes.coverPic || !uploadRes.iconPic) {
                msg.push("There was an error uploading the ");
                if (!uploadRes.coverPic) msg.push("cover image");
                if (!uploadRes.coverPic && !uploadRes.iconPic) msg.push(" and ");
                if (!uploadRes.iconPic) msg.push("icon image");
                msg.push(". Please reupload the image in the edit page.");
            }

            const patchRes = await fetchPatchChara(chara._id, uploadRes);
            if (patchRes.status !== 200 || patchRes.chara === null) {
                msg.push(patchRes.msg);
                console.log()
                return { status: postRes.status, msg: msg, 
                    err: "fetchPatchChara failed" + (patchRes.err ? ": " + patchRes.err : "."),
                    chara: chara };
            } else {
                return { status: postRes.status, msg: msg, err: null,
                    chara: patchRes.chara };
            }
        } else {
            return { status: postRes.status, msg: msg, 
                err: null, chara: chara };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: 500, msg: "Failed to create Chara.", err: err, chara: null };
    }
}

/**TODO: edit chara*/
export const editChara = async (id, body) => {
    const msg = [];
    const editBody = Object.assign({}, body);

    try {
        //upload pictures
        let coverPicUpload = null;
        let iconPicUpload = null;
        if (body.coverPic) {
            coverPicUpload = replaceFile(body.coverPic, id, charaFolder, true);
            if (coverPicUpload.newURL !== null) {
                editBody.coverPic = coverPicUpload.newURL;
            }
        }
        if (body.iconPic) {
            iconPicUpload = replaceFile(body.iconPic, id, charaFolder, false);
            if (iconPicUpload.newURL !== null) {
                editBody.iconPic = iconPicUpload.newURL;
            }
        }

        //patch res
        const patchRes = await fetchPatchChara(id, editBody);
        if (patchRes.status !== 200 || patchRes.chara === null) {
            msg.push(patchRes.msg);
            return { status: patchRes.status, msg: msg, 
                err: "fetchPatchGacha failed" + (patchRes.err ? ": " + patchRes.err : "."),
                chara: patchRes.chara, deleteCoverPic: null, deleteIconPic: null };
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
                chara: patchRes.chara,
                deleteCoverPic: deleteCoverPic, 
                deleteIconPic: deleteIconPic };
        }
    } catch (err) {
        console.log(err);
        return { status: null, chara: null, msg: "Failed to patch Chara.", err: err, deleteCoverPic: null,
            deleteIconPic: null };
    }

}

export const deleteCharaById = async (id) => {
    const url = "http://localhost:3001/charas/" + id
    //const url = "/charas/" + id 

    /**TODO: delete the images of the characters from Amazon S3 */
    try {
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
        let deleteCoverPic;
        let deleteIconPic;
        if (json.chara && json.chara.coverPic && json.chara.coverPic !== "") {
            deleteCoverPic = await deleteFile(json.chara.coverPic.replace(s3URL, ""));
        }
        if (json.chara && json.chara.iconPic && json.chara.iconPic !== "") {
            deleteIconPic = await deleteFile(json.chara.iconPic.replace(s3URL, ""));
        }
        return { status: res.status, chara: json.chara, msg: msg, err: json.err,
            deleteCoverPic: deleteCoverPic, deleteIconPic: deleteIconPic };
    } catch (err) {
        console.log('fetch failed, ', err);
        return { status: null, chara: null, msg: "Failed to delete Chara.", err: err,
            deleteCoverPic: null, deleteIconPic: null };
    }
}