import React from "react";

import "./styles.css";

//images
import exit_icon from './../../images/exit.png';


class AlertDialogue extends React.Component {

    handleExit = (parent) => {
        parent.setState({
            alert: null
        });
    }

    render() {
        const { parent, title, text, yesNo, handleYes, handleNo, handleOk, 
            yesText, noText, okText, image } = this.props;

        return (
            <div className="alertDialogueContainer">
                <div className="alertDarkBackground">
                </div>
                <div className="alertDialogueWindow">
                    <div className="iconBar">
                        <img className="exitButton" src={exit_icon} onClick={this.handleExit.bind(this, parent)} alt={'Exit Profile'} />
                    </div>
                    { title ?
                        <div className="alertDialogueTitle">{title}</div> : null
                    }
                    <div className="alertDialogueContent">
                        { image ? 
                            <img className="alertDialogueImage" src={image.src} alt={image.alt}/> :
                            null
                        }
                        <div className="alertDialogueText">{text ? text: "Alert dialogue text goes here"}</div>
                    </div>
                    { yesNo ?
                        <div className="alertDialogueButtonContainer">
                            <button className="alertDialogueButton" onClick={handleYes ? handleYes : this.handleExit.bind(this, parent)}>{yesText ? yesText : "Yes"}</button> 
                            <button className="alertDialogueButton" onClick={handleNo ? handleNo : this.handleExit.bind(this, parent)}>{noText ? noText : "No"}</button>
                        </div> :
                        <div className="alertDialogueButtonContainer">
                            <button className="alertDialogueButton" onClick={handleOk ? handleOk : this.handleExit.bind(this, parent)}>{okText ? okText : "Ok"}</button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default AlertDialogue;