/*  FavGachas component */
import React from "react";
import { Redirect } from 'react-router-dom';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import GachaList from "./../../page-components/GachaList";
import AlertDialogue from "./../../page-components/AlertDialogue";
import PageNumNav from "./../../page-components/PageNumNav";

// Importing actions/required methods
import { checkAndUpdateSession } from "../../../actions/helpers";
import { getGachaById } from "../../../actions/gachaHelpers";

//Importing constants
import { favouritesURL, errorURL, favGachasPerPage } from "../../../constants";

class FavGachas extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(favouritesURL);

        this.state = {
            isLoaded: false,
            currUser: null,
            gachaList: [],
            currPageNum: 0,
            alert: null,
            error: null
        };
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        try {
            this._isMounted = true;
            this._isMounted && await checkAndUpdateSession.bind(this)(this.fetchFavGachas);
        } catch (err) {
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong and your session has expired." +
                    "Please log in again.", toLogin: true }
            });
        }
    }

    componentWillUnmount () {
        this._isMounted = false;
        this.setState = (state,callback)=>{
            return;
        };
    }

    fetchFavGachas = async () => {
        const gachaReqs = [];
        const currUser = this.state.currUser;
        let i;
        for (i = 0; i < currUser.favGachas.length; i++) {
            gachaReqs.push(getGachaById(currUser.favGachas[i]._id));
        }

        Promise.all(gachaReqs).then(res => {
            const gachaList = [];
            res.forEach(getGacha => {
                if (!getGacha || !getGacha.gacha) {
                    gachaList.push(null);
                } else {
                    gachaList.push(getGacha.gacha)
                }
            });
            this._isMounted && this.setState({
                gachaList: gachaList,
                isLoaded: true
            });
        }).catch((err) => {
            console.log("Error with Promise.all in fetchFavGachas: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        })
    }

    switchGachaPages = (index) => {
        this._isMounted && this.setState({
            currPageNum: index
        });
    }


    render() {

        const { isLoaded, gachaList, currUser, currPageNum, alert, error } = this.state;

        if (error) {
            return (
                <Redirect push to={{
                    pathname: errorURL,
                    state: { error: error }
                }} />
            );
        }

        return (
            <div className="App">
                <Header currUser={currUser} />

                <div className="mainBodyContainer">
                    {alert ?
                        <AlertDialogue parent={this} alert={alert} /> :
                        null
                    }
                    <div className="mainBody">
                        <div className="pageTitle">Favourites</div>
                        {isLoaded ?
                            <GachaList
                                gachaList={gachaList.slice(currPageNum * favGachasPerPage, 
                                    Math.min(currPageNum * favGachasPerPage + favGachasPerPage, gachaList.length))}
                                    currUser={currUser} /> :
                            null
                        }
                        { isLoaded ?
                            <PageNumNav num={Math.ceil(gachaList.length / favGachasPerPage)}
                                currPageNum={currPageNum}
                                handleClick={this.switchGachaPages} /> : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default FavGachas;