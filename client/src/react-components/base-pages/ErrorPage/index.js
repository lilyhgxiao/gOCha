/*  Full ErrorPage component */
import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";
import AlertDialogue from "./../../page-components/AlertDialogue";

// Importing actions/required methods
import { updateSession } from "../../../actions/loginHelpers";


//images
/**TODO: replace placeholder images */
import dashboard_placeholder from './../../../images/dashboard_placeholder.jpg';

/**TODO: implement random character selection for cover pic */

class ErrorPage extends BaseReactComponent {

    state = {
        error: {
            code: 404,
            msg: "Resource not found.",
            toDashboard: true,
            toLogin: false
        }
    };

    constructor(props) {
        super(props);
        this.props.history.push("/error");
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        const locationState = this.props.location.state;
        /**TODO: redirect back to login if session is not there */
        const readSessRes = await updateSession();
        if (readSessRes) {
            if (readSessRes.currUser) {
                this.setState({
                    currUser: readSessRes.currUser
                });
            }
        }
        
        if (locationState && locationState.error) {
            console.log("hi")
            this.setState({
                error: locationState.error
            });
        }
    }

    render() {
        const { history } = this.props;
        const { currUser, error } = this.state;

        return (
            <div className="App">
                {/* Header component. */}
                <Header username={currUser ? currUser.username: ""} 
                    starFrags={currUser ? currUser.starFrags: 0} 
                    silvers={currUser ? currUser.silvers : 0}/>

                <div className="mainBodyContainer">
                    <div className="mainBody">
                        <div className="pageTitle">Sorry!</div>
                        <div className="errorCode">{error.code}</div>
                        <div className="errorMsg">{error.msg}</div>
                        { error.toDashboard ?
                            <Link to={'/dashboard'}>
                                <button>Back to the Dashboard</button>
                            </Link> 
                            : null
                        }
                        { error.toLogin ?
                            <Link to={'/'}>
                                <button>Back to Login</button>
                            </Link> 
                            : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorPage;