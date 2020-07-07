import React from "react";

import "./styles.css";

// Importing components
import GachaSmnListTable from "./../GachaSmnListTable";

//images
/**TODO: replace placeholder images */
import main_placeholder from './../../../images/dashboard_placeholder.jpg';
import exit_icon from './../../../images/exit.png';
import edit_icon from './../../../images/edit.png';

// Importing actions/required methods
import { getAllCharasInGacha } from "../../../actions/charaHelpers";
import { uid } from "react-uid";

//Importing constants
import { fiveStarChance, fourStarChance, threeStarChance } from "../../../constants";


class GachaSmnList extends React.Component {

    /**TODO: handle when gacha/properties is empty */
    render() {
        const { gacha, handleExitWindowClick, threeStars, fourStars, fiveStars, isLoaded } = this.props;

        return (
            <div className="gachaSmnListContainer">
                <div className="darkBackground">
                </div>
                <div className="gachaSmnListWindow">
                    <div className="iconBar">
                        <img className="exitButton" src={exit_icon} onClick={handleExitWindowClick} alt={'Exit Profile'} />
                    </div>
                    <div className="gachaSmnListTitle">{gacha.name + " Character List"}</div>

                    <div className="gachaSmnListContent">
                        <div className="gachaSmnListTableTitle">5 Stars</div>
                        <GachaSmnListTable isLoaded={isLoaded} charaList={fiveStars} chance={fiveStarChance}/>
                        <br/>

                        <div className="gachaSmnListTableTitle">4 Stars</div>
                        <GachaSmnListTable isLoaded={isLoaded} charaList={fourStars} chance={fourStarChance}/>
                        <br/>

                        <div className="gachaSmnListTableTitle">3 Stars</div>
                        <GachaSmnListTable isLoaded={isLoaded} charaList={threeStars} chance={threeStarChance}/>
                        <br/>
                    </div>
                </div>
            </div>
        );
    }
}

export default GachaSmnList;