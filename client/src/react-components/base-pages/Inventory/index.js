/*  Inventory component */
import React from "react";

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import CharaList from "./../../page-components/CharaList";
import CharaProfile from "./../../page-components/CharaProfile";

// Importing actions/required methods
import { getCharaById } from "../../../actions/charaHelpers";
import { updateSession } from "../../../actions/loginHelpers";

class Inventory extends BaseReactComponent {

    state = {
        isLoaded: false,
        currUser: null,
        charaList: null,
        charaProfile: null,
        charaProfileVisible: false
    };

    constructor(props) {
        super(props);
        this.props.history.push("/inventory");
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        /**TODO: redirect back to login if session is not there */
        const locationState = this.props.location.state;
        console.log(locationState);
        const readSessRes = await updateSession();
        if (readSessRes) {
            if (readSessRes.currUser) {
                this.setState({
                    currUser: readSessRes.currUser
                }, this.fetchInv);
                if (locationState) {
                    if (locationState.showChara) {
                        this.showCharaImmediately(locationState);
                    }
                }
            }
        }
    }

    showCharaImmediately = (locationState) => {
        this.setState({
            charaProfileVisible: true,
            charaProfile: locationState.showChara
        })
    }

    fetchInv = async () => {
        const charaReqs = [];
        const currUser = this.state.currUser;
        console.log(this.state);
        let i;
        for (i = 0; i < currUser.inventory.length; i++) {
            charaReqs.push(getCharaById(currUser.inventory[i]._id));
        }

        /**TODO: handle failed requests...? */
        Promise.all(charaReqs).then(res => {
            const charaList = [];
            res.forEach(charaRes => {
                console.log()
                if (!charaRes || !charaRes.chara) {
                    console.log("error retrieving chara" + (charaRes ? ": " + charaRes.err : ""));
                } else {
                    charaList.push(charaRes.chara);
                }
            });
            this.setState({
                charaList: charaList,
                isLoaded: true
            });
        }).catch((err) => {
            /**TODO: handle catch error */
            console.log("Error with Promise.all in fetchInv: " + err);
        })
    }
    
    handleCharaLinkClick = (charaData, event) => {
        this.setState({
            charaProfile: charaData,
            charaProfileVisible: true
        });
    }

    handleExitWindowClick = (event) => {
        this.setState({
            charaProfile: null,
            charaProfileVisible: false
        }, () => {
            const mainBodyContainer = document.querySelector(".mainBodyContainer");
            mainBodyContainer.style.height = "";
        });
    }

    render() {

        const { isLoaded, charaList, charaProfileVisible, charaProfile, currUser } = this.state;

        return (
            <div className="App">
                <Header username={currUser ? currUser.username : ""}
                    starFrags={currUser ? currUser.starFrags : 0}
                    silvers={currUser ? currUser.silvers : 0} />

                <div className="mainBodyContainer">
                    {  charaProfileVisible ?
                        <CharaProfile className="charaProf"
                            chara={charaProfile}
                            handleExitWindowClick={this.handleExitWindowClick}
                        /> :
                        null
                    }
                    <div className="mainBody">
                        <div className="pageTitle">Inventory</div>
                        <div>
                            {   isLoaded ?
                                <CharaList 
                                charaList={charaList} 
                                handleCharaLinkClick={this.handleCharaLinkClick}/> : 
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Inventory;