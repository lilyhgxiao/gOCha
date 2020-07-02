/*  Full Dashboard component */
import React from "react";
import { uid } from "react-uid";
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import UploadPic from "./../../page-components/UploadPic";
import AlertDialogue from "./../../page-components/AlertDialogue";

// Importing actions/required methods
import { updateSession } from "../../../actions/loginHelpers";
import { createNewGacha } from "../../../actions/gachaHelpers";

//images
/**TODO: replace placeholder images */
import dotted_line_box from './../../../images/dotted_line_box_placeholder.png';

//Importing constants
import { maxGachaDescLength, maxGachaNameLength, minGachaNameLength } from "../../../constants";

class CreateGacha extends BaseReactComponent {

    state = {
        alert: null,
        coverPic: dotted_line_box,
        coverPicRaw: null,
        iconPic: dotted_line_box,
        iconPicRaw: null,
        name: "",
        desc: "",
        stats: [],
        toEdit: false,
        toSummon: false,
        toId: null
    }

    constructor(props) {
        super(props);
        this.props.history.push("/create/gacha");
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
                }, this.resizeMainContainer);
            }
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

    handleStatInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const index = parseInt(target.getAttribute("index"));
        const { stats } = this.state;

        stats[index] = value;
    
        this.setState({
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

        this.setState({
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
        
        this.setState({
            stats: stats
        }, this.resizeMainContainer);
    }
    
    /**TODO: resize main container...? */
    validateInput = async () => {
        const { name, desc, stats, coverPicRaw, iconPicRaw, currUser } = this.state;
        let success = true;
        const msg = [];
        //validate gacha name length
        if (name.length < minGachaNameLength) {
            msg.push("Your gacha name is too short.");
            msg.push(<br/>)
            msg.push("It must be between " + minGachaNameLength + " and " + maxGachaNameLength + " characters.");
            msg.push(<br/>)
            success = false;
        } 
        if (maxGachaNameLength - name.length < 0) {
            msg.push("Your gacha name is too long.");
            msg.push(<br/>)
            msg.push("It must be between " + minGachaNameLength + " and " + maxGachaNameLength + " characters.");
            msg.push(<br/>)
            success = false;
        } 
        //validate gacha desc length
        if (maxGachaDescLength - desc.length < 0) {
            msg.push("Your description is too long.");
            msg.push(<br/>)
            msg.push("It must be under " + maxGachaDescLength + " characters.");
            msg.push(<br/>)
            success = false;
        }
        //validate if pictures uploaded or not
        if (coverPicRaw === null) {
            msg.push("Please upload a cover picture.");
            msg.push(<br/>)
            success = false;
        }
        if (iconPicRaw === null) {
            msg.push("Please upload an icon.");
            msg.push(<br/>)
            success = false;
        }
        //validate stat names are not blank
        let i;
        for (i = 0; i < stats.length; i++) {
            if (!(/\S/.test(stats[i]))) {
                msg.push("Please don't leave any stat names blank.");
                msg.push(<br/>)
                msg.push("Delete them if needed.");
                msg.push(<br/>)
                success = false;
                break;
            }   
        }
        if (success === true) {
            const createGachaBody = {
                name: name,
                desc: desc,
                stats: stats,
                creator: currUser._id,
                coverPic: coverPicRaw,
                iconPic: iconPicRaw
            };
            /**TODO: handle if create gacha fails */
            const createGachaRes = await createNewGacha(createGachaBody);
            if (createGachaRes) {
                if (createGachaRes.gacha) {
                    this.setState({
                        alert: {
                            title: "Gacha created successfully!",
                            text: ["Would you like to edit it right away?"],
                            yesNo: true,
                            handleYes: this.redirectGacha.bind(this, createGachaRes.gacha._id),
                            handleNo: this.redirectGacha.bind(this, createGachaRes.gacha._id),
                            yesText: "Go to Edit",
                            noText: "Go to Summon"
                        }
                    });
                }
            }
        } else {
            this.setState({
                alert: {
                    title: "Could not create Gacha",
                    text: msg
                }
            });
        }

    }

    redirectEdit = (id) => {
        this.setState({
            alert: null,
            toEdit: true,
            toId: id
        });
    }

    redirectGacha = (id) => {
        this.setState({
            alert: null,
            toSummon: true,
            toId: id
        });
    }

    createAlertDialogue = () => {
        this.setState({
            alert: {
                title: "Yep",
                yesNo: true,
                image: {src: dotted_line_box, alt:"Dashboard Placeholder"}
            }
        });
    }

    render() {
        const { history } = this.props;
        const { currUser, alert, coverPic, iconPic, name, desc, stats, toEdit, toSummon, toId } = this.state;

        if (toEdit) {
            return (
                <Redirect push to={{
                    pathname: "/edit/gacha/" + toId
                }} />
            );
        }

        if (toSummon) {
            return (
                <Redirect push to={{
                    pathname: "/summon/" + toId
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
                        <AlertDialogue parent={this} title={alert.title} text={alert.text} yesNo={alert.yesNo} 
                        handleYes={alert.handleYes} handleNo={alert.handleNo} handleOk={alert.handleOk} 
                        yesText={alert.yesText} noText={alert.noText} okText={alert.okText} image={alert.image}
                        checkbox={alert.checkbox} checkboxText={alert.checkboxText}/> :
                        null
                    }
                    <div className="mainBody">
                        <div className="createGachaContainer">
                            <div className="pageSubtitle">Create New Gacha</div>
                            <div className="gachaNameContainer">
                                <input className="gachaNameInput"
                                    name='name'
                                    value={this.state.name}
                                    onChange={this.handleInputChange}
                                    type="text"
                                    placeholder="Name (required)" />
                                {maxGachaNameLength - name.length > 0 ?
                                    <div className="nameCharCount">{maxGachaNameLength - name.length}</div> :
                                    <div className="nameCharCountRed">{maxGachaNameLength - name.length}</div>
                                }
                            </div>
                            <div className="createGachaCoverPicContainer">
                                <UploadPic parent={this} cover={true} src={coverPic}/>
                            </div>
                            <div className="gachaIconDescContainer">
                                <div className="gachaIconContainer">
                                    <UploadPic parent={this} cover={false} src={iconPic}/>
                                    <div className="gachaNamePreview">{name}</div>
                                </div>
                                <div className="gachaDescContainer">
                                    <textarea className="gachaDescInput"
                                        name='desc'
                                        value={this.state.desc}
                                        onChange={this.handleInputChange}
                                        type="text"
                                        placeholder="Describe your Gacha (optional)" />
                                    {maxGachaDescLength - desc.length > 0 ?
                                        <div className="descCharCount">{maxGachaDescLength - desc.length}</div> :
                                        <div className="descCharCountRed">{maxGachaDescLength - desc.length}</div>
                                    }
                                </div>
                            </div>
                            <div className="gachaStatsTableContainer">
                                <table className="gachaStatsTable">
                                    <tbody>
                                        <tr className="gachaStatsTable">
                                            <th className="gachaStatsTableLeft">Stats</th>
                                            <th className="gachaStatsTableRight"></th>
                                        </tr>
                                        {stats.map((stat, index) => {
                                            return (<tr className="gachaStatsTable" key={uid(index)}>
                                                <td className="gachaStatsTableLeft">
                                                    <input className="statsInput"
                                                        name={'stats[' + index + ']'}
                                                        value={stats[index]}
                                                        index={index}
                                                        onChange={this.handleStatInputChange}
                                                        type="text"
                                                        placeholder={"Stat " + (index + 1).toString() + " Name (required)"} />
                                                </td>
                                                <td className="gachaStatsTableRight">
                                                    <button className="deleteStatButton" onClick={this.deleteStat} index={index}>Delete Stat</button>
                                                </td>
                                            </tr>);
                                        })}
                                        {   stats.length < 10 ?
                                            <tr className="gachaStatsTable">
                                                <td className="gachaStatsTableLeft">
                                                    <button className="addStatButton" onClick={this.addStat}>Add Stat</button>
                                                </td>
                                                <td className="gachaStatsTableRight"></td>
                                            </tr> : null
                                        }
                                        
                                    </tbody>
                                </table>
                            </div>
                            <button className="gachaSaveButton" onClick={this.validateInput}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateGacha;
