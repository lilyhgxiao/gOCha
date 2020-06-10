import { setState, convertJSON } from "./helpers";
import { getState } from "statezero";

export const getCharaById = async (id) => {
    const url = "http://localhost:3001/charas/" + id
    //const url = "/charas/" + id 

    try {
        const res = await fetch(url);
        if (res.status === 200) {
            const chara = await res.json();
            return chara;
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}