import React from "react";

import "./styles.css";

import CharaPhraseInput from "./../CharaPhraseInput";

//Importing constants
import {
    maxWelcPhrLength, maxSummPhrLength
} from "../../../constants";

class RarityPhrasesForm extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
    }

    componentDidMount () {
        this._isMounted = true;
    }

    componentWillUnmount () {
        this._isMounted = false;
    }

    render() {
        const { rarity, welcomePhrase, summonPhrase, onChange } = this.props;

        return (
            <div className="rarityPhrasesContainer">
                <table className="rarityPhrasesTable">
                    <tbody>
                        <tr>
                            <th>Rarity</th>
                            <td><select className="raritySelect"
                                value={rarity}
                                name={"rarity"}
                                onChange={onChange}>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                            </select>
                            </td>
                        </tr>
                        <CharaPhraseInput headerText="Welcome Phrase"
                            name="welcomePhrase" value={welcomePhrase} onChange={onChange} 
                            placeholder="Their phrase when a character appears on the dashboard."
                            maxValueLength={maxWelcPhrLength}/>
                        <CharaPhraseInput headerText="Summon Phrase"
                            name="summonPhrase" value={summonPhrase} onChange={onChange} 
                            placeholder="Their phrase when a character is summoned."
                            maxValueLength={maxSummPhrLength}/>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default RarityPhrasesForm;