import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";

// Importing components
import BaseReactComponent from "./../BaseReactComponent";

//images
/**TODO: replace placeholder images */
import icon_placeholder from './../../images/dashboard_placeholder.jpg';
import edit_icon from './../../images/edit.png';

class GachaLink extends BaseReactComponent {

    state = {
        isHovering: false
    };

    filterState({ currUser }) {
        return { currUser };
    }

    handleMouseHover = () => {
        this.setState(this.toggleHoverState);
    }
    
    toggleHoverState = (state) => {
        return {
            isHovering: !state.isHovering,
        };
    }

    render() {
        const { gacha } = this.props;
        const { isHovering, currUser } = this.state;

        /**TODO: turn currUser into prop instead of state */
        /**TODO: handle if gacha or gacha properties are empty */
        return (
            <div className="gachaLinkContainer" onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseHover}>
                { isHovering && currUser._id == gacha.creator ?
                    <Link to={'/edit/gacha/' + gacha._id}>
                        <input
                            className="gachaLinkEditButton"
                            type='image'
                            src={edit_icon}
                            alt={'Go To Edit Page'}
                        />
                    </Link> :
                    null
                }
                <Link to={'/summon/' + gacha._id}>
                    <img className="gachaLinkIcon" src={gacha.iconPic} alt={gacha.name + " Icon"}/>
                    <div className="gachaLinkName">{gacha.name}</div>
                </Link>
            </div>
            
            
        );
    }
}

export default GachaLink;