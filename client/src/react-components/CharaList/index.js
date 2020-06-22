import React from "react";
import { uid } from "react-uid";

import CharaLink from "./../CharaLink";

/* Component for the List of Students */
class CharaList extends React.Component {
    // Access the global state paths required by your component
    // using filterState. filterState puts these state paths on
    // this.state

    render() {
        // the filtered states are now on this.state
        const { charaList, handleCharaLinkClick } = this.props;

        return (
            <div className="charaListContainer">
                <ul className="charaListUL">
                    { charaList.map((chara) => {
                        return (
                            <CharaLink className="invCharaLink" key = { uid(chara) }
                            chara={chara}
                            handleCharaLinkClick={handleCharaLinkClick}/>
                        )
                    }) }
                </ul>
            </div>
        );
    }
}

export default CharaList;