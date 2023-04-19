import { useApi } from "../contexts/useApi";
import { useCallback, useEffect, useState } from "react";
import IdlePopup from "../components/IdlePopup";
import configSettings from "config.json";
import Icon from "../components/Icon";
import NavBar from "../components/NavBar";
import { Helmet } from "react-helmet";

interface ILayoutAuthenticated {
  header: string
  children: any
}
  
export const LayoutAuthenticated = ({header, children}: ILayoutAuthenticated) => {    
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isIdlePopupOpen, setIsIdlePopupOpen] = useState(false);
  const [isNavBarCollapsed, setIsNavBarCollapsed] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [idleLifeRemaining, setIdleLifeRemaining] = useState(100);
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

  const handleNavBarToggle = (isCollapsed: boolean) => {
    setIsNavBarCollapsed(isCollapsed)
  }

  const validateIdentity = () => {
    const identity = getIdentity();

    if (!identity)
      return false;
    
    setRole(identity.role);

    const parts = window.location.pathname.split("/").slice(1);
   
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
    <Helmet>
      <title>Hammerbeam</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />      
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Lato" rel="preload" as="style"/>
      <link href="https://fonts.googleapis.com/css2?family=Lato&display=swap" rel="stylesheet" media="print" />
    </Helmet>
    <div id="overlay" className={isMakingRequest ? "enabled" : ""}></div>
    <IdlePopup isOpen={isIdlePopupOpen} onClose={onIdlePopupClose}></IdlePopup>
    <div className={`auth-container ${isAuthenticated ? "" : "not-authenticated"} ${isMakingRequest ? "making-api-request" : ""} ${isNavBarCollapsed ? "nav-bar-collapsed" : ""}`}>
      <div className="top-bar">
        <div className="top-bar-buttons">
          <div className="icon-circle">
            <Icon name="user"></Icon>
          </div>
         <button className="button is-danger" onClick={logout}>Logout</button>
        </div>
      </div>             
      <div className="outer">         
        <NavBar role={role} oauthAccessTokenLifeRemaining={oauthAccessTokenLifeRemaining} idleLifeRemaining={idleLifeRemaining} handleNavBarToggle={handleNavBarToggle}></NavBar>           
        <main>
          <div className="header">{header}</div>
          {children}
        </main>        
      </div>
    </div>  
    </>
    );
  }
