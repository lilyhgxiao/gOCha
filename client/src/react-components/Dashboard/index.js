/*  Full Dashboard component */
import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";

// Importing actions/required methods
import { readSession } from "../../actions/loginHelpers";

//images
import dashboard_placeholder from './../../images/dashboard_placeholder.jpg';

class Dashboard extends BaseReactComponent {

    constructor(props) {
        super(props);
        this.props.history.push("/dashboard");
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        const readSessRes = await readSession();
        if (readSessRes.currUser) {
            this.setState({
                currUser: readSessRes.currUser
            }, this.fetchInv);
        }
    }

    render() {
        const { history } = this.props;

        return (
            <div className="App">
                {/* Header component. */}
                <Header/>

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
