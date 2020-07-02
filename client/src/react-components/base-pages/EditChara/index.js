/*  Full Dashboard component */
import React from "react";
import { uid } from "react-uid";
import { Redirect } from 'react-router';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import UploadPic from "../../page-components/UploadPic";
import AlertDialogue from "../../page-components/AlertDialogue";
import StatDisplay from "../../page-components/StatDisplay";
import StarRarityDisplay from "../../page-components/StarRarityDisplay";
import CharaEditTable from "../../page-components/CharaEditTable";

// Importing actions/required methods
import { updateSession } from "../../../actions/loginHelpers";
import { getCharaById, editChara, getAllCharasInGacha } from "../../../actions/charaHelpers";
import { getGachaById } from "../../../actions/gachaHelpers";
import { getUserById } from "../../../actions/userhelpers";

//images
/**TODO: replace placeholder images */
import dotted_line_box from './../../../images/dotted_line_box_placeholder.png';

//Importing constants
import { maxCharaDescLength, maxCharaNameLength, minCharaNameLength, maxWelcPhrLength, maxSummPhrLength } from "../../../constants";
import { forEach } from "lodash-es";

/**TODO: add navigation back to edit gacha page */

class CreateChara extends BaseReactComponent {

    state = {
        alert: null,
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
        isCharaLoaded: false
    }

