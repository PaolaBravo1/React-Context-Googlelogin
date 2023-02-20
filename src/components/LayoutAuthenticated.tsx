import Head from "next/head";
import { useAuthentication } from '../contexts/useAuthentication';
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import Router from "next/router";
import IdlePopup from "./IdlePopup";
import configSettings from "../../config.json";
import StatusBar from "./StatusBar";
import { isLocalURL } from "next/dist/shared/lib/router/router";

interface ILayoutAuthenticated {
  children: any
}
  
const emailAddressCookieName = "hammer_username";
const accessTokenCookieName = "hammer_access_token";
const refreshTokenCookieName = "hammer_refresh_token";
const expirationCookieName = "hammer_expiration";

const LayoutAuthenticated = ({children}: ILayoutAuthenticated) => {    
  const { oauthAccessTokenLifeRemaining, clearOAuthCookies } = useAuthentication();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isIdlePopupOpen, setIsIdlePopupOpen] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [idleLifeRemaining, setIdleLifeRemaining] = useState(100);

  const domEvents = ["click", "scroll", "keypress"];
  //cconst domEvents = ["click", "scroll", "keypress", "mousemove"];

  var idleTimer: ReturnType<typeof setTimeout>;

  useEffect(() => {
    clearInterval(idleTimer);

    const emailAddress = Cookies.get(emailAddressCookieName);
    const accessToken = Cookies.get(accessTokenCookieName);
    const refreshToken = Cookies.get(refreshTokenCookieName);
    const expiration = Cookies.get(expirationCookieName);
    
    if (emailAddress && accessToken && refreshToken && expiration) {
      setIsAuthenticated(true);       
      resetIdleTimer();
    }
    else {      
      setIsAuthenticated(false);
      redirectUnauthenticated();
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    const now = Date.now();
    setLastActiveTime(now);
    clearInterval(idleTimer);

    idleTimer = setInterval(() => {
      const secondsRemaining = configSettings.idleTimeout - Math.round((Date.now() - now) / 1000);
      const precentTimeRemaining = 100 * secondsRemaining / configSettings.idleTimeout;
      setIdleLifeRemaining(precentTimeRemaining);
    }, 1000);    
  }, []);

  const redirectUnauthenticated = () => {
    if (Router.pathname.indexOf("/login") < 0)
      Router.push("/login?" + encodeURIComponent(Router.pathname.toString()));
    else
      Router.push("/login");
  }
  
  const onIdlePopupClose = useCallback((isLogout: boolean) => {
    setIsIdlePopupOpen(false);

    if (isLogout) {
      clearOAuthCookies();
      clearInterval(idleTimer);
      redirectUnauthenticated();      
    } else 
    {
      clearInterval(idleTimer);
      setLastActiveTime(Date.now());
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setIsIdlePopupOpen(true);
    }, configSettings.idleTimeout * 1000);

    return clearTimeout.bind(null, id);
  }, [lastActiveTime]);

  useEffect(() => {
    domEvents.forEach((event: any) => document.addEventListener(event, resetIdleTimer));

    return () => {
      domEvents.forEach((event: any) =>
        document.removeEventListener(event, resetIdleTimer)
      );
    };
  }, [resetIdleTimer]);
  
  return (
    <>
    <Head>
      <title>Hammerbeam</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />      
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Lato" rel="preload" as="style"/>
      <link href="https://fonts.googleapis.com/css2?family=Lato&display=swap" rel="stylesheet" media="print" />
      <noscript>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato&display=swap" />
      </noscript>
    </Head>
    <IdlePopup isOpen={isIdlePopupOpen} onClose={onIdlePopupClose}></IdlePopup>
    <div className={`auth-container ${isAuthenticated ? "" : "not-authenticated"}`}>
      <div className="top-bar">
        <div className="status-bars">
          <StatusBar id="oauth-token-timeout" icon="user" warningAt={10 + configSettings.oauthAccessTokenRefreshMarginPercent} complete={oauthAccessTokenLifeRemaining}></StatusBar>
          <StatusBar id="idle-timeout" icon="bell" warningAt={10} complete={idleLifeRemaining}></StatusBar>          
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
  