/*  Full Dashboard component */
import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";
import CharaList from "./../CharaList";

// Importing actions/required methods
import { getCharaById } from "../../actions/charaHelpers";
import { readSession } from "../../actions/loginHelpers";

class Inventory extends BaseReactComponent {

    state = {
        isLoaded: false,
        currUser: null,
        charaList: null
    };

    constructor(props) {
        super(props);
        this.props.history.push("/inventory");
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        const readSessRes = await readSession();
        if (readSessRes.currUser) {
            this.setState({
                currUser: readSessRes.currUser
            }, this.fetchInv);
        }
    }

    fetchInv = async () => {
        const charaReqs = [];
        const currUser = this.state.currUser;
        console.log(this.state);
        let i;
        for (i = 0; i < currUser.inventory.length; i++) {
            charaReqs.push(getCharaById(currUser.inventory[i]));
        }

        Promise.all(charaReqs).then(res => {
            console.log(res);
            this.setState({
                charaList: res,
                isLoaded: true
            });
        });
    }

    render() {
        const { history } = this.props;

        const { isLoaded } = this.state;

        if (isLoaded) {

        }

        return (
            <div className="App">
                <Header/>

                <div className="mainBodyContainer">
                    <div className="mainBody">
                        <div className="pageTitle">Inventory</div>
                        <div>
                            {   isLoaded ?
                                <CharaList charaList={this.state.charaList}/> : 
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Inventory;