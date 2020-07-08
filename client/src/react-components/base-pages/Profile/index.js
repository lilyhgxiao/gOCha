/*  Full Profile component */
import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import AlertDialogue from "./../../page-components/AlertDialogue";
import GachaList from "./../../page-components/GachaList";

// Importing actions/required methods
import { updateSession } from "../../../actions/loginHelpers";
import { getUserByUsername } from "../../../actions/userhelpers";
import { getGachasByCreator } from "../../../actions/gachaHelpers";


//images
/**TODO: replace placeholder images */
import dashboard_placeholder from './../../../images/dashboard_placeholder.jpg';

/**TODO: implement random character selection for cover pic */

class Profile extends BaseReactComponent {

    state = {
        alert: null,
        user: null,
        gachaList: [],
        isUserLoaded: false,
        isGachaLoaded: false
    }

    constructor(props) {
        super(props);
        this.props.history.push("/profile/" + props.match.params.username);
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
                }, this.fetchUser);
            }
        }
    }

    fetchUser = async () => {
        const username = this.props.match.params.username;

        try {
            const getUser = await getUserByUsername(username);
            if (!getUser || !getUser.user) {
                /**TODO: handle if failed to get user */
                console.log("Failed to get user " + username);
                return;
            }
            const user = getUser.user;
            this.setState({
                user: user,
                isUserLoaded: true
            });
            const currUser = this.state.currUser;

            const getGachasReq = await getGachasByCreator(currUser._id);
            if (!getGachasReq) {
                /**TODO: handle when req fails */
            }
            this.setState({
                gachaList: getGachasReq.gachas.result,
                isGachaLoaded: true
            });

        } catch (err) {
            console.log("Error in fetchUser: " + err);
        }
    }

    render() {
        const { history } = this.props;
        const { currUser, alert, user, gachaList, isUserLoaded, isGachaLoaded } = this.state;

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
                        <div className="editProfileButtonContainer">
                            { isUserLoaded && user.username === currUser.username ?
                                <Link to={"/edit/profile/" + user.username}>
                                    <button className="editProfileButton">Edit Profile</button> 
                                </Link> : null
                            }
                        </div>
                        <img className="profilePic" src={isUserLoaded ? dashboard_placeholder : dashboard_placeholder} alt='Profile Pic'/>
                        <div className="profileUsername">{isUserLoaded ? user.username : "Username" }</div>
                        <div className="profileBio">{isUserLoaded ? user.bio : "Bio Goes Here" }</div>
                        <div>
                            {   isGachaLoaded ?
                                <GachaList 
                                gachaList={gachaList}
                                newLink={false}/> : 
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Profile;
