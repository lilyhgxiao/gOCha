import { setState, setEmptyState, convertJSON } from "./helpers";
import { getState } from "statezero";

const fetch = require('node-fetch');

export const signup = async function (newUser) {
    const url = "http://localhost:3001/users"
    //const url = "/users"

    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(convertJSON(newUser)),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        });
        if (res.status === 200) {
            const user = await res.json();
            if (user !== undefined) {
                setState("currUser", user);

                const loginBody = {username: newUser.username, password: newUser.password}

                const loginRes = await fetch("http://localhost:3001/users/login", {
                    method: 'POST',
                    body: JSON.stringify(convertJSON(loginBody)),
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                });
                if (loginRes.status === 200) {
                    console.log("login succeeded")
                } else {
                    console.log("login unsuccessful")
                }
                return { signupSuccess: true, msg: "Successful signup" };
            }
        } else if (res.status === 400) {
            const json = await res.json();
            return {signupSuccess: false, msg: json.message};
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return {signupSuccess: false, msg: err};
    }
}

export const getUserById = async function (id) {
    const url = "http://localhost:3001/users/id/" + id;
    //const url = "/users/id/" + id;

    try {
        const res = await fetch(url);
        if (res.status === 200) {
            const user = await res.json();
            return user;
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const getUserByUsername = async function (username) {
    const url = "http://localhost:3001/users/username/" + username
    //const url = "/users/username/" + username 

    try {
        const res = await fetch(url);
        if (res.status === 200) {
            const user = await res.json();
            return user;
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const getUserByEmail = async function (email) {
    const url = "http://localhost:3001/users/email/" + email
    //const url = "/users/email/" + email

    try {
        const res = await fetch(url);
        if (res.status === 200) {
            const user = await res.json();
            return user;
        } else {
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const summonChara = async function (id, chara, cost) {
    const url = "http://localhost:3001/users/summonChara/" + id;
    //const url = "/users/summonChara/" + id

    const body = {starFrags: cost * (-1), chara: {_id: chara._id, gacha: chara.gacha, creator: chara.creator}};

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        if (res.status === 200) {
            const user = await res.json();
            if (user !== undefined) {
                console.log(user)
                setState("currUser", user);
                return true;
            }
        } else if (res.status === 400) {
            //do something else if bad request
            return null;
        } else if (res.status === 401) {
            //do something else if bad request
            return null;
        }else {
            //status is 500
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const incCurrency = async function (id, starFrags, silvers) {
    const url = "http://localhost:3001/users/incCurrency/" + id;
    //const url = "/users/incCurrency/" + id

    const body = {starFrags: starFrags, silvers: silvers};
    try {
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        if (res.status === 200) {
            const user = await res.json();
            if (user !== undefined) {
                console.log(user)
                setState("currUser", user);
                return true;
            }
        } else if (res.status === 400) {
            //do something else if bad request
            return null;
        } else if (res.status === 401) {
            //do something else if bad request
            return null;
        } else {
            //status is 500
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
} 

export const pushUserInfo = async function (id, body) {
    const url = "http://localhost:3001/users/push/" + id;

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        if (res.status === 200) {
            const user = await res.json();
            if (user !== undefined) {
                setState("currUser", user);
                return true;
            }
        } else if (res.status === 400) {
            //do something else if bad request
            return null;
        } else if (res.status === 401) {
            //do something else if bad request
            return null;
        } else {
            //status is 500
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}

export const pullUserInfo = async function (id, body) {
    const url = "http://localhost:3001/users/pull/" + id;

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: "include",
        });
        if (res.status === 200) {
            const user = await res.json();
            if (user !== undefined) {
                setState("currUser", user);
                return true;
            }
        } else if (res.status === 400) {
            //do something else if bad request
            return null;
        } else if (res.status === 401) {
            //do something else if bad request
            return null;
        } else {
            //status is 500
            return null;
        }
    } catch (err) {
        console.log('fetch failed, ', err);
        return null;
    }
}