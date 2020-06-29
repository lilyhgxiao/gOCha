/*  Inventory component */
import React from "react";

import "./styles.css";
import "./../../App.css"

// Importing components
import Header from "./../Header";
import BaseReactComponent from "./../BaseReactComponent";
import GachaList from "./../GachaList";

// Importing actions/required methods
import { getGachaById } from "../../actions/gachaHelpers";
import { updateSession } from "../../actions/loginHelpers";

class FavGachas extends BaseReactComponent {

    state = {
        isLoaded: false,
        currUser: null,
        gachaList: null
    };

    constructor(props) {
        super(props);
        this.props.history.push("/favourites");
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        /**TODO: redirect back to login if session is not there */
        const readSessRes = await updateSession();
        if (readSessRes) {
            if (readSessRes.currUser) {
                this.setState({
                    currUser: readSessRes.currUser
                }, this.fetchFavGachas);
            }
        }
    }

    fetchFavGachas = async () => {
        const gachaReqs = [];
        const currUser = this.state.currUser;
        console.log(this.state);
        let i;
        for (i = 0; i < currUser.favGachas.length; i++) {
            gachaReqs.push(getGachaById(currUser.favGachas[i]._id));
        }

        /**TODO: Handle failed reqs...? */
        Promise.all(gachaReqs).then(res => {
            console.log(res);
            this.setState({
                gachaList: res,
                isLoaded: true
            });
        }).catch((err) => {
            console.log("Error with Promise.all in fetchFavGachas: " + err);
        })
    }

    render() {

        const { isLoaded, gachaList, currUser } = this.state;

        return (
            <div className="App">
                <Header username={currUser ? currUser.username : ""}
                    starFrags={currUser ? currUser.starFrags : 0}
                    silvers={currUser ? currUser.silvers : 0} />

                <div className="mainBodyContainer">
                    <div className="mainBody">
                        <div className="pageTitle">Favourites</div>
                        <div>
                            {   isLoaded ?
                                <GachaList 
                                gachaList={gachaList}/> : 
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FavGachas;