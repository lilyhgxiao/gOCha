import React from "react";

import "./styles.css";

//images
import exit_icon from './../../../images/exit.png';


class AlertDialogue extends React.Component {

    state = {
        checked: false,
        inputText: ""
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

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
    
        // 'this' is bound to the component in this arrow function.
        this.setState({
          [name]: value  // [name] sets the object property name to the value of the 'name' variable.
        });
    }

    handleChoice = (handleFunction) => {
        const {checkbox, inputOn} = this.props;
        const {checked, inputText} = this.state;

        if (inputOn) {
            if (checkbox) {
                handleFunction(inputText, checked);
            } else {
                handleFunction(inputText);
            }
        } else {
            if (checkbox) {
                handleFunction(checked);
            } else {
                handleFunction();
            }
        }
    }

    render() {
        const { parent, title, text, yesNo, handleYes, handleNo, handleOk, yesText, noText, okText, 
            image, checkbox, checkboxText, inputOn, inputParameters } = this.props;
        const { inputText } = this.state;

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
                        { inputOn ?
                            <input className="alertDialogueInput"
                            name='inputText'
                            value={inputText}
                            onChange={this.handleInputChange}
                            type={inputParameters.type}
                            placeholder={inputParameters.placeholder} /> 
                            : null
                        }
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
                                onClick={this.handleChoice.bind(this, handleYes ? handleYes : this.handleExit.bind(this, parent))}>
                                {yesText ? yesText : "Yes"}
                            </button> 
                            <button 
                                className="alertDialogueButton" 
                                onClick={this.handleChoice.bind(this, handleNo ? handleNo : this.handleExit.bind(this, parent))}>
                                    {noText ? noText : "No"}
                            </button>
                        </div> :
                        <div className="alertDialogueButtonContainer">
                            <button 
                                className="alertDialogueButton" 
                                onClick={this.handleChoice.bind(this, handleOk ? handleOk : this.handleExit.bind(this, parent))}>
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