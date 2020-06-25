import React from "react";
import { Link } from 'react-router-dom';

import { logout } from "../../actions/loginHelpers";

import "./../../App.css";
import "./styles.css";

//images
import logo from './../../images/logo_placeholder.png';
import starFrag_placeholder from './../../images/starFrag_placeholder.png';
import silvers_placeholder from './../../images/silvers_placeholder.png';

/* The Header Component */
class Header extends React.Component {

    state = {
        redirect: false
    };

    logoutUser = () => {
        this.props.history.push("/");
        logout();
    };

    search = () => {

    }

    render() {
        const { starFrags, silvers, username } = this.props;

        return (
            <div className="headerContainer">
                <div className="header">
                    <div className="headerLinks">
                        <div className="headerLine1">
                            <Link className="hdrLogo" to={'/dashboard'}>
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
                                {starFrags}
                            </div>
                            <div className="hdrCurrency">
                                <img className="hdrCurrencyIcon" src={silvers_placeholder} alt="StarFrag Placeholder"/>
                                {silvers}
                            </div>
                            <Link className="hdrProfile" to={'/profile/' + username}>{username}</Link>
                            <Link className="hdrSettings" to={'/settings'}>Settings</Link>
                            <Link className="hdrLogout" onClick={ this.logoutUser } to={'/login'}>Log Out</Link>        
                        </div>

                        <div className ="headerLine2"> 
                            <Link className="hdr2Link" to={'/dashboard'}>Home</Link>   
                            <Link className="hdr2Link" to={'/inventory'}>Inventory</Link>  
                            <Link className="hdr2Link" to={'/yourGachas'}>Your Gachas</Link>  
                            <Link className="hdr2Link" to={'/favourites'}>Favourites</Link>  
                            <Link className="hdr2Link" to={'/news'}>News</Link> 
                        </div>
                    </div>
                </div>
            </div>
            
            
        );
    }
}

export default Header;
