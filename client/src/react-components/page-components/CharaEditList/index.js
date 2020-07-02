import React from "react";
import { uid } from "react-uid";

import CharaEditLink from "../CharaEditLink";

/* Component for the List of Students */
class CharaEditList extends React.Component {
    // Access the global state paths required by your component
    // using filterState. filterState puts these state paths on
    // this.state

    render() {
        // the filtered states are now on this.state
        const { page, charaList, canDelete } = this.props;

        return (
            <div className="charaEditListContainer">
                {charaList.map((chara) => {
                    return (
                        <CharaEditLink key={uid(chara)}
                            page={page}
                            chara={chara}
                            canDelete={canDelete} />
                    )
                })}
            </div>
        );
    }
}

export default CharaEditList;