import React from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

import "./styles.css";

//images
import icon_placeholder from './../../images/dashboard_placeholder.jpg';

class CharaLink extends React.Component {
  render() {
    const { chara } = this.props;

    return (
        <div className="charaLinkContainer">
            <img className="charaLinkIcon" src={icon_placeholder}/>
            <div className="charaLinkName">{chara.name}</div>
        </div>
    );
  }
}

export default CharaLink;