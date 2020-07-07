/*  Full Profile component */
import React from "react";
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import AlertDialogue from "./../../page-components/AlertDialogue";
import UploadPic from "./../../page-components/UploadPic";

// Importing actions/required methods
import { updateSession } from "../../../actions/loginHelpers";
import { getUserByUsername, editUser, deleteUser } from "../../../actions/userhelpers";


//images
/**TODO: replace placeholder images */
import dashboard_placeholder from './../../../images/dashboard_placeholder.jpg';
import { maxUserBioLength, minPassLength, maxPassLength } from "../../../constants";

const bcrypt = require('bcryptjs')

class EditProfile extends BaseReactComponent {

    state = {
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

    constructor(props) {
        super(props);
        this.props.history.push("/edit/profile/" + props.match.params.username);
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
        const { currUser } = this.state;

        try {
            const user = await getUserByUsername(username);
            if (!user) {
                /**TODO: handle if failed to get user */
                console.log("Failed to get user " + username);
                return;
            }

            if (user.username !== currUser.username) {
                //do not have permission. redirect to 401 error page
                return;
            }

            this.setState({
                user: user,
                iconPic: user.iconPic,
                bio: user.bio,
                isUserLoaded: true
            });

        } catch (err) {
            console.log("Error in fetchUser: " + err);
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
        const msg = [];
        if (bio.length > maxUserBioLength) {
            msg.push("Your bio is too long.");
            msg.push(<br/>)
            msg.push("It must be under " + maxUserBioLength + " characters.");
            msg.push(<br/>)
            success = false;
        } 
        if (success === true) {
            this.editProfile();
        } else {
            this.setState({
                alert: {
                    title: "Could not edit profile",
                    text: msg
                }
            });
        }
    }

    editProfile = async () => {
        let success = true;
        const { bio, iconPicRaw, user } = this.state;

        const editProfileBody = {
            bio: bio
        };
        if (iconPicRaw) editProfileBody.iconPic = { oldURL: user.iconPic, raw: iconPicRaw };

        const patchUserReq = await editUser(user._id, editProfileBody);
        /**TODO: handle response */
        if (!patchUserReq.user) {
            console.log("something went wrong")
            success = false;
            return;
        }

        if (success) {
            this.setState({
                alert: {
                    title: "Profile saved successfully!"
                }
            });
        } else {
            this.setState({
                alert: {
                    text: ["Something went wrong..."]
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
        const msg = [];
        // if the user exists, make sure their password is correct
        const checkOldPass = await this.comparePass(oldPassword);
		if (!checkOldPass) {
            msg.push("The old password is not correct.");
            msg.push(<br/>)
            success = false;
        }
        if (newPassword.length < minPassLength || newPassword.length > maxPassLength) {
            msg.push("The password must be between " + minPassLength + " and " + maxPassLength + " characters.");
            msg.push(<br/>)
            success = false;
        }
        if (newPassword !== confirmPassword) {
            msg.push("The new password and confirm password do not match.");
            msg.push(<br/>)
            success = false;
        }
        
        if (success === true) {
            this.changePassword();
        } else {
            this.setState({
                alert: {
                    title: "Could not change password",
                    text: msg
                }
            });
        }
    }

    changePassword = async () => {
        let success = true;
        const { user, newPassword } = this.state;

        const editPasswordBody = {
            password: newPassword
        };

        const patchUserReq = await editUser(user._id, editPasswordBody);
        /**TODO: handle response */
        if (!patchUserReq.user) {
            console.log("something went wrong")
            success = false;
            return;
        }

        if (success) {
            this.setState({
                alert: {
                    title: "Password changed successfully!"
                }
            });
        } else {
            this.setState({
                alert: {
                    text: ["Something went wrong..."]
                }
            });
        }
    }

    handleDelete = () => {
        this.setState({
            alert: {
                title: "Delete your account?",
                text: ["Please enter your password to continue."],
                yesNo: true,
                yesText: "Delete",
                noText: "Cancel",
                handleYes: this.handleDeleteCheckPass,
                inputOn: true,
                inputParameters: {type: "password", placeholder: "Password"}
            }
        });
    }

    handleDeleteCheckPass = async (password) => {
        const checkPass = await this.comparePass(password);
        if (!checkPass) {
            this.setState({
                alert: {
                    title: "Could not delete your account",
                    text: ["The password was not correct."]
                }
            });
        } else {
            this.setState({
                alert: {
                    title: "Are you sure?",
                    text: ["This action cannot be reversed.", <br/>, 
                        "You will lose your inventory, favourite gacha list, and other user information. Any " + 
                        "gachas and characters you have created will also be lost, including from the inventories of other users.",
                        <br/>, <br/>, "Delete your account anyway?"],
                    checkbox: true,
                    checkboxText: ["I understand, delete my account."],
                    okText: "Delete",
                    handleOk: this.deleteAccount
                }
            });
        }
    }

    deleteAccount = async (checked) => {
        const { user } = this.state;
        if (checked) {
            /**TODO: delete the user and redirect back to login */
            const deleteUserReq = await deleteUser(user._id);
            if (!deleteUserReq) {
                this.setState({
                    alert: {
                        text: ["Something went wrong..."]
                    }
                });
            } else {
                this.setState({
                    alert: {
                        title: "Successfully deleted your account",
                        text: ["Thank you for using gOCha. See you next time!"],
                        handleOk: this.redirectLogin
                    }
                });
            }
            
        } else {
            this.setState({
                alert: {
                    title: "Could not delete your account",
                    text: ["Please check the confirmation checkbox."]
                }
            });
        }
    }

    redirectLogin = () => {
        this.setState({
            alert: null,
            toLogin: true
        });
    }

    render() {
        const { history } = this.props;
        const { currUser, alert, user, iconPic, bio, oldPassword, newPassword, confirmPassword, isUserLoaded, toLogin } = this.state;

        if (toLogin) {
            return (
                <Redirect push to={{
                    pathname: "/"
                }} />
            );
        }

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
                        <div className="pageTitle">Edit Profile and Settings</div>
                        <UploadPic parent={this} cover={false} src={isUserLoaded ? iconPic: dashboard_placeholder}/>
                        <div className="profileUsername">{isUserLoaded ? user.username : "Username" }</div>
                        <textarea className="profileBioInput"
                            name='bio'
                            value={bio}
                            onChange={this.handleInputChange}
                            type="text"
                            placeholder="Write about yourself..." />
                        { maxUserBioLength - bio.length > 0 ?
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
                            <br/>
                            <input className="profilePasswordInput"
                                name='newPassword'
                                value={newPassword}
                                onChange={this.handleInputChange}
                                type="password"
                                placeholder="New Password" />
                            <br/>
                            <input className="profilePasswordInput"
                                name='confirmPassword'
                                value={confirmPassword}
                                onChange={this.handleInputChange}
                                type="password"
                                placeholder="Confirm Password" />
                            <br/>
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
