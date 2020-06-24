/*  GachaSummon component */
import React from "react";
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";
import GachaSmnList from "./../GachaSmnList";
import AlertDialogue from "./../AlertDialogue";

// Importing actions/required methods
import { readSession } from "../../actions/loginHelpers";
import { getGachaById } from "../../actions/gachaHelpers";
import { getUserById } from "../../actions/userhelpers";
import { getCharaById } from "../../actions/charaHelpers";

//images
import main_placeholder from './../../images/dashboard_placeholder.jpg';
import skeleton_placeholder from './../../images/gacha_summon_main_skeleton_placeholder.jpg';
import edit_icon from './../../images/edit.png';

//Importing constants
import { summonCost, threeStarChance, fourStarChance, fiveStarChance } from "./../../constants";

class GachaSummon extends BaseReactComponent {

    state = {
        isGachaLoaded: false,
        isCreatorLoaded: false,
        currUser: null,
        gacha: null,
        alert: null,
        rolledCharacter: null,
        redirectDashboard: false
    };

    constructor(props) {
        super(props);
        this.props.history.push("/gachaSummon/" + props.match.params.id);
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        const readSessRes = await readSession();
        if (readSessRes.currUser) {
            this.setState({
                currUser: readSessRes.currUser
            }, this.fetchGachaInfo);
        }
    }

    fetchGachaInfo = async () => {
        const id = this.props.match.params.id;

        try {
            const gacha = await getGachaById(id);
            if (!gacha) {
                console.log("Failed to get gacha " + id);
                return;
            }
            this.setState({
                gacha: gacha,
                isGachaLoaded: true
            });
            const creator = await getUserById(gacha.creator);
            if (!creator) {
                console.log("Failed to get creator " + id);
                return;
            }
            this.setState({
                creator: creator,
                isCreatorLoaded: true
            });
        } catch (err) {
            console.log("Error in fetchGachaInfo: " + err);
        }
    }

    summon = async () => {
        //remove the alert
        this.setState({ 
            alert: null 
        });

        let { gacha } = this.state;

        //roll to see which tier character to get
        const roll = Math.random();
        let rolledCharacter = null;
        let retries = 5;

        let rarityToPickFrom;
        if (roll < threeStarChance) { //rolled a three star
            rarityToPickFrom = gacha.threeStars;
        } else if (roll >= threeStarChance && roll < threeStarChance + fourStarChance) { // rolled a four star
            rarityToPickFrom = gacha.fourStars;
        } else { //rolled a five star
            rarityToPickFrom = gacha.fiveStars;
        }

        //try multiple times in case the gacha is changed during the summon
        while (retries > 0) {
            try {
                //pick a random character from the rarity list
                const rolledCharacterId = rarityToPickFrom[Math.floor(Math.random() * rarityToPickFrom.length)];
                //get the character by id
                rolledCharacter = await getCharaById(rolledCharacterId);
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

    handleSummonClick = () => {
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
            redirectDashboard, rolledCharacter } = this.state;

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
                    pathname: "/summon/" + gacha._id,
                    state: { rolledCharacter: rolledCharacter }
                }} />
            );
        }

        return (
            <div className="App">
                <Header username={currUser ? currUser.username : ""}
                    starFrags={currUser ? currUser.starFrags : 0}
                    silvers={currUser ? currUser.silvers : 0} />

                <div className="mainBodyContainer">
                    {alert ?
                        <AlertDialogue parent={this} title={alert.title} text={alert.text} yesNo={alert.yesNo}
                            handleYes={alert.handleYes} handleNo={alert.handleNo} handleOk={alert.handleOk}
                            yesText={alert.yesText} noText={alert.noText} okText={alert.okText} image={alert.image} /> :
                        null
                    }
                    {isGachaLoaded ?
                        <GachaSmnList
                            gacha={gacha}
                            handleExitWindowClick={this.handleExitWindowClick}
                        /> :
                        null
                    }
                    <div className="mainBody">
                        <div className="pageTitle">{ isGachaLoaded ? gacha.name : "" }</div>
                        <div className="pageSubtitle">{ isCreatorLoaded ? creator.username : "" }</div>
                        {isGachaLoaded ? 
                        <img className="gachaSmnMainPic" src={main_placeholder} alt={gacha.name + " Main Picture"}/> :
                        <img className="gachaSmnMainPic" src={skeleton_placeholder} alt="Skeleton Main Picture"/> }
                        <br/>
                        { isGachaLoaded && gacha.active ?
                            <button className="smnButtonActive" onClick={this.handleSummonClick}>Summon</button> :
                            <button className="smnButtonInactive" onClick={this.handleSummonClick}>Inactive</button>
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