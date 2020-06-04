import React from "react";
import Button from "@material-ui/core/Button";

import { logout } from "../../actions/loginHelpers";

import "./../../App.css";
import "./styles.css";

//images
import logo from './../../images/logo_placeholder.png';

/* The Header Component */
class Header extends React.Component {
    logoutUser = () => {
        this.props.history.push("/");
        logout();
    };

    search = () => {

    }

    redirectTo = () => {

    }

    render() {
        const { starFrags, silvers, username } = this.props;

        return (
            <div className="headerContainer">
                <div className="header">
                    <div className="headerLinks">
                        <div className="headerLine1">
                            <div className="hdrLogo" onClick = { this.redirectTo } value="/dashboard">
                                <img className='logo' src={logo} alt='logo'/>
                                </div>
                            <div className="hdrSearch">
                                <input className="searchBar"></input>
                                <button className="searchButton" onClick={ this.search }>Search</button>
                            </div>            
                            <div className="hdrProfile" onClick = {this.redirectTo } value={"/profile/" + username}>Hello, {username}</div>
                            <div className="hdrSettings" onClick = {this.redirectTo } value="/settings" >Settings</div>
                        </div>

                        <div className ="headerLine2"> 
                            <span className="hdr2Link" onClick = { this.redirectTo } value="/dashboard" >Home</span>
                            <span className="hdr2Link" onClick = { this.redirectTo } value="/inventory">Inventory</span>
                            <span className="hdr2Link" onClick = { this.redirectTo } value="/yourGachas">Your Gachas</span>
                            <span className="hdr2Link" onClick = { this.redirectTo } value="/favourites">Favourites</span>
                            <span className="hdr2Link" onClick = { this.redirectTo } value="/news">News</span>
                        </div>
                    </div>
                </div>
            </div>
            
            
        );
    }
}

export default Header;
