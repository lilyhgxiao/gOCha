/*  Full ErrorPage component */
import React from "react";
import { Link } from 'react-router-dom';

import "./styles.css";
import "./../../../App.css"

// Importing components
import Header from "./../../page-components/Header";
import BaseReactComponent from "../../other/BaseReactComponent";

// Importing actions/required methods
import { checkAndUpdateSession } from "../../../actions/helpers";

//images

//Importing constants
import { errorURL } from "../../../constants";

class ErrorPage extends BaseReactComponent {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(errorURL);
        this.state = {
            error: {
                code: 404,
                msg: "Resource not found.",
                toDashboard: true,
                toLogin: false
            }
        };
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount() {
        try {
            const locationState = this.props.location.state;
            let success = false;

            this._isMounted = true;
            this._isMounted && (success = await checkAndUpdateSession.bind(this)(this.fetchInv));

            if (locationState && locationState.error) {
                this._isMounted && this.setState({
                    error: locationState.error
                });
            }
        } catch (err) {
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong and your session has expired." +
                    "Please log in again.", toLogin: true }
            });
        }
    }

    componentWillUnmount () {
        this._isMounted = false;
        this.setState = (state,callback)=>{
            return;
        };
    }

    render() {
        const { history } = this.props;
        const { currUser, error } = this.state;

        return (
            <div className="App">
                {/* Header component. */}
                <Header currUser={currUser}/>

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