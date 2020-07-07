import { setState, convertJSON, coverFileName, iconFileName } from "./helpers";

import { uploadFile, deleteFile, replaceFile } from "./fileHelpers";

import { s3URL, charaFolder } from "./../constants";

const fetch = require('node-fetch');

export const getCharaById = async (id) => {
    const url = "http://localhost:3001/charas/" + id
    //const url = "/charas/" + id 

    try {
        const res = await fetch(url);
        if (res.status === 404) { //resource not found
            /**TODO: handle 404 error */
            return null;
        } else if (res.status === 500) { //internal server error
            /**TODO: handle 500 error */
            return null;
        }
        const chara = await res.json();
        return chara;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const getAllCharasInGacha = async (id) => {
    const url = "http://localhost:3001/charas/ingacha/" + id
    //const url = "/charas/ingacha/" + id 

    try {
        const res = await fetch(url);
        if (res.status === 404) { //resource not found
            /**TODO: handle 404 error */
            return null;
        } else if (res.status === 500) { //internal server error
            /**TODO: handle 500 error */
            return null;
        }
        const charas = await res.json();
        return charas.result;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const createNewChara = async (id, body) => {
    const url = "http://localhost:3001/charas/" + id;
    //const url = "/charas/" + id

    try {
        //post request
        const res = await fetch(url, {
            method: 'POST',
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
            console.log(await res.json())
            return null;
        }
        const json = await res.json();
        if (json === undefined) {
            /**TODO: handle if json is not defined */
            return null;
        }

        setState("currUser", json.user)
        const chara = json.chara;
        const gacha = json.gacha;

        /**TODO: handle if coverPic and iconPic don't exist */
        //uploading pictures to s3
        const newCoverPicName = coverFileName(charaFolder, chara._id, body.coverPicRaw, 0);
        const newIconPicName = iconFileName(charaFolder, chara._id, body.iconPicRaw, 0);
        const uploadCoverRes = uploadFile(body.coverPicRaw, newCoverPicName);
        const uploadIconRes = uploadFile(body.iconPicRaw, newIconPicName);

        //check the upload responses
        return Promise.all([uploadCoverRes, uploadIconRes]).then(async (res) => {
            console.log(res);
            const patchBody = {};
            if (!res[0]) { //cover pic failed
                /**TODO: handle cover pic failure */
                console.log("Error with uploading cover pic.");
            } else {
                patchBody.coverPic = s3URL + newCoverPicName;
            }
            if (!res[1]) { //icon pic failed
                /**TODO: handle icon pic failure */
                console.log("Error with uploading icon pic.");
            } else {
                patchBody.iconPic = s3URL + newIconPicName;
            }

            //patch gacha to include the cover and icon pic urls
            const patchUrl = "http://localhost:3001/charas/" + chara._id;
            //const patchUrl = "/charas/" + chara._id;

            //patch res
            const patchRes = await fetch(patchUrl, {
                method: 'PATCH',
                body: JSON.stringify(patchBody),
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                credentials: "include",
            });
            if (patchRes.status === 401) { //unauthorized
                /**TODO: handle 401 error */
                console.log(patchRes)
                return { chara: chara, gacha: gacha };
            } else if (patchRes.status === 404) { //resource not found
                /**TODO: handle 404 error */
                console.log(patchRes)
                return { chara: chara, gacha: gacha };
            } else if (patchRes.status === 500) { //internal server error
                /**TODO: handle 500 error */
                console.log(patchRes)
                return { chara: chara, gacha: gacha };
            }

            const patchJson = await patchRes.json();
            if (patchJson === undefined) { //patch failed
                return { chara: chara, gacha: gacha };
            } else {
                return { chara: patchJson, gacha: gacha };
            }
        }).catch((err) => {
            /**TODO: handle error with promise all */
            console.log("Error with Promise.all in createNewChara " + err);
            return null;
        });
    } catch (err) {
        /**TODO: handle error with catch */
        console.log('fetch failed, ', err);
        return null;
    }
}

/**TODO: edit gacha*/
export const editChara = async (id, body) => {
    const url = "http://localhost:3001/charas/" + id;
    //const url = "/charas/" + id; 

    try {
        const editBody = Object.assign({}, body);

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
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(convertJSON(editBody)),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        const json = await res.json();
        if (res.status === 401) { //unauthorized
            /**TODO: handle 401 error */
            console.log(json)
            return null;
        } else if (res.status === 404) { //resource not found
            /**TODO: handle 404 error */
            console.log(json)
            return null;
        } else if (res.status === 500) { //internal server error
            /**TODO: handle 500 error */
            console.log(json)
            return null;
        }

        console.log(json)
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
            return { chara: json.result, deleteCoverPic: deleteCoverPic, deleteIconPic: deleteIconPic };
        }
    } catch (err) {
        console.log(err);
        return null;
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
        if (res.status === 404) { //resource not found
            /**TODO: handle 404 error */
            return null;
        } else if (res.status === 401) { //unauthorized
            /**TODO: handle 401 error */
            return null;
        } else if (res.status === 500) { //internal server error
            /**TODO: handle 500 error */
            return null;
        }
        const json = await res.json();
        return json;
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}