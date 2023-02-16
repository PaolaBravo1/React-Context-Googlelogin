import { createContext, FunctionComponent, PropsWithChildren, useContext, useState, useEffect } from 'react'
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import Router from "next/router";
import configSettings from "../../config.json";

const authHeaderKey = "Authorization";
const contentTypeHeaderKey = "Content-Type";
const emailAddressCookieName = "hammer_username";
const accessTokenCookieName = "hammer_access_token";
const refreshTokenCookieName = "hammer_refresh_token";
const expirationCookieName = "hammer_expiration";
const authEndPoint = "/oauth/authorize";

var authTimer: ReturnType<typeof setTimeout>;
var authTimerCountdown: ReturnType<typeof setInterval>;

interface ContextInterface {
  authorize: (emailAddress: string, password: string) => Promise<string>,
  reauthorize: (emailAddress: string, refreshToken: string) => Promise<string>,
  confirmAccount: (emailAddress: string, token: string) => Promise<AxiosResponse<any, any>>,
  requestPasswordReset: (emailAddress: string) => Promise<AxiosResponse<any, any>>,
  updatePassword: (emailAddress: string, password: string, token: string) => Promise<AxiosResponse<any, any>>,
  register: (firstName: string, lastName: string, emailAddress: string, password: string) => Promise<AxiosResponse<any, any>>,
  getMe: () => Promise<AxiosResponse<any, any>>,
  clearOAuthCookies: () => void,

  oauthAccessTokenLifetime: number
}

export const useAuthentication = (): ContextInterface => {
  const { 
    authorize,
    reauthorize,
    confirmAccount,
    requestPasswordReset,
    updatePassword,
    register,
    getMe,
    clearOAuthCookies,

    oauthAccessTokenLifetime
  } = useContext(AuthenticationContext); 
  
  return {
    authorize,
    reauthorize,
    confirmAccount,
    requestPasswordReset,
    updatePassword,
    register,
    getMe,
    clearOAuthCookies,

    oauthAccessTokenLifetime
  };
}

export const AuthenticationContext = createContext({} as ContextInterface);

export function AuthenticationProvider({ children }: {children:any}) {
  const [oauthAccessTokenLifetime, setOAuthAccessTokenLifetime] = useState(0);
  
  let instance = axios.create({
    baseURL: configSettings.apiRootUrl
  });

  instance.interceptors.request.use((config) => {
    const emailAddress = Cookies.get(emailAddressCookieName);
    const accessToken = Cookies.get(accessTokenCookieName);
    const refreshToken = Cookies.get(refreshTokenCookieName);
    const expiration = Cookies.get(expirationCookieName);

    if (emailAddress && accessToken && refreshToken && expiration) {
      if (!authTimer)
        restartTimers(emailAddress, refreshToken, expiration);

      if (accessToken)
        config.headers[authHeaderKey] = `Bearer ${accessToken}`;
      else {
        config.headers[authHeaderKey] = null;
        delete config.headers[authHeaderKey];
      }

      config.headers[contentTypeHeaderKey] = "application/x-www-form-urlencoded";
    } 
    
    return config;    
  });

  const restartTimers = (emailAddress: string, refreshToken: string, expiration: string) => {
    clearTimeout(authTimer);
    clearInterval(authTimerCountdown);

    const ttl = getOAuthTokenTtl(Date.parse(expiration));

    authTimer = setTimeout(() => {
      reauthorize(emailAddress, refreshToken);
    }, ttl);

    authTimerCountdown = setInterval(function () {
      const countdown = (Date.parse(expiration) - (new Date()).getTime()) / 1000;   
      setOAuthAccessTokenLifetime(100.0 * countdown / configSettings.oauthAccessTokenTimeout);
    }, 1000);   
  }

  const getOAuthTokenTtl = (expiration: number): number => {
    let margin = configSettings.oauthAccessTokenTimeout * configSettings.oauthAccessTokenRefreshMarginPercent / 100;

    if (margin < configSettings.oauthAccessTokenMinimumRefreshMargin)
      margin = configSettings.oauthAccessTokenMinimumRefreshMargin;

    let ttl = (expiration - margin * 1000) - new Date().getTime();
    return ttl;
  }

  const saveOAuthToken = async (emailAddress: string, accessToken: string, refreshToken: string, expiresInSeconds: number) => {
    const expiration = new Date(new Date().getTime() + expiresInSeconds * 1000).toISOString();
    const expiresInDays = (expiresInSeconds) / 60 / 60 / 24;
    const params = { domain: configSettings.cookieDomain, secure: true, expires: expiresInDays };

    Cookies.set(emailAddressCookieName, emailAddress, params);
    Cookies.set(accessTokenCookieName, accessToken, params);
    Cookies.set(refreshTokenCookieName, refreshToken, params);
    Cookies.set(expirationCookieName, expiration, params);

    restartTimers(emailAddress, refreshToken, expiration);
  }

  const clearOAuthCookies = () => {
    Cookies.remove(emailAddressCookieName);
    Cookies.remove(accessTokenCookieName);
    Cookies.remove(refreshTokenCookieName);
    Cookies.remove(expirationCookieName);
  }

  // todo figure out async return promise or not?
  const authorize = async (emailAddress: string, password: string): Promise<string> => {
    console.log('authorizing....');
    await instance.post(authEndPoint,
      new URLSearchParams({
        grant_type: "password",
        username: emailAddress,
        password: password
      })
    ).then(async result => {
      await saveOAuthToken(emailAddress, result.data.access_token, result.data.refresh_token, result.data.expires_in);
      return result.data.access_token;
    }
    ).catch(error => { alert(JSON.stringify(error)); throw error; });

    return "";
  }

  const reauthorize = async (emailAddress: string, refreshToken: string): Promise<string> => {
    console.log('reauthorizing....');
    await instance.post(authEndPoint,
      new URLSearchParams({
        grant_type: "refresh_token",
        username: emailAddress,
        refresh_token: refreshToken
      })
    ).then(async result => {
      await saveOAuthToken(emailAddress, result.data.access_token, result.data.refresh_token, result.data.expires_in);
      return result.data.access_token;
    }
    ).catch(error => { alert(JSON.stringify(error)); throw error; });

    return "";
  }

  const confirmAccount = async (emailAddress: string, token: string): Promise<AxiosResponse<any, any>> => {
    return await instance.post("/account/confirm",
      new URLSearchParams({
        emailAddress: emailAddress,
        token: token
      })
    );
  }

  const requestPasswordReset = async (emailAddress: string): Promise<AxiosResponse<any, any>> => {
    return await instance.post("/account/password/reset",
      new URLSearchParams({
        emailAddress: emailAddress
      })
    );
  }

  const updatePassword = async (emailAddress: string, password: string, token: string): Promise<AxiosResponse<any, any>> => {
    return await instance.put("/account/password",
      new URLSearchParams({
        emailAddress: emailAddress,
        newPassword: password,
        token: token
      })
    );
  }

  const register = async (firstName: string, lastName: string, emailAddress: string, password: string): Promise<AxiosResponse<any, any>> => {
    if (password.length == 0) {
      return await instance.post("/participant",
        new URLSearchParams({
          firstName,
          lastName,
          emailAddress
        })
      );
    }
    else {
      return await instance.post("/participant",
        new URLSearchParams({
          firstName,
          lastName,
          emailAddress,
          password
        })
      );
    }
  }

  const getMe = async (): Promise<AxiosResponse<any, any>> => {
    return await instance.get("/account/me");
  }    

  return (
    <AuthenticationContext.Provider value={{
      authorize,
      reauthorize,
      confirmAccount,
      requestPasswordReset,
      updatePassword,
      register,
      getMe,
      clearOAuthCookies,

      oauthAccessTokenLifetime
    }}>{children}
    </AuthenticationContext.Provider>
  )
}
