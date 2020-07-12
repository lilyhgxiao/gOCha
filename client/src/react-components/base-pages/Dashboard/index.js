/*  Full Dashboard component */
import React from "react";
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import AlertDialogue from "./../../page-components/AlertDialogue";

// Importing actions/required methods
import { checkAndUpdateSession } from "../../../actions/helpers";
import { getCharaById } from "../../../actions/charaHelpers";

//images
/**TODO: replace placeholder images */
import dashboard_placeholder from './../../../images/dashboard_placeholder.jpg';

//Importing constants
import { dashboardURL, errorURL, collectionURL } from "../../../constants";

/**TODO: implement random character selection for cover pic */

class Dashboard extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(dashboardURL);

        this.state = {
            alert: null,
            error: null,
            mainPic: dashboard_placeholder,
            welcomePhrase: null,
            chara: null
        };    
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount () {
        this._isMounted = true;
        this._isMounted && await checkAndUpdateSession.bind(this)(this.fetchRandChara);
    }

    componentWillUnmount () {
        this._isMounted = false;
    }

    fetchRandChara = async () => {
        const { currUser } = this.state;
        const numCharas = currUser.inventory.length;
        if (numCharas > 0) {
            const index = Math.floor(Math.random() * numCharas);
            const randChara = currUser.inventory[index];
            const getChara = await getCharaById(randChara._id);
            if (!getChara || !getChara.chara || !getChara.chara.coverPic || !getChara.chara.coverPic === ""){
                if (this._isMounted) {
                    this.setState({
                        mainPic: dashboard_placeholder
                    });
                }
            } else {
                this.setState({
                    mainPic: getChara.chara.coverPic,
                    welcomePhrase: getChara.chara.welcomePhrase,
                    chara: getChara.chara
                });
            }
        }
    }

    /**TODO: delete this */
    createAlertDialogue = () => {
        this.setState({
            alert: {
                title: "Yep",
                yesNo: true,
                image: {src: dashboard_placeholder, alt:"Dashboard Placeholder"},
                inputOn: true,
                inputParameters: { type: "password", placeholder: "Placeholder!" },
                checkbox: true
            }
        })
    }

    render() {
        const { history } = this.props;
        const { currUser, alert, error, welcomePhrase, mainPic, chara } = this.state;

        if (error) {
            return (
                <Redirect push to={{
                    pathname: errorURL,
                    state: { error: error }
                }} />
            );
        }

        /**TODO: add link to inventory and character if you click on the main pic */

        return (
            <div className="App">
                {/* Header component. */}
                <Header currUser={currUser}/>

                <div className="mainBodyContainer">
                    { alert ? 
                        <AlertDialogue parent={this} alert={alert}/> :
                        null
                    }
                    <div className="mainBody">
                        { welcomePhrase ?
                            <div className="dashboardWelcPhrase">{ welcomePhrase }</div> : null
                        }
                        <img className="dashboardMainPic" src={mainPic} alt='Dashboard Main'/>
                        <div className="dashboardTopMenu">
                            <div className="currencyDisplay">Star Fragments: {currUser ? currUser.starFrags: 0}</div>
                            <div className="currencyDisplay">Silvers: {currUser ? currUser.silvers : 0}</div>
                            <div className="mailContainer" onClick={this.createAlertDialogue}> 
                                <div className="mailNotif">3</div>
                                <div className="mailIcon"> 
                                    Mail
                                </div>
                            </div>
                        </div>
                        <div className="dashboardBottomMenu">
                            <Link className="dashboardInventory" to={collectionURL}>Collection</Link>
                            <Link className="dashboardOwnGachas" to={gachasURL}>Your Gachas</Link>
                            <Link className="dashboardFavGachas" to={'./favourites'}>Favourites</Link>
                        </div>
                        <div className="newsBanner">
                        <Link className="dashboardNews" to={'./news'}>News</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
