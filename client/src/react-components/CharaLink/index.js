import React from "react";

import "./styles.css";

//images
/**TODO: get new placeholder for icon */
import icon_placeholder from './../../images/dashboard_placeholder.jpg';
/**TODO: handle when chara  or chara properties is empty */

class CharaLink extends React.Component {
  render() {
    const { chara, handleCharaLinkClick } = this.props;

    /**TODO: replace chara icon with actual icon */
    return (
        <div className="charaLinkContainer" onClick={handleCharaLinkClick.bind(null, chara)}>
            <img className="charaLinkIcon" src={icon_placeholder} alt={chara.name + " Icon"}/>
            <div className="charaLinkName">{chara.name}</div>
        </div>
    );
  }
}

export default CharaLink;