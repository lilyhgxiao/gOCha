import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";

import BaseReactComponent from "./react-components/other/BaseReactComponent";

import Login from "./react-components/base-pages/Login";
import Signup from "./react-components/base-pages/Signup";
import Dashboard from "./react-components/base-pages/Dashboard";
import Inventory from "./react-components/base-pages/Inventory";
import YourGachas from "./react-components/base-pages/YourGachas";
import FavGachas from "./react-components/base-pages/FavGachas";
import GachaSummon from "./react-components/base-pages/GachaSummon"
import GachaSmnResult from "./react-components/base-pages/GachaSmnResult"
import CreateGacha from "./react-components/base-pages/CreateGacha"
import EditGacha from "./react-components/base-pages/EditGacha"
import CreateChara from "./react-components/base-pages/CreateChara"

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
                    <Route path="/create/chara/:id" exact component={CreateChara} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
