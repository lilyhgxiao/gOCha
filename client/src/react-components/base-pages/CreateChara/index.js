/*  Full Dashboard component */
import React from "react";
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import UploadPic from "../../page-components/UploadPic";
import AlertDialogue from "../../page-components/AlertDialogue";
import StarRarityDisplay from "../../page-components/StarRarityDisplay";
import NameInput from "./../../page-components/NameInput";
import DescInput from "./../../page-components/DescInput";
import RarityPhrasesForm from "./../../page-components/RarityPhrasesForm";
import CharaStatsTable from "./../../page-components/CharaStatsTable";

// Importing actions/required methods
import { checkAndUpdateSession, processError } from "../../../actions/helpers";
import { createNewChara } from "../../../actions/charaHelpers";
import { getGachaById } from "../../../actions/gachaHelpers";
import { getUserById } from "../../../actions/userhelpers";

//images
/**TODO: replace placeholder images */
import dotted_line_box from './../../../images/dotted_line_box_placeholder.png';

//Importing constants
import {
    createCharaURL, editGachaURL, errorURL, maxCharaDescLength, maxCharaNameLength,
    minCharaNameLength, maxWelcPhrLength, maxSummPhrLength
} from "../../../constants";

class CreateChara extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(createCharaURL + props.match.params.id);

        this.state = {
            coverPic: dotted_line_box,
            coverPicRaw: null,
            iconPic: dotted_line_box,
            iconPicRaw: null,
            name: "",
            desc: "",
            stats: [],
            rarity: 3,
            welcomePhrase: "",
            summonPhrase: "",
            toEdit: false,
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
            this._isMounted && await checkAndUpdateSession.bind(this)(this.fetchGachaInfo);
        } catch (err) {
            this._isMounted && this.setState({
                error: {
                    code: 500, msg: "Something went wrong and your session has expired." +
                        "Please log in again.", toLogin: true
                }
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.setState = (state, callback) => {
            return;
        };
    }


    fetchGachaInfo = async () => {
        const id = this.props.match.params.id;

        try {
            const getGacha = await getGachaById(id);
            if (!getGacha || !getGacha.gacha) {
                this._isMounted && processError.bind(this)(getGacha, true, false);
                return;
            }
            const gacha = getGacha.gacha;
            const getCreator = await getUserById(gacha.creator);
            if (!getCreator || !getCreator.user) {
                this._isMounted && processError.bind(this)(getCreator, true, false);
                return;
            }
            const creator = getCreator.user;
            if (creator._id.toString() !== this.state.currUser._id.toString()) {
                this._isMounted && this.setState({
                    error: {
                        code: 401,
                        msg: ["Sorry, you don't have permission to create a character on this gacha."],
                        toDashboard: true
                    }
                });
                return;
            }
            const stats = JSON.parse(JSON.stringify(gacha.stats));
            stats.forEach(stat => {
                stat.value = 0;
            });
            this._isMounted && this.setState({
                gacha: gacha,
                stats: stats,
                isGachaLoaded: true
            }, this.resizeMainContainer);

        } catch (err) {
            console.log("Error in fetchGachaInfo: " + err);
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
        this._isMounted && this.setState({
            [name]: value  // [name] sets the object property name to the value of the 'name' variable.
        });
    }

    resizeMainContainer = () => {
        const mainBodyContainer = document.querySelector(".mainBodyContainer");
        const createCharaStyle = window.getComputedStyle(document.querySelector(".createCharaContainer"));

        const newHeight = parseInt(createCharaStyle.height) + parseInt(createCharaStyle.marginTop) * 3;
        mainBodyContainer.style.height = newHeight.toString() + "px";
    }

    validateInput = async () => {
        const { name, desc, welcomePhrase, summonPhrase, coverPicRaw, iconPicRaw } = this.state;
        let success = true;
        const msg = [];
        if (name.length < minCharaNameLength) { //validate chara name length
            msg.concat(["Your character name is too short.", <br />, "It must be between " + minCharaNameLength +
                " and " + maxCharaNameLength + " characters.", <br />]);
            success = false;
        }
        if (maxCharaNameLength - name.length < 0) {
            msg.concat(["Your character name is too long.", <br />, "It must be between " + minCharaNameLength +
                " and " + maxCharaNameLength + " characters.", <br />]);
            success = false;
        }
        if (maxCharaDescLength - desc.length < 0) { //validate chara desc length
            msg.concat(["The description is too long.", <br />, "It must be under " + maxCharaDescLength +
                " characters.", <br />]);
            success = false;
        }
        if (maxWelcPhrLength - welcomePhrase.length < 0) { //validate chara welcome phrase length
            msg.concat(["The welcome phrase is too long.", <br />, "It must be under " + maxWelcPhrLength +
                " characters.", <br />]);
            success = false;
        }
        if (maxSummPhrLength - summonPhrase.length < 0) { //validate chara summon phrase length
            msg.concat(["The welcome phrase is too long.", <br />, "It must be under " + maxSummPhrLength +
                " characters.", <br />]);
            success = false;
        }
        if (coverPicRaw === null) { //validate if pictures uploaded or not
            msg.concat(["Please upload a cover picture.", <br />]);
            success = false;
        }
        if (iconPicRaw === null) {
            msg.concat(["Please upload an icon.", <br />]);
            success = false;
        }
        if (success === true) {
            this.createChara();
        } else {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not create the character",
                    text: msg
                }
            });
        }
    }

    createChara = async () => {
        const { name, desc, stats, currUser, rarity, welcomePhrase, summonPhrase,
            coverPicRaw, iconPicRaw, gacha } = this.state;
        try {
            const createCharaBody = {
                name: name,
                desc: desc,
                stats: stats,
                creator: currUser._id,
                rarity: rarity,
                welcomePhrase: welcomePhrase,
                summonPhrase: summonPhrase,
                coverPic: coverPicRaw,
                iconPic: iconPicRaw,
            };
            const createCharaRes = await createNewChara(gacha._id, createCharaBody);
            if (!createCharaRes || !createCharaRes.chara) {
                const msg = (createCharaRes && createCharaRes.msg) ?
                    ["There was an error creating the character: "].concat(createCharaRes.msg) :
                    ["There was an error creating the character."];
                msg.concat([<br />, "Please try again."])
                this._isMounted && this.setState({
                    alert: {
                        title: "Oops!",
                        text: msg
                    }
                });
                return;
            }
            this._isMounted && this.setState({
                alert: {
                    title: "Chara created successfully!",
                    handleOk: this.redirectEdit.bind(this, createCharaRes.chara.gacha),
                    okText: "Go back to Edit Gacha"
                }
            });
        } catch (err) {
            console.log("Error in createGacha: " + err);
            this._isMounted && this.setState({
                alert: {
                    title: "Oops!",
                    text: ["There was an error creating the character. Please try again."]
                }
            });
        }
    }

    handleBackToGacha = () => {
        this._isMounted && this.setState({
            alert: {
                title: "Back to Edit Gacha?",
                text: ["Any unsaved changes will be lost."],
                yesNo: true,
                handleYes: this.redirectEdit,
                yesText: "Go to Edit Gacha",
                noText: "Cancel"
            }
        });
    }

    redirectEdit = () => {
        this._isMounted && this.setState({
            alert: null,
            toEdit: true
        });
    }

    render() {
        const gacha_id = this.props.match.params.id;
        const { currUser, coverPic, iconPic, name, desc, stats, rarity,
            welcomePhrase, summonPhrase, toEdit, alert, error } = this.state;

        if (error) {
            return (
                <Redirect push to={{
                    pathname: errorURL,
                    state: { error: error }
                }} />
            );
        }

        if (toEdit) {
            return (
                <Redirect push to={{
                    pathname: editGachaURL + gacha_id
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
                        <div className="createCharaContainer">
                            <div className="pageSubtitle">Create New Chara</div>
                            <NameInput name={"name"} value={name} onChange={this.handleInputChange}
                                placeholder={"Name (required)"} maxValueLength={maxCharaNameLength} />
                            <div className="createCharaCoverPicContainer">
                                <UploadPic parent={this} cover={true} src={coverPic} />
                                <StarRarityDisplay rarity={rarity} />
                            </div>
                            <div className="charaIconDescContainer">
                                <div className="charaIconContainer">
                                    <UploadPic parent={this} cover={false} src={iconPic} />
                                    <div className="charaNamePreview">{name}</div>
                                </div>
                                <DescInput name={"desc"} value={desc} onChange={this.handleInputChange}
                                    placeholder={"Describe this character (optional)"} maxValueLength={maxCharaDescLength} />
                            </div>
                            <RarityPhrasesForm rarity={rarity} welcomePhrase={welcomePhrase} summonPhrase={summonPhrase} 
                                onChange={this.handleInputChange}/>
                            <CharaStatsTable page={this} stats={stats}/>
                            <button className="backToGachaButton" onClick={this.handleBackToGacha}>Back to Edit Gacha</button>
                            <button className="charaSaveButton" onClick={this.validateInput}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateChara;
