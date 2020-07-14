/*  Full Dashboard component */
import React from "react";
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import UploadPic from "./../../page-components/UploadPic";
import NameInput from "./../../page-components/NameInput";
import DescInput from "./../../page-components/DescInput";
import GachaStatsTable from "./../../page-components/GachaStatsTable";
import AlertDialogue from "./../../page-components/AlertDialogue";

// Importing actions/required methods
import { checkAndUpdateSession } from "../../../actions/helpers";
import { createNewGacha } from "../../../actions/gachaHelpers";

//images
/**TODO: replace placeholder images */
import dotted_line_box from './../../../images/dotted_line_box_placeholder.png';

//Importing constants
import {
    createGachaURL, editGachaURL, smnInfoURL, errorURL, maxGachaDescLength, 
    maxGachaNameLength, minGachaNameLength
} from "../../../constants";

class CreateGacha extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(createGachaURL);

        this.state = {
            coverPic: dotted_line_box,
            coverPicRaw: null,
            iconPic: dotted_line_box,
            iconPicRaw: null,
            name: "",
            desc: "",
            stats: [],
            toEdit: false,
            toSummon: false,
            toId: null,
            error: null,
            alert: null
        };
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        try {
            this._isMounted = true;
            this._isMounted && await checkAndUpdateSession.bind(this)(this.resizeMainContainer);
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

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        // 'this' is bound to the component in this arrow function.
        this._isMounted && this.setState({
            [name]: value  // [name] sets the object property name to the value of the 'name' variable.
        });
    }

    handleStatInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const index = parseInt(target.getAttribute("index"));
        const { stats } = this.state;

        stats[index] = value;

        this._isMounted && this.setState({
            stats: stats
        });
    }

    resizeMainContainer = () => {
        const mainBodyContainer = document.querySelector(".mainBodyContainer");
        const createGachaStyle = window.getComputedStyle(document.querySelector(".createGachaContainer"));

        const newHeight = parseInt(createGachaStyle.height) + parseInt(createGachaStyle.marginTop) * 3;
        mainBodyContainer.style.height = newHeight.toString() + "px";
    }

    addStat = () => {
        const { stats } = this.state;

        stats.push("");

        this._isMounted && this.setState({
            stats: stats
        }, this.resizeMainContainer);
    }

    deleteStat = (event) => {
        const target = event.target;
        const index = parseInt(target.getAttribute("index"));
        const { stats } = this.state;

        if (index > -1) {
            stats.splice(index, 1);
        }

        this._isMounted && this.setState({
            stats: stats
        }, this.resizeMainContainer);
    }

    validateInput = async () => {
        const { name, desc, stats, coverPicRaw, iconPicRaw } = this.state;
        let success = true;
        let msg = [];
        if (name.length < minGachaNameLength) { //validate gacha name length
            msg = msg.concat(["Your gacha name is too short.", <br />, "It must be between " + minGachaNameLength +
                " and " + maxGachaNameLength + " characters.", <br />]);
            success = false;
        }
        if (maxGachaNameLength - name.length < 0) {
            msg = msg.concat(["Your gacha name is too long.", <br />, "It must be between " + minGachaNameLength +
                " and " + maxGachaNameLength + " characters.", <br />]);
            success = false;
        }
        if (maxGachaDescLength - desc.length < 0) { //validate gacha desc length
            msg = msg.concat(["The description is too long.", <br />, "It must be under " + maxGachaDescLength +
                " characters.", <br />]);
            success = false;
        }
        if (coverPicRaw === null && iconPicRaw === null) { //validate if pictures uploaded or not
            msg = msg.concat(["Please upload a cover or icon picture.", <br />]);
            success = false;
        }
        //validate stat names are not blank
        for (let i = 0; i < stats.length; i++) {
            if (!(/\S/.test(stats[i]))) {
                msg = msg.concat(["Please don't leave any stat names blank.", <br />], "Delete them if needed.", <br />);
                success = false;
                break;
            }
        }
        if (success === true) {
            this.createGacha();
        } else {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not create Gacha",
                    text: msg
                }
            });
        }
    }

    createGacha = async () => {
        const { name, desc, stats, currUser } = this.state;
        let { coverPicRaw, iconPicRaw } = this.state;
        let msg = [];
        try {
            if (coverPicRaw && !iconPicRaw) {
                iconPicRaw = coverPicRaw;
                console.log("Note: An icon was not uploaded, so the cover picture will be used instead.")
                msg = msg.concat(["Note: An icon was not uploaded, so the cover picture will be used instead.", <br/>]);
            } else if (iconPicRaw && !coverPicRaw) {
                coverPicRaw = iconPicRaw;
                msg = msg.concat(["Note: A cover picture was not uploaded, so the icon will be used instead.", <br/>]);
            }
            const createGachaBody = {
                name: name,
                desc: desc,
                stats: stats,
                creator: currUser._id,
                coverPic: coverPicRaw,
                iconPic: iconPicRaw
            };
            const createGachaRes = await createNewGacha(createGachaBody);
            if (!createGachaRes || !createGachaRes.gacha) {
                msg = msg.concat((createGachaRes && createGachaRes.msg) ?
                    ["There was an error creating the gacha: " + createGachaRes.msg] :
                    ["There was an error creating the gacha."]);
                msg = msg.concat([<br />, "Please try again."])
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
                    title: "Gacha created successfully!",
                    text: msg.concat(["Would you like to edit it right away?"]),
                    yesNo: true,
                    handleYes: this.redirectGacha.bind(this, createGachaRes.gacha._id),
                    handleNo: this.redirectGacha.bind(this, createGachaRes.gacha._id),
                    yesText: "Go to Edit",
                    noText: "Go to Summon"
                }
            });
        } catch (err) {
            console.log("Error in createGacha: " + err);
            this._isMounted && this.setState({
                alert: {
                    title: "Oops!",
                    text: ["There was an error creating the gacha. Please try again."]
                }
            });
        }
    }

    redirectEdit = (id) => {
        this._isMounted && this.setState({
            alert: null,
            toEdit: true,
            toId: id
        });
    }

    redirectGacha = (id) => {
        this._isMounted && this.setState({
            alert: null,
            toSummon: true,
            toId: id
        });
    }

    render() {
        const { currUser, coverPic, iconPic, name, desc, stats, toEdit, toSummon, toId, 
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
                    pathname: editGachaURL + toId
                }} />
            );
        }

        if (toSummon) {
            return (
                <Redirect push to={{
                    pathname: smnInfoURL + toId
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
                        <div className="createGachaContainer">
                            <div className="pageSubtitle">Create New Gacha</div>
                            <NameInput name={"name"} value={name} onChange={this.handleInputChange}
                                placeholder={"Name (required)"} maxValueLength={maxGachaNameLength} />
                            <div className="createGachaCoverPicContainer">
                                <UploadPic parent={this} cover={true} src={coverPic} />
                            </div>
                            <div className="gachaIconDescContainer">
                                <div className="gachaIconContainer">
                                    <UploadPic parent={this} cover={false} src={iconPic} />
                                    <div className="gachaNamePreview">{name}</div>
                                </div>
                                <DescInput name={"desc"} value={desc} onChange={this.handleInputChange}
                                    placeholder={"Describe your Gacha (optional)"} maxValueLength={maxGachaDescLength} />
                            </div>
                            <GachaStatsTable oldStats={[]} newStats={stats} handleOldStatInputChange={null}
                                handleNewStatInputChange={this.handleStatInputChange} addStat={this.addStat}
                                deleteOldStat={null} deleteNewStat={this.deleteStat} />
                            <button className="gachaSaveButton" onClick={this.validateInput}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateGacha;
