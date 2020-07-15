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
import GachaStatsTable from "./../../page-components/GachaStatsTable";
import AlertDialogue from "../../page-components/AlertDialogue";
import CharaEditTable from "./../../page-components/CharaEditTable";

// Importing actions/required methods
import { checkAndUpdateSession, processError } from "../../../actions/helpers";
import { getGachaById, editGacha, addStatsToGacha, updateStatsOnGacha, 
    deleteStatsOnGacha, deleteGachaById } from "../../../actions/gachaHelpers";
import { getUserById } from "../../../actions/userhelpers";
import { getAllCharasInGacha, deleteCharaById } from "../../../actions/charaHelpers";

//images
/**TODO: replace image placeholders */
import dotted_line_box from './../../../images/dotted_line_box_placeholder.png';

//Importing constants
import { editGachaURL, gachasURL, maxGachaDescLength, 
    maxGachaNameLength, minGachaNameLength } from "../../../constants";

/**TODO: add delete gacha */

class EditGacha extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(editGachaURL + props.match.params.id);

        this.state = {
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
            threeStars: [],
            fourStars: [],
            fiveStars: [],
            charasToRemove: [],
            active: false,
            toYourGachas: false,
            dontShowDeleteWarning: false,
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
                error: { code: 500, msg: "Something went wrong and your session has expired." +
                    "Please log in again.", toLogin: true }
            });
        }
    }

    componentWillUnmount () {
        this._isMounted = false;
        this.setState = (state,callback)=>{
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
                    error: {code: 401, 
                        msg: ["Sorry, you don't have permission to edit this gacha."], 
                        toDashboard: true
                    }
                });
                return;
            }
            const oldStats = JSON.parse(JSON.stringify(gacha.stats));
            this._isMounted && this.setState({
                gacha: gacha,
                coverPic: gacha.coverPic,
                iconPic: gacha.iconPic,
                name: gacha.name,
                desc: gacha.desc,
                oldStats: oldStats,
                active: gacha.active,
                isGachaLoaded: true
            }, this.fetchCharas);

        } catch (err) {
            console.log("Error in fetchGachaInfo: " + err);
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong loading the page.", toDashboard: true }
            });
        }
    }

    fetchCharas = async () => {
        const { gacha } = this.state;
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

    handleActiveClick = () => {
        const { active, threeStars, fourStars, fiveStars } = this.state;
        if (active === false && 
            (threeStars.length === 0 || fourStars.length === 0 || fiveStars.length === 0)) {
            this._isMounted && this.setState({
                alert: {
                    text: ["You cannot set this gacha to active because", <br/>, 
                        "one of your rarity lists is empty."]
                }
            });
        } else {
            this._isMounted && this.setState({
                active: !this.state.active
            });
        }
        
    }

    handleOldStatInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const index = parseInt(target.getAttribute("index"));
        const stats = this.state.oldStats;
        stats[index].name = value;
        this._isMounted && this.setState({
            oldStats: stats
        });
    }

    handleNewStatInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const index = parseInt(target.getAttribute("index"));
        const stats = this.state.newStats;
        stats[index] = value;
        this._isMounted && this.setState({
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
        this._isMounted && this.setState({
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
        this._isMounted && this.setState({
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
        this._isMounted && this.setState({
            newStats: stats
        }, this.resizeMainContainer);
    }

    validateInput = async () => {
        const { name, desc, newStats, oldStats } = this.state;
        let success = true;
        let msg = [];
        if (name.length < minGachaNameLength) {
            msg = msg.concat(["Your gacha name is too short.", <br/>, "It must be between " + minGachaNameLength + 
                " and " + maxGachaNameLength + " characters.", <br/>]);
            success = false;
        } 
        if (maxGachaNameLength - name.length < 0) {
            msg = msg.concat(["Your gacha name is too long.", <br/>, "It must be between " + minGachaNameLength + 
                " and " + maxGachaNameLength + " characters.", <br/>]);
            success = false;
        } 
        if (maxGachaDescLength - desc.length < 0) {
            msg = msg.concat(["The description is too long.", <br/>, "It must be under " + maxGachaDescLength + 
                " characters.", <br/>]);
            success = false;
        }
        for (let i = 0; i < newStats.length; i++) {
            if (!(/\S/.test(newStats[i]))) {
                msg = msg.concat(["Please don't leave any stat names blank.", <br/>], "Delete them if needed.", <br/>);
                success = false;
                break;
            }   
        }
        if (success === true) {
            for (let i = 0; i < oldStats.length; i++) {
                if (!(/\S/.test(oldStats[i].name))) {
                    msg = msg.concat(["Please don't leave any stat names blank.", <br/>], "Delete them if needed.", <br/>);
                    success = false;
                    break;
                }   
            }
        }
        if (success === true) {
            this.editGacha();
        } else {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not create Gacha",
                    text: msg
                }
            });
        }

    }

    editGacha = async () => {
        let success = true;
        let msg = [];
        const { name, desc, active, coverPicRaw, iconPicRaw, gacha } = this.state;

        try {
            const editGachaBody = {
                name: name,
                desc: desc,
                active: active
            };
            if (coverPicRaw) editGachaBody.coverPic = { oldURL: gacha.coverPic, raw: coverPicRaw };
            if (iconPicRaw) editGachaBody.iconPic = { oldURL: gacha.iconPic, raw: iconPicRaw };
    
            const patchGachaReq = await editGacha(gacha._id, editGachaBody);
            if (!patchGachaReq || !patchGachaReq.gacha) {
                if (patchGachaReq && patchGachaReq.msg) {
                    msg = msg.concat(["Failed to edit gacha: " + patchGachaReq.msg, <br/>]);
                } else {
                    msg = msg.concat(["Failed to edit gacha.", <br/>]);
                }
                success = false;
            }
    
            const editStats = await this.editStats();
            success = editStats.success && success;
            if (!editStats.success) {
                msg = msg.concat(["There was an error editing the following stats: ", <br/>]);
                editStats.failedStats.forEach(stat => msg.push(stat.name + ", "));
                msg.push(<br/>)
            }
        
            const removeCharas = await this.removeCharas();
            success = removeCharas.success && success;
            if (!removeCharas.success) {
                msg = msg.concat(["There was an error removing the following characters: ", <br/>])
                removeCharas.failedCharas.forEach(chara => msg.push(chara.name + ", "));
                msg.push(<br/>);
            }
    
            if (success) {
                this._isMounted && this.setState({
                    alert: {
                        title: "Gacha saved successfully!",
                        text: ["Keep editing?"],
                        yesNo: true,
                        handleNo: this.redirectYourGachas 
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
                    text: ["There was an error editing the gacha. Please try again."]
                }
            });
        }
    }

    editStats = async () => {
        const { gacha, oldStats, newStats } = this.state;
        let success = true;
        const editStatsReqs = [];
        const deleteStats = [];
        let statsToEdit = [];
        let checkStat;
        
        const failedStats = [];
        try {
            for (let i = 0; i < gacha.stats.length; i++) {
                checkStat = oldStats.filter(stat => stat._id.toString() === gacha.stats[i]._id.toString());
                if (checkStat.length === 0) {
                    deleteStats.push(gacha.stats[i]);
                } else {
                    if (checkStat[0].name !== gacha.stats[i].name) {
                        statsToEdit.push(checkStat[0]);
                        editStatsReqs.push(await updateStatsOnGacha(gacha._id, {stats: checkStat[0]}))
                    }
                }
            }
            if (deleteStats.length > 0) {
                statsToEdit = statsToEdit.concat(deleteStats);
                editStatsReqs.push(await deleteStatsOnGacha(gacha._id, { stats: deleteStats }));
            }
            if (newStats.length > 0) {
                statsToEdit = statsToEdit.concat(newStats);
                editStatsReqs.push(await addStatsToGacha(gacha._id, { stats: newStats }));
            }
    
            editStatsReqs.forEach((res, index) => {
                if (!res || !res.gacha) {
                    success = false;
                    failedStats.push(statsToEdit[index]);
                }
            });
        } catch (err) {
            this._isMounted && this.setState({
                alert: {
                    title: "Oops!",
                    text: ["There was an error editing the gacha. Please try again."]
                }
            });
        }
        return {success, failedStats};
    }

    removeCharas = async () => {
        const { charasToRemove } = this.state;
        let success = true;
        const failedCharas = [];
        try {
            let res;
            charasToRemove.forEach(async (chara) => {
                res = await deleteCharaById(chara._id);
                if (!res || !res.chara) {
                    success = false;
                    failedCharas.push(chara);
                }
            });
        } catch (err) {
            this._isMounted && this.setState({
                alert: {
                    title: "Oops!",
                    text: ["There was an error editing the gacha. Please try again."]
                }
            });
        }
        return {success, failedCharas};
    }

    handleDeleteClick = () => {
        this._isMounted && this.setState({
            alert: {
                title: "Delete this gacha?",
                text: ["Any characters created through this gacha will be deleted, including " + 
                    "from the inventories of other users.", <br/>, <br/>, "Delete this gacha anyway?", <br/>,
                    "(Please check the box to confirm.)"],
                yesNo: true,
                yesText: "Delete",
                noText: "Cancel",
                handleYes: this.deleteGacha,
                checkbox: true,
                checkboxText: ["I understand, delete the gacha."],
            }
        });
    }

    deleteGacha = async (checked) => {
        const { gacha } = this.state;
        if (checked) {
            try {
                const deleteGacha = await deleteGachaById(gacha._id);
                if (!deleteGacha || !deleteGacha.gacha) {
                    this._isMounted && this.setState({
                        alert: {
                            text: ["Something went wrong..."]
                        }
                    });
                } else {
                    this._isMounted && this.setState({
                        alert: {
                            title: "Successfully deleted the gacha.",
                            text: ["Going back to the gacha list..."],
                            handleOk: this.redirectYourGachas
                        }
                    });
                }
            } catch (err) {
                this._isMounted && this.setState({
                    alert: {
                        title: "Oops!",
                        text: ["There was an error deleting the gacha. Please try again."]
                    }
                });
            }
        } else {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not delete the gacha",
                    text: ["Please check the confirmation checkbox."]
                }
            });
        }
    }

    redirectYourGachas = () => {
        this.setState({
            alert: null,
            toYourGachas: true
        });
    }

    render() {
        const { currUser, gacha, alert, coverPic, iconPic, name, desc, oldStats, newStats, 
            toYourGachas, active, threeStars, fourStars, fiveStars } = this.state;

        if (toYourGachas) {
            return (
                <Redirect push to={{
                    pathname: gachasURL
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
                        <div className="editGachaContainer">
                            <div className="pageSubtitle">Edit Gacha</div>
                            <button onClick={this.handleActiveClick}>
                                {active ? <span>Active</span> : <span>Inactive</span>}
                            </button>
                            <NameInput name={"name"} value={name} onChange={this.handleInputChange}
                                placeholder={"Name (required)"} maxValueLength={maxGachaNameLength} />
                            <div className="createGachaCoverPicContainer">
                                <UploadPic parent={this} cover={true} src={coverPic}/>
                            </div>
                            <div className="gachaIconDescContainer">
                                <div className="gachaIconContainer">
                                    <UploadPic parent={this} cover={false} src={iconPic}/>
                                    <div className="gachaNamePreview">{name}</div>
                                </div>
                                <DescInput name={"desc"} value={desc} onChange={this.handleInputChange}
                                    placeholder={"Describe your Gacha (optional)"} maxValueLength={maxGachaDescLength} />
                            </div>
                            <GachaStatsTable oldStats={oldStats} newStats={newStats} 
                                handleOldStatInputChange={this.handleOldStatInputChange}
                                handleNewStatInputChange={this.handleNewStatInputChange} 
                                addStat={this.addStat} deleteOldStat={this.deleteOldStat} 
                                deleteNewStat={this.deleteNewStat} />
                            <CharaEditTable page={this} 
                                gacha={gacha} 
                                threeStars={threeStars} 
                                fourStars={fourStars} 
                                fiveStars={fiveStars} 
                                canDelete={true}/>
                            <button className="gachaSaveButton" onClick={this.validateInput}>Save</button>
                            <br />
                            <button className="gachaDeleteButton" onClick={this.handleDeleteClick}>Delete Gacha</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EditGacha;
