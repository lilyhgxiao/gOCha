/*  Inventory component */
import React from "react";
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import CharaList from "../../page-components/CharaList";
import CharaProfile from "../../page-components/CharaProfile";
import AlertDialogue from "./../../page-components/AlertDialogue";
import PageNumNav from "./../../page-components/PageNumNav";

// Importing actions/required methods
import { checkAndUpdateSession } from "../../../actions/helpers";
import { getCharaById } from "../../../actions/charaHelpers";

//Importing constants
import { collectionURL, errorURL, charasPerPage } from "../../../constants";

class Collection extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(collectionURL);
        this.state = {
            isLoaded: false,
            currUser: null,
            allCharaList: [],
            currPageNum: 0,
            charaProfile: null,
            charaProfileVisible: false,
            alert: null,
            error: null
        };
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount () {
        const locationState = this.props.location.state;
        let success = false;

        this._isMounted = true;
        this._isMounted && (success = await checkAndUpdateSession.bind(this)(this.fetchInv));

        if (success && locationState) {
            this.showCharaImmediately(locationState);
        }
    }

    componentWillUnmount () {
        this._isMounted = false;
    }

    showCharaImmediately = (locationState) => {
        this._isMounted && this.setState({
            charaProfileVisible: true,
            charaProfile: locationState.showChara
        })
    }

    fetchInv = async () => {
        const charaReqs = [];
        const currUser = this.state.currUser;
        let i;
        for (i = 0; i < currUser.inventory.length; i++) {
            charaReqs.push(getCharaById(currUser.inventory[i]._id));
        }

        Promise.all(charaReqs).then(res => {
            const allCharaList = [];
            res.forEach(charaRes => {
                if (!charaRes || !charaRes.chara) {
                    allCharaList.push(null);
                } else {
                    allCharaList.push(charaRes.chara);
                }
            });
            this._isMounted && this.setState({
                allCharaList: allCharaList,
                isLoaded: true
            });
        }).catch((err) => {
            console.log("Error with Promise.all in fetchInv: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        })
    }
    
    handleCharaLinkClick = (charaData) => {
        this._isMounted && this.setState({
            charaProfile: charaData,
            charaProfileVisible: true
        });
    }

    handleExitWindowClick = () => {
        this._isMounted && this.setState({
            charaProfile: null,
            charaProfileVisible: false
        }, () => {
            const mainBodyContainer = document.querySelector(".mainBodyContainer");
            mainBodyContainer.style.height = "";
        });
    }

    switchCharaPages = (index) => {
        this._isMounted && this.setState({
            currPageNum: index
        });
    }

    render() {

        const { isLoaded, allCharaList, charaProfileVisible, charaProfile, currUser, 
            currPageNum, alert, error } = this.state;

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
                <Header username={currUser ? currUser.username : ""}
                    starFrags={currUser ? currUser.starFrags : 0}
                    silvers={currUser ? currUser.silvers : 0} />

                <div className="mainBodyContainer">
                    { alert ?
                        <AlertDialogue parent={this} alert={alert} /> :
                        null
                    }
                    {  charaProfileVisible ?
                        <CharaProfile className="charaProf"
                            chara={charaProfile}
                            handleExitWindowClick={this.handleExitWindowClick}
                        /> :
                        null
                    }
                    <div className="mainBody">
                        <div className="pageTitle">Collection</div>
                        {isLoaded ?
                            <CharaList
                                page={this}
                                charaList={allCharaList.slice(currPageNum * charasPerPage, 
                                    Math.min(currPageNum * charasPerPage + charasPerPage, allCharaList.length))}
                                handleCharaLinkClick={this.handleCharaLinkClick} /> :
                            null
                        }
                        { isLoaded ?
                            <PageNumNav num={Math.ceil(allCharaList.length / charasPerPage)}
                                currPageNum={currPageNum}
                                handleClick={this.switchCharaPages} /> : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Collection;