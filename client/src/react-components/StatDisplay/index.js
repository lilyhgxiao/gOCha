import React from "react";
import { uid } from "react-uid";

import "./styles.css";

//images
import stat_filled from './../../images/stat_filled.png';
import stat_unfilled from './../../images/stat_unfilled.png';

class StarRarityDisplay extends React.Component {

  render() {
    const { value } = this.props;

    let statIcons = [];
    let i;
    for (i = 0; i < value; i++) {
        statIcons.push(<img className="statFilled" src={stat_filled} key={ uid(i)}/>)
    }
    for (i = 0; i < 5 - value; i++) {
        statIcons.push(<img className="statUnfilled" src={stat_unfilled} key={ uid(value+i)}/>)
    }

    return (
        <div className="statDisplayContainer">
            {statIcons}
        </div>
    );
  }
}

export default StarRarityDisplay;