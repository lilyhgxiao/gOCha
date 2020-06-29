import React from "react";
import { uid } from "react-uid";

import "./styles.css";

class GachaSmnListTable extends React.Component {

    render() {
        const { isLoaded, charaList, chance } = this.props;

        /**TODO: handle when props empty, ESPECIALLY charaList */
        return (
            <table className="gachaSmnListTable">
                <tbody>
                    <tr className="gachaSmnListTable">
                        <th className="gachaSmnListTableLeft">Name</th>
                        <th className="gachaSmnListTableRight">Summon Chance</th>
                    </tr>
                    {charaList.length > 0 && isLoaded ?
                        charaList.map((chara) => {
                            return (
                                <tr className="gachaSmnListTable" key={uid(chara)}>
                                    <td className="gachaSmnListTableLeft">{chara.name}</td>
                                    <td className="gachaSmnListTableRight">{((chance / charaList.length) * 100).toFixed(2) + "%"}</td>
                                </tr>
                            )
                        }) :
                        <tr className="gachaSmnListTable">
                            <td className="gachaSmnListTableLeft"></td>
                            <td className="gachaSmnListTableRight"></td>
                        </tr>
                    }
                </tbody>
            </table>
            
        );
    }
}

export default GachaSmnListTable;