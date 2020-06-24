import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";

// Importing components
import BaseReactComponent from "./../BaseReactComponent";

//images
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

        return (
            <div className="gachaLinkContainer" onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseHover}>
                { isHovering && currUser._id == gacha.creator ?
                    <Link to={'/edit/'}>
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
                    <img className="gachaLinkIcon" src={icon_placeholder} alt={gacha.name + " Icon"}/>
                    <div className="gachaLinkName">{gacha.name}</div>
                </Link>
            </div>
            
            
        );
    }
}

export default GachaLink;