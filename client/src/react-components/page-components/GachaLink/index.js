import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";

//images
/**TODO: replace placeholder images */
import edit_icon from './../../../images/edit.png';

//Importing constants
import { editGachaURL, smnInfoURL } from "../../../constants";

class GachaLink extends React.Component {

    state = {
        isHovering: false
    };

    handleMouseHover = () => {
        this.setState(this.toggleHoverState);
    }
    
    toggleHoverState = (state) => {
        return {
            isHovering: !state.isHovering,
        };
    }

    render() {
        const { gacha, currUser } = this.props;
        const { isHovering } = this.state;

        return (
            <div className="gachaLinkContainer" onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseHover}>
                { isHovering && currUser._id.toString() === gacha.creator.toString() ?
                    <Link to={editGachaURL + gacha._id}>
                        <input
                            className="gachaLinkEditButton"
                            type='image'
                            src={edit_icon}
                            alt={'Go To Edit Page'}
                        />
                    </Link> :
                    null
                }
                <Link to={smnInfoURL + gacha._id}>
                    <img className="gachaLinkIcon" src={gacha.iconPic} alt={gacha.name + " Icon"}/>
                    <div className="gachaLinkName">{gacha.name}</div>
                </Link>
            </div>
            
            
        );
    }
}

export default GachaLink;