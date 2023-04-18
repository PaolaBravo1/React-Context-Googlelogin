import "bootstrap/dist/css/bootstrap.css"
import { TextInput } from "components/TextInput"
import { useEffect, useState } from "react"
import { LayoutUnauthenticated } from "components/LayoutUnauthenticated"
import { emailAddressRegex } from "helpers/constants"
import { useApi } from "contexts/useApi"
import { Link, useNavigate } from "react-router-dom"

export const ForgotPassword = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitButtonEnabled, setIsSubmitButtonEnabled] = useState(false);
  
  const { requestPasswordReset } = useApi();
  
  useEffect(() => {    
    setIsSubmitButtonEnabled(emailAddress.length > 0);
  }, [emailAddress]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate())
      return;
    
    await attemptSignin();    
  }

  const validate = () => {
    if (emailAddress.length == 0) {
      setErrorMessage(" ");      
      return false;
    }

    if (!new RegExp(emailAddressRegex).test(emailAddress)){
      setErrorMessage("The email address you provided is not valid.");
      return false;
    }

    return true;
  }

  const attemptSignin = async() => {    
    const navigate = useNavigate(); 

    await requestPasswordReset(emailAddress)
    .then(result => {
      navigate("/thankyou");
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
            <Link className="simple-link" to="/signin">Return to sign-in page</Link>
          </div>                                         
        </form>
    </LayoutUnauthenticated>                     
  )
}
