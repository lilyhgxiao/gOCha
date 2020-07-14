import React from "react";
import { Redirect } from 'react-router';

// Importing components
import AlertDialogue from "./../../page-components/AlertDialogue";

// Importing actions/required methods
//import { updateLoginForm, login } from "../../actions/user";
import { login } from "../../../actions/loginHelpers"
import { checkAndUpdateSession } from "../../../actions/helpers";

/**TODO: replace placeholder images */
import logo from './../../../images/logo_placeholder.png';

//Importing constants
import { loginURL, dashboardURL, signupURL } from "../../../constants";

import "./../../../App.css";
import "./styles.css";

class Login extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(loginURL);

        this._isMounted = false;
        this.state = {
            username: "",
            password: "",
            isAdmin: false,
            loginSuccess: false,
            user: null,
            signup: false,
            error: null,
            alert: null
        };
    }

    filterState({ currUser }) {
        return { currUser };
    }

    async componentDidMount () {
        try {
            this._isMounted = true;
            this._isMounted && await checkAndUpdateSession.bind(this)(function(){});
        } catch (err) {
            this._isMounted && this.setState({
                error: { code: 500, msg: "Something went wrong.", toLogin: true }
            });
        }
    }

    componentWillUnmount () {
        this._isMounted = false;
        this.setState = (state,callback)=>{
            return;
        };
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
    
        // 'this' is bound to the component in this arrow function.
        this._isMounted && this.setState({
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
        if (!result || !result.currUser) {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not log in",
                    text: [result.msg ? result.msg : "Something went wrong."]
                }
            });
            return;
        } 
        if (result.status === 200) {
            this._isMounted && this.setState({
                isAdmin: result.currUser.isAdmin,
                loginSuccess: true
            });
        } else {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not log in",
                    text: [result.msg ? result.msg : "Something went wrong."]
                }
            });
        }
        
    }

    render() {
        const { alert } = this.state;

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
                    pathname: signupURL
                }} />
            );
        }

        return (
            <div className='center'>
                { alert ? 
                        <AlertDialogue parent={this} alert={alert}/> :
                        null
                    }
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
