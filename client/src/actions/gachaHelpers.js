import { setState, convertJSON, coverFileName, iconFileName } from "./helpers";

import { uploadFile, deleteFile } from "./fileHelpers";

import { s3URL } from "./../constants";

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

export const createNewGacha = async (body) => {
    const url = "http://localhost:3001/gachas"
    //const url = "/gachas"

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
            console.log(res)
            return null;
        }
        const json = await res.json();
        if (json === undefined) {
            /**TODO: handle if json is not defined */
            return null;
        }

        setState("currUser", json.user)
        const gacha = json.gacha;

        /**TODO: handle if coverPic and iconPic don't exist */
        //uploading pictures to s3
        const newCoverPicName = coverFileName(gacha._id, body.coverPic, 0);
        const newIconPicName = iconFileName(gacha._id, body.iconPic, 0);
        const uploadCoverRes = uploadFile(body.coverPic, newCoverPicName);
        const uploadIconRes = uploadFile(body.iconPic, newIconPicName);

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
            const patchUrl = "http://localhost:3001/gachas/" + gacha._id
            //const patchUrl = "/gachas/" + gacha._id

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
                return { gacha: gacha };
            } else if (patchRes.status === 404) { //resource not found
                /**TODO: handle 404 error */
                console.log(patchRes)
                return { gacha: gacha };
            } else if (patchRes.status === 500) { //internal server error
                /**TODO: handle 500 error */
                console.log(patchRes)
                return { gacha: gacha };
            }

            const patchJson = await patchRes.json();
            if (patchJson === undefined) { //patch failed
                return { gacha: gacha };
            } else {
                return { gacha: patchJson };
            }
        }).catch((err) => {
            /**TODO: handle error with promise all */
            console.log("Error with Promise.all in createNewGacha " + err);
            return null;
        });
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

    //upload pictures
    let coverPicUpload = null;
    let iconPicUpload = null;
    let newCoverVer = 0;
    let newIconVer = 0;
    console.log(body.coverPic)
    if (body.coverPic) {
        const oldCoverVer = parseInt(body.coverPic.oldURL.substring(body.coverPic.oldURL.lastIndexOf("_v") + 2, body.coverPic.oldURL.lastIndexOf(".")));
        newCoverVer = isNaN(oldCoverVer) ? 0 : (oldCoverVer + 1) % 50;
        coverPicUpload = body.coverPic ? await uploadFile(body.coverPic.raw, coverFileName(id, body.coverPic.raw, newCoverVer)) : null;
        if (!coverPicUpload.message) {
            editBody.coverPic = s3URL + coverFileName(id, body.coverPic.raw, newCoverVer);
            console.log(body.coverPic.oldURL.replace(s3URL,""))
            const coverPicDelete = deleteFile(body.coverPic.oldURL.replace(s3URL,""));
        } else {
            console.log("Error with uploading cover pic."); //cover pic failed
        }
    }
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
        return { gacha: json };
    }
}

/**TODO: add stat */
export const addStatsToGacha = async (id, body) => {
    const url = "http://localhost:3001/gachas/stats/new/" + id;
    //const url = "/gachas/stats/new/" + id; 

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
}

/**TODO: update stat */
export const updateStatsOnGacha = async (id, body) => {
    const url = "http://localhost:3001/gachas/stats/update/" + id;
    //const url = "/gachas/stats/update/" + id; 

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
}

/**TODO: delete stat */
export const deleteStatsOnGacha = async (id, body) => {
    const url = "http://localhost:3001/gachas/stats/delete/" + id;
    //const url = "/gachas/stats/delete/" + id; 

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
}
