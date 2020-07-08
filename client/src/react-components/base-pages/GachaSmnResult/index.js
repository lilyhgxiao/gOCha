/*  Inventory component */
import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import StarRarityDisplay from './../../page-components/StarRarityDisplay';

// Importing actions/required methods
import { getCharaById } from "../../../actions/charaHelpers";
import { updateSession } from "../../../actions/loginHelpers";
import { summonChara, incCurrency } from "../../../actions/userhelpers";

//Importing constants
import { summonCost, threeStarSilvers, fourStarSilvers, fiveStarSilvers } from "../../../constants";

//images
/**TODO: replace placeholder images */
import main_placeholder from './../../../images/dashboard_placeholder.jpg';
import exit_icon from './../../../images/exit.png';
import edit_icon from './../../../images/edit.png';

class GachaSmnResult extends BaseReactComponent {

    state = {
        isLoaded: false,
        chara: null,
        alreadyHave: false,
        silversReceived: 0
    };

    constructor(props) {
        super(props);
        this.props.history.push("/summon/result/" + props.match.params.id);
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        /**TODO: redirect back to login if session is not there */
        const locationState = this.props.location.state;
        const readSessRes = await updateSession();
        if (readSessRes) {
            if (readSessRes.currUser) {
                this.setState({
                    currUser: readSessRes.currUser
                }, this.addCharaToInv.bind(this, locationState));
            }
        }
    }

    addCharaToInv = async (locationState) => {
        if (locationState) {
            if (locationState.rolledCharacter) {
                const charaToAdd = locationState.rolledCharacter;
                this.setState({
                    chara: charaToAdd
                }, async function () {
                    const { currUser } = this.state;
                    const charaToCompare = { _id: charaToAdd._id, gacha: charaToAdd.gacha, creator: charaToAdd.creator };
                    const compareResult = currUser.inventory.findIndex(charaInInv => {
                        const charaInInvTemp = { _id: charaInInv._id, gacha: charaInInv.gacha, creator: charaInInv.creator };
                        return (JSON.stringify(charaInInvTemp) === JSON.stringify(charaToCompare));
                    });
                    if (compareResult === -1) {
                        //if the user doesnt have the character, add it to inventory
                        /**TODO: handle when request fails */
                        const summonCharaRes = await summonChara(currUser._id, charaToAdd, summonCost);
                        if (summonCharaRes.user) {
                            this.setState({
                                chara: locationState.rolledCharacter,
                                isLoaded: true
                            });
                        }
                    } else {
                        //if the user does have the character, add silvers to the user's currency
                        let silversToAdd;
                        if (charaToAdd.rarity === 3) {
                            silversToAdd = threeStarSilvers;
                        } else if (charaToAdd.rarity === 4) {
                            silversToAdd = fourStarSilvers;
                        } else if (charaToAdd.rarity === 5) {
                            silversToAdd = fiveStarSilvers;
                        } else {
                            console.log("charaToAdd has an invalid rarity.")
                            silversToAdd = 0;
                        }
                        if (silversToAdd > 0) {
                            /**TODO: handle when request fails */
                            const addSilversRes = await incCurrency(currUser._id, summonCost * (-1), silversToAdd);
                            if (addSilversRes.user) {
                                this.setState({
                                    chara: locationState.rolledCharacter,
                                    isLoaded: true,
                                    alreadyHave: true,
                                    silversReceived: silversToAdd
                                });
                            }
                        }
                    }
                });
            }
        } else {

        }
    }

    render() {

        const { isLoaded, chara, currUser, alreadyHave, silversReceived } = this.state;

        /**TODO: handle when props empty */
        /**TODO: replace placeholder image with actual image */
        return (
            <div className="App">
                <Header username={currUser ? currUser.username : ""}
                    starFrags={currUser ? currUser.starFrags : 0}
                    silvers={currUser ? currUser.silvers : 0} />

                <div className="mainBodyContainer">
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
                                    <Link to={'/summon/info/' + chara.gacha}>
                                        <button className="charaSmnButton">Go back to the Gacha</button>
                                    </Link>
                                    <Link to={{pathname: '/inventory', state: {showChara: chara}}}>
                                        <button className="charaSmnButton">Check them out in your inventory!</button>
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