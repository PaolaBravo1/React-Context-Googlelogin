import { createContext, useContext, useEffect, useState } from "react"
import { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { Route, useNavigate } from "react-router-dom";
import jwt from "jwt-decode"
import { ErrorCode } from "helpers/errorcodes"
import { Identity } from "models/Identity";
import { axiosRequest } from "api/api";

const identityCookieName = "hammer_identity";
const providerCookieName = "hammer_provider";
const authEndPoint = "/oauth/authorize";
const authLocalStorageKey = "hammer_oauth_timer";

var authTimer: ReturnType<typeof setTimeout>;
var authTimerCountdown: ReturnType<typeof setInterval>;

interface IAuthenticationContext {
  redirectUnauthenticated: (includeRedirectParam: boolean) => void,
  authorize: (emailAddress: string, password: string) => Promise<string>,
  authorizeGoogle: (credential: string, nonce: string) => Promise<string>,
  clearIdentity: () => void,
  getIdentity: () => Identity | null,
  getProvider: () => string 
  oauthAccessTokenLifeRemaining: number
}

export const AuthenticationContext = (): IAuthenticationContext => {
  const {
    redirectUnauthenticated,
    authorize,
    authorizeGoogle,
    clearIdentity,
    getIdentity,
    getProvider,
    oauthAccessTokenLifeRemaining
  } = useContext(Context);

  return {
    redirectUnauthenticated,
    authorize,
    authorizeGoogle,
    clearIdentity,
    getIdentity,
    getProvider,
    oauthAccessTokenLifeRemaining
  };
}
    
const Context = createContext({} as IAuthenticationContext);

export function AuthenticationProvider({ children }: { children: any }) {
  const [oauthAccessTokenLifeRemaining, setOAuthAccessTokenLifeRemaining] = useState(100);
  
  const navigate = useNavigate();              
  
  useEffect(() => {
    // on page refresh we need to restart the oauth token timer
    const oauthCountdown = Number(localStorage.getItem(authLocalStorageKey));
    const identity = getIdentity();
    
    if (oauthAccessTokenLifeRemaining == 100 && identity?.emailAddress != null && !isNaN(oauthCountdown)) 
      restartOAuthTimers(identity);
  }, []);

  const restartOAuthTimers = (identity: Identity) => {
    clearTimeout(authTimer);
    clearInterval(authTimerCountdown);

    const ttl = getOAuthTokenTtl(Date.parse(identity.expiration));

    authTimer = setTimeout(() => {
      reauthorize(identity.emailAddress);
    }, ttl);

    authTimerCountdown = setInterval(() => {
      const countdown = (Date.parse(identity.expiration) - (new Date()).getTime()) / 1000;
      setOAuthAccessTokenLifeRemaining(100.0 * countdown / Number(process.env.REACT_APP_OAUTH_ACCESS_TOKEN_TIMEOUT));
      localStorage.setItem(authLocalStorageKey, countdown.toString());      
    }, 1000);
  }
  
  const redirectUnauthenticated = (includeRedirectParam: boolean) => {
    if (includeRedirectParam && window.location.pathname.indexOf("/signin") < 0)
      navigate("/signin?redirectTo=" + encodeURIComponent(window.location.pathname));
    else
      navigate("/signin");
  }

  const getIdentity = (): Identity | null => {
    const identityCookie = Cookies.get(identityCookieName);

    if (identityCookie != undefined) {
      const identity = Identity.parse(identityCookie);

      if (identity)
        return identity;
    }

    return null;
  }

  const getProvider = (): string => {
    const provider = Cookies.get(providerCookieName);

    if (provider && provider.length > 0)
      return provider;
    else
      return "";
  }

  const saveProvider = (provider: string) => {
    const params = { domain: process.env.REACT_APP_COOKIE_DOMAIN, secure: true, expires: 365 };
    Cookies.set(providerCookieName, provider, params);
  }

  const getOAuthTokenTtl = (expiration: number): number => {
    let margin = Number(process.env.REACT_APP_OAUTH_ACCESS_TOKEN_TIMEOUT) * Number(process.env.REACT_APP_OAUTH_ACCESS_TOKEN_REFRESH_MARGIN_PERCENT) / 100;

    if (margin < Number(process.env.REACT_APP_OAUTH_ACCESS_TOKEN_MINIMUM_REFRESH_MARGIN))
      margin = Number(process.env.REACT_APP_OAUTH_ACCESS_TOKEN_MINIMUM_REFRESH_MARGIN);

    const ttl = (expiration - margin * 1000) - new Date().getTime();
    return ttl;
  }

  const saveIdentity = (emailAddress: string, role: string, expiresInSeconds: number) => {
    const emailAddresses = emailAddress.split(":");
    const expiration = new Date(new Date().getTime() + expiresInSeconds * 1000).toISOString();
    const expiresInDays = (expiresInSeconds) / 60 / 60 / 24;
    const params = { domain: process.env.REACT_APP_COOKIE_DOMAIN, secure: true, expires: expiresInDays };
    
    var identity = new Identity(emailAddresses[0], role, null, expiration);

    Cookies.set(identityCookieName, JSON.stringify(identity), params);
    
    restartOAuthTimers(identity);
  }

  const clearIdentity = () => {
    Cookies.remove(identityCookieName);    
  }

  const authorize = async (emailAddress: string, password: string): Promise<string> => {
    console.log("authorizing...");
    
    await axiosRequest.post(authEndPoint, {
        "grant_type": "password",
        "username": emailAddress,
        "password": password
      }
    ).then(async result => {
      saveIdentity(emailAddress, result.data.role, result.data.expires_in);
      saveProvider("Local");
      return result.data.access_token;
    }
    ).catch(error => { throw error; });

    return "";
  }

  const authorizeGoogle = async (credential: string, nonce: string): Promise<string> => {
    console.log("authorizing google...");
    
    const item = jwt<any>(credential);
    await axiosRequest.post(authEndPoint, {
        "grant_type": "password",
        "username": item.email,
        "google_credential": credential
      }
    ).then(async result => {
      if (nonce != item.nonce) {
        clearIdentity();
        throw { response: { data: { errorCode: 2201, errorCodeName: ErrorCode.GoogleOAuthNonceInvalid } } };
      }

      saveIdentity(item.email, result.data.role, result.data.expires_in);
      saveProvider("Google");

      return result.data.access_token;
    }
    ).catch(error => { throw error; });

    return "";
  }

  const reauthorize = async (emailAddress: string): Promise<string> => {
    console.log("reauthorizing...");
    await axiosRequest.post(authEndPoint, {
        "grant_type": "refresh_token",
        "username": emailAddress,
        "refresh_token": "_"
      }
    ).then(async result => {      
      await saveIdentity(emailAddress, result.data.role, result.data.expires_in);
      return result.data.access_token;
    }
    ).catch(error => { throw error; });

    return "";
  }
  
  return (
    <Context.Provider value={{
      redirectUnauthenticated,
      authorize,
      authorizeGoogle,
      clearIdentity,
      getIdentity,
      getProvider,
      oauthAccessTokenLifeRemaining
    }}>{children}
    </Context.Provider>
  )
}
