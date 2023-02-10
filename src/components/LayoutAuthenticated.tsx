import Head from "next/head";
import TextInput from "./TextInput";
import { useAuthentication } from '../contexts/useAuthentication';
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Router from "next/router";

interface ILayoutAuthenticated {
    children: any
}
  
const emailAddressCookieName = "hammer_username";
const accessTokenCookieName = "hammer_access_token";
const refreshTokenCookieName = "hammer_refresh_token";
const expirationCookieName = "hammer_expiration";

const LayoutAuthenticated = ({children}: ILayoutAuthenticated) => {    
  const { oauthAccessTokenLifetime } = useAuthentication();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const redirectUnauthenticated = () => {
    if (Router.pathname.indexOf("/login") < 0)
      Router.push("/login?" + encodeURIComponent(Router.pathname.toString()));
    else
      Router.push("/login");
  }

  useEffect(() => {
    const emailAddress = Cookies.get(emailAddressCookieName);
    const accessToken = Cookies.get(accessTokenCookieName);
    const refreshToken = Cookies.get(refreshTokenCookieName);
    const expiration = Cookies.get(expirationCookieName);
    
    if (emailAddress && accessToken && refreshToken && expiration)    
      setIsAuthenticated(true);       
    else {      
      setIsAuthenticated(false);
      redirectUnauthenticated();
    }

  }, []);

  return (
    <>
    <Head>
      <title>Hammerbeam</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className={`auth-container ${isAuthenticated ? " " : "not-authenticated"}`}>
      <div className="top-bar">
        <div className="status-bars">
          <div className="status-bar" id="oauth-token-timeout">
            <span className="status-bar-complete" style={{width: oauthAccessTokenLifetime + "%"}}></span>
          </div>
        </div>          
      </div>
      <div className="container-fluid">          
        <main>{children}</main>
      </div>
    </div>            
    </>
    );
  }

  export default LayoutAuthenticated