import React from 'react';
import { Redirect } from 'react-router';
import AlertDialogue from "./../../page-components/AlertDialogue";

//helper functions
import { checkAndUpdateSession } from "../../../actions/helpers"
import { signup, getUserByUsername, getUserByEmail } from "../../../actions/userhelpers"
import { login } from "../../../actions/loginHelpers"

//constants
import { minUserLength, maxUserLength, minEmailLength, 
    minPassLength, maxPassLength, dashboardURL, loginURL, signupURL } from '../../../constants';

//images
/**TODO: replace image placeholder */
import logo from './../../../images/logo_placeholder.png';

class Signup extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.props.history.push(signupURL);

        this._isMounted = false;
        this.state = {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            loginSuccess: false,
            backToLogin: false,
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

    authPass = () => {
        if (this.state.password === this.state.confirmPassword) {
            return true;
        } else {
            return false;
        }
    }

    validateInput = () => {
        const msg = [];
        let success = true;
        if (this.state.username.length < minUserLength || this.state.username.length > maxUserLength) {
            msg.push("Usernames must be between " + minUserLength + " and " + maxUserLength + 
                " characters long.");
            msg.push(<br/>);
            success = false;
        }
        if (this.state.email.length < minEmailLength) {
            msg.push("The email entered is invalid.");
            msg.push(<br/>);
            success = false;
        }
        if (this.state.password.length < minPassLength || this.state.password.length > maxPassLength) {
            msg.push("Passwords must be between " + minUserLength + " and " + maxUserLength + 
                " characters long.");
            msg.push(<br/>);
            success = false;
        }
        return { msg: null, success: success }
    }

    /**TODO: use alert dialogue */
    authSignup = async () => {
        //authenticate
        const validateInput = this.validateInput();
        console.log(validateInput)
        if (!validateInput.success) {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not sign up",
                    text: validateInput.msg
                }
            });
            return;
        }

        if (!this.authPass()) {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not sign up",
                    text: ["Passwords do not match. Please try again."]
                }
            });
        } else {
            try {
                const userByUsername =  await getUserByUsername(this.state.username);
                console.log(userByUsername);
                if (userByUsername && userByUsername.user !== null) {
                    this._isMounted && this.setState({
                        alert: {
                            title: "Could not sign up",
                            text: ["Username already taken."]
                        }
                    });
                    return;
                }
                const userByEmail =  await getUserByEmail(this.state.email);
                if (userByEmail && userByEmail.user !== null) {
                    this._isMounted && this.setState({
                        alert: {
                            title: "Could not sign up",
                            text: ["This email is already in use. Please try another email."]
                        }
                    });
                    return;
                }
                this.trySignup();
            } catch (err) {
                console.log('signup failed, ', err);
            }
        }
    }

    trySignup = async () => {
        const signupRes = await signup({
            username: this.state.username,
            password: this.state.password,
            email: this.state.email,
            isAdmin: false
        });

        if (!signupRes.user) {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not sign up",
                    text: [signupRes.msg]
                }
            });
            return;
        }

        const loginRes = await login({username: signupRes.user.username, password: this.state.password});
        if (!loginRes || !loginRes.currUser) {
            this._isMounted && this.setState({
                alert: {
                    title: "Could not login",
                    text: ["Signup successful but failed to login: " + loginRes.msg],
                    handleOk: this.backToLogin
                }
            });
            return;
        }
        this._isMounted && this.setState({
            loginSuccess: true
        });
    }

    backToLogin = () => {
        this.setState({
            backToLogin: true
        })
    }

    render() {
        const { alert } = this.state;

        if (this.state.loginSuccess || (this.state.currUser && !this.state.currUser.isAdmin)) {
            return (
                <Redirect push to={{
                    pathname: dashboardURL
                }} />
            );
        }

        if (this.state.backToLogin) {
            return (
                <Redirect push to={{
                    pathname: loginURL
                }} />
            );
        }

        /**TODO: add alert dialogue */
        return(
            <div className='center'>
                { alert ? 
                        <AlertDialogue parent={this} alert={alert}/> :
                        null
                    }
                <img id='logo' src={logo} alt='logo'/>

                <div className='loginForm'>
                    <span className='title'>Create a new gOCha account!</span>
                    <br/>
                    <br/>
                    <span className='signUpFieldTitle'>Username:</span>
                    <input name='username' 
                        value={ this.state.username } 
                        onChange={this.handleInputChange} 
                        type="text" 
                        placeholder="Username" />
                    <br/>
                    <span className='signUpFieldTitle'>Email:</span>
                    <input name='email' 
                        value={ this.state.email } 
                        onChange={this.handleInputChange} 
                        type="text" 
                        placeholder="Email" />
                    <br/>
                    <span className='signUpFieldTitle'>Password:</span>
                    <input name='password' 
                        value={ this.state.password } 
                        onChange={this.handleInputChange} 
                        type="password" 
                        placeholder="Password" />
                    <br/>
                    <span className='signUpFieldTitle'>Confirm Password:</span>
                    <input name='confirmPassword' 
                        value={ this.state.confirmPassword } 
                        onChange={this.handleInputChange} 
                        type="password" 
                        placeholder="Confirm Password" />
                    <div className='buttons'>
                        <button onClick={ this.backToLogin }>Back to Login</button>
                        <button onClick={ this.authSignup }>Sign Up</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Signup;