import React from "react";
import { uid } from "react-uid";
import { Link } from 'react-router-dom';

import "./styles.css";

//Importing components
import GachaLink from "./../GachaLink";

//images
/**TODO: get new image */
import new_gacha_placeholder from './../../../images/new_gacha_placeholder.png';
import icon_placeholder from './../../../images/dashboard_placeholder.jpg';

//Importing constants
import { createGachaURL } from "../../../constants";

class GachaList extends React.Component {

    showErrorDialogue = () => {
        const { page } = this.props;

        page.setState({
            alert: {
                text: ["There was an error loading this gacha. Please try reloading the page."]
            }
        });
    }

    render() {
        // the filtered states are now on this.state
        const { currUser, gachaList, newLink } = this.props;

        return (
            <div className="gachaListContainer">
                <ul className="gachaListUL">
                    {newLink ?
                        <div className="newGachaLink">
                            <Link to={createGachaURL}>
                                <img className="newGachaLinkIcon" src={new_gacha_placeholder} alt={"New Gacha Placeholder"} />
                                <div className="newGachaLinkName">Create New</div>
                            </Link>
                        </div> :
                        null
                    }
                    {gachaList.map((gacha) => {
                        return (gacha === null ?
                            <div className="errorRetrvGacha" onClick={this.showErrorDialogue}>
                                <img className="gachaLinkIcon" src={icon_placeholder} alt={"Error"} />
                                <div className="gachaLinkName">Error</div>
                            </div> :
                            <GachaLink key={uid(gacha)}
                                gacha={gacha}
                                currUser={currUser} />
                        )
                    })}
                </ul>
            </div>
        );
    }
}

export default GachaList;