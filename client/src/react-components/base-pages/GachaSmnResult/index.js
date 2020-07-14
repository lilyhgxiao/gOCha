/*  Inventory component */
import React from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import StarRarityDisplay from './../../page-components/StarRarityDisplay';
import AlertDialogue from "./../../page-components/AlertDialogue";

// Importing actions/required methods
import { checkAndUpdateSession, processError, summon } from "../../../actions/helpers";
import { summonChara, incCurrency } from "../../../actions/userhelpers";
import { getGachaById } from "../../../actions/gachaHelpers";

//Importing constants
import { smnResultURL, smnInfoURL, errorURL, summonCost, threeStarSilvers, fourStarSilvers, 
    fiveStarSilvers, collectionURL } from "../../../constants";

//images
/**TODO: replace placeholder images */
import main_placeholder from './../../../images/dashboard_placeholder.jpg';
import exit_icon from './../../../images/exit.png';
import edit_icon from './../../../images/edit.png';

class GachaSmnResult extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(smnResultURL + props.match.params.id);

        this.state = {
            isLoaded: false,
            isGachaLoaded: false,
            rolledCharacter: null,
            gacha: null,
            chara: null,
            alreadyHave: false,
            silversReceived: 0,
            toGacha: false,
            error: null,
            alert: null
        };
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        try {
            this._isMounted = true;
            const locationState = this.props.location.state;
            let success = false;
            this._isMounted && (success = await checkAndUpdateSession.bind(this)(this.fetchGachaInfo));

            if (success && locationState) {
                this.addCharaToInv(locationState);
            }
            if (!locationState || !locationState.rolledCharacter) {
                this._isMounted && this.setState({
                    error: {
                        code: 400,
                        msg: "This page cannot be accessed without going through the Summon button.",
                        toDashboard: true
                    }
                });
                return;
            }
        } catch (err) {
            this._isMounted && this.setState({
                error: {
                    code: 500, msg: "Something went wrong and your session has expired." +
                        "Please log in again.", toLogin: true
                }
            });
        }
    }

    componentWillUnmount () {
        this._isMounted = false;
        this.setState = (state,callback)=>{
            return;
        };
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
            this._isMounted && this.setState({
                gacha: gacha,
                isGachaLoaded: true
            });
        } catch (err) {
            /**TODO: handle when request fails */
            console.log("Error in fetchGachaInfo: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    addCharaToInv = async (locationState) => {
        try {
            const { currUser } = this.state;
            
            const charaToAdd = locationState ? locationState.rolledCharacter : this.state.rolledCharacter;
            const charaToCompare = { _id: charaToAdd._id, gacha: charaToAdd.gacha, creator: charaToAdd.creator };
            const compareResult = currUser.inventory.findIndex(charaInInv => {
                const charaInInvTemp = { _id: charaInInv._id, gacha: charaInInv.gacha, creator: charaInInv.creator };
                return (JSON.stringify(charaInInvTemp) === JSON.stringify(charaToCompare));
            });
            if (compareResult === -1) {
                const summonCharaRes = await summonChara(currUser._id, charaToAdd, summonCost);
                if (summonCharaRes && summonCharaRes.user) {
                    this._isMounted && this.setState({
                        chara: locationState ? locationState.rolledCharacter : this.state.rolledCharacter,
                        isLoaded: true
                    });
                } else {
                    this._isMounted && processError.bind(this)(summonCharaRes, true, false);
                }
            } else {
                let silversToAdd = this.determineSilvers(charaToAdd.rarity);
                if (silversToAdd > 0) {
                    const addSilversRes = await incCurrency(currUser._id, summonCost * (-1), silversToAdd);
                    if (!addSilversRes || !addSilversRes.user) {
                        this._isMounted && processError.bind(this)(addSilversRes, true, false);
                    } else {
                        this._isMounted && this.setState({
                            chara: locationState ? locationState.rolledCharacter : this.state.rolledCharacter,
                            isLoaded: true,
                            alreadyHave: true,
                            silversReceived: silversToAdd
                        });
                    }
                }
            }
        } catch (err) {
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    determineSilvers = (rarity) => {
        switch(rarity) {
            case 3: return threeStarSilvers;
            case 4: return fourStarSilvers;
            case 5: return fiveStarSilvers;
        }
        console.log("charaToAdd has an invalid rarity.")
        return 0;
    }

    handleSummonClick = async () => {
        const { isGachaLoaded } = this.state;
        if (!isGachaLoaded) {
            this._isMounted && this.setState({
                alert: {
                    text: ["There was an error loading the gacha."],
                    okText: "Go back to Gacha",
                    handleOk: this.toGacha
                }
            });
            return;
        }
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

    trySummon = async () => {
        const { gacha } = this.state;
        //remove the alert
        this._isMounted && this.setState({
            alert: null,
            alreadyHave: false
        });
    
        try {
            this._isMounted && (await checkAndUpdateSession.bind(this)(async function () {
                const rolledCharacter = await summon.bind(this)(gacha);
                if (rolledCharacter.rolledCharacter) {
                    this.addCharaToInv(null);
                }
            }));
        } catch (err) {
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    toGacha = () => {
        this._isMounted && this.setState({
            alert: null,
            toGacha: true
        });
    }

    render() {
        const { toGacha, isLoaded, chara, currUser, alreadyHave, silversReceived, error, alert } = this.state;

        if (toGacha) {
            return (
                <Redirect push to={{
                    pathname: smnInfoURL + this.props.match.params.id,
                    state: { error: error }
                }} />
            );
        }

        if (error) {
            return (
                <Redirect push to={{
                    pathname: errorURL,
                    state: { error: error }
                }} />
            );
        }

        /**TODO: handle when props empty */
        /**TODO: replace placeholder image with actual image */
        return (
            <div className="App">
                <Header currUser={currUser} />

                <div className="mainBodyContainer">
                    {alert ?
                            <AlertDialogue parent={this} alert={alert}/> :
                            null
                        }
                    <div className="mainBody">
                        {isLoaded ?
                            <div className="charaSmnContainer">
                                <div className="charaSmnSubtitle">Congratulations! You've summoned</div>
                                <div className="charaSmnTitle">{chara.name}</div>
                                <img className="charaSmnCoverPic" src={chara.coverPic} alt={chara.name + ' Picture'} />
                                <StarRarityDisplay rarity={chara.rarity} />
                                {chara.summonPhrase ?
                                    <div className="charaSmnPhrase">{chara.summonPhrase}</div> :
                                    null
                                }
                                {alreadyHave ?
                                    <div className="alreadyHaveText">
                                        You already have this character. You got {silversReceived} silvers.
                                    </div> :
                                    null
                                }
                                <div className="charaSmnButtonContainer">
                                    <Link to={smnInfoURL + this.props.match.params.id}>
                                        <button className="charaSmnButton">Go back to the Gacha</button>
                                    </Link>
                                    <button className="summonAgainButton" onClick={this.handleSummonClick}>
                                        Summon Again
                                    </button>
                                    <Link to={{pathname: collectionURL, state: {showChara: chara}}}>
                                        <button className="charaSmnButton">Check them out in your collection!</button>
                                    </Link>
                                </div>
                            </div>
                            : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default GachaSmnResult;