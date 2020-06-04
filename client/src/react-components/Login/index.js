import React from "react";
import { Redirect } from 'react-router';

// Importing actions/required methods
//import { updateLoginForm, login } from "../../actions/user";
import { login, logout, updateLoginForm } from "../../actions/loginHelpers"
import { getState } from "statezero";

import logo from './../../images/logo_placeholder.png';

import "./../../App.css";
import "./styles.css";

class Login extends React.Component {

    state = {
        username: "",
        password: "",
        isAdmin: false,
        loginSuccessful: false,
        user: null,
        signup: false
    };

    componentDidMount() {
        const currUser = getState("currUser");
        if (currUser !== null) {
            logout();
        }
        this.setState({
            username: "",
            password: "",
            isAdmin: false,
            loginSuccessful: false,
            user: null,
            signup: false
        });
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        updateLoginForm(target);
    
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

    tryLogin = async () => {
        const result = await login();
        const { isAdmin, loginSuccessful } = result;
        if (loginSuccessful === false) {
            alert('Invalid username/password combination. Please try again.');
        } else if (loginSuccessful === null) {
            alert('Could not login in. Please check your connection.');
        }
        this.setState({
            isAdmin: isAdmin,
            loginSuccessful: loginSuccessful
        })
    }

    render() {
        const currUser = getState("currUser");

        /*Redirect */
        if (this.state.loginSuccessful) {
            if (this.state.isAdmin) {
                return(
                    <Redirect push to={{
                        pathname: "/admin/dashboard",
                        state: { username: this.state.username }
                    }} />
                );
            } else {
                return(
                    <Redirect push to={{
                        pathname: "/dashboard",
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
