import React from "react";
import { Redirect } from 'react-router';

// Importing actions/required methods
//import { updateLoginForm, login } from "../../actions/user";
import { login, logout, updateLoginForm } from "../../../actions/loginHelpers"
import { checkAndUpdateSession } from "../../../actions/helpers";
import { getState } from "statezero";

/**TODO: replace placeholder images */
import logo from './../../../images/logo_placeholder.png';

//Importing constants
import { loginURL, dashboardURL } from "../../../constants";

import "./../../../App.css";
import "./styles.css";

class Login extends React.Component {

    state = {
        username: "",
        password: "",
        isAdmin: false,
        loginSuccess: false,
        user: null,
        signup: false,
        error: null
    };

    constructor(props) {
        super(props);
        this.props.history.push(loginURL);

        this._isMounted = false;
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount () {
        this._isMounted = true;
        this._isMounted && await checkAndUpdateSession.bind(this)(function() {});
    }

    componentWillUnmount () {
        this._isMounted = false;
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
    
        // 'this' is bound to the component in this arrow function.
        this.setState({
          [name]: value  // [name] sets the object property name to the value of the 'name' variable.
        });
    }

    goToSignup = () => {
        this.setState({
            signup: true
        }); 
    }

    /**TODO: use alert dialogue here */
    /**TODO: validate input...? */
    tryLogin = async () => {
        const { username, password } = this.state;
        const result = await login({username, password});
        console.log(result);
        if (!result || !result.currUser) {
            alert(result.msg ? result.msg : "Something went wrong.");
            return;
        } 
        this.setState({
            isAdmin: result.currUser.isAdmin,
            loginSuccess: true
        });
    }

    render() {

        /*Redirect */
        if (this.state.loginSuccess || this.state.currUser) {
            if (this.state.isAdmin || (this.state.currUser && this.state.currUser.isAdmin)) {
                return(
                    <Redirect push to={{
                        pathname: "/admin/dashboard",
                        state: { username: this.state.username }
                    }} />
                );
            } else {
                return(
                    <Redirect push to={{
                        pathname: dashboardURL,
                        state: { user: this.state.user }
                    }} />
                );
            }
        }

        if (this.state.signup) {
            return(
                <Redirect push to={{
                    pathname: "/SignUp"
                }} />
            );
        }

        /*Render */
        /**TODO: add alertdialogue */
        return (
            <div className='center'>
                <img id='logo' src={logo} alt='logo'/>

                <div className='loginForm'>
                    <span className='title'>Login:</span>
                    <br/>
                    <br/>
                    <input name='username' 
                        value={ this.state.username } 
                        onChange={ this.handleInputChange } 
                        type="text" 
                        placeholder="Username" />
                    <br/>
                    <input name='password' 
                        value={ this.state.password } 
                        onChange={ this.handleInputChange } 
                        type="password" 
                        placeholder="Password" />
                    <div className='buttons'>
                        <button onClick={ this.goToSignup } >Sign Up</button>
                        <button onClick={ this.tryLogin }>Log In</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
