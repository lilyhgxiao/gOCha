import React from "react";
import { Redirect } from 'react-router';

import "./styles.css";

import CharaEditList from "./../CharaEditList";

//Importing constants
import {
    createCharaURL
} from "../../../constants";

class CharaEditLink extends React.Component {
    state = {
        toNewChara: false,
        rarityDisplayed: 3
    };

    handleAddNewClick = () => {
        const { page } = this.props;

        page.setState({
            alert: {
                title: "Add a new character?",
                text: ["Any unsaved changes will be lost."],
                yesNo: true,
                yesText: "Go to Create",
                noText: "Stay here",
                handleYes: this.goToNew
            }
        });
    }

    handleRarityClick = (event, rarity) => {
        event.preventDefault();
        
        if (!isNaN(rarity)) {
            this.setState({rarityDisplayed: rarity});
        }
    }

    goToNew = () => {
        this.setState({
            toNewChara: true
        });
    }

    render() {
        const { page, gacha, threeStars, fourStars, fiveStars, canDelete } = this.props;
        const { toNewChara, rarityDisplayed } = this.state;

        if (toNewChara) {
            return (
                <Redirect push to={{
                    pathname: createCharaURL + gacha._id
                }} />
            );
        }

        /**TODO: replace chara icon with actual icon */
        return (
            <div className="gachaCharaListContainer">
                <div>
                    <span>Characters in this Gacha</span>
                    <button className="charaEditAddNewButton" onClick={this.handleAddNewClick}>Add New</button>
                </div>
                <table className="charaEditContTable">
                    <tbody>
                        <tr>
                            <td>
                                <button className="charaEditTabButton" onClick={e => this.handleRarityClick(e, 3)}>3 Stars</button><br/>
                                <button className="charaEditTabButton" onClick={e => this.handleRarityClick(e, 4)}>4 Stars</button><br/>
                                <button className="charaEditTabButton" onClick={e => this.handleRarityClick(e, 5)}>5 Stars</button><br/>
                            </td>
                            <td>
                                <table className="charaEditLinkTable">
                                    <tbody>
                                        <tr className="charaEditLinkTable">
                                            <th className="charaEditLinkTable">3 Stars</th>
                                        </tr>
                                        <tr className="charaEditLinkTable">
                                            <td className="charaEditLinkTable">
                                                <div className="charaEditTableCell">
                                                    <CharaEditList page={page} 
                                                        charaList={rarityDisplayed === 3 ? threeStars : (rarityDisplayed === 4 ? fourStars: fiveStars)}
                                                        canDelete={canDelete} />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
                
            </div>
        );
    }
}

export default CharaEditLink;