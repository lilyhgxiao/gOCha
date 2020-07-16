/*  Full Profile component */
import React from "react";
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import AlertDialogue from "./../../page-components/AlertDialogue";
import GachaList from "./../../page-components/GachaList";
import PageNumNav from "./../../page-components/PageNumNav";

// Importing actions/required methods
import { checkAndUpdateSession, processError } from "../../../actions/helpers";
import { getUserByUsername } from "../../../actions/userhelpers";
import { getGachasByCreator } from "../../../actions/gachaHelpers";

//images
/**TODO: replace placeholder images */
import dashboard_placeholder from './../../../images/dashboard_placeholder.jpg';

//Importing constants
import { profileURL, editAccURL, errorURL, gachasPerPage } from "../../../constants";

class Profile extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(profileURL + props.match.params.username);

        this.state = {
            user: null,
            gachaList: [],
            currPageNum: 0,
            isUserLoaded: false,
            isGachaLoaded: false,
            alert: null,
            error: null
        }
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        try {
            this._isMounted = true;
            this._isMounted && await checkAndUpdateSession.bind(this)(this.fetchUser);
        } catch (err) {
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong.", toLogin: true }
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.setState = (state, callback) => {
            return;
        };
    }

    fetchUser = async () => {
        const username = this.props.match.params.username;

        try {
            const getUser = await getUserByUsername(username);
            if (!getUser || !getUser.user) {
                this._isMounted && processError.bind(this)(getUser, true, false);
                return;
            }
            const user = getUser.user;
            this._isMounted && this.setState({
                user: user,
                isUserLoaded: true
            });
            const currUser = this.state.currUser;

            const getGachasReq = await getGachasByCreator(currUser._id);
            if (!getGachasReq || !getGachasReq.gachas) {
                this._isMounted && processError.bind(this)(getGachasReq, true, false);
                return;
            }
            this._isMounted && this.setState({
                gachaList: getGachasReq.gachas,
                isGachaLoaded: true
            });

        } catch (err) {
            console.log("Error in fetchUser: " + err);
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
        const { currUser, user, gachaList, currPageNum, isUserLoaded, isGachaLoaded,
            alert, error } = this.state;

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
                {/* Header component. */}
                <Header currUser={currUser} />

                <div className="mainBodyContainer">
                    {alert ?
                        <AlertDialogue parent={this} alert={alert} /> :
                        null
                    }
                    <div className="mainBody">
                        <div className="editProfileButtonContainer">
                            {isUserLoaded && user.username === currUser.username ?
                                <Link to={editAccURL + user.username}>
                                    <button className="editProfileButton">Edit Profile</button>
                                </Link> : null
                            }
                        </div>
                        <img className="profilePic"
                            src={isUserLoaded && (user.iconPic && user.iconPic !== "")  ? user.iconPic : dashboard_placeholder}
                            alt='Profile Pic' />
                        <div className="profileUsername">
                            {isUserLoaded ? user.username : "Username"}
                        </div>
                        <div className="profileBio">
                            {isUserLoaded ? user.bio : "Bio Goes Here"}
                        </div>
                        <div className="theirGachasTitle">
                            {isUserLoaded ? user.username + "'s Gachas" : "Their Gachas"}
                        </div>
                        <div>
                            {isGachaLoaded ?
                                <GachaList
                                    gachaList={gachaList}
                                    newLink={false}
                                    currUser={currUser} /> :
                                null
                            }
                            {isGachaLoaded ?
                                <PageNumNav num={Math.ceil(gachaList.length / gachasPerPage)}
                                    currPageNum={currPageNum}
                                    handleClick={this.switchGachaPages} /> : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Profile;
