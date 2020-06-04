/*  Full Dashboard component */
import React from "react";

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";

//images
import dashboard_placeholder from './../../images/dashboard_placeholder.jpg';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.props.history.push("/dashboard");
    }

    render() {
        const { history } = this.props;

        return (
            <div className="App">
                {/* Header component with text props. */}
                <Header
                    title="Dashboard"
                    subtitle="You are logged in."
                    history={history}
                />
                <div className="mainBodyContainer">
                    <div className="mainBody">
                        <img className="dashboardMainPic" src={dashboard_placeholder} alt='Dashboard Main'/>
                        <div className="dashboardTopMenu">
                            <div className="currencyDisplay">Star Fragments: 200</div>
                            <div className="currencyDisplay">Silvers: 50</div>
                            <div className="mailContainer"> 
                                <div className="mailNotif">3</div>
                                <div className="mailIcon"> 
                                    Mail
                                </div>
                            </div>
                        </div>
                        <div className="dashboardBottomMenu">
                            <div className="dashboardInventory">
                                Inventory
                            </div>
                            <div className="dashboardOwnGachas">
                                Your Gachas
                            </div>
                            <div className="dashboardfavGachas">
                                Favourites
                            </div>
                        </div>
                        <div className="newsBanner">
                            News
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
