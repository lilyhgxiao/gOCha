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

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(gachasURL);

        this.state = {
            isLoaded: false,
            currUser: null,
            gachaList: []
        };
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        this._isMounted = true;
        this._isMounted && await checkAndUpdateSession.bind(this)(this.fetchYrGachas);
    }

    componentWillUnmount () {
        this._isMounted = false;
    }

    fetchYrGachas = async () => {
        const currUser = this.state.currUser;

        try {
            const getGachas = await getGachasByCreator(currUser._id);

            if (!getGachas || !getGachas.gachas) {
                this._isMounted && this.setState({
                    error: {
                        code: getGachas ? getGachas.status : 500,
                        msg: getGachas ? getGachas.msg : "Something went wrong.",
                        toDashboard: true
                    }
                });
                return;
            }
            this._isMounted && this.setState({
                gachaList: getGachasReq.gachas,
                isLoaded: true
            });
        } catch (err) {
            console.log("Catch error in fetchYrGachas: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    render() {
        const { isLoaded, gachaList, currUser } = this.state;

        return (
            <div className="App">
                <Header currUser={currUser} />

                <div className="mainBodyContainer">
                    <div className="mainBody">
                        <div className="pageTitle">Gachas</div>
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