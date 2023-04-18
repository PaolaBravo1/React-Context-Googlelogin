import "bootstrap/dist/css/bootstrap.css"
import { TextInput } from "components/TextInput"
import { useEffect, useState } from "react"
import { LayoutUnauthenticated } from "components/LayoutUnauthenticated"
import { emailAddressRegex } from "helpers/constants"
import { useApi } from "contexts/useApi"
import { ErrorCode } from "helpers/errorcodes"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import configSettings from "config.json";
import { v4 } from "uuid"
import { Link, useNavigate } from "react-router-dom"

export const Signin = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [nonce, setNonce] = useState(v4());
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
  const [isPasswordResetLinkVisible, setIsPasswordResetLinkVisible] = useState(false);

  const { getIdentity, authorize, authorizeGoogle, clearIdentity, getProvider } = useApi();
  
  useEffect(() => {    
    clearIdentity();
    const params = new URLSearchParams(window.location.search);  
    const provider = getProvider();
    
    if (provider == "Local")
      setEmailAddress(params.get("emailAddress") ?? "");   
  }, []);
    
  useEffect(() => {    
    setIsSubmitButtonEnabled(
      emailAddress.length > 0 && password.length > 0);
  }, [emailAddress, password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate())
      return;

    await signIn(async () => { await authorize(emailAddress, password); } ); 
  }

  const handleGoogleSubmit = async (credentialResponse: any) => {
    if (credentialResponse == null || credentialResponse.credential == null) {
      setErrorMessage("An error occurred while attempting to sign in via Google: the remote system failed to return a valid credential token.");      
      return;
    }
    
    await signIn(async () => { await authorizeGoogle(credentialResponse.credential, nonce);  } );    
  }

  const handleGoogleError = async () => {
    setErrorMessage("An error occurred while attempting to sign in via Google.");      
  }

  const validate = () => {
    if (emailAddress.length == 0 || password.length == 0) {      
      setErrorMessage(" ");      
      return false;
    }

    let isValid = false;
    const emailAddresses = emailAddress.split(":");
    
    if (emailAddresses.length == 2) {
      if (new RegExp(emailAddressRegex).test(emailAddresses[0]) && new RegExp(emailAddressRegex).test(emailAddresses[1])) 
        isValid = true;
    }
    else if (new RegExp(emailAddressRegex).test(emailAddress))
      isValid = true;

    if (!isValid)
      setErrorMessage("The email address you provided is not valid.");
    
    return isValid;
  }

  const signIn = async(authFunction: () => Promise<void>) => {        
    try {    
      await authFunction();
      
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo");
      const navigate = useNavigate();

      if (redirectTo)
        navigate(decodeURIComponent(redirectTo));
      else
        navigate(getIdentity()!.role.toLowerCase() + "/dashboard");      
    }
    catch (error:any) {
        switch(error?.response?.data?.errorCode) {
          case ErrorCode.AccountCredentialsInvalid:
            setErrorMessage("The credentials you provided are invalid.  Please check your email address and password and try again to sign in.");
            setIsPasswordResetLinkVisible(true);
            break;
          
          case ErrorCode.AccountExternalCredentialsInvalid:
              setErrorMessage("The Google account does not appear to be configured as an account on this system.  Please try signing in with an email address and password, or create a new account on the registration page.");
              break;
          
          case ErrorCode.AccountEmailAddressNotConfirmed:
            setErrorMessage("You cannot sign in until you have confirmed your account.  Please check your email for the welcome message we sent when you registered.<br/><br/>If you have not received the welcome message, please use the link below to request a password reset.");
            break;

          case ErrorCode.AccountLockedOut:
          case ErrorCode.AccountLockedOutOverride:
            setErrorMessage("Your account has been locked due to too many failed sign-in attempts.  Please wait for 30 minutes, then request a password reset.");
            break;

          case ErrorCode.AccountTombstoned:
            setErrorMessage("Your account has been disabled.");
            break;

          case ErrorCode.AccountCredentialsExpired:
          case ErrorCode.AccountCredentialsNotConfirmed:
            setErrorMessage("Your account credentials are expired.  Please check your email for a password reset email, or click the Forgot Password link below to retry.");
            break;

          case ErrorCode.AccountRequiresIdentityProviderLocal:
            setErrorMessage("You created your account using an email address and password.  Please sign in using these credentials rather than using the Google sign-in framework.");
            break;

          case ErrorCode.AccountRequiresIdentityProviderGoogle:
            setErrorMessage("You created your account using your Google account, rather than using a standard email address and password.  Please sign in using the Google sign-in button.");
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
      }
  };

  return (
    <LayoutUnauthenticated id="signin" title="Welcome!" message="Please provide your user credentials in order to sign in." errorMessage={errorMessage}>  
      <div className={`muted password-reset ${isPasswordResetLinkVisible ? "": "hidden"}`}>Forgot your password? <Link className="simple-link" to="/forgotpassword">Click here to request a passsword reset!</Link></div>
      <form className={(errorMessage.length > 0 ? "form-error" : "")} onSubmit={handleSubmit}>
        <div className="mb-3">
          <TextInput required={true} type="text" label="Email address" name="email-address" value={emailAddress} onChange={(value:string) => setEmailAddress(value)}></TextInput>
        </div>
        <div className="mb-3">
          <TextInput required={true} type="password" label="Password" name="password" value={password} onChange={(value:string) => setPassword(value)}></TextInput>
        </div>
        <div className="form-check">
          <input id="rememberPassword" type="checkbox" className="form-check-input" />
          <label htmlFor="rememberPassword" className="form-check-label">Remember password</label>
        </div>
        <div className="d-grid gap-2 mt-2">
          <button disabled={!isSubmitButtonEnabled} type="submit" className="styled-button">Sign in</button>
        </div>
        <div className="or-block">
          <span>OR</span>
        </div>
        <div id="social-login-buttons">
          <div id="google-login-button">
            <GoogleOAuthProvider clientId={configSettings.googleOAuthClientID}> 
              <GoogleLogin nonce={nonce} theme="filled_black" shape="circle" size="large" width="400" onSuccess={handleGoogleSubmit} onError={handleGoogleError} />    
            </GoogleOAuthProvider>
            <div id="google-login-override" className="styled-button">Sign in using Google</div>
          </div>          
        </div>   
        <div className="not-registered text-muted">
          Not registered yet?  <Link className="simple-link" to="/register">Click here to get started!</Link>
        </div>                        
      </form>
    </LayoutUnauthenticated>
  )
}
