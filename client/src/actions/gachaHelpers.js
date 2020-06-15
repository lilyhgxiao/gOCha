import { setState, convertJSON } from "./helpers";
import { getState } from "statezero";

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