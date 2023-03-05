import 'bootstrap/dist/css/bootstrap.css'
import TextInput from '@/components/TextInput'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { emailAddressRegex, passwordRegex } from '@/helpers/constants'
import LayoutUnauthenticated from '@/components/LayoutUnauthenticated'
import Router from 'next/router';
import { useApi } from '../contexts/useApi';
import { ErrorCode } from '@/helpers/errorcodes'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import configSettings from "../../config.json";
import { v4 } from 'uuid'

const Register = () => {
  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
  const [isPasswordAllowed, setIsPasswordAllowed] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errorMessage, setErrorMessage] = useState("")
  const [nonce, setNonce] = useState(v4())

  const { register, registerGoogle } = useApi();
  
  useEffect(() => {    
    const params = new URLSearchParams(window.location.search);
    let passwordParam = params.get("password");    
    setIsPasswordAllowed(passwordParam === "true");
  }, []);

  useEffect(() => {    
      setIsSubmitButtonEnabled(
         firstName.length > 0 && lastName.length > 0 && emailAddress.length > 0
          && (!isPasswordAllowed || ( password.length > 0 && password2.length > 0) ));
   }, [isPasswordAllowed, firstName, lastName, emailAddress, password, password2 ]);
   
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validate())
      return;

    await attemptRegister(async () => { await register(firstName, lastName, emailAddress, password) });       
  }
  
  const handleGoogleSubmit = async (credentialResponse: any) => {
    if (credentialResponse == null || credentialResponse.credential == null) {
      setErrorMessage("An error occurred while attempting to sign in via Google: the remote system failed to return a valid credential token.");      
      return;
    }
    
    await attemptRegister(async () => { await registerGoogle(credentialResponse.credential, nonce); });       
  }

  const handleGoogleError = async () => {
    setErrorMessage("An error occurred while attempting to sign in via Google.");      
  }

  const validate = () => {
    if (firstName.length == 0 || lastName.length == 0 || emailAddress.length == 0) {
      setErrorMessage(" ");
      return false;
    }

    if (isPasswordAllowed) {
      if (password.length == 0 || password2.length == 0) {
        setErrorMessage(" ");
        return false;
      }
  
      if (password != password2) {
        setErrorMessage("The passwords do not match.");
        return false;
      }
  
      if (!new RegExp(emailAddressRegex).test(emailAddress)){
        setErrorMessage("The email address you provided is not valid.");
        return false;
      }

      if (!new RegExp(passwordRegex).test(password)){
        setErrorMessage("The password does not meet the minimum complexity requirements.  Please make sure that your password is at least 8 characters and includes a lowercase letter, an uppercase letter, a number, and a symbol.");
        return false;
      }
    }
 
    return true;
  }
 
  const attemptRegister = async(registerFunction: () => Promise<void>) => {     
    await registerFunction()
      .then(result => {                    
          Router.push("/thankyou");
        }
      )
      .catch(error => {
        if (!error.response?.data?.errorCode) {
          setErrorMessage(JSON.stringify(error));
          return;
        }

        switch(error?.response?.data?.errorCode) {
          case ErrorCode.AccountEmailAddressInvalid:          
            setErrorMessage("The email address you provided is not valid.");              
            break;

          case ErrorCode.AccountPasswordDoesNotMeetMinimumComplexity:
            setErrorMessage("The password does not meet the minimum complexity requirements.  Please make sure that your password is at least 8 characters and includes a lowercase letter, an uppercase letter, a number, and a symbol.");
            break;
            
          case ErrorCode.GoogleOAuthTokenInvalid:
            setErrorMessage("Your account could not be validated by Google.  Please check that your Google account is valid and try again.");
            break;

          case ErrorCode.GoogleOAuthNonceInvalid:
            setErrorMessage("Your account could not be validated by Google, the nonce is invalid.  Please check that your Google account is valid and try again.");
            break;
            
          default:
            if (error.message == "Network Error")
              setErrorMessage("The request could not be completed, the backend API may not be configured correctly.");  
            else
              setErrorMessage(error?.response?.data?.message ?? JSON.stringify(error));
            break;                
        }
      });
  };

  return (
    <LayoutUnauthenticated id="register" title="Register" message="Please enter your contact information below.  We'll send you an email confirming your account creation!" errorMessage={errorMessage} reversed={true}>
      <form className={(errorMessage.length > 0 ? "form-error" : "")} onSubmit={handleSubmit}>
          <div className="row">
              <div className="col-lg-6">
                <TextInput type="text" label="First name" name="first-name" value={firstName} onChange={(value:string) => setFirstName(value)}></TextInput>
              </div>   
              <div className="col-lg-6">
                <TextInput type="text" label="Last name" name="last-name" value={lastName} onChange={(value:string) => setLastName(value)}></TextInput>
              </div>   
            </div>
          <div className="mb-3">
            <TextInput type="text" label="Email address" name="email-address" value={emailAddress} onChange={(value:string) => setEmailAddress(value)}></TextInput>
          </div>  
          { !isPasswordAllowed ? <></> :  
          <>
            <div className="mb-3">
              <TextInput type="password" label="Password" name="password" value={password} onChange={(value:string) => setPassword(value)}></TextInput>
            </div> 
            <div className="mb-3">
              <TextInput type="password" label="Retype password" name="password2" value={password2} onChange={(value:string) => setPassword2(value)}></TextInput>
            </div>     
          </>   
          }               
          <div className="d-grid gap-2 mt-2">
            <button disabled={!isSubmitButtonEnabled} type="submit" className="styled-button">Register</button>
          </div>
          <div className="not-registered text-muted">
            <Link className="simple-link" href="/login">Return to login page</Link>
          </div> 
          <div id="social-login-buttons">
            <div id="google-login-button">
              <GoogleOAuthProvider clientId={configSettings.googleOAuthClientID}> 
                <GoogleLogin nonce={nonce} theme="filled_black" shape="circle" size="large" width="400" onSuccess={handleGoogleSubmit} onError={handleGoogleError} />    
              </GoogleOAuthProvider>
              <div id="google-login-override" className="styled-button">Register using Google</div>
            </div>          
          </div>                                                  
        </form>
    </LayoutUnauthenticated>     
  )
}

export default Register