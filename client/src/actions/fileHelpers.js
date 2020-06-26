const fetch = require('node-fetch');

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
            console.log(putRes.url)
            return putRes;
            
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const getFile = async (fileName) => {
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
