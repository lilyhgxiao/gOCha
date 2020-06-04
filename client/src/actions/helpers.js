import set from "lodash-es/set";
import { action } from "statezero";

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
export const setState = action(({ commit, state }, path, value) => {
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