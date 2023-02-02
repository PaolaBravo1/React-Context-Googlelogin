import 'bootstrap/dist/css/bootstrap.css'
import TextInput from '@/components/TextInput'
import { useEffect, useState } from 'react'
import * as api from 'services/api'
import Link from 'next/link'
import LayoutUnauthenticated from '@/components/LayoutUnauthenticated'
import { emailAddressRegex } from '@/helpers/constants'

const ForgotPassword = () => {

  const [emailAddress, setEmailAddress] = useState("tester@hammerbeam.com");
  const [errorMessage, setErrorMessage] = useState("")
  const [isMakingApiRequest, setIsMakingApiRequest] = useState(false); 
  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
  
  useEffect(() => {    
    setIsSubmitButtonEnabled(!isMakingApiRequest && emailAddress.length > 0);
  }, [isMakingApiRequest, emailAddress]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate())
      return;
    
    setIsMakingApiRequest(true);
    await attemptLogIn();
    setIsMakingApiRequest(false);
  }

  const validate = () => {
    if (emailAddress.length == 0)
    {
      setErrorMessage(" ");      
      return false;
    }

    if (!new RegExp(emailAddressRegex).test(emailAddress)){
      setErrorMessage("The email address you provided is not valid.");
      return false;
    }

    return true;
  }

  const attemptLogIn = async() => {
    
    await api.requestPasswordReset(emailAddress)
      .then(result => {
           window.location.href = "/thankyou";
      })
      .catch(error => {
          setErrorMessage(error?.response?.data?.message ?? JSON.stringify(error));
      });      
  };

  return (
    <LayoutUnauthenticated id='forgotpassword' title="Forgot Password" message="Please enter your email address and click the Reset button.  We'll send you an email with instructions for resetting your password." errorMessage={errorMessage} reversed={true}>
      <form className={(errorMessage.length > 0 ? "form-error" : "")} onSubmit={handleSubmit}>
          <div className="mb-3">
            <TextInput type="text" label="Email address" name="email-address" value={emailAddress} onChange={(value:string) => setEmailAddress(value)}></TextInput>
          </div>                       
          <div className="d-grid gap-2 mt-2">
            <button disabled={!isSubmitButtonEnabled} type="submit" className="styled-button">Reset</button>
          </div>
          <div className="not-registered text-muted">
            <Link href="/login">Return to login page</Link>
          </div>                                         
        </form>
    </LayoutUnauthenticated>                           
  )
}


export default ForgotPassword