    constructor(props) {
        super(props);
        this.props.history.push("/edit/chara/" + props.match.params.id);
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
                }, this.fetchCharaGachaInfo);
            }
        }
    }

    fetchCharaGachaInfo = async () => {
        const id = this.props.match.params.id;

        try {
            const chara = await getCharaById(id);
            if (!chara) {
                console.log("Failed to get chara " + id);
                return;
            }
            const creator = await getUserById(chara.creator);
            if (!creator) {
                console.log("Failed to get creator " + id);
                return;
            }
            if (creator._id.toString() !== this.state.currUser._id.toString()) {
                //do not have permission. redirect to 401 error page
                return;
            }
            const gacha = await getGachaById(chara.gacha);
            if (!gacha) {
                console.log("Failed to get gacha " + id);
                return;
            }
            const stats = await this.addMissingStats(chara.stats, gacha.stats);

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
                summonPhrase: chara.summonPhrase,
                stats: stats
            }, this.fetchCharas);

        } catch (err) {
            console.log("Error in fetchGachaInfo: " + err);
        }
    }

    fetchCharas = async () => {
        const { gacha } = this.state;
        const getAllCharasRes = await getAllCharasInGacha(gacha._id);
        if (!getAllCharasRes) {
            console.log("Failed to get charas of gacha.")
            return;
        }

        this.setState({
            threeStars: getAllCharasRes.filter(chara => chara.rarity === 3),
            fourStars: getAllCharasRes.filter(chara => chara.rarity === 4),
            fiveStars: getAllCharasRes.filter(chara => chara.rarity === 5),
            isLoaded: true
        ,}, this.resizeMainContainer);
    }

    addMissingStats = async (charaStats, gachaStats) => {
        const statsToReturn = JSON.parse(JSON.stringify(charaStats));

        console.log(statsToReturn);
        console.log(gachaStats);
        
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
        this.setState({
          [name]: value  // [name] sets the object property name to the value of the 'name' variable.
        });
    }

    resizeMainContainer = () => {
        const mainBodyContainer = document.querySelector(".mainBodyContainer");
        const editCharaStyle = window.getComputedStyle(document.querySelector(".editCharaContainer"));

        const newHeight = parseInt(editCharaStyle.height) + parseInt(editCharaStyle.marginTop) * 3;
        mainBodyContainer.style.height = newHeight.toString() + "px";
    }
    
    /**TODO: resize main container...? */
    validateInput = async () => {
        const { name, desc, stats, rarity, welcomePhrase, summonPhrase, coverPicRaw, 
            iconPicRaw, currUser } = this.state;
        let success = true;
        const msg = [];
        //validate chara name length
        if (name.length < minCharaNameLength) {
            msg.push("Your character name is too short.");
            msg.push(<br/>)
            msg.push("It must be between " + minCharaNameLength + " and " + maxCharaNameLength + " characters.");
            msg.push(<br/>)
            success = false;
        } 
        if (maxCharaNameLength - name.length < 0) {
            msg.push("Your character name is too long.");
            msg.push(<br/>)
            msg.push("It must be between " + minCharaNameLength + " and " + maxCharaNameLength + " characters.");
            msg.push(<br/>)
            success = false;
        } 
        //validate chara desc length
        if (maxCharaDescLength - desc.length < 0) {
            msg.push("Your description is too long.");
            msg.push(<br/>)
            msg.push("It must be under " + maxCharaDescLength + " characters.");
            msg.push(<br/>)
            success = false;
        }
        //validate chara welcome phrase length
        if (maxWelcPhrLength - welcomePhrase.length < 0) {
            msg.push("The welcome phrase is too long.");
            msg.push(<br/>)
            msg.push("It must be under " + maxWelcPhrLength + " characters.");
            msg.push(<br/>)
            success = false;
        }
        //validate chara summon phrase length
        if (maxSummPhrLength - summonPhrase.length < 0) {
            msg.push("The summon phrase is too long.");
            msg.push(<br/>)
            msg.push("It must be under " + maxWelcPhrLength + " characters.");
            msg.push(<br/>)
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
        const { name, desc, stats, rarity, welcomePhrase, summonPhrase, coverPicRaw, iconPicRaw, 
            currUser, chara } = this.state;

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
        /**TODO: handle response */
        if (!patchCharaReq.chara) {
            console.log(patchCharaReq)
            console.log("something went wrong")
            success = false;
            return;
        }
        if (chara.rarity !== rarity && !patchCharaReq.gacha) {
            /**TODO: handle response to gacha not being patched properly when rarity changes */
            console.log("rarity changed and gacha not edited")
            success = false;
            return;
        }

        if (success) {
            this.setState({
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
            this.setState({
                alert: {
                    text: ["Something went wrong..."]
                }
            });
        }
    }

    redirectEdit = () => {
        this.setState({
            alert: null,
            toEdit: true
        });
    }

    render() {
        const { history } = this.props;
        const { currUser, alert, chara, gacha, coverPic, iconPic, name, desc, stats, rarity, 
            welcomePhrase, summonPhrase, threeStars, fourStars, fiveStars, toEdit } = this.state;

        if (toEdit) {
            return (
                <Redirect push to={{
                    pathname: "/edit/gacha/" + chara.gacha
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
                        <div className="editCharaContainer">
                            <div className="pageSubtitle">Create New Chara</div>
                            <div className="charaNameContainer">
                                <input className="charaNameInput"
                                    name='name'
                                    value={name}
                                    onChange={this.handleInputChange}
                                    type="text"
                                    placeholder="Name (required)" />
                                {maxCharaNameLength - name.length > 0 ?
                                    <div className="nameCharCount">{maxCharaNameLength - name.length}</div> :
                                    <div className="nameCharCountRed">{maxCharaNameLength - name.length}</div>
                                }
                            </div>
                            <div className="editCharaCoverPicContainer">
                                <UploadPic parent={this} cover={true} src={coverPic}/>
                                <StarRarityDisplay rarity={rarity}/>
                            </div>
                            <div className="charaIconDescContainer">
                                <div className="charaIconContainer">
                                    <UploadPic parent={this} cover={false} src={iconPic}/>
                                    <div className="charaNamePreview">{name}</div>
                                </div>
                                <div className="charaDescContainer">
                                    <textarea className="charaDescInput"
                                        name='desc'
                                        value={desc}
                                        onChange={this.handleInputChange}
                                        type="text"
                                        placeholder="Describe this character (optional)" />
                                    {maxCharaDescLength - desc.length > 0 ?
                                        <div className="descCharCount">{maxCharaDescLength - desc.length}</div> :
                                        <div className="descCharCountRed">{maxCharaDescLength - desc.length}</div>
                                    }
                                </div>
                            </div>
                            <div className="rarityPhrasesContainer">
                                <table className="rarityPhrasesTable">
                                    <tbody>
                                        <tr>
                                            <th>Rarity</th>
                                            <td><select className="raritySelect" 
                                                value={rarity} 
                                                name={"rarity"} 
                                                onChange={this.handleInputChange}>
                                                    <option value={3}>3</option>
                                                    <option value={4}>4</option>
                                                    <option value={5}>5</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Welcome Phrase</th>
                                            <td>
                                                <textarea className="charaPhraseInput"
                                                    name='welcomePhrase'
                                                    value={welcomePhrase}
                                                    onChange={this.handleInputChange}
                                                    type="text"
                                                    placeholder="Their phrase when a character appears on the dashboard." />
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Summon Phrase</th>
                                            <td>
                                                <textarea className="charaPhraseInput"
                                                    name='summonPhrase'
                                                    value={summonPhrase}
                                                    onChange={this.handleInputChange}
                                                    type="text"
                                                    placeholder="Their phrase when a character is summoned." />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="charaStatsTableContainer">
                                {stats.length > 0 ?
                                    <div>
                                        <div>Stats</div>
                                        <table className="editCharaStatsTable">
                                            <tbody>
                                                {stats.map((stat, index) => {
                                                    return (
                                                        <tr key={uid(stat)}>
                                                            <th>{stat.name}</th>
                                                            <td>
                                                                <StatDisplay value={stat.value}
                                                                    edit={true}
                                                                    index={index}
                                                                    page={this} />
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                                }
                                            </tbody>
                                        </table>
                                    </div> : null
                                }
                            </div>
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
