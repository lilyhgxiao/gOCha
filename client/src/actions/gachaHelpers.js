import { setState, convertJSON } from "./helpers";

import { uploadFile } from "./fileHelpers";

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
        } else if (res.status === 404 ) { //resource not found
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

        //uploading pictures to s3
        const newCoverPicName = "gacha_images/" + gacha._id + "_coverPic" + (body.coverPic.type).replace("image/", ".");
        const newIconPicName = "gacha_images/" + gacha._id + "_iconPic" + (body.iconPic.type).replace("image/", ".");
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
            } else if (patchRes.status === 404 ) { //resource not found
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

/**TODO: add stat */

/**TODO: delete stat */

/**TODO: update stat */