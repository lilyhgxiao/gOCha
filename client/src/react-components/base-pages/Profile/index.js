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
import { getGachaById } from "../../../actions/gachaHelpers";


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
            const user = await getUserByUsername(username);
            if (!user) {
                /**TODO: handle if failed to get user */
                console.log("Failed to get user " + username);
                return;
            }

            const gachaReqs = [];

            let i;
            for (i = 0; i < user.ownGachas.length; i++) {
                gachaReqs.push(getGachaById(user.ownGachas[i]));
            }

            /**TODO: handle if requests fail...? */
            Promise.all(gachaReqs).then(res => {
                this.setState({
                    user: user,
                    gachaList: res,
                    isUserLoaded: true,
                    isGachaLoaded: true
                });
            }).catch((err) => {
                /**TODO: handle if catch */
                this.setState({
                    user: user,
                    isUserLoaded: true
                });
                console.log("Error with Promise.all in fetchUser: " + err);
            })

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
                        <AlertDialogue parent={this} title={alert.title} text={alert.text} yesNo={alert.yesNo} 
                        handleYes={alert.handleYes} handleNo={alert.handleNo} handleOk={alert.handleOk} 
                        yesText={alert.yesText} noText={alert.noText} okText={alert.okText} image={alert.image}
                        checkbox={alert.checkbox} checkboxText={alert.checkboxText}/> :
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
