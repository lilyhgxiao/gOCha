/*  GachaSummon component */
import React from "react";

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";
import GachaSmnList from "./../GachaSmnList";

// Importing actions/required methods
import { readSession } from "../../actions/loginHelpers";
import { getGachaById } from "../../actions/gachaHelpers";
import { getUserById } from "../../actions/userhelpers";

//images
import main_placeholder from './../../images/dashboard_placeholder.jpg';
import skeleton_placeholder from './../../images/gacha_summon_main_skeleton_placeholder.jpg';
import edit_icon from './../../images/edit.png';

class GachaSummon extends BaseReactComponent {

    state = {
        isGachaLoaded: false,
        isCreatorLoaded: false,
        currUser: null,
        gacha: null,
        charaListVisible: false
    };

    constructor(props) {
        super(props);
        this.props.history.push("/gachaSummon/" + props.match.params.id);
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        const readSessRes = await readSession();
        if (readSessRes.currUser) {
            this.setState({
                currUser: readSessRes.currUser
            }, this.fetchGachaInfo);
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
            this.setState({
                gacha: gacha,
                isGachaLoaded: true
            });
            const creator = await getUserById(gacha.creator);
            if (!creator) {
                console.log("Failed to get creator " + id);
                return;
            }
            this.setState({
                creator: creator,
                isCreatorLoaded: true
            });
        } catch (err) {
            console.log("Error in fetchGachaInfo: " + err);
        }
    }

    handleSummonClick = () => {

    }

    handleCharaListClick = () => {
        this.setState({
            charaListVisible: true
        }, () => {
            //adjusting height if mainBodyContainer is not tall enough
            const mainBodyContainer = document.querySelector(".mainBodyContainer");
            const gachaSmnListContainer = document.querySelector(".gachaSmnListContainer");
            const gachaSmnListStyle = window.getComputedStyle(document.querySelector(".gachaSmnListWindow"));

            const newHeight = parseInt(gachaSmnListStyle.height) + parseInt(gachaSmnListStyle.marginTop) * 2;
            const origHeight = parseInt(window.getComputedStyle(mainBodyContainer).height);

            if (newHeight > origHeight) {
                mainBodyContainer.style.height = newHeight.toString() + "px";
            }
            gachaSmnListContainer.style.visibility = "visible";
            
        });
    }

    handleExitWindowClick = () => {
        this.setState({
            charaListVisible: false
        }, () => {
            const mainBodyContainer = document.querySelector(".mainBodyContainer");
            const gachaSmnListContainer = document.querySelector(".gachaSmnListContainer");
            mainBodyContainer.style.height = "";
            gachaSmnListContainer.style.visibility = "hidden";
        });
    }

    render() {
        const { isGachaLoaded, isCreatorLoaded, gacha, creator, charaListVisible } = this.state;

        return (
            <div className="App">
                <Header/>
                <div className="mainBodyContainer">
                    { isGachaLoaded ?
                        <GachaSmnList
                            gacha={gacha}
                            handleExitWindowClick={this.handleExitWindowClick}
                        /> :
                        null
                    }
                    <div className="mainBody">
                        <div className="pageTitle">{ isGachaLoaded ? gacha.name : "" }</div>
                        <div className="pageSubtitle">{ isCreatorLoaded ? creator.username : "" }</div>
                        {isGachaLoaded ? 
                        <img className="gachaSmnMainPic" src={main_placeholder} alt={gacha.name + " Main Picture"}/> :
                        <img className="gachaSmnMainPic" src={skeleton_placeholder} alt="Skeleton Main Picture"/> }
                        <br/>
                        { isGachaLoaded && gacha.active ?
                            <button className="smnButtonActive" onClick={this.handleSummonClick}>Summon</button> :
                            <button className="smnButtonInactive" onClick={this.handleSummonClick}>Inactive</button>
                        }
                        { isGachaLoaded ?
                            <div className="gachaSmnDesc">{gacha.desc}</div> :
                            null
                        }
                        { isGachaLoaded ?
                            <button className="gachaCharaLists" onClick={this.handleCharaListClick}>See Characters</button> :
                            null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default GachaSummon;