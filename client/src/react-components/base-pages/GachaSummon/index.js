/*  GachaSummon component */
import React from "react";
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import GachaSmnList from "./../../page-components/GachaSmnList";
import AlertDialogue from "./../../page-components/AlertDialogue";

// Importing actions/required methods
import { checkAndUpdateSession, processError, summon } from "../../../actions/helpers";
import { updateSession } from "../../../actions/loginHelpers";
import { getGachaById } from "../../../actions/gachaHelpers";
import { getUserById, pullUserInfo, pushUserInfo } from "../../../actions/userhelpers";
import { getAllCharasInGacha } from "../../../actions/charaHelpers";

//images
/**TODO: replace placeholder images */
import skeleton_placeholder from './../../../images/gacha_summon_main_skeleton_placeholder.jpg';
import favourited from './../../../images/stat_filled.png';
import notFavourited from './../../../images/stat_unfilled.png';

//Importing constants
import { smnInfoURL, dashboardURL, profileURL, smnResultURL, errorURL, summonCost } from "../../../constants";

class GachaSummon extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(smnInfoURL + props.match.params.id);

        this.state = {
            isGachaLoaded: false,
            isCreatorLoaded: false,
            currUser: null,
            gacha: null,
            creator: null,
            threeStars: [],
            fourStars: [],
            fiveStars: [],
            rolledCharacter: null,
            favourite: false,
            toDashboard: false,
            toCreator: false,
            alert: null,
            error: null
        };
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        /**TODO: redirect back to login if session is not there */
        this._isMounted = true;
        this._isMounted && await checkAndUpdateSession.bind(this)(this.fetchGachaInfo);
    }

    componentWillUnmount () {
        this._isMounted = false;
    }

    fetchGachaInfo = async () => {
        const id = this.props.match.params.id;

        try {
            const getGacha = await getGachaById(id);
            if (!getGacha || !getGacha.gacha) {
                this._isMounted && processError.bind(this)(getGacha, true, false);
                return;
            }
            const gacha = getGacha.gacha;
            const getAllCharas = await getAllCharasInGacha(id);
            if (!getAllCharas || !getAllCharas.charas) {
                this._isMounted && processError.bind(this)(getAllCharas, true, false);
                return;
            }
            this._isMounted && this.setState({
                gacha: gacha,
                threeStars: getAllCharas.charas.filter(chara => chara.rarity === 3),
                fourStars: getAllCharas.charas.filter(chara => chara.rarity === 4),
                fiveStars: getAllCharas.charas.filter(chara => chara.rarity === 5),
                isGachaLoaded: true
            });
            const getCreator = await getUserById(gacha.creator);
            if (!getCreator || !getCreator.user) {
                this._isMounted && this.setState({
                    creator: { username: "Error" },
                    isCreatorLoaded: true
                });
            } else {
                const creator = getCreator.user;
                this._isMounted && this.setState({
                    creator: creator,
                    isCreatorLoaded: true
                });
            }
            if (this.state.currUser.favGachas.findIndex(favGacha => 
                favGacha._id.toString() === gacha._id.toString()) !== -1) {
                this._isMounted && this.setState({
                    favourite: true
                });
            }
        } catch (err) {
            /**TODO: handle when request fails */
            console.log("Error in fetchGachaInfo: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    /**TODO: CLEAN UP THIS FUNCTION TOO MANY NESTS */
    trySummon = async () => {
        const { gacha } = this.state;
        //remove the alert
        this._isMounted && this.setState({
            alert: null
        });
    
        try {
            this._isMounted && (await checkAndUpdateSession.bind(this)(function () {
                summon.bind(this)(gacha);
            }));
        } catch (err) {
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    redirectToDashboard = () => {
        this._isMounted && this.setState({
            alert: null,
            toDashboard: true
        });
    }

    refreshPage = () => {
        this._isMounted && this.setState({
            alert: null
        }, this.fetchGachaInfo);
    }

    handleSummonClick = async () => {
        this._isMounted && (await checkAndUpdateSession.bind(this)(function () {
            if (this.state.currUser.starFrags >= summonCost) {
                this._isMounted && this.setState({
                    alert: {
                        title: "Summon?",
                        text: [
                            "Summoning costs ", <strong>{summonCost}</strong>, " star fragments.", 
                            <br/>,"You have ",  <strong>{this.state.currUser.starFrags}</strong>, 
                            " star fragments."],
                        yesNo: true,
                        yesText: "Summon",
                        noText: "Cancel",
                        handleYes: this.trySummon
                    }
                });
            } else {
                /**TODO: change this LOL */
                this._isMounted && this.setState({
                    alert: {
                        text: [
                            "Your a poor bich"
                        ],
                        okText: ":("
                    }
                });
            }
        }));
    }

    handleCreatorClick = () => {
        const { creator } = this.state;
        if (creator) {
            this._isMounted && this.setState({
                toCreator: true
            });
        } else {
            this._isMounted && this.setState({
                alert: {
                    text: ["There was an error loading the creator. Please reload the page."]
                }
            });
        }
    }

    handleInactiveClick = () => {
        this._isMounted && this.setState({
            alert: {
                text: [
                    "This gacha has been set to ", <strong>inactive</strong>, 
                    ", so summons are currently unavailable.", <br/>, "Please check back later!" ]
            }
        });
    }

    handleFavouriteClick = async () => {
        const { gacha } = this.state;
        let alertText;
        let favourite = false;

        const readSessRes = await updateSession();
        if (!readSessRes) {
            /**TODO: redirect back to login if session is not there */
            return;
        }
        if (!readSessRes.currUser) {
            /**TODO: redirect back to login if session is not there */
            return;
        }
        this._isMounted && this.setState({
            currUser: readSessRes.currUser
        });  
        const currUser = readSessRes.currUser

        if (currUser.favGachas.findIndex(favGacha => favGacha._id.toString() === gacha._id.toString()) === -1) {
            const addFavRes = await pushUserInfo(currUser._id, { favGachas: {_id: gacha._id, creator: gacha.creator } });
            if (addFavRes.user) {
                alertText = gacha.name + " has been added to your favourite gacha list!";
                favourite = true;
            } else {
                /**TODO: handle when request fails */
                alertText = "Sorry, something went wrong.";
                favourite = false;
            }
        } else {
            const removeFavRes = await pullUserInfo(currUser._id, { favGachas: {_id: gacha._id, creator: gacha.creator } });
            if (removeFavRes.user) {
                alertText = gacha.name + " has been removed from your favourite gacha list.";
                favourite = false;
            } else {
                /**TODO: handle when request fails */
                alertText = "Sorry, something went wrong.";
                favourite = true;
            }
        }
        this._isMounted && this.setState({
            alert: {
                text: [ alertText ]
            },
            favourite: favourite
        });
    }

    handleCharaListClick = () => {
        //adjusting height if mainBodyContainer is not tall enough
        const mainBodyContainer = document.querySelector(".mainBodyContainer");
        const gachaSmnListContainer = document.querySelector(".gachaSmnListContainer");
        const gachaSmnListStyle = window.getComputedStyle(document.querySelector(".gachaSmnListWindow"));

        const newHeight = parseInt(gachaSmnListStyle.height) + parseInt(gachaSmnListStyle.marginTop) * 2;
        const origHeight = parseInt(window.getComputedStyle(mainBodyContainer).height);

        if (newHeight > origHeight) {
            mainBodyContainer.style.height = newHeight.toString() + "px";
        }
        gachaSmnListContainer.style.visibility = "visible";
    }

    handleExitWindowClick = () => {
        const mainBodyContainer = document.querySelector(".mainBodyContainer");
        const gachaSmnListContainer = document.querySelector(".gachaSmnListContainer");
        mainBodyContainer.style.height = "";
        gachaSmnListContainer.style.visibility = "hidden";
    }

    render() {
        const { isGachaLoaded, isCreatorLoaded, gacha, creator, currUser, rolledCharacter, 
            favourite, threeStars, fourStars, fiveStars, toDashboard, toCreator, alert, error  } = this.state;

        if (error) {
            return (
                <Redirect push to={{
                    pathname: errorURL,
                    state: { error: error }
                }} />
            );
        }

        if (toDashboard) {
            return (
                <Redirect push to={{
                    pathname: dashboardURL
                }} />
            );
        }

        if (toCreator) {
            return (
                <Redirect push to={{
                    pathname: profileURL + creator._id
                }} />
            );
        }

        if (rolledCharacter) {
            return (
                <Redirect push to={{
                    pathname: smnResultURL + gacha._id,
                    state: { rolledCharacter: rolledCharacter }
                }} />
            );
        }

        /**TODO: handle when gacha empty */
        return (
            <div className="App">
                <Header currUser={currUser} />

                <div className="mainBodyContainer">
                    {alert ?
                        <AlertDialogue parent={this} alert={alert}/> :
                        null
                    }
                    {isGachaLoaded ?
                        <GachaSmnList
                            gacha={gacha}
                            threeStars={threeStars}
                            fourStars={fourStars}
                            fiveStars={fiveStars}
                            handleExitWindowClick={this.handleExitWindowClick}
                            isLoaded={isGachaLoaded}
                        /> :
                        null
                    }
                    <div className="mainBody">
                        <div className="favouriteGachaButton" onClick={this.handleFavouriteClick}>
                            { favourite ?
                                <img className="favIcon" src={favourited} alt="Fav icon"/> :
                                <img className="favIcon" src={notFavourited} alt="Not fav icon"/>
                            }
                        </div>
                        <div className="pageTitle">{ isGachaLoaded ? gacha.name : "" }</div>
                        <div className="pageSubtitle" onClick={this.handleCreatorClick}>
                            { isCreatorLoaded ? creator.username : "" }
                        </div>
                        {isGachaLoaded ? 
                            <img className="gachaSmnCoverPic" src={gacha.coverPic} alt={gacha.name + " Cover Pic"}/> :
                            <img className="gachaSmnCoverPic" src={skeleton_placeholder} alt="Skeleton Cover Pic"/> 
                        }
                        <br/>
                        { isGachaLoaded && gacha.active ?
                            <button className="smnButtonActive" onClick={this.handleSummonClick}>Summon</button> :
                            <button className="smnButtonInactive" onClick={this.handleInactiveClick}>Inactive</button>
                        }
                        { isGachaLoaded ?
                            <div className="gachaSmnDesc">{gacha.desc}</div> :
                            null
                        }
                        { isGachaLoaded ?
                            <button className="gachaCharaLists" onClick={this.handleCharaListClick}>See Characters</button> :
                            null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default GachaSummon;