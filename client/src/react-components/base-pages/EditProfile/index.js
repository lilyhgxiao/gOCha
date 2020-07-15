/*  Full Profile component */
import React from "react";
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import AlertDialogue from "./../../page-components/AlertDialogue";
import UploadPic from "./../../page-components/UploadPic";

// Importing actions/required methods
import { checkAndUpdateSession, processError } from "../../../actions/helpers";
import { getUserByUsername, editUser, deleteUser } from "../../../actions/userhelpers";


//images
/**TODO: replace placeholder images */
import dashboard_placeholder from './../../../images/dashboard_placeholder.jpg';
import { editAccURL, loginURL, errorURL, maxUserBioLength, minPassLength, 
    maxPassLength } from "../../../constants";

const bcrypt = require('bcryptjs')

class EditProfile extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(editAccURL + props.match.params.username);

        this.state = {
            alert: null,
            user: null,
            iconPic: "",
            iconPicRaw: null,
            bio: "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
            isUserLoaded: false,
            toLogin: false
        }
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        /**TODO: redirect back to login if session is not there */
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
        const { currUser } = this.state;

        try {
            const getUser = await getUserByUsername(username);
            if (!getUser || !getUser.user) {
                this._isMounted && processError.bind(this)(getUser, true, false);
                return;
            }
            const user = getUser.user;
            if (user.username !== currUser.username) {
                this._isMounted && this.setState({
                    error: {
                        code: 401,
                        msg: ["Sorry, you don't have permission to edit this account."],
                        toDashboard: true
                    }
                });
                return;
            }

            this._isMounted && this.setState({
                user: user,
                iconPic: user.iconPic,
                bio: user.bio,
                isUserLoaded: true
            });

        } catch (err) {
            console.log("Error in fetchUser: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        // 'this' is bound to the component in this arrow function.
        this.setState({
            [name]: value  // [name] sets the object property name to the value of the 'name' variable.
        });
    }

    validateProfileInput = () => {
        const { bio } = this.state;
        let success = true;
        let msg = [];
        if (bio.length > maxUserBioLength) {
            msg = msg.concat(["Your bio is too long.", <br />, "It must be under " +
                maxUserBioLength + " characters.", <br />]);
            success = false;
        }
        if (success === true) {
            this.editProfile();
        } else {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not edit profile",
                    text: msg
                }
            });
        }
    }

    editProfile = async () => {
        let success = true;
        let msg = [];
        const { bio, iconPicRaw, user } = this.state;

        try {
            const editProfileBody = {
                bio: bio
            };
            if (iconPicRaw) editProfileBody.iconPic = { oldURL: user.iconPic, raw: iconPicRaw };

            const patchUserReq = await editUser(user._id, editProfileBody);
            if (!patchUserReq.user) {
                if (patchUserReq && patchUserReq.msg) {
                    msg = msg.concat(["Failed to edit user: " + patchUserReq.msg, <br />]);
                } else {
                    msg = msg.concat(["Failed to edit user.", <br />]);
                }
                success = false;
            }

            if (success) {
                this._isMounted && this.setState({
                    alert: {
                        title: "Profile saved successfully!"
                    }
                });
            } else {
                this._isMounted && this.setState({
                    alert: {
                        title: "Something went wrong...",
                        text: msg
                    }
                });
            }
        } catch (err) {
            this._isMounted && this.setState({
                alert: {
                    title: "Oops!",
                    text: ["There was an error editing the profile. Please try again."]
                }
            });
        }
    }

    comparePass = async (password) => {
        const { user } = this.state;
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
        });
    }

    validatePassInput = async () => {
        let success = true;
        const { oldPassword, newPassword, confirmPassword } = this.state;
        let msg = [];
        try {
            // if the user exists, make sure their password is correct
            const checkOldPass = await this.comparePass(oldPassword);
            if (!checkOldPass) {
                msg = msg.concat(["The old password is not correct.", <br />]);
                success = false;
            }
            if (newPassword.length < minPassLength || newPassword.length > maxPassLength) {
                msg = msg.concat(["The password must be between " + minPassLength + " and " +
                    maxPassLength + " characters.", <br />]);
                success = false;
            }
            if (newPassword !== confirmPassword) {
                msg = msg.concat(["The new password and confirm password do not match.", <br />]);
                success = false;
            }

            if (success === true) {
                this.changePassword();
            } else {
                this._isMounted && this.setState({
                    alert: {
                        title: "Could not change password",
                        text: msg
                    }
                });
            }
        } catch (err) {
            this._isMounted && this.setState({
                alert: {
                    title: "Oops!",
                    text: ["There was an error changing the password. Please try again."]
                }
            });
        }

    }

    changePassword = async () => {
        let success = true;
        let msg = [];
        const { user, newPassword } = this.state;

        try {
            const editPasswordBody = {
                password: newPassword
            };

            const patchUserReq = await editUser(user._id, editPasswordBody);
            if (!patchUserReq.user) {
                if (patchUserReq && patchUserReq.msg) {
                    msg = msg.concat(["Failed to edit user: " + patchUserReq.msg, <br />]);
                } else {
                    msg = msg.concat(["Failed to edit user.", <br />]);
                }
                success = false;
            }

            if (success) {
                this._isMounted && this.setState({
                    alert: {
                        title: "Password changed successfully!"
                    }
                });
            } else {
                this._isMounted && this.setState({
                    alert: {
                        title: "Something went wrong...",
                        text: msg
                    }
                });
            }
        } catch (err) {
            this._isMounted && this.setState({
                alert: {
                    title: "Oops!",
                    text: ["There was an error changing the password. Please try again."]
                }
            });
        }
    }

    handleDelete = () => {
        this._isMounted && this.setState({
            alert: {
                title: "Delete your account?",
                text: ["Please enter your password to continue."],
                yesNo: true,
                yesText: "Delete",
                noText: "Cancel",
                handleYes: this.handleDeleteCheckPass,
                inputOn: true,
                inputParameters: { type: "password", placeholder: "Password" }
            }
        });
    }

    handleDeleteCheckPass = async (password) => {
        try {
            const checkPass = await this.comparePass(password);
            if (!checkPass) {
                this._isMounted && this.setState({
                    alert: {
                        title: "Could not delete your account",
                        text: ["The password was not correct."]
                    }
                });
            } else {
                this._isMounted && this.setState({
                    alert: {
                        title: "Are you sure?",
                        text: ["This action cannot be reversed.", <br />,
                            "You will lose your inventory, favourite gacha list, and other user information. Any " +
                            "gachas and characters you have created will also be lost, including from the inventories of other users.",
                            <br />, <br />, "Delete your account anyway?", <br/>,
                            "(Please check the box to confirm.)"],
                        checkbox: true,
                        checkboxText: ["I understand, delete my account."],
                        okText: "Delete",
                        handleOk: this.deleteAccount
                    }
                });
            }
        } catch (err) {
            this._isMounted && this.setState({
                alert: {
                    title: "Oops!",
                    text: ["There was an error deleting the account. Please try again."]
                }
            });
        }
    }

    deleteAccount = async (checked) => {
        const { user } = this.state;
        if (checked) {
            try {
                const deleteUserReq = await deleteUser(user._id);
                if (!deleteUserReq || !deleteUserReq.user) {
                    this._isMounted && this.setState({
                        alert: {
                            text: ["Something went wrong..."]
                        }
                    });
                } else {
                    this._isMounted && this.setState({
                        alert: {
                            title: "Successfully deleted your account",
                            text: ["Thank you for using gOCha. See you next time!"],
                            handleOk: this.redirectLogin
                        }
                    });
                }
            } catch (err) {
                this._isMounted && this.setState({
                    alert: {
                        title: "Oops!",
                        text: ["There was an error deleting the account. Please try again."]
                    }
                });
            }
        } else {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not delete your account",
                    text: ["Please check the confirmation checkbox."]
                }
            });
        }
    }

    redirectLogin = () => {
        this._isMounted && this.setState({
            alert: null,
            toLogin: true
        });
    }

    render() {
        const { currUser, user, iconPic, bio, oldPassword, newPassword, confirmPassword,
            isUserLoaded, toLogin, alert, error } = this.state;

        if (error) {
            return (
                <Redirect push to={{
                    pathname: errorURL,
                    state: { error: error }
                }} />
            );
        }

        if (toLogin) {
            return (
                <Redirect push to={{
                    pathname: loginURL
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
                        <div className="pageTitle">Edit Profile and Settings</div>
                        <UploadPic parent={this} cover={false} src={isUserLoaded ? iconPic : dashboard_placeholder} />
                        <div className="profileUsername">{isUserLoaded ? user.username : "Username"}</div>
                        <textarea className="profileBioInput"
                            name='bio'
                            value={bio}
                            onChange={this.handleInputChange}
                            type="text"
                            placeholder="Write about yourself..." />
                        {maxUserBioLength - bio.length > 0 ?
                            <div className="nameCharCount">{maxUserBioLength - bio.length}</div> :
                            <div className="nameCharCountRed">{maxUserBioLength - bio.length}</div>
                        }
                        <button onClick={this.validateProfileInput}>Save</button>
                        <div className="editPasswordContainer">
                            <input className="profilePasswordInput"
                                name='oldPassword'
                                value={oldPassword}
                                onChange={this.handleInputChange}
                                type="password"
                                placeholder="Old Password" />
                            <br />
                            <input className="profilePasswordInput"
                                name='newPassword'
                                value={newPassword}
                                onChange={this.handleInputChange}
                                type="password"
                                placeholder="New Password" />
                            <br />
                            <input className="profilePasswordInput"
                                name='confirmPassword'
                                value={confirmPassword}
                                onChange={this.handleInputChange}
                                type="password"
                                placeholder="Confirm Password" />
                            <br />
                            <button onClick={this.validatePassInput}>Change Password</button>
                        </div>
                        <button onClick={this.handleDelete}>Delete Your Account</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default EditProfile;
