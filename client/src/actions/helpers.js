import set from "lodash-es/set";
import { action } from "statezero";
import { updateSession } from "./loginHelpers";
import { getAllCharasInGacha } from "./charaHelpers";
import { getGachaById } from "./gachaHelpers";

import { summonCost, threeStarChance, fourStarChance } from "../constants";

// Initialize all state paths used by your app as empty.
// These are the states that you can filter using filterState()
// as needed by specific components. All component classes that read
// from these state paths must extend BaseReactComponent class.
//
// - currentUser state path is used by the root App component
// - studentForm and message state paths are used by the StudentForm component
// - studentList state path is used by the StudentList component
export const setEmptyState = () => {
    setState("currUser", null);
};

// Helper method to set a state path.
// Usage: setState(STATE_PATH_NAME, STATE_PATH_VALUE);
export const setState = action(async ({ commit, state }, path, value) => {
    set(state, path, value);
    commit(state);
});

export const convertJSON = (obj) => {
    let newObj = JSON.parse(JSON.stringify(obj));

    for (const property in obj) {
        if (typeof newObj[property] === 'number' || typeof newObj[property] === 'boolean') {
            newObj[property] = `${newObj[property]}`;
        }
    }
    return newObj;
}

export const coverFileName = (folder, gachaId, file, version) => {
    return folder + gachaId + "_coverPic_v" + version + (file.type).replace("image/", ".");
}

export const iconFileName = (folder, gachaId, file, version) => {
    return folder + gachaId + "_iconPic_v" + version + (file.type).replace("image/", ".");
}

export const errorMatch = (res) => {
    if (res.status === 401) { //unauthorized
        return "The user is unauthorized to access this resource.";
    } else if (res.status === 404) { //resource not found
        return "The resource was not found.";
    } else if (res.status === 500) { //internal server error
        return "Internal server error.";
    } else {
        return null;
    }
}

export const checkAndUpdateSession = async function (callback) {
    const readSessRes = await updateSession();
    if (!readSessRes || !readSessRes.currUser) {
        if (readSessRes && readSessRes.status && readSessRes.msg) {
            this.setState({
                error: { code: readSessRes.status, msg: readSessRes.msg, toLogin: true }
            });
            return false;
        } else {
            this.setState({
                error: { code: 500, msg: "Something went wrong and your session has expired." +
                    "Please log in again.", toLogin: true }
            });
            return false;
        }
    }
    this._isMounted && this.setState({
        currUser: readSessRes.currUser
    }, callback);
    return true;
}

export const processError = function (res, toDashboard, toLogin) {
    this._isMounted && this.setState({
        error: {
            code: res ? res.status : 500,
            msg: res ? res.msg : "Something went wrong.",
            toDashboard: toDashboard,
            toLogin: toLogin
        }
    });
}

export const resizeMainContainer = function (className) {
    const mainBodyContainer = document.querySelector(".mainBodyContainer");
    const containerStyle = window.getComputedStyle(document.querySelector(className));

    const newHeight = parseInt(containerStyle.height) + parseInt(containerStyle.marginTop) * 3;
    mainBodyContainer.style.height = newHeight.toString() + "px";
}

export const summon = async function (gacha) {
    if (this.state.currUser.starFrags < summonCost) {
        this._isMounted && this.setState({
            alert: {
                text: ["Your a poor bich"],
                okText: ":("
            }
        });
        return;
    }
    //roll to see which tier character to get
    const rarityRoll = Math.random();

    //try multiple times in case the gacha is changed during the summon
    let retries = 5;
    let rarityList;
    let randCharaCheck;
    let rolledCharacter;
    while (retries > 0) {
        try {
            rarityList = await rollRarity(rarityRoll, gacha._id);
            if (!rarityList.rarityToPickFrom) {
                retries--;
                continue;
            }
            randCharaCheck = await selectRandomChara.bind(this)(rarityList.rarityToPickFrom, gacha._id);
            if (!randCharaCheck.retry && !randCharaCheck.rolledCharacter) {
                this._isMounted && this.setState({
                    alert: randCharaCheck.alert
                });
                return { rolledCharacter: null };
            }
            if (randCharaCheck.rolledCharacter) {
                this._isMounted && this.setState({
                    rolledCharacter: randCharaCheck.rolledCharacter
                });
                return { rolledCharacter: randCharaCheck.rolledCharacter };
            }
            if (randCharaCheck.gacha) {
                this._isMounted && this.setState({
                    gacha: randCharaCheck.gacha
                });
            }
            retries--;
        } catch (err) {
            console.log("Could not summon: " + err);
            retries--;
        }
    }
    //if all retries used up, reload gacha information
    if (retries == 0 && !rolledCharacter) {
        this._isMounted && this.setState({
            alert: {
                title: "Oh no!",
                text: ["Something went wrong during the summon..."],
                handleOk: this.refreshPage
            }
        });
        return { rolledCharacter: null };
    }
    return { rolledCharacter: null };
}

async function rollRarity (roll, gachaId) {
    try {
        const getCharas = await getAllCharasInGacha(gachaId);
        if (!getCharas || !getCharas.charas) {
            return { getCharas: getCharas, rarityToPickFrom: null };
        }
        let rarityToPickFrom;
        if (roll < threeStarChance) { //rolled a three star
            rarityToPickFrom = getCharas.charas.filter(chara => chara.rarity === 3);
        } else if (roll >= threeStarChance && roll < threeStarChance + fourStarChance) { // rolled a four star
            rarityToPickFrom = getCharas.charas.filter(chara => chara.rarity === 4);
        } else { //rolled a five star
            rarityToPickFrom = getCharas.charas.filter(chara => chara.rarity === 5);
        }
        return { getCharas: getCharas, rarityToPickFrom: rarityToPickFrom };
    } catch (err) {
        return { getCharas: null, rarityToPickFrom: null };
    }
}

async function selectRandomChara (rarityToPickFrom, gachaId) {
    try {
        //pick a random character from the rarity list
        const rolledCharacter = rarityToPickFrom[Math.floor(Math.random() * rarityToPickFrom.length)];
        //if it exists, stop and set the state
        if (rolledCharacter) {
            return { retry: false, rolledCharacter: rolledCharacter, gacha: null, alert: null };
        } else { //if it doesn't exist, reload the gacha information
            const getGacha = await getGachaById(gachaId);
            if (!getGacha || !getGacha.gacha) {
                return { retry: false, rolledCharacter: null, gacha: null, 
                    alert: {
                        title: "Oh no!",
                        text: ["This gacha can't be found anymore..."],
                        okText: "Go Back to the Dashboard",
                        handleOk: this.redirectToDashboard
                    } 
                };
            }
            const reloadGacha = getGacha.gacha;
            if (!reloadGacha.active) {
                return { retry: false, rolledCharacter: null,  gacha: null,
                    alert: {
                        title: "Oh no!",
                        text: ["This gacha has been set to inactive..."],
                        handleOk: this.refreshPage
                    } 
                };
            } else {
                //if the gacha exists, reroll from the newly retrieved gacha
                return { retry: true, rolledCharacter: null,  gacha: reloadGacha,
                    alert: {
                        title: "Oh no!",
                        text: ["This gacha has been set to inactive..."],
                        handleOk: this.refreshPage
                    } 
                };
            }
        }
    } catch (err) {
        console.log("Could not summon: " + err);
        return { retry: true, rolledCharacter: null,  gacha: null,
            alert: {
                title: "Oh no!",
                text: ["Something went wrong during the summon..."],
                handleOk: this.refreshPage
            }
        };
    }
}