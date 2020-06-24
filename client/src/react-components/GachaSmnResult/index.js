/*  Inventory component */
import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";
import StarRarityDisplay from './../StarRarityDisplay';

// Importing actions/required methods
import { getCharaById } from "../../actions/charaHelpers";
import { readSession } from "../../actions/loginHelpers";

//images
import main_placeholder from './../../images/dashboard_placeholder.jpg';
import exit_icon from './../../images/exit.png';
import edit_icon from './../../images/edit.png';

class GachaSmnResult extends BaseReactComponent {

    state = {
        isLoaded: false,
        chara: null,
        alreadyHave: false
    };

    constructor(props) {
        super(props);
        this.props.history.push("/summonResult/" + props.match.params.id);
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        const locationState = this.props.location.state;
        const readSessRes = await readSession();
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
                this.setState({
                    chara: locationState.rolledCharacter
                }, async function () {
                    const subtractFrags = 
                    this.setState({
                        isLoaded: true
                    });
                });
            }
        } else {

        }
        /*
        const charaReqs = [];
        const currUser = this.state.currUser;
        console.log(this.state);
        let i;
        for (i = 0; i < currUser.inventory.length; i++) {
            charaReqs.push(getCharaById(currUser.inventory[i]._id));
        }

        Promise.all(charaReqs).then(res => {
            console.log(res);
            this.setState({
                charaList: res,
                isLoaded: true
            });
        }).catch((err) => {
            console.log("Error with Promise.all in fetchInv: " + err);
        })*/
    }

    render() {

        const { isLoaded, chara, currUser } = this.state;

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
                                <img className="charaSmnMainPic" src={main_placeholder} alt={chara.name + ' Picture'} />
                                <StarRarityDisplay rarity={chara.rarity} />
                                {chara.summonPhrase ?
                                    <div className="charaSmnPhrase">{chara.summonPhrase}</div> :
                                    null
                                }
                                <div className="charaSmnButtonContainer">
                                    <Link to={'/gachaSummon/' + chara.gacha}>
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