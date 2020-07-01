import React from "react";

import "./styles.css";

//images
import exit_icon from './../../images/exit.png';


class AlertDialogue extends React.Component {

    state = {
        checked: false
    };

    handleExit = (parent) => {
        parent.setState({
            alert: null
        });
    }

    handleCheck = () => {
        this.setState({
            checked: !this.state.checked
        });
    }

    handleChoiceWithCheck = (handleFunction) => {
        const {checkbox} = this.props;
        const {checked} = this.state;

        if (checkbox) {
            handleFunction(checked);
        } else {
            handleFunction();
        }
    }

    render() {
        const { parent, title, text, yesNo, handleYes, handleNo, handleOk, 
            yesText, noText, okText, image, checkbox, checkboxText } = this.props;

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
                        <div className="alertDialogueText">{text ? 
                            text.map((textOrHTML, index) => <span key={index}>{textOrHTML}</span>)
                            : "Alert dialogue text goes here" }
                        </div>
                        {checkbox ?
                        <div className="alertCheckbox">
                            <input type="checkbox" onClick={this.handleCheck}/>{checkboxText ? checkboxText.map((textOrHTML, index) => <span key={index}>{textOrHTML}</span>) : "Checkbox text goes here"}
                        </div> : null
                        }
                    </div>
                    { yesNo ?
                        <div className="alertDialogueButtonContainer">
                            <button
                                className="alertDialogueButton"
                                onClick={this.handleChoiceWithCheck.bind(this, handleYes ? handleYes : this.handleExit.bind(this, parent))}>
                                {yesText ? yesText : "Yes"}
                            </button> 
                            <button 
                                className="alertDialogueButton" 
                                onClick={this.handleChoiceWithCheck.bind(this, handleNo ? handleNo : this.handleExit.bind(this, parent))}>
                                    {noText ? noText : "No"}
                            </button>
                        </div> :
                        <div className="alertDialogueButtonContainer">
                            <button 
                                className="alertDialogueButton" 
                                onClick={this.handleChoiceWithCheck.bind(this, handleOk ? handleOk : this.handleExit.bind(this, parent))}>
                                    {okText ? okText : "Ok"}
                            </button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default AlertDialogue;