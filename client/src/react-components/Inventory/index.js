/*  Inventory component */
import React from "react";

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";
import CharaList from "./../CharaList";
import CharaProfile from "./../CharaProfile";

// Importing actions/required methods
import { getCharaById } from "../../actions/charaHelpers";
import { updateSession } from "../../actions/loginHelpers";

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
        console.log("hey")
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

        Promise.all(charaReqs).then(res => {
            console.log(res);
            this.setState({
                charaList: res,
                isLoaded: true
            });
        }).catch((err) => {
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