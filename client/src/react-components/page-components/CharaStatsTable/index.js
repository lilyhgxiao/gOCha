import React from "react";
import { uid } from "react-uid";

import "./styles.css";

import StatDisplay from "../../page-components/StatDisplay";

//Importing constants

class RarityPhrasesForm extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const { page, stats } = this.props;

        return (
            <div className="charaStatsTableContainer">
                {stats.length > 0 ?
                    <div>
                        <div>Stats</div>
                        <table className="charaStatsTable">
                            <tbody>
                                {stats.map((stat, index) => {
                                    return (
                                        <tr key={uid(stat)}>
                                            <th>{stat.name}</th>
                                            <td>
                                                <StatDisplay value={stat.value}
                                                    edit={true}
                                                    index={index}
                                                    page={page} />
                                            </td>
                                        </tr>
                                    )
                                })
                                }
                            </tbody>
                        </table>
                    </div> : null
                }
            </div>
        );
    }
}

export default RarityPhrasesForm;