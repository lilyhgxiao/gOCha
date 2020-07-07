/*  Inventory component */
import React from "react";

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import GachaList from "./../../page-components/GachaList";

// Importing actions/required methods
import { getGachasByCreator } from "../../../actions/gachaHelpers";
import { updateSession } from "../../../actions/loginHelpers";

class YourGachas extends BaseReactComponent {

    state = {
        isLoaded: false,
        currUser: null,
        gachaList: []
    };

    constructor(props) {
        super(props);
        this.props.history.push("/yourGachas");
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
                }, this.fetchYrGachas);
            }
        }
    }

    fetchYrGachas = async () => {
        const currUser = this.state.currUser;

        try {
            const getGachasReq = await getGachasByCreator(currUser._id);
            if (!getGachasReq) {
                /**TODO: handle when req fails */
                console.log("getGachasReq failed");
                return;
            }
            this.setState({
                gachaList: getGachasReq.gachas.result,
                isLoaded: true
            });
        } catch (err) {
            /**TODO: handle catch err */
        }
    }

    render() {

        const { isLoaded, gachaList, currUser } = this.state;

        return (
            <div className="App">
                <Header username={currUser ? currUser.username : ""}
                    starFrags={currUser ? currUser.starFrags : 0}
                    silvers={currUser ? currUser.silvers : 0} />

                <div className="mainBodyContainer">
                    <div className="mainBody">
                        <div className="pageTitle">Your Gachas</div>
                        <div>
                            {   isLoaded ?
                                <GachaList 
                                gachaList={gachaList}
                                newLink={true}/> : 
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default YourGachas;