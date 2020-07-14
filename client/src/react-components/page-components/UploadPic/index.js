import React from "react";

import "./styles.css";

// Importing components

//images
/**TODO: replace image placeholders */
import dotted_line_box from './../../../images/dotted_line_box_placeholder.png';

class UploadPic extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            isHovering: false,
            preview: dotted_line_box
        };
    }

    componentDidMount () {
        this._isMounted = true;
    }

    componentWillUnmount () {
        this._isMounted = false;
        this.setState = (state, callback) => {
            return;
        };
    }

    handleMouseHover = () => {
        this._isMounted && this.setState(this.toggleHoverState);
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

        if (target.files && target.files.length) {
            if (!target.files[0].name.match(/.(jpg|jpeg|png)$/i)) {
                parent.setState({
                    alert: {
                        title: "Oops!",
                        text: ["What you just uploaded wasn't an image!"]
                    }
                });
            } else {
                const url = URL.createObjectURL(event.target.files[0])

                parent._isMounted && parent.setState({
                    [name]: url,
                    [nameRaw]: target.files[0]
                });
            }
        }
    }

    render() {
        const { cover, src } = this.props;
        const { isHovering, preview } = this.state;

        return (
                <div className={cover ? "uploadCoverContainer" : "uploadIconContainer"} onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseHover}>
                    { isHovering ?
                        <div className="resolutionDisplay">
                            { cover ? <span>700 x 700</span> : <span>100 x 100</span>}
                        </div> :
                        null
                    }
                    <label htmlFor={cover ? "uploadCoverImage" : "uploadIconImage" }>
                        <img 
                            className={cover ? "uploadCoverPic" : "uploadIconPic"} 
                            src={ (!src || src === "") ? preview : src } 
                            alt={cover ? "New Cover Pic" : "New Icon Pic"} />
                    </label>
                    <input
                        className="hiddenInput"
                        type="file"
                        name={cover ? "coverPic" : "iconPic"}
                        id={cover ? "uploadCoverImage" : "uploadIconImage" }
                        accept=".png,.jpg, .jpeg"
                        onChange={this.handleImageUpload}
                    />
                </div>
            
            
        );
    }
}

export default UploadPic;