import React from "react";
import { uid } from "react-uid";

import "./styles.css";

//images
/**TODO: replace image placeholders */
import star from './../../../images/star.png';

class StarRarityDisplay extends React.Component {

  /**TODO: handle if rarity is empty */
  render() {
    const { rarity } = this.props;

    let stars = [];
    let i;
    for (i = 0; i < rarity; i++) {
        stars.push(<img className="starRarityImg" src={star} key={ uid(i)} alt={'Rarity Star'}/>)
    }

    return (
        <div className="starRarityContainer">
            {stars}
        </div>
    );
  }
}

export default StarRarityDisplay;