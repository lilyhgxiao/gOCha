import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";

// Importing components


//Importing helper functions
import { uploadFile } from "../../actions/fileHelpers";

//images
import icon_placeholder from './../../images/dashboard_placeholder.jpg';
import edit_icon from './../../images/edit.png';
import dotted_line_box from './../../images/dotted_line_box_placeholder.png';

class UploadPic extends React.Component {

    state = {
        isHovering: false,
        preview: dotted_line_box
    };

    handleMouseHover = () => {
        this.setState(this.toggleHoverState);
    }
    
    toggleHoverState = (state) => {
        return {
            isHovering: !state.isHovering,
        };
    }

    handleImageUpload = async (event) => {
        const target = event.target;
        const name = target.name;
        const nameRaw = name + "Raw";
        const { parent } = this.props;

        console.log(name)
        if (target.files) {
            if (target.files.length) {
                if (!target.files[0].name.match(/.(jpg|jpeg|png)$/i)) {
                    parent.setState({
                        alert: {
                            title: "Oops!",
                            text: ["What you just uploaded wasn't an image!"]
                        }
                    });
                } else {
                    const url = URL.createObjectURL(event.target.files[0])
                    console.log(url)
                    console.log(target.files[0])
                    parent.setState({
                        [name]: url,
                        [nameRaw]: target.files[0]
                    });
                }
            }
        }
    }

    testImageUpload = async (file) => {
        
    }

    render() {
        const { main, src } = this.props;
        const { isHovering, preview } = this.state;

        return (
                <div className={main ? "uploadMainContainer" : "uploadIconContainer"} onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseHover}>
                    { isHovering ?
                        <div className="resolutionDisplay">
                            { main ? <span>700 x 700</span> : <span>100 x 100</span>}
                        </div> :
                        null
                    }
                    <label htmlFor={main ? "uploadMainImage" : "uploadIconImage" }>
                        <img 
                            className={main ? "uploadMainPic" : "uploadIconPic"} 
                            src={ (!src && src === "") ? preview : src } 
                            alt={main ? "New Main Pic" : "New Icon Pic"} />
                    </label>
                    <input
                        className="hiddenInput"
                        type="file"
                        name={main ? "mainPic" : "iconPic"}
                        id={main ? "uploadMainImage" : "uploadIconImage" }
                        accept=".png,.jpg, .jpeg"
                        onChange={this.handleImageUpload}
                    />
                </div>
            
            
        );
    }
}

export default UploadPic;