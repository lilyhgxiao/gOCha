import React from "react";
import { uid } from "react-uid";

import BaseReactComponent from "./../BaseReactComponent";
import CharaLink from "./../CharaLink";

/* Component for the List of Students */
class CharaList extends React.Component {
    // Access the global state paths required by your component
    // using filterState. filterState puts these state paths on
    // this.state

    render() {
        // the filtered states are now on this.state
        const { charaList } = this.props;

        return (
            <div className="charaListContainer">
                <ul>
                    { charaList.map((chara) => {
                        return (
                            <CharaLink className="invCharaLink" key = { uid(chara) }
                            chara={chara}/>
                        )
                    }) }
                </ul>
            </div>
        );
    }
}

export default CharaList;