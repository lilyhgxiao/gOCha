import React from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';

import { logout } from "../../../actions/loginHelpers";

import "./../../../App.css";
import "./styles.css";

// Importing actions/required methods
import { processError } from "../../../actions/helpers";
import { incCurrency } from "../../../actions/userhelpers";

//images
import logo from './../../../images/logo_placeholder.png';
import starFrag_placeholder from './../../../images/starFrag_placeholder.png';
import silvers_placeholder from './../../../images/silvers_placeholder.png';

//Importing constants
import { loginURL, errorURL, dashboardURL, collectionURL, gachasURL, favouritesURL } from "../../../constants";

/* The Header Component */
class Header extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            toLogin: false,
            error: null
        };
    }

    componentDidMount () {
        this._isMounted = true;
    }

    componentWillUnmount () {
        this._isMounted = false;
    }


    logoutUser = async () => {
        const logoutRes = await logout();
        console.log(logoutRes);
        if (!logoutRes || logoutRes.status !== 200) {
            alert("Something went wrong in logging out.");
        } else {
            this._isMounted && this.setState({
                toLogin: true
            });
        }
    };

    addStarFrags = async () => {
        const { currUser } = this.props;

        try {
            const addRes = await incCurrency(currUser._id, 500, 0);
            if (!addRes || !addRes.user) {
                this._isMounted && processError.bind(this)(addRes, true, false);
            }
        } catch (err) {
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong adding currency.", toDashboard: true }
            });
        }
        

    }

    /**TODO: search function to be coming? */
    search = () => {

    }

    render() {
        /**TODO: handle when props are empty */
        const { currUser } = this.props;
        const { toLogin, error } = this.state;

        if (toLogin) {
            return (
                <Redirect push to={{
                    pathname: loginURL
                }} />
            );
        }

        if (error) {
            return (
                <Redirect push to={{
                    pathname: errorURL,
                    state: { error: error }
                }} />
            );
        }

        return (
            <div className="headerContainer">
                <div className="header">
                    <div className="headerLinks">
                        <div className="headerLine1">
                            <Link className="hdrLogo" to={dashboardURL}>
                                <input
                                    type='image'
                                    className="logo"
                                    src={logo}
                                    alt={'Home'}
                                />
                            </Link>
                            {/* Search function to be coming?
                            <div className="hdrSearch">
                                <input className="searchBar"></input>
                                <button className="searchButton" onClick={ this.search }>Search</button>
                            </div> */}
                            <div className="hdrCurrency">
                                <img className="hdrCurrencyIcon" src={starFrag_placeholder} alt="StarFrag Placeholder"/>
                                {currUser ? currUser.starFrags: 0}
                                {currUser ? <button onClick={this.addStarFrags}>+</button> : null}
                            </div>
                            <div className="hdrCurrency">
                                <img className="hdrCurrencyIcon" src={silvers_placeholder} alt="StarFrag Placeholder"/>
                                {currUser ? currUser.silvers : 0}
                            </div>
                            <Link className="hdrProfile" to={'/profile/' + (currUser ? currUser.username: "")}>
                                {currUser ? currUser.username: ""}
                            </Link>
                            <Link className="hdrSettings" to={'/settings'}>Settings</Link>
                            <span className="hdrLogout" onClick={ this.logoutUser }>Log Out</span> 
                        </div>

                        <div className ="headerLine2"> 
                            <Link className="hdr2Link" to={dashboardURL}>Home</Link>   
                            <Link className="hdr2Link" to={collectionURL}>Collection</Link>  
                            <Link className="hdr2Link" to={gachasURL}>Your Gachas</Link>  
                            <Link className="hdr2Link" to={favouritesURL}>Favourites</Link>  
                            { /* News not implemented yet
                                <Link className="hdr2Link" to={'/news'}>News</Link> 
                            */ }
                        </div>
                    </div>
                </div>
            </div>
            
            
        );
    }
}

export default Header;
