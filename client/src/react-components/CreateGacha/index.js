/*  Full Dashboard component */
import React from "react";
import { uid } from "react-uid";
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";
import AlertDialogue from "./../AlertDialogue";

// Importing actions/required methods
import { updateSession } from "../../actions/loginHelpers";

//images
import dotted_line_box from './../../images/dotted_line_box_placeholder.png';

//Importing constants
import { maxGachaDescLength, maxGachaNameLength, minGachaNameLength } from "./../../constants";

class CreateGacha extends BaseReactComponent {

    state = {
        alert: null,
        mainPic: dotted_line_box,
        iconPic: dotted_line_box,
        name: "",
        desc: "",
        stats: []
    }

    constructor(props) {
        super(props);
        this.props.history.push("/create/gacha");
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

    createAlertDialogue = () => {
        this.setState({
            alert: {
                title: "Yep",
                yesNo: true,
                image: {src: dotted_line_box, alt:"Dashboard Placeholder"}
            }
        })
    }

    render() {
        const { history } = this.props;
        const { currUser, alert, mainPic, iconPic, name, desc, stats } = this.state;

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
                        <div className="createGachaContainer">
                            <div className="pageSubtitle">Create New Gacha</div>
                            <div className="gachaNameContainer">
                                <input className="gachaNameInput"
                                    name='name'
                                    value={this.state.name}
                                    onChange={this.handleInputChange}
                                    type="text"
                                    placeholder="Name" />
                                {maxGachaNameLength - name.length > 0 ?
                                    <div className="nameCharCount">{maxGachaNameLength - name.length}</div> :
                                    <div className="nameCharCountRed">{maxGachaNameLength - name.length}</div>
                                }
                            </div>
                            <div className="gachaMainPicContainer">
                                <img className="gachaMainPic" src={mainPic} alt="New Gacha Main Pic" />
                            </div>
                            <div className="gachaIconDescContainer">
                                <div className="gachaIconContainer">
                                    <img className="gachaIcon" src={iconPic} alt="New Gacha Main Pic" />
                                    <div className="gachaNamePreview">{name}</div>
                                </div>
                                <div className="gachaDescContainer">
                                    <textarea className="gachaDescInput"
                                        name='desc'
                                        value={this.state.desc}
                                        onChange={this.handleInputChange}
                                        type="text"
                                        placeholder="Describe your Gacha" />
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
                                                        value={this.state.stats[index]}
                                                        index={index}
                                                        onChange={this.handleStatInputChange}
                                                        type="text"
                                                        placeholder={"Stat " + (index + 1).toString() + " Name"} />
                                                </td>
                                                <td className="gachaStatsTableRight">
                                                    <button className="deleteStatButton" onClick={this.deleteStat} index={index}>Delete Stat</button>
                                                </td>
                                            </tr>);
                                        })}
                                        <tr className="gachaStatsTable">
                                            <td className="gachaStatsTableLeft">
                                                <button className="addStatButton" onClick={this.addStat}>Add Stat</button>
                                            </td>
                                            <td className="gachaStatsTableRight"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <button className="gachaSaveButton" onClick={this.createGacha}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateGacha;
