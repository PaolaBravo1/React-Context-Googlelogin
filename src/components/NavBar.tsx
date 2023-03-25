import Link from "next/link";
import { useEffect, useState } from "react";
import Router from "next/router";
import Icon from "./Icon";
import NavItemList from "./NavItemList";
import StatusBar from "./StatusBar";
import configSettings from "../../config.json";

interface INavBar{
  role: string,
  oauthAccessTokenLifeRemaining: number,
  idleLifeRemaining: number
}

const NavBar = ({ role, oauthAccessTokenLifeRemaining, idleLifeRemaining }: INavBar) => {
  const [isVisible, setIsVisible] = useState(true);
    
  const toggleIsVisible = () => {  
    setIsVisible(!isVisible);
  }

  return (
    <nav id="nav-bar" className={`nav-bar${isVisible ? "" : " collapsed"}`}>
      <div className="collapse-button" onClick={toggleIsVisible}>
        <Icon name="angle-double-left"></Icon>
      </div>
      <div className="position-sticky pt-md-5">
        <NavItemList role={role}></NavItemList>                
      </div>
      <div className="status-bars">
        <StatusBar id="oauth-token-timeout" icon="cloud" warningAt={10 + configSettings.oauthAccessTokenRefreshMarginPercent} complete={oauthAccessTokenLifeRemaining}></StatusBar>
        <StatusBar id="idle-timeout" icon="bed" warningAt={10} complete={idleLifeRemaining}></StatusBar>          
      </div>    
    </nav>
  )
}

export default NavBar
