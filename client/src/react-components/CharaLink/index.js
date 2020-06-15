import React from "react";

import "./styles.css";

//images
import icon_placeholder from './../../images/dashboard_placeholder.jpg';

class CharaLink extends React.Component {
  render() {
    const { chara, handleCharaLinkClick } = this.props;

    return (
        <div className="charaLinkContainer" onClick={handleCharaLinkClick.bind(null, chara)}>
            <img className="charaLinkIcon" src={icon_placeholder}/>
            <div className="charaLinkName">{chara.name}</div>
        </div>
    );
  }
}

export default CharaLink;