import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";

import BaseReactComponent from "./react-components/other/BaseReactComponent";

import Login from "./react-components/base-pages/Login";
import Signup from "./react-components/base-pages/Signup";
import ErrorPage from "./react-components/base-pages/ErrorPage";
import Dashboard from "./react-components/base-pages/Dashboard";
import Collection from "./react-components/base-pages/Collection";
import YourGachas from "./react-components/base-pages/YourGachas";
import FavGachas from "./react-components/base-pages/FavGachas";
import GachaSummon from "./react-components/base-pages/GachaSummon";
import GachaSmnResult from "./react-components/base-pages/GachaSmnResult";
import CreateGacha from "./react-components/base-pages/CreateGacha";
import EditGacha from "./react-components/base-pages/EditGacha";
import CreateChara from "./react-components/base-pages/CreateChara";
import EditChara from "./react-components/base-pages/EditChara";
import Profile from "./react-components/base-pages/Profile";
import EditProfile from "./react-components/base-pages/EditProfile";

import { readSession } from "./actions/loginHelpers";

import "./App.css";

import { loginURL, signupURL, errorURL, dashboardURL, collectionURL, 
    gachasURL, favouritesURL, smnInfoURL, smnResultURL, createGachaURL, editGachaURL, 
    createCharaURL, editCharaURL, profileURL, editAccURL } from "./constants";

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
                    <Route path={loginURL} exact component={Login} />
                    <Route path={signupURL} exact component={Signup} />
                    <Route path={errorURL} exact component={ErrorPage} />
                    <Route path={dashboardURL} exact component={Dashboard} />
                    <Route path={collectionURL} exact component={Collection} />
                    <Route path={gachasURL} exact component={YourGachas} />
                    <Route path={favouritesURL} exact component={FavGachas} />
                    <Route path={smnInfoURL + ":id"} render={(props => 
                        <GachaSummon key={props.match.params.id} {...props}/>)} />
                    <Route path={smnResultURL + ":id"} render={(props => 
                        <GachaSmnResult key={props.match.params.id} {...props}/>)} />
                    <Route path={createGachaURL} exact component={CreateGacha} />
                    <Route path={editGachaURL + ":id"} render={(props => 
                        <EditGacha key={props.match.params.id} {...props}/>)} />
                    <Route path={createCharaURL + ":id"} render={(props => 
                        <CreateChara key={props.match.params.id} {...props}/>)} />
                    <Route path={editCharaURL + ":id"} render={(props => 
                        <EditChara key={props.match.params.id} {...props}/>)} />
                    <Route path={profileURL + ":username"} render={(props => 
                        <Profile key={props.match.params.username} {...props}/>)} />
                    <Route path={editAccURL + ":username"} render={(props => 
                        <EditProfile key={props.match.params.username} {...props}/>)} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
