/*  Full Dashboard component */
import React from "react";
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import UploadPic from "../../page-components/UploadPic";
import NameInput from "./../../page-components/NameInput";
import DescInput from "./../../page-components/DescInput";
import RarityPhrasesForm from "./../../page-components/RarityPhrasesForm";
import CharaStatsTable from "./../../page-components/CharaStatsTable";
import AlertDialogue from "../../page-components/AlertDialogue";
import StarRarityDisplay from "../../page-components/StarRarityDisplay";
import CharaEditTable from "../../page-components/CharaEditTable";

// Importing actions/required methods
import { checkAndUpdateSession, processError } from "../../../actions/helpers";
import { getCharaById, editChara, getAllCharasInGacha } from "../../../actions/charaHelpers";
import { getGachaById } from "../../../actions/gachaHelpers";
import { getUserById } from "../../../actions/userhelpers";

//images
/**TODO: replace placeholder images */
import dotted_line_box from './../../../images/dotted_line_box_placeholder.png';

//Importing constants
import { editCharaURL, editGachaURL, errorURL, maxCharaDescLength, maxCharaNameLength, 
    minCharaNameLength, maxWelcPhrLength, maxSummPhrLength } from "../../../constants";

/**TODO: add delete character */

class CreateChara extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(editCharaURL + props.match.params.id);

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
            chara: null,
            gacha: null,
            threeStars: [],
            fourStars: [],
            fiveStars: [],
            toEdit: false,
            isCharaLoaded: false,
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
            this._isMounted && await checkAndUpdateSession.bind(this)(this.fetchCharaGachaInfo);
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

    fetchCharaGachaInfo = async () => {
        const id = this.props.match.params.id;

        try {
            const getChara = await getCharaById(id);
            if (!getChara || !getChara.chara) {
                this._isMounted && processError.bind(this)(getChara, true, false);
                return;
            }
            const chara = getChara.chara;
            const getCreator = await getUserById(chara.creator);
            if (!getCreator || !getCreator.user) {
                this._isMounted && processError.bind(this)(getCreator, true, false);
                return;
            }
            const creator = getCreator.user;
            if (creator._id.toString() !== this.state.currUser._id.toString()) {
                this._isMounted && this.setState({
                    error: {
                        code: 401,
                        msg: ["Sorry, you don't have permission to edit this character."],
                        toDashboard: true
                    }
                });
                return;
            }
            const getGacha = await getGachaById(chara.gacha);
            if (!getGacha || !getGacha.gacha) {
                this._isMounted && processError.bind(this)(getGacha, true, false);
                return;
            }
            const gacha = getGacha.gacha;
            const stats = this.addMissingStats(chara.stats, gacha.stats);

            this.setState({
                chara: chara,
                gacha: gacha,
                coverPic: chara.coverPic,
                iconPic: chara.iconPic,
                name: chara.name,
                desc: chara.desc,
                stats: stats,
                rarity: chara.rarity,
                welcomePhrase: chara.welcomePhrase,
                summonPhrase: chara.summonPhrase
            }, this.fetchCharas);

        } catch (err) {
            console.log("Error in fetchCharaGachaInfo: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    fetchCharas = async () => {
        const { gacha } = this.state;
        try {
            const getAllCharasRes = await getAllCharasInGacha(gacha._id);
            if (!getAllCharasRes || !getAllCharasRes.charas) {
                this._isMounted && processError.bind(this)(getAllCharasRes, true, false);
                return;
            }

            this._isMounted && this.setState({
                threeStars: getAllCharasRes.charas.filter(chara => chara.rarity === 3),
                fourStars: getAllCharasRes.charas.filter(chara => chara.rarity === 4),
                fiveStars: getAllCharasRes.charas.filter(chara => chara.rarity === 5),
                isLoaded: true
            ,}, this.resizeMainContainer);
        } catch (err) {
            console.log("Error in fetchCharas: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
        
    }

    addMissingStats = (charaStats, gachaStats) => {
        const statsToReturn = JSON.parse(JSON.stringify(charaStats));
        
        let checkStat;
        gachaStats.forEach(gachaStat => {
            checkStat = charaStats.filter(charaStat =>  charaStat._id.toString() === gachaStat._id.toString());
            if (checkStat.length === 0) {
                statsToReturn.push({ _id: gachaStat._id, name: gachaStat.name, value: 0 });
            }
        })
        return statsToReturn;
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
        const editCharaStyle = window.getComputedStyle(document.querySelector(".editCharaContainer"));

        const newHeight = parseInt(editCharaStyle.height) + parseInt(editCharaStyle.marginTop) * 3;
        mainBodyContainer.style.height = newHeight.toString() + "px";
    }
    
    validateInput = async () => {
        const { name, desc, welcomePhrase, summonPhrase } = this.state;
        let success = true;
        let msg = [];
        if (name.length < minCharaNameLength) { //validate chara name length
            msg = msg.concat(["Your character name is too short.", <br />, "It must be between " + minCharaNameLength +
                " and " + maxCharaNameLength + " characters.", <br />]);
            success = false;
        }
        if (maxCharaNameLength - name.length < 0) {
            msg = msg.concat(["Your character name is too long.", <br />, "It must be between " + minCharaNameLength +
                " and " + maxCharaNameLength + " characters.", <br />]);
            success = false;
        }
        if (maxCharaDescLength - desc.length < 0) { //validate chara desc length
            msg = msg.concat(["The description is too long.", <br />, "It must be under " + maxCharaDescLength +
                " characters.", <br />]);
            success = false;
        }
        if (maxWelcPhrLength - welcomePhrase.length < 0) { //validate chara welcome phrase length
            msg = msg.concat(["The welcome phrase is too long.", <br />, "It must be under " + maxWelcPhrLength +
                " characters.", <br />]);
            success = false;
        }
        if (maxSummPhrLength - summonPhrase.length < 0) { //validate chara summon phrase length
            msg = msg.concat(["The welcome phrase is too long.", <br />, "It must be under " + maxSummPhrLength +
                " characters.", <br />]);
            success = false;
        }
        if (success === true) {
            this.editChara();
        } else {
            this.setState({
                alert: {
                    title: "Could not edit the character",
                    text: msg
                }
            });
        }

    }

    editChara = async () => {
        let success = true;
        let msg = [];
        const { name, desc, stats, rarity, welcomePhrase, summonPhrase, coverPicRaw, iconPicRaw, 
            chara } = this.state;
            
        try {
            const editCharaBody = {
                name: name,
                desc: desc,
                stats: stats,
                rarity: rarity,
                welcomePhrase: welcomePhrase,
                summonPhrase: summonPhrase
            };
            if (coverPicRaw) editCharaBody.coverPic = { oldURL: chara.coverPic, raw: coverPicRaw };
            if (iconPicRaw) editCharaBody.iconPic = { oldURL: chara.iconPic, raw: iconPicRaw };
    
            const patchCharaReq = await editChara(chara._id, editCharaBody);
            if (!patchCharaReq || !patchCharaReq.chara) {
                if (patchCharaReq && patchCharaReq.msg) {
                    msg = msg.concat(["Failed to edit chara: " + patchCharaReq.msg, <br/>]);
                } else {
                    msg = msg.concat(["Failed to edit chara.", <br/>]);
                }
                success = false;
            }
            if (success) {
                this._isMounted && this.setState({
                    alert: {
                        title: "Chara saved successfully!",
                        text: ["Would you like to go back to the edit gacha page?"],
                        yesNo: true,
                        yesText: "Go back to Edit Gacha",
                        noText: "Stay here",
                        handleYes: this.redirectEdit
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
                    text: ["There was an error editing the character. Please try again."]
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
        const { currUser, gacha, coverPic, iconPic, name, desc, stats, rarity, 
            welcomePhrase, summonPhrase, threeStars, fourStars, fiveStars, toEdit, 
            alert, error } = this.state;

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
                        pathname: editGachaURL + gacha._id
                    }} />
                );
            }

        return (
            <div className="App">
                {/* Header component. */}
                <Header currUser={currUser}/>

                <div className="mainBodyContainer">
                    { alert ? 
                        <AlertDialogue parent={this} alert={alert}/> :
                        null
                    }
                    <div className="mainBody">
                        <div className="editCharaContainer">
                            <div className="pageSubtitle">Create New Chara</div>
                            <NameInput name={"name"} value={name} onChange={this.handleInputChange}
                                placeholder={"Name (required)"} maxValueLength={maxCharaNameLength} />
                            <div className="editCharaCoverPicContainer">
                                <UploadPic parent={this} cover={true} src={coverPic}/>
                                <StarRarityDisplay rarity={rarity}/>
                            </div>
                            <div className="charaIconDescContainer">
                                <div className="charaIconContainer">
                                    <UploadPic parent={this} cover={false} src={iconPic}/>
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
                            <CharaEditTable page={this} 
                                gacha={gacha} 
                                threeStars={threeStars} 
                                fourStars={fourStars} 
                                fiveStars={fiveStars} 
                                canDelete={false}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateChara;
