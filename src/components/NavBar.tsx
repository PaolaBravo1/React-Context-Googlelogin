import NavItemList from "./NavItemList";
import StatusDonut from "./StatusDonut";
import configSettings from "settings/config.json";

interface INavBar {
  role: string,
  oauthAccessTokenLifeRemaining: number,
  idleLifeRemaining: number
}

const NavBar = ({ role, oauthAccessTokenLifeRemaining, idleLifeRemaining }: INavBar) => {  
  return (
    <nav id="nav-bar" className="nav-bar">      
      <div className="position-sticky pt-md-5">
        <NavItemList role={role}></NavItemList>                
      </div>
      <ul className="status-donuts">
        <StatusDonut id="oauth-token-timeout" label="OAuth token timeout" icon="cloud" warningAt={10 + Number(configSettings.AccessTokenRefreshMarginPercent)} complete={oauthAccessTokenLifeRemaining}></StatusDonut>
        <StatusDonut id="idle-timeout" label="Idle timeout" icon="bed" warningAt={10} complete={idleLifeRemaining}></StatusDonut>
      </ul>
    </nav>
  )
}

export default NavBar 