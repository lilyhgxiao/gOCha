import React from "react";
import { uid } from "react-uid";
import { Link } from 'react-router-dom';

import "./styles.css";

//Importing components
import GachaLink from "./../GachaLink";

//images
/**TODO: get new image */
import new_gacha_placeholder from './../../../images/new_gacha_placeholder.png';

/* Component for the List of Students */
class GachaList extends React.Component {
    // Access the global state paths required by your component
    // using filterState. filterState puts these state paths on
    // this.state

    render() {
        // the filtered states are now on this.state
        const { gachaList, newLink } = this.props;

        return (
            <div className="gachaListContainer">
                <ul className="gachaListUL">
                    { newLink ?
                        <div className="newGachaLink">
                            <Link  to={'/create/gacha'}>
                                <img className="newGachaLinkIcon" src={new_gacha_placeholder} alt={"New Gacha Placeholder"}/>
                                <div className="newGachaLinkName">Create New</div>
                            </Link>
                        </div> :
                        null
                    }
                    { gachaList.map((gacha) => {
                        return (
                            <GachaLink className="yrGachaLink" key = { uid(gacha) }
                            gacha={gacha}/>
                        )
                    }) }
                </ul>
            </div>
        );
    }
}

export default GachaList;