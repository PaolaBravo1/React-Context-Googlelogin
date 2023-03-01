import 'bootstrap/dist/css/bootstrap.css'
import TextInput from '@/components/TextInput'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { emailAddressRegex, passwordRegex } from '@/helpers/constants'
import LayoutUnauthenticated from '@/components/LayoutUnauthenticated'
import Router from 'next/router';
import { useAuthentication } from '../contexts/useAuthentication';
import { ErrorCode } from 'errorcodes'

const Register = () => {
  const [isMakingApiRequest, setIsMakingApiRequest] = useState(false);
  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
  const [isPasswordAllowed, setIsPasswordAllowed] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errorMessage, setErrorMessage] = useState("")

  const { register } = useAuthentication();
  
  useEffect(() => {    
    const params = new URLSearchParams(window.location.search);
    let passwordParam = params.get("password");    
    setIsPasswordAllowed(passwordParam === "true");
  }, []);

  useEffect(() => {    
      setIsSubmitButtonEnabled(
        !isMakingApiRequest 
          && firstName.length > 0 && lastName.length > 0 && emailAddress.length > 0
          && (!isPasswordAllowed || ( password.length > 0 && password2.length > 0) ));
   }, [isMakingApiRequest, isPasswordAllowed, firstName, lastName, emailAddress, password, password2 ]);
   
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validate())
      return;

    setIsMakingApiRequest(true);
    await attemptRegister();   
    setIsMakingApiRequest(false);           
  }

  const validate = () => {
    
    if (firstName.length == 0 || lastName.length == 0 || emailAddress.length == 0) {
      setErrorMessage(" ");
      return false;
    }

    if (isPasswordAllowed)
    {
      if (password.length == 0 || password2.length == 0)
      {
        setErrorMessage(" ");
        return false;
      }
  
      if (password != password2)
      {
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

  const attemptRegister = async() => {
    await register(firstName, lastName, emailAddress, password)
      .then(result => 
        {                    
          Router.push("/thankyou");
        }
      )
      .catch(error => {
        if (!error.response?.data?.errorCode)
        {
          setErrorMessage(JSON.stringify(error));
          return;
        }

        switch(error?.response?.data?.errorCode) {
          case ErrorCode.AccountEmailAddressInvalid:          
              setErrorMessage("The credentials you provided are invalid.  Please check your email address and password and try again to sign in.");              
              break;

          case ErrorCode.AccountPasswordDoesNotMeetMinimumComplexity:
              setErrorMessage("The password does not meet the minimum complexity requirements.  Please make sure that your password is at least 8 characters and includes a lowercase letter, an uppercase letter, a number, and a symbol.");
              break;

          default:
            setErrorMessage(error?.response?.data?.message ?? JSON.stringify(error));
            break;        
      }});
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
            <Link href="/login">Return to login page</Link>
          </div>                                             
        </form>
    </LayoutUnauthenticated>     
  )
}

export default Register
