/*  Full Dashboard component */
import React from "react";
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import AlertDialogue from "./../../page-components/AlertDialogue";

// Importing actions/required methods
import { updateSession } from "../../../actions/loginHelpers";


//images
/**TODO: replace placeholder images */
import dashboard_placeholder from './../../../images/dashboard_placeholder.jpg';

/**TODO: implement random character selection for cover pic */

class Dashboard extends BaseReactComponent {

    state = {
        alert: null,
        error: null
    }

    constructor(props) {
        super(props);
        this.props.history.push("/dashboard");
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
                }, this.fetchInv);
            }
        }
    }

    createAlertDialogue = () => {
        this.setState({
            alert: {
                title: "Yep",
                yesNo: true,
                image: {src: dashboard_placeholder, alt:"Dashboard Placeholder"},
                inputOn: true,
                inputParameters: { type: "password", placeholder: "Placeholder!" },
                checkbox: true
            }
        })
    }

    redirectError = () => {
        this.setState({
            error: {code: 500, msg: "Hi there", toDashboard: true}
        });
    }

    render() {
        const { history } = this.props;
        const { currUser, alert, error } = this.state;

        if (error) {
            return (
                <Redirect push to={{
                    pathname: "/error",
                    state: { error: error }
                }} />
            );
        }

        return (
            <div className="App">
                {/* Header component. */}
                <Header username={currUser ? currUser.username: ""} 
                    starFrags={currUser ? currUser.starFrags: 0} 
                    silvers={currUser ? currUser.silvers : 0}/>

                <div className="mainBodyContainer">
                    { alert ? 
                        <AlertDialogue parent={this} alert={alert}/> :
                        null
                    }
                    <div className="mainBody">
                        <img className="dashboardMainPic" src={dashboard_placeholder} alt='Dashboard Main'/>
                        <div className="dashboardTopMenu">
                            <div className="currencyDisplay">Star Fragments: {currUser ? currUser.starFrags: 0}</div>
                            <div className="currencyDisplay">Silvers: {currUser ? currUser.silvers : 0}</div>
                            <div className="mailContainer" onClick={this.redirectError}> 
                                <div className="mailNotif">3</div>
                                <div className="mailIcon"> 
                                    Mail
                                </div>
                            </div>
                        </div>
                        <div className="dashboardBottomMenu">
                            <Link className="dashboardInventory" to={'./inventory'}>Inventory</Link>
                            <Link className="dashboardOwnGachas" to={'./yourGachas'}>Your Gachas</Link>
                            <Link className="dashboardFavGachas" to={'./favourites'}>Favourites</Link>
                        </div>
                        <div className="newsBanner">
                        <Link className="dashboardNews" to={'./news'}>News</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
