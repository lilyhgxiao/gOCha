/*  Full Dashboard component */
import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";
import AlertDialogue from "./../AlertDialogue";

// Importing actions/required methods
import { updateSession } from "../../actions/loginHelpers";

//images
import dashboard_placeholder from './../../images/dashboard_placeholder.jpg';

class Dashboard extends BaseReactComponent {

    state = {
        alert: null
    }

    constructor(props) {
        super(props);
        this.props.history.push("/dashboard");
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
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
                image: {src: dashboard_placeholder, alt:"Dashboard Placeholder"}
            }
        })
    }

    render() {
        const { history } = this.props;
        const { currUser, alert } = this.state;

        return (
            <div className="App">
                {/* Header component. */}
                <Header username={currUser ? currUser.username: ""} 
                    starFrags={currUser ? currUser.starFrags: 0} 
                    silvers={currUser ? currUser.silvers : 0}/>

                <div className="mainBodyContainer">
                    { alert ? 
                        <AlertDialogue parent={this} title={alert.title} text={alert.text} yesNo={alert.yesNo} 
                        handleYes={alert.handleYes} handleNo={alert.handleNo} handleOk={alert.handleOk} 
                        yesText={alert.yesText} noText={alert.noText} okText={alert.okText} image={alert.image}/> :
                        null
                    }
                    <div className="mainBody">
                        <img className="dashboardMainPic" src={dashboard_placeholder} alt='Dashboard Main'/>
                        <div className="dashboardTopMenu">
                            <div className="currencyDisplay">Star Fragments: {currUser ? currUser.starFrags: 0}</div>
                            <div className="currencyDisplay">Silvers: {currUser ? currUser.silvers : 0}</div>
                            <div className="mailContainer" onClick={this.createAlertDialogue}> 
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
