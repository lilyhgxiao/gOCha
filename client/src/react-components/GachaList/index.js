import React from "react";
import { uid } from "react-uid";

import GachaLink from "./../GachaLink";

/* Component for the List of Students */
class GachaList extends React.Component {
    // Access the global state paths required by your component
    // using filterState. filterState puts these state paths on
    // this.state

    render() {
        // the filtered states are now on this.state
        const { gachaList } = this.props;

        return (
            <div className="gachaListContainer">
                <ul className="gachaListUL">
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