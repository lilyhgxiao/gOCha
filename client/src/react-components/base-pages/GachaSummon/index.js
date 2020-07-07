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
import { updateSession } from "../../../actions/loginHelpers";
import { getGachaById } from "../../../actions/gachaHelpers";
import { getUserById, pullUserInfo, pushUserInfo } from "../../../actions/userhelpers";
import { getCharaById, getAllCharasInGacha } from "../../../actions/charaHelpers";

//images
/**TODO: replace placeholder images */
import skeleton_placeholder from './../../../images/gacha_summon_main_skeleton_placeholder.jpg';
import favourited from './../../../images/stat_filled.png';
import notFavourited from './../../../images/stat_unfilled.png';

//Importing constants
import { summonCost, threeStarChance, fourStarChance, fiveStarChance } from "../../../constants";

class GachaSummon extends BaseReactComponent {

    state = {
        isGachaLoaded: false,
        isCreatorLoaded: false,
        currUser: null,
        gacha: null,
        threeStars: [],
        fourStars: [],
        fiveStars: [],
        alert: null,
        rolledCharacter: null,
        redirectDashboard: false,
        favourite: false
    };

    constructor(props) {
        super(props);
        this.props.history.push("/summon/info/" + props.match.params.id);
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        /**TODO: redirect back to login if session is not there */
        const readSessRes = await updateSession();
        if (readSessRes) {
            if (readSessRes.currUser) {
                this.setState({
                    currUser: readSessRes.currUser
                }, this.fetchGachaInfo);
            }
        }
    }

    fetchGachaInfo = async () => {
        const id = this.props.match.params.id;

        try {
            /**TODO: handle when request fails */
            const gacha = await getGachaById(id);
            if (!gacha) {
                console.log("Failed to get gacha " + id);
                return;
            }
            const getAllCharasRes = await getAllCharasInGacha(id);
            if (!getAllCharasRes) {
                console.log("Failed to get charas of gacha " + id);
                return;
            }
            this.setState({
                gacha: gacha,
                threeStars: getAllCharasRes.filter(chara => chara.rarity === 3),
                fourStars: getAllCharasRes.filter(chara => chara.rarity === 4),
                fiveStars: getAllCharasRes.filter(chara => chara.rarity === 5),
                isGachaLoaded: true
            });
            /**TODO: handle when request fails */
            const creator = await getUserById(gacha.creator);
            if (!creator) {
                console.log("Failed to get creator " + id);
                return;
            }
            this.setState({
                creator: creator,
                isCreatorLoaded: true
            });
            if (this.state.currUser.favGachas.findIndex(favGacha => favGacha._id.toString() === gacha._id.toString()) !== -1) {
                this.setState({
                    favourite: true
                });
            }
        } catch (err) {
            /**TODO: handle when request fails */
            console.log("Error in fetchGachaInfo: " + err);
        }
    }

    /**TODO: CLEAN UP THIS FUNCTION TOO MANY NESTS */
    summon = async () => {
        const { threeStars, fourStars, fiveStars } = this.state;
        //remove the alert
        this.setState({ 
            alert: null 
        });

        /**TODO: redirect back to login if session is not there */
        /**TODO: handle when request fails */
        const readSessRes = await updateSession();
        if (readSessRes) {
            if (readSessRes.currUser) {
                this.setState({
                    currUser: readSessRes.currUser
                }, async function () {
                    if (this.state.currUser.starFrags >= summonCost) {
                        let { gacha } = this.state;
                        //roll to see which tier character to get
                        const roll = Math.random();
                        let rolledCharacter = null;
                        let retries = 5;

                        let rarityToPickFrom;
                        if (roll < threeStarChance) { //rolled a three star
                            rarityToPickFrom = threeStars;
                        } else if (roll >= threeStarChance && roll < threeStarChance + fourStarChance) { // rolled a four star
                            rarityToPickFrom = fourStars;
                        } else { //rolled a five star
                            rarityToPickFrom = fiveStars;
                        }
                        
                        //try multiple times in case the gacha is changed during the summon
                        while (retries > 0) {
                            try {
                                //pick a random character from the rarity list
                                const rolledCharacter = rarityToPickFrom[Math.floor(Math.random() * rarityToPickFrom.length)];
                                //if it exists, stop and set the state
                                if (rolledCharacter) {
                                    this.setState({
                                        rolledCharacter: rolledCharacter
                                    });
                                    retries = 0;
                                } else { //if it doesn't exist, reload the gacha information
                                    const reloadGacha = await getGachaById(gacha._id);
                                    //if the gacha no longer exists, redirect back to dashboard
                                    if (!reloadGacha) {
                                        this.setState({
                                            alert: {
                                                title: "Oh no!",
                                                text: ["This gacha can't be found anymore..."],
                                                okText: "Go Back to the Dashboard",
                                                handleOk: this.redirectToDashboard
                                            }
                                        });
                                        retries = 0;
                                    } else {
                                        //if the gacha is no longer active, stop and reload gacha information
                                        if (!reloadGacha.active) {
                                            this.setState({
                                                alert: {
                                                    title: "Oh no!",
                                                    text: ["This gacha has been set to inactive..."],
                                                    handleOk: this.refreshPage
                                                }
                                            });
                                            retries = 0;
                                        } else {
                                            //if the gacha exists, reroll from the newly retrieved gacha
                                            gacha = reloadGacha;
                                        }
                                    }
                                }
                                retries--;
                            } catch (err) {
                                console.log("Could not summon: " + err);
                            }
                        }
                        //if all retries used up, reload gacha information
                        if (retries == 0 && !rolledCharacter) {
                            this.setState({
                                alert: {
                                    title: "Oh no!",
                                    text: ["Something went wrong during the summon..."],
                                    handleOk: this.refreshPage
                                }
                            });
                        }

                    } else {
                        /**TODO: change this LOL */
                        this.setState({
                            alert: {
                                text: [
                                    "Your a poor bich"
                                ],
                                okText: ":("
                            }
                        });
                    }
                });
            }
        }
    }

    redirectToDashboard = () => {
        this.setState({
            alert: null,
            redirectDashboard: true
        });
    }

    refreshPage = () => {
        this.setState({
            alert: null
        }, this.fetchGachaInfo);
    }

    handleSummonClick = async () => {
        /**TODO: redirect back to login if session is not there */
        /**TODO: handle when request fails */
        const readSessRes = await updateSession();
        if (readSessRes) {
            if (readSessRes.currUser) {
                this.setState({
                    currUser: readSessRes.currUser
                }, function () {
                    if (this.state.currUser.starFrags >= summonCost) {
                        this.setState({
                            alert: {
                                title: "Summon?",
                                text: [
                                    "Summoning costs ", <strong>{summonCost}</strong>, " star fragments.", <br/>,
                                    "You have ",  <strong>{this.state.currUser.starFrags}</strong>, " star fragments."],
                                yesNo: true,
                                yesText: "Summon",
                                noText: "Cancel",
                                handleYes: this.summon
                            }
                        });
                    } else {
                        /**TODO: change this LOL */
                        this.setState({
                            alert: {
                                text: [
                                    "Your a poor bich"
                                ],
                                okText: ":("
                            }
                        });
                    }
                });
            }
        }
    }

    handleInactiveClick = () => {
        this.setState({
            alert: {
                text: [
                    "This gacha has been set to ", <strong>inactive</strong>, ", so summons are currently unavailable.",
                    <br/>, "Please check back later!" ]
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
        this.setState({
            currUser: readSessRes.currUser
        });  
        const currUser = readSessRes.currUser

        if (currUser.favGachas.findIndex(favGacha => favGacha._id.toString() === gacha._id.toString()) === -1) {
            const addFavRes = await pushUserInfo(currUser._id, { favGachas: {_id: gacha._id, creator: gacha.creator } });
            if (addFavRes) {
                alertText = gacha.name + " has been added to your favourite gacha list!";
                favourite = true;
            } else {
                /**TODO: handle when request fails */
                alertText = "Sorry, something went wrong.";
                favourite = false;
            }
        } else {
            const removeFavRes = await pullUserInfo(currUser._id, { favGachas: {_id: gacha._id, creator: gacha.creator } });
            if (removeFavRes) {
                alertText = gacha.name + " has been removed from your favourite gacha list.";
                favourite = false;
            } else {
                /**TODO: handle when request fails */
                alertText = "Sorry, something went wrong.";
                favourite = true;
            }
        }
        this.setState({
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
        const { isGachaLoaded, isCreatorLoaded, gacha, creator, currUser, alert, 
            redirectDashboard, rolledCharacter, favourite, threeStars, fourStars, fiveStars } = this.state;

        if (redirectDashboard) {
            return (
                <Redirect push to={{
                    pathname: "/dashboard"
                }} />
            );
        }

        if (rolledCharacter) {
            return (
                <Redirect push to={{
                    pathname: "/summon/result/" + gacha._id,
                    state: { rolledCharacter: rolledCharacter }
                }} />
            );
        }

        /**TODO: handle when gacha empty */
        return (
            <div className="App">
                <Header username={currUser ? currUser.username : ""}
                    starFrags={currUser ? currUser.starFrags : 0}
                    silvers={currUser ? currUser.silvers : 0} />

                <div className="mainBodyContainer">
                    {alert ?
                        <AlertDialogue parent={this} title={alert.title} text={alert.text} yesNo={alert.yesNo} 
                        handleYes={alert.handleYes} handleNo={alert.handleNo} handleOk={alert.handleOk} 
                        yesText={alert.yesText} noText={alert.noText} okText={alert.okText} image={alert.image}
                        checkbox={alert.checkbox} checkboxText={alert.checkboxText} inputOn={alert.inputOn}
                        inputParameters={alert.inputParameters}/> :
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
                        <div className="pageSubtitle">{ isCreatorLoaded ? creator.username : "" }</div>
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