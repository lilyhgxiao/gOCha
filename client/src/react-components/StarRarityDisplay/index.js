import React from "react";
import { uid } from "react-uid";

import "./styles.css";

//images
import star from './../../images/star.png';

class StarRarityDisplay extends React.Component {

  render() {
    const { rarity } = this.props;

    let stars = [];
    let i;
    for (i = 0; i < rarity; i++) {
        stars.push(<img className="starRarityImg" src={star} key={ uid(i)}/>)
    }

    return (
        <div className="starRarityContainer">
            {stars}
        </div>
    );
  }
}

export default StarRarityDisplay;