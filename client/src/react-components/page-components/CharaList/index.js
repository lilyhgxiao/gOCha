import React from "react";
import { uid } from "react-uid";

import CharaLink from "./../CharaLink";

import "./styles.css";

/**TODO: get new placeholder for icon */
import icon_placeholder from './../../../images/dashboard_placeholder.jpg';

class CharaList extends React.Component {

    showErrorDialogue = () => {
        const { page } = this.props;

        page.setState({
            alert: {
                text: ["There was an error loading this character. Please try reloading the page."]
            }
        });
    }

    render() {
        // the filtered states are now on this.state
        const { charaList, handleCharaLinkClick } = this.props;

        return (
            <div className="charaListContainer">
                <ul className="charaListUL">
                    { charaList.map((chara) => {
                        return ( chara === null ?
                            <div className="errorRetrvChara" onClick={this}>
                                <img className="charaLinkIcon" src={icon_placeholder} alt={"Error"} />
                                <div className="charaLinkName">Error</div>
                            </div> :
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