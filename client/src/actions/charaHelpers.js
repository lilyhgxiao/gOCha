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