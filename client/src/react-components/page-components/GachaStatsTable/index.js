import React from "react";
import { uid } from "react-uid";

import "./styles.css";

class GachaStatsTable extends React.Component {

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
        const { oldStats, newStats, handleOldStatInputChange, handleNewStatInputChange, 
            addStat, deleteOldStat, deleteNewStat } = this.props;

        return (
            <div className="gachaStatsTableContainer">
                <table className="gachaStatsTable">
                    <tbody>
                        <tr className="gachaStatsTable">
                            <th className="gachaStatsTableLeft">Stats</th>
                            <th className="gachaStatsTableRight"></th>
                        </tr>
                        {oldStats.map((stat, index) => {
                            return (<tr className="gachaStatsTable" key={uid(index)}>
                                <td className="gachaStatsTableLeft">
                                    <input className="statsInput"
                                        value={stat.name}
                                        index={index}
                                        onChange={handleOldStatInputChange}
                                        type="text"
                                        placeholder={"Stat " + (index + 1).toString() 
                                            + " Name (required)"} />
                                </td>
                                <td className="gachaStatsTableRight">
                                    <button className="deleteStatButton"
                                        onClick={deleteOldStat}
                                        index={index}>Delete Stat</button>
                                </td>
                            </tr>);
                        })}
                        {newStats.map((stat, index) => {
                            return (<tr className="gachaStatsTable" key={uid(index)}>
                                <td className="gachaStatsTableLeft">
                                    <input className="statsInput"
                                        value={stat.name}
                                        index={index}
                                        onChange={handleNewStatInputChange}
                                        type="text"
                                        placeholder={"Stat " + (oldStats.length + index + 1).toString() 
                                            + " Name (required)"} />
                                </td>
                                <td className="gachaStatsTableRight">
                                    <button className="deleteStatButton"
                                        onClick={deleteNewStat}
                                        index={index}>Delete Stat</button>
                                </td>
                            </tr>);
                        })}
                        {oldStats.length + newStats.length < 10 ?
                            <tr className="gachaStatsTable">
                                <td className="gachaStatsTableLeft">
                                    <button className="addStatButton" onClick={addStat}>
                                        Add Stat
                                    </button>
                                </td>
                                <td className="gachaStatsTableRight"></td>
                            </tr> : null
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default GachaStatsTable;