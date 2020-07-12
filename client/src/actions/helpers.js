import set from "lodash-es/set";
import { action } from "statezero";
import { updateSession } from "./loginHelpers";

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