/*  Full Dashboard component */
import React from "react";
import { uid } from "react-uid";
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";
import UploadPic from "./../UploadPic";
import AlertDialogue from "./../AlertDialogue";

// Importing actions/required methods
import { updateSession } from "../../actions/loginHelpers";
import { getGachaById, editGacha, addStatsToGacha, updateStatsOnGacha, deleteStatsOnGacha } from "../../actions/gachaHelpers";
import { getUserById } from "../../actions/userhelpers";

//images
/**TODO: replace image placeholders */
import dotted_line_box from './../../images/dotted_line_box_placeholder.png';

//Importing constants
import { maxGachaDescLength, maxGachaNameLength, minGachaNameLength } from "./../../constants";

class EditGacha extends BaseReactComponent {

    state = {
        alert: null,
        gacha: null,
        isGachaLoaded: false,
        coverPic: dotted_line_box,
        coverPicRaw: null,
        iconPic: dotted_line_box,
        iconPicRaw: null,
        name: "",
        desc: "",
        oldStats: [],
        newStats: [],
        active: false,
        toSummon: false
    }

    constructor(props) {
        super(props);
        this.props.history.push("/edit/gacha/" + props.match.params.id);
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        const readSessRes = await updateSession();
        if (readSessRes) {
            if (readSessRes.currUser) {
                this.setState({
                    currUser: readSessRes.currUser
                }, this.fetchGachaInfo);
            }
        }
    }

    fetchGachaInfo = async () => {
        const id = this.props.match.params.id;

        try {
            const gacha = await getGachaById(id);
            if (!gacha) {
                console.log("Failed to get gacha " + id);
                return;
            }
            const creator = await getUserById(gacha.creator);
            if (!creator) {
                console.log("Failed to get creator " + id);
                return;
            }
            if (creator._id.toString() !== this.state.currUser._id.toString()) {
                //do not have permission. redirect to 401 error page
                return;
            }
            const oldStats = JSON.parse(JSON.stringify(gacha.stats));
            this.setState({
                gacha: gacha,
                coverPic: gacha.coverPic,
                iconPic: gacha.iconPic,
                name: gacha.name,
                desc: gacha.desc,
                oldStats: oldStats,
                active: gacha.active,
                isGachaLoaded: true
            }, this.resizeMainContainer);
        } catch (err) {
            console.log("Error in fetchGachaInfo: " + err);
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

    handleActiveClick = () => {
        this.setState({
            active: !this.state.active
        });
    }

    handleOldStatInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const index = parseInt(target.getAttribute("index"));
        const stats = this.state.oldStats;
        stats[index].name = value;
        this.setState({
            oldStats: stats
        });
    }

    handleNewStatInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const index = parseInt(target.getAttribute("index"));

        const stats = this.state.newStats;
        stats[index] = value;
        this.setState({
            newStats: stats
        });        
    }

    resizeMainContainer = () => {
        const mainBodyContainer = document.querySelector(".mainBodyContainer");
        const editGachaStyle = window.getComputedStyle(document.querySelector(".editGachaContainer"));

        const newHeight = parseInt(editGachaStyle.height) + parseInt(editGachaStyle.marginTop) * 3;
        mainBodyContainer.style.height = newHeight.toString() + "px";
    }

    addStat = () => {
        const { newStats } = this.state;

        newStats.push("");

        this.setState({
            newStats: newStats
        }, this.resizeMainContainer);
    }

    deleteOldStat = (event) => {
        const target = event.target;
        const index = parseInt(target.getAttribute("index"));
        
        const stats = this.state.oldStats;
        if (index > -1) {
            stats.splice(index, 1);
        }
        this.setState({
            oldStats: stats
        }, this.resizeMainContainer);
        
    }

    deleteNewStat = (event) => {
        const target = event.target;
        const index = parseInt(target.getAttribute("index"));
        
        const stats = this.state.newStats;
        if (index > -1) {
            stats.splice(index, 1);
        }
        this.setState({
            newStats: stats
        }, this.resizeMainContainer);
    }

    validateInput = async () => {
        const { name, desc, newStats, oldStats, coverPicRaw, iconPicRaw, currUser } = this.state;
        let success = true;
        const msg = [];
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
        if (maxGachaDescLength - desc.length < 0) {
            msg.push("Your description is too long.");
            msg.push(<br/>)
            msg.push("It must be under " + maxGachaDescLength + " characters.");
            msg.push(<br/>)
            success = false;
        }
        let i;
        for (i = 0; i < newStats.length; i++) {
            if (!(/\S/.test(newStats[i]))) {
                console.log(newStats[i])
                msg.push("Please don't leave any stat names blank.");
                msg.push(<br/>)
                msg.push("Delete them if needed.");
                msg.push(<br/>)
                success = false;
                break;
            }   
        }
        if (success === true) {
            for (i = 0; i < oldStats.length; i++) {
                if (!(/\S/.test(oldStats[i].name))) {
                    console.log(oldStats[i])
                    msg.push("Please don't leave any stat names blank.");
                    msg.push(<br/>)
                    msg.push("Delete them if needed.");
                    msg.push(<br/>)
                    success = false;
                    break;
                }   
            }
        }
        if (success === true) {
            this.editGacha();
        } else {
            this.setState({
                alert: {
                    title: "Could not create Gacha",
                    text: msg
                }
            });
        }

    }

    editGacha = async () => {
        const success = true;
        const { name, desc, active, oldStats, newStats, coverPicRaw, iconPicRaw, currUser, gacha } = this.state;
        console.log(oldStats);
        const editGachaBody = {
            name: name,
            desc: desc,
            active: active
        };
        if (coverPicRaw) editGachaBody.coverPic = { oldURL: gacha.coverPic, raw: coverPicRaw };
        if (iconPicRaw) editGachaBody.iconPic = { oldURL: gacha.iconPic, raw: iconPicRaw };

        const patchGachaReq = await editGacha(gacha._id, editGachaBody);
        /**TODO: handle response */
        if (!patchGachaReq.gacha) {
            console.log("something went wrong")
            success = false;
            return;
        }

        const editStatsReqs = [];

        let i;
        let checkStat;
        const deleteStats = []
        for (i = 0; i < gacha.stats.length; i++) {
            checkStat = oldStats.filter(stat => stat._id.toString() === gacha.stats[i]._id.toString());
            console.log(checkStat)
            console.log(gacha.stats[i])
            if (checkStat.length === 0) {
                deleteStats.push(gacha.stats[i]);
            } else {
                if (checkStat[0].name !== gacha.stats[i].name) {
                    console.log(checkStat[0])
                    editStatsReqs.push(await updateStatsOnGacha(gacha._id, {stats: checkStat[0]}))
                }
            }
        }
        if (deleteStats.length > 0) {
            console.log(deleteStats)
            editStatsReqs.push(await deleteStatsOnGacha(gacha._id, { stats: deleteStats }));
        }
        if (newStats.length > 0) {
            editStatsReqs.push(await addStatsToGacha(gacha._id, { stats: newStats }));
        }

        editStatsReqs.forEach(res => {
            /**TODO: check res and handle if any returned null */
            if (res === null) {
                const success = false;
                console.log("A stat was not edited properly.")
            }
        });

        if (success) {
            this.setState({
                alert: {
                    title: "Gacha saved successfully!"
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

    redirectGacha = (id) => {
        this.setState({
            alert: null,
            toSummon: true
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
        const { currUser, gacha, alert, coverPic, iconPic, name, desc, oldStats, newStats, toSummon, active } = this.state;

        if (toSummon) {
            return (
                <Redirect push to={{
                    pathname: "/summon/" + gacha._id
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
                        yesText={alert.yesText} noText={alert.noText} okText={alert.okText} image={alert.image}/> :
                        null
                    }
                    <div className="mainBody">
                        <div className="editGachaContainer">
                            <div className="pageSubtitle">Edit Gacha</div>
                            <button onClick={this.handleActiveClick}>{active ? <span>Active</span> : <span>Inactive</span>}</button>
                            <div className="gachaNameContainer">
                                <input className="gachaNameInput"
                                    name='name'
                                    value={this.state.name}
                                    onChange={this.handleInputChange}
                                    type="text"
                                    placeholder="Name (required)" />
                                { maxGachaNameLength - name.length > 0 ?
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
                                        {oldStats.map((stat, index) => {
                                            return (<tr className="gachaStatsTable" key={uid(index)}>
                                                <td className="gachaStatsTableLeft">
                                                    <input className="statsInput"
                                                        name={'stats[' + index + ']'}
                                                        value={oldStats[index].name}
                                                        index={index}
                                                        old={"true"}
                                                        onChange={this.handleOldStatInputChange}
                                                        type="text"
                                                        placeholder={"Stat " + (index + 1).toString() + " Name (required)"} />
                                                </td>
                                                <td className="gachaStatsTableRight">
                                                    <button className="deleteStatButton" 
                                                        onClick={this.deleteOldStat} 
                                                        index={index} 
                                                        old={"true"}>Delete Stat</button>
                                                </td>
                                            </tr>);
                                        })}
                                        {newStats.map((stat, index) => {
                                            return (<tr className="gachaStatsTable" key={uid(index)}>
                                                <td className="gachaStatsTableLeft">
                                                    <input className="statsInput"
                                                        name={'stats[' + index + ']'}
                                                        value={newStats[index]}
                                                        index={index}
                                                        onChange={this.handleNewStatInputChange}
                                                        type="text"
                                                        placeholder={"Stat " + (oldStats.length + index + 1).toString() + " Name (required)"} />
                                                </td>
                                                <td className="gachaStatsTableRight">
                                                    <button className="deleteStatButton" 
                                                        onClick={this.deleteNewStat} 
                                                        index={index}>Delete Stat</button>
                                                </td>
                                            </tr>);
                                        })}
                                        {   oldStats.length + newStats.length < 10 ?
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

export default EditGacha;
