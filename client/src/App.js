import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";

import BaseReactComponent from "./react-components/BaseReactComponent";

import Login from "./react-components/Login";
import Signup from "./react-components/Signup";
import Dashboard from "./react-components/Dashboard";
import Inventory from "./react-components/Inventory";
import YourGachas from "./react-components/YourGachas";
import FavGachas from "./react-components/FavGachas";
import GachaSummon from "./react-components/GachaSummon"
import GachaSmnResult from "./react-components/GachaSmnResult"
import CreateGacha from "./react-components/CreateGacha"
import EditGacha from "./react-components/EditGacha"

import { readSession } from "./actions/loginHelpers";

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
        readSession();
    }

    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path={["/", "/login"]} exact component={Login} />
                    <Route path="/signup" exact component={Signup} />
                    <Route path="/dashboard" exact component={Dashboard} />
                    <Route path="/inventory" exact component={Inventory} />
                    <Route path="/yourGachas" exact component={YourGachas} />
                    <Route path="/favourites" exact component={FavGachas} />
                    <Route path="/summon/:id" exact component={GachaSummon} />
                    <Route path="/summon/result/:id" exact component={GachaSmnResult} />
                    <Route path="/create/gacha" exact component={CreateGacha} />
                    <Route path="/edit/gacha/:id" exact component={EditGacha} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
