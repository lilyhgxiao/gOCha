import { setState, convertJSON } from "./helpers";

import { uploadFile } from "./fileHelpers";

import { s3URL } from "./../constants";

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

    console.log("creating gacha")
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
        if (res.status !== 200) {
            console.log(res)
            return null;
        }
        const json = await res.json();
        if (json === undefined) {
            return null;
        }
        setState("currUser", json.user)
        const gacha = json.gacha;
        console.log("uploading pictures")
        const newCoverPicName = "gacha_images/" + gacha._id + "_coverPic" + (body.coverPic.type).replace("image/", ".");
        const newIconPicName = "gacha_images/" + gacha._id + "_iconPic" + (body.iconPic.type).replace("image/", ".");
        const uploadCoverRes = uploadFile(body.coverPic, newCoverPicName);
        const uploadIconRes = uploadFile(body.iconPic, newIconPicName);
        
        
        return Promise.all([uploadCoverRes, uploadIconRes]).then(async (res) => {
            console.log(res);
            const patchBody = {};
            if (!res[0]) {
                console.log("Error with uploading cover pic.");
            } else {
                patchBody.coverPic = s3URL + newCoverPicName;
            }
            if (!res[1]) {
                console.log("Error with uploading icon pic.");
            } else {
                patchBody.iconPic = s3URL + newIconPicName;
            }
            
            console.log("patching gacha")
            const patchUrl = "http://localhost:3001/gachas/" + gacha._id 
            //const patchUrl = "/gachas/" + gacha._id

            const patchRes = await fetch(patchUrl, {
                method: 'PATCH',
                body: JSON.stringify(patchBody),
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                credentials: "include",
            });
            if (patchRes.status !== 200) {
                return null;
            }
            const patchJson = await patchRes.json();
            console.log(patchJson);
            if (patchJson === undefined) {
                return { gacha: gacha };
            } else {
                return { gacha: patchJson };
            }

        }).catch((err) => {
            console.log("Error with Promise.all in createNewGacha " + err);
            return null;
        });
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

/**TODO: edit gacha*/

/**TODO: add stat */

/**TODO: delete stat */

/**TODO: update stat */