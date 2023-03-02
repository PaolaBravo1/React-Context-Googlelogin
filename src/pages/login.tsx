import 'bootstrap/dist/css/bootstrap.css'
import TextInput from '@/components/TextInput'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LayoutUnauthenticated from '@/components/LayoutUnauthenticated'
import { emailAddressRegex } from '@/helpers/constants'
import Router from 'next/router';
import { useAuthentication } from '../contexts/useAuthentication';
import { ErrorCode } from 'errorcodes'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import configSettings from "../../config.json";

const Login = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("")
  const [isMakingApiRequest, setIsMakingApiRequest] = useState(false);
  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
    
  const { authorize, authorizeGoogle, clearOAuthCookies } = useAuthentication();
  
  useEffect(() => {    
    clearOAuthCookies();
    const params = new URLSearchParams(window.location.search);  
    setEmailAddress(params.get("emailAddress") ?? "");   
  }, []);
    
  useEffect(() => {    
    setIsSubmitButtonEnabled(
      !isMakingApiRequest && emailAddress.length > 0 && password.length > 0);
  }, [emailAddress, password, isMakingApiRequest]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate())
      return;

    setIsMakingApiRequest(true);
    await login(async () => { await authorize(emailAddress, password); } );
    setIsMakingApiRequest(false);
  }

  const handleGoogleSubmit = async (credentialResponse: any) => {
    if (credentialResponse == null || credentialResponse.credential == null) {
      setErrorMessage("An error occurred while attempting to sign in via Google: the remote system failed to return a valid credential token.");      
      return;
    }
    
    await login(async () => { await authorizeGoogle(credentialResponse.credential);  } );    
  }

  const handleGoogleError = async () => {
    setErrorMessage("An error occurred while attempting to sign in via Google.");      
  }

  const validate = () => {
    if (emailAddress.length == 0 || password.length == 0) {
      setErrorMessage(" ");      
      return false;
    }

    if (!new RegExp(emailAddressRegex).test(emailAddress)){
      setErrorMessage("The email address you provided is not valid.");
      return false;
    }

    return true;
  }

  const login = async(authFunction: () => Promise<void>) => {        
    try {    
      await authFunction();
      
      if (Router.query.redirectTo)
        Router.push(decodeURIComponent(Router.query.redirectTo.toString()));
      else
        Router.push("/dashboard");      
    }
    catch (error:any) { 
        switch(error?.response?.data?.errorCode) {
          case ErrorCode.AccountCredentialsInvalid:
            setErrorMessage("The credentials you provided are invalid.  Please check your email address and password and try again to sign in.");
            break;
          
          case ErrorCode.AccountExternalCredentialsInvalid:
              setErrorMessage("The Google account does not appear to be configured as an account on this system.");
              break;
          
          case ErrorCode.AccountEmailAddressNotConfirmed:
            setErrorMessage("You cannot log in until you have confirmed your account.  Please check your email for the welcome message we sent when you registered.<br/><br/>If you have not received the welcome message, please use the link below to request a password reset.");
            break;

          case ErrorCode.AccountLockedOut:
          case ErrorCode.AccountLockedOutOverride:
            setErrorMessage("Your account has been locked due to too many failed login attempts.  Please wait for 30 minutes, then request a password reset.");
            break;

          case ErrorCode.AccountTombstoned:
            setErrorMessage("Your account has been disabled.");
            break;

          case ErrorCode.AccountCredentialsExpired:
          case ErrorCode.AccountCredentialsNotConfirmed:
            setErrorMessage("Your account credentials are expired.  Please check your email for a password reset email, or click the Forgot Password link below to retry.");
            break;

          case ErrorCode.AccountRequiresIdentityProviderLocal:
            setErrorMessage("You created your account using an email address and password.  Please log in using these credentials rather than using the Google sign-in framework.");
            break;

          case ErrorCode.AccountRequiresIdentityProviderGoogle:
            setErrorMessage("You created your account using your Google account, rather than using a standard email address and password.  Please log in using the Google sign-in button.");
            break;

          case ErrorCode.GoogleOAuthTokenInvalid:
            setErrorMessage("Your account could not be validated by Google.  Please check that your Google account is valid and try again.");
            break;

          default:
            if (error.message == "Network Error")
              setErrorMessage("The request could not be completed, the backend API may not be configured correctly.");  
            else
              setErrorMessage(error?.response?.data?.message ?? JSON.stringify(error));
            break;                
        }
      }
  };

  return (
    <LayoutUnauthenticated id="login" title="Welcome!" message="Please provide your user credentials in order to log in." errorMessage={errorMessage}>                   
      <form className={(errorMessage.length > 0 ? "form-error" : "")} onSubmit={handleSubmit}>
        <div className="mb-3">
          <TextInput type="text" label="Email address" name="email-address" value={emailAddress} onChange={(value:string) => setEmailAddress(value)}></TextInput>
        </div>
        <div className="mb-3">
          <TextInput type="password" label="Password" name="password" value={password} onChange={(value:string) => setPassword(value)}></TextInput>
        </div>
        <div className="form-check">
          <input id="rememberPassword" type="checkbox" className="form-check-input" />
          <label htmlFor="rememberPassword" className="form-check-label">Remember password</label>
        </div>
        <div className="d-grid gap-2 mt-2">
          <button disabled={!isSubmitButtonEnabled} type="submit" className="styled-button">Sign in</button>
        </div>
        <div className="not-registered text-muted">
          Not registered yet?  <Link href="/register">Click here to get started!</Link>
        </div>        
        <div>
          <div><Link href="/forgotpassword">Forgot your password?</Link></div>
        </div>  
        <div id="social-login-buttons">
          <div id="google-login-button">
            <GoogleOAuthProvider clientId={configSettings.googleOAuthClientID}> 
              <GoogleLogin theme="filled_black" shape="circle" size="large" width="400" onSuccess={handleGoogleSubmit} onError={handleGoogleError} />    
            </GoogleOAuthProvider>
            <div id="google-login-override" className="styled-button">Sign in using Google</div>
          </div>          
        </div>       
      </form>
    </LayoutUnauthenticated>
  )
}

export default Login