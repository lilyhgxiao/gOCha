import React from 'react';
import { Redirect } from 'react-router';

//helper functions
import { signup, getUserByUsername, getUserByEmail } from "../../../actions/userhelpers"
import { login, logout, updateLoginForm } from "../../../actions/loginHelpers"

//constants
import { minUserLength, maxUserLength, minEmailLength, 
    minPassLength, maxPassLength } from '../../../constants';

//images
/**TODO: replace image placeholder */
import logo from './../../../images/logo_placeholder.png';



class Signup extends React.Component {
    state = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        loginSuccess: false,
        backToLogin: false
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
    
        // 'this' is bound to the component in this arrow function.
        this.setState({
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
        if (this.state.username.length < minUserLength || this.state.username.length > maxUserLength) {
            return { msg: "Failed to sign up: Usernames must be between " + minUserLength + " and " + maxUserLength + " characters long.", 
                success: false };
        }
        if (this.state.email.length < minEmailLength) {
            return { msg: "Failed to sign up: Invalid email.", 
                success: false };
        }
        if (this.state.password.length < minPassLength || this.state.password.length > maxPassLength) {
            return { msg: "Failed to sign up: Passwords must be between " + minUserLength + " and " + maxUserLength + " characters long.", 
                success: false };
        }
        return { msg: "Input validated.", success: true }
    }

    /**TODO: use alert dialogue */
    authSignup = async () => {
        //authenticate

        const validateInput = this.validateInput();
        console.log(validateInput)
        if (!validateInput.success) {
            alert(validateInput.msg);
            return;
        }

        if (!this.authPass()) {
            alert('Failed to sign up: Passwords do not match. Please try again.')
        } else {
            try {
                const userByUsername =  await getUserByUsername(this.state.username);
                if (userByUsername && userByUsername.user !== null) {
                    alert('Failed to sign up: Username already taken. Please try another username.');
                    return;
                }
                const userByEmail =  await getUserByEmail(this.state.email);
                if (userByEmail && userByEmail.user !== null) {
                    alert('Failed to sign up: This email is already in use. Please try another email.');
                    return;
                }
                const signupRes = await signup({
                    username: this.state.username,
                    password: this.state.password,
                    email: this.state.email,
                    isAdmin: false
                });

                if (!signupRes.user) {
                    alert("Failed to sign up: " + signupRes.msg);
                    return;
                }

                const loginRes = await login({username: signupRes.user.username, password: signupRes.user.password});
                if (!loginRes.loginSuccess) {
                    alert("Signed up but failed to login: " + loginRes.msg);
                    return;
                }
                this.setState({
                    loginSuccess: true
                });
            } catch (err) {
                console.log('signup failed, ', err);
            }
        }
    }

    backToLogin = () => {
        this.setState({
            backToLogin: true
        })
    }

    render() {

        if (this.state.loginSuccess) {
            return (
                <Redirect push to={{
                    pathname: "/dashboard"
                }} />
            );
        }

        if (this.state.backToLogin) {
            return (
                <Redirect push to={{
                    pathname: "/"
                }} />
            );
        }

        /**TODO: add alert dialogue */
        return(
            <div className='center'>
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