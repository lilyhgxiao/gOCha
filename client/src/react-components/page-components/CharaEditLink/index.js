import React from "react";
import { Redirect } from 'react-router';

import "./styles.css";

//images
/**TODO: get new placeholder for icon */
import icon_placeholder from './../../../images/dashboard_placeholder.jpg';
/**TODO: handle when chara  or chara properties is empty */

class CharaEditLink extends React.Component {
    state = {
        toChara: false
    };

    goToEdit = () => {
        this.setState({
            toChara: true
        });
    }

    handleClick = () => {
        const { page, chara } = this.props;

        page.setState({
            alert: {
                title: "Edit " + chara.name + "?",
                text: ["Any unsaved changes will be lost."],
                yesNo: true,
                yesText: "Go to Edit",
                noText: "Stay here",
                handleYes: this.goToEdit
            }
        });
    }

    deleteChara = (checked) => {
        const { page, chara } = this.props;
        const { charasToRemove, dontShowDeleteWarning } = page.state;

        if (!dontShowDeleteWarning) {
            page.setState({
                dontShowDeleteWarning: checked
            });
        }
        
        let charaList;
        if (chara.rarity === 3) {
            charaList = page.state.threeStars.filter(charaOnList => charaOnList._id.toString() !== chara._id.toString());
            charasToRemove.push(chara._id);
            page.setState({
                charasToRemove: charasToRemove,
                threeStars: charaList,
                alert: null
            });
        } else if (chara.rarity === 4) {
            charaList = page.state.fourStars.filter(charaOnList => charaOnList._id.toString() !== chara._id.toString());
            charasToRemove.push(chara._id);
            page.setState({
                charasToRemove: charasToRemove,
                fourStars: charaList,
                alert: null
            });
        } else {
            charaList = page.state.fiveStars.filter(charaOnList => charaOnList._id.toString() !== chara._id.toString());
            charasToRemove.push(chara._id);
            page.setState({
                charasToRemove: charasToRemove,
                fiveStars: charaList,
                alert: null
            });
        }
        if (charaList.length === 0) {
            page.setState({
                active: false
            });
        }
    }

    handleDeleteClick = (checked) => {
        const { page, chara } = this.props;
        const { dontShowDeleteWarning } = page.state;

        if (dontShowDeleteWarning) {
            this.deleteChara(checked);
        } else {
            page.setState({
                alert: {
                    title: "Delete " + chara.name + "?",
                    text: ["This will not take effect until the gacha has been saved."],
                    yesNo: true,
                    yesText: "Delete",
                    noText: "Cancel",
                    checkbox: true,
                    checkboxText: ["Don't show this warning again", <br/>,"(only this edit session)"],
                    handleYes: this.deleteChara
                }
            });
        }
    }

    render() {
        const { chara } = this.props;
        const { toChara } = this.state;

        if (toChara) {
            return (
                <Redirect push to={{
                    pathname: "/edit/chara/" + chara._id
                }} />
            );
        }

        /**TODO: replace chara icon with actual icon */
        return (
            <table className="charaEditLinkContainer">
                <tbody>
                    <tr>
                        <td onClick={this.handleClick}><img className="charaEditLinkIcon" src={icon_placeholder} alt={chara.name + " Icon"} /></td>
                        <td onClick={this.handleClick}><div className="charaEditLinkName">{chara.name}</div></td>
                        <td><button onClick={this.handleDeleteClick}>Delete</button></td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default CharaEditLink;