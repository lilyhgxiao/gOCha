/*  Inventory component */
import React from "react";
import { Redirect } from 'react-router-dom';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import GachaList from "./../../page-components/GachaList";
import AlertDialogue from "./../../page-components/AlertDialogue";
import PageNumNav from "./../../page-components/PageNumNav";

// Importing actions/required methods
import { checkAndUpdateSession, processError } from "../../../actions/helpers";
import { getGachasByCreator } from "../../../actions/gachaHelpers";

//Importing constants
import { errorURL, gachasURL, gachasPerPage } from "../../../constants";

class YourGachas extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(gachasURL);

        this.state = {
            isLoaded: false,
            currUser: null,
            gachaList: [],
            currPageNum: 0,
            alert: null,
            error: null
        };
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        try {
            this._isMounted = true;
            this._isMounted && await checkAndUpdateSession.bind(this)(this.fetchYrGachas);
        } catch (err) {
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong.", toLogin: true }
            });
        }
    }

    componentWillUnmount () {
        this._isMounted = false;
        this.setState = (state,callback)=>{
            return;
        };
    }

    fetchYrGachas = async () => {
        const currUser = this.state.currUser;

        try {
            const getGachas = await getGachasByCreator(currUser._id);
            if (!getGachas || !getGachas.gachas) {
                this._isMounted && processError.bind(this)(getGachas, true, false);
                return;
            }
            this._isMounted && this.setState({
                gachaList: getGachas.gachas,
                currPageNum: 0,
                isLoaded: true
            });
        } catch (err) {
            console.log("Catch error in fetchYrGachas: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    switchGachaPages = (index) => {
        this._isMounted && this.setState({
            currPageNum: index
        });
    }

    render() {
        const { isLoaded, gachaList, currUser, currPageNum, alert, error } = this.state;

        if (error) {
            return (
                <Redirect push to={{
                    pathname: errorURL,
                    state: { error: error }
                }} />
            );
        }

        return (
            <div className="App">
                <Header currUser={currUser} />

                <div className="mainBodyContainer">
                    {alert ?
                        <AlertDialogue parent={this} alert={alert} /> :
                        null
                    }
                    <div className="mainBody">
                        <div className="pageTitle">Gachas</div>
                        {isLoaded ?
                            <GachaList
                                gachaList={gachaList.slice(currPageNum * gachasPerPage, 
                                    Math.min(currPageNum * gachasPerPage + gachasPerPage, gachaList.length))}
                                newLink={true}
                                currUser={currUser} /> :
                            null
                        }
                        {isLoaded ?
                            <PageNumNav num={Math.ceil(gachaList.length / gachasPerPage)}
                                currPageNum={currPageNum}
                                handleClick={this.switchGachaPages} /> : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default YourGachas;