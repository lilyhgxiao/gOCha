import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";

import BaseReactComponent from "./react-components/BaseReactComponent";

import Login from "./react-components/Login";
import Signup from "./react-components/Signup";
import Dashboard from "./react-components/Dashboard";

import { readCookie } from "./actions/loginHelpers";

import "./App.css";

class App extends BaseReactComponent {
    // Access the global state paths required by your component
    // using filterState. filterState puts these state paths on
    // this.state.
    // Note: all available global state paths are initialized in
    // setEmptyState() in actions/helpers.js
    filterState({ currUser }) {
        return { currUser };
    }

    constructor(props) {
        super(props);
        readCookie();
    }

    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path={["/", "/login"]} exact component={Login} />
                    <Route path="/signup" exact component={Signup} />
                    <Route path="/dashboard" exact component={Dashboard} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
