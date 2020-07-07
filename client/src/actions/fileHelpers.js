import { coverFileName, iconFileName } from "./helpers";

import { s3URL } from "./../constants";

const fetch = require('node-fetch');

/**TODO: get rid of most console.logs */

export const uploadFile = async (file, fileName) => {

    let url = "http://localhost:3001/generate-put-url?";
    //const url = "/generate-put-url?Key=${encodeURIComponent(file.name)}&ContentType=${encodeURIComponent(file.type)}"

    url += "Key=" + encodeURIComponent(fileName);
    url +=  "&ContentType=" + encodeURIComponent(file.type);

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': file.type
            }
        });
        if (res.status === 200) {
            const getJson = await res.json();
            console.log(getJson);
            
            const putRes = await fetch(getJson.putURL, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type
                },
                body: file
            });
            console.log(putRes)
            return putRes;
            
        } else {
            return { message: "Upload failed." };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { message: "Upload failed." };
    }
}

export const deleteFile = async (fileName) => {
    let url = "http://localhost:3001/delete-object?";
    //const url = "/generate-put-url?Key=${encodeURIComponent(file.name)}&ContentType=${encodeURIComponent(file.type)}"

    url += "Key=" + encodeURIComponent(fileName);

    try {
        const res = await fetch(url, {
            method: 'DELETE'
        });
        if (res.status === 200) {
            return res;
        } else {
            return { message: "Delete failed." };
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return { message: "Delete failed." };
    }
}

/**TODO: fix up this function and test it */
export const getFile = async (fileName) => {
    /**TODO: fix url */
    const url = "http://localhost:3001/generate-get-url?Key=${encodeURIComponent(fileName)}&ContentType=${encodeURIComponent(file.type)}"
    //const url = "/generate-get-url?Key=${encodeURIComponent(file.name)}&ContentType=${encodeURIComponent(file.type)}"

    try {
        const res = await fetch(url, {
            method: 'GET'
        });
        if (res.status === 200) {
            const json = await res.json();
            return json;
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const uploadPicsForNewObj = (folder, id, body) => {
    let newCoverPicName = "";
    let newIconPicName = "";
    let uploadCoverRes = null;
    let uploadIconRes = null;
    if (body.coverPic) {
        newCoverPicName = coverFileName(folder, id, body.coverPic, 0);
        uploadCoverRes = uploadFile(body.coverPic, newCoverPicName);
    }
    if (body.iconPic) {
        newIconPicName = iconFileName(folder, id, body.iconPic, 0);
        uploadIconRes = uploadFile(body.iconPic, newIconPicName);
    }
    
    //check the upload responses
    return Promise.all([uploadCoverRes, uploadIconRes]).then((res) => {
        const patchBody = {uploadRes: []};
        if (!res[0]) { //cover pic failed
            /**TODO: handle cover pic failure */
            console.log("Error with uploading cover pic.");
            patchBody.coverPic = null;
        } else {
            patchBody.coverPic = s3URL + newCoverPicName;
        }
        if (!res[1]) { //icon pic failed
            /**TODO: handle icon pic failure */
            console.log("Error with uploading icon pic.");
            patchBody.iconPic = null;
        } else {
            patchBody.iconPic = s3URL + newIconPicName;
        }
        return patchBody;
    }).catch((err) => {
        /**TODO: handle error with promise all */
        console.log("Error with Promise.all in uploadPicsForNewObj " + err);
        return { coverPic: null, iconPic: null };
    });
}

export const replaceFile = async (pic, id, folder, cover) => {
    let coverOrIcon = cover ? "coverPic" : "iconPic";
    let reg =  new RegExp(`${s3URL}${folder}[a-f\d0-9]{24}_${coverOrIcon}_v[0-9]+\.[a-z]+`, "i");
    let newFilename;
    if (pic.oldURL.match(reg) !== null) {
        const oldVer = parseInt(pic.oldURL.substring(pic.oldURL.lastIndexOf("_v") + 2, pic.oldURL.lastIndexOf(".")));
        const newVer = isNaN(oldVer) ? 0 : (oldVer + 1) % 50;
        newFilename = cover ? coverFileName(folder, id, pic.raw, newVer) : iconFileName(folder, id, pic.raw, newVer);
    } else {
        newFilename = cover ? coverFileName(folder, id, pic.raw, 0) : iconFileName(folder, id, pic.raw, 0);
    }
    const picUpload = await uploadFile(pic.raw, newFilename);
    if (!uploadFile.message) {
        const newURL = s3URL + newFilename;
        return { newURL: newURL, uploadRes: picUpload };
    } else {
        console.log("Error with uploading cover pic."); //cover pic failed
        return { newURL: null, uploadRes: picUpload };
    }    
}
