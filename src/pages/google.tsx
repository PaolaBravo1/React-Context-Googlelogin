import 'bootstrap/dist/css/bootstrap.css'
import { useEffect, useState } from 'react'
import LayoutUnauthenticated from '@/components/LayoutUnauthenticated'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import configSettings from "../../config.json";

const Google = () => {
  
  return (
    <GoogleOAuthProvider clientId={configSettings.googleOAuthClientID}>
    <LayoutUnauthenticated id="thankyou" title="Google Sign-in" message="Click the button to sign in using your Google account." errorMessage="">
    <GoogleLogin 
    theme="filled_black"     
        shape="circle"     
        size="large"
        onSuccess={credentialResponse => { console.log(credentialResponse.credential); }}
        onError={() => { console.log('Login Failed'); }}
      />         

    </LayoutUnauthenticated>

    </GoogleOAuthProvider>
  )
}

export default Google