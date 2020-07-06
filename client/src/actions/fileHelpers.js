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