import Head from "next/head";
import { useApi } from "../contexts/useApi";
import { useCallback, useEffect, useState } from "react";
import Router from "next/router";
import IdlePopup from "./IdlePopup";
import configSettings from "../../config.json";
import StatusBar from "./StatusBar";
import NavItem from "./NavItem";
import Icon from "./Icon";
import NavItemList from "./NavItemList";
import NavBar from "./NavBar";
import PropertyBar from "./PropertyBar";

interface ILayoutAuthenticated {
  children: any
}
  
const LayoutAuthenticated = ({children}: ILayoutAuthenticated) => {    
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isIdlePopupOpen, setIsIdlePopupOpen] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [idleLifeRemaining, setIdleLifeRemaining] = useState(100);
  const [isPropertyBarVisible, setIsPropertyBarVisible] = useState(false);
  const [role, setRole] = useState("");
  
  const { redirectUnauthenticated, oauthAccessTokenLifeRemaining, clearIdentity, getIdentity, isMakingRequest } = useApi();
  
  const domEvents = ["click", "scroll", "keypress"];
  //cconst domEvents = ["click", "scroll", "keypress", "mousemove"];

  var idleTimer: ReturnType<typeof setTimeout>;

  useEffect(() => {
    clearInterval(idleTimer);

    if (validateIdentity()) {
      setIsAuthenticated(true);       
      resetIdleTimer();      
    }
    else {      
      setIsAuthenticated(false);
      redirectUnauthenticated(true);
    }
  }, []);

  const validateIdentity = () => {
    const identity = getIdentity();

    if (!identity)
      return false;
    
    setRole(identity.role);

    var parts = Router.pathname.split("/").slice(1);

    if (parts.length == 0)
      return false;

    if (parts.length == 1)
      return true;
      
    return (parts[0].toLowerCase() == identity.role.toLowerCase());
  }

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

  const onIdlePopupClose = useCallback((isLogout: boolean) => {
    setIsIdlePopupOpen(false);
    clearInterval(idleTimer);
      
    if (isLogout) {
      clearIdentity();
      redirectUnauthenticated(true);     
    }
    else {
      setLastActiveTime(Date.now());
    }
  }, []);

  const logout = () => {
    clearIdentity();
    clearInterval(idleTimer);
    redirectUnauthenticated(false);      
  }

  const toggleIsPropertyBarvisible = () => {  
    setIsPropertyBarVisible(!isPropertyBarVisible);
  }

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
    <div id="overlay" className={isMakingRequest ? "enabled" : ""}></div>
    <IdlePopup isOpen={isIdlePopupOpen} onClose={onIdlePopupClose}></IdlePopup>
    <div className={`auth-container ${isAuthenticated ? "" : "not-authenticated"} ${isMakingRequest ? "making-api-request" : ""}`}>
      <div className="top-bar">
        <div className="top-bar-buttons">
          <div className="icon-circle">
            <Icon name="user"></Icon>
          </div>
         <button className="button is-danger" onClick={logout}>Logout</button>
        </div>
      </div>             
      <div className="outer">         
        <NavBar role={role} oauthAccessTokenLifeRemaining={oauthAccessTokenLifeRemaining} idleLifeRemaining={idleLifeRemaining}></NavBar>           
        <main>{children}</main>        
      </div>
    </div>  
    </>
    );
  }

  export default LayoutAuthenticated
  