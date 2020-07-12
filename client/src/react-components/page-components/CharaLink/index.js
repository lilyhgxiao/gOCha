import React from "react";

import "./styles.css";

//images
/**TODO: handle when chara  or chara properties is empty */

class CharaLink extends React.Component {

  /**TODO: move handle charalink click here..? */
  render() {
    const { chara, handleCharaLinkClick } = this.props;

    /**TODO: replace chara icon with actual icon */
    return (
        <div className="charaLinkContainer" onClick={handleCharaLinkClick.bind(null, chara)}>
            <img className="charaLinkIcon" src={chara.iconPic} alt={chara.name + " Icon"}/>
            <div className="charaLinkName">{chara.name}</div>
        </div>
    );
  }
}

export default CharaLink;