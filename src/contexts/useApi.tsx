import { createContext, FunctionComponent, PropsWithChildren, useContext, useState, useEffect } from 'react'
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import Router from "next/router";
import configSettings from "../../config.json";
import jwt from 'jwt-decode'
import { ErrorCode } from '@/helpers/errorcodes';
import { Identity } from '@/models/identity';

const authHeaderKey = "Authorization";
const contentTypeHeaderKey = "Content-Type";
const identityCookieName = "hammer_identity";
const providerCookieName = "hammer_provider";
const authEndPoint = "/oauth/authorize";

var authTimer: ReturnType<typeof setTimeout>;
var authTimerCountdown: ReturnType<typeof setInterval>;

interface ContextInterface {
  redirectUnauthenticated: () => void,
  authorize: (emailAddress: string, password: string) => Promise<string>,
  authorizeGoogle: (credential: string, nonce: string) => Promise<string>,
  reauthorize: (emailAddress: string, provider: string, refreshToken: string) => Promise<string>,
  confirmAccount: (emailAddress: string, token: string) => Promise<AxiosResponse<any, any>>,
  requestPasswordReset: (emailAddress: string) => Promise<AxiosResponse<any, any>>,
  updatePassword: (emailAddress: string, password: string, token: string) => Promise<AxiosResponse<any, any>>,
  register: (firstName: string, lastName: string, emailAddress: string, password: string) => Promise<AxiosResponse<any, any>>,
  registerGoogle: (credential: string, nonce: string) => Promise<string>,
  getMe: () => Promise<AxiosResponse<any, any>>,
  getParticipants: () => Promise<AxiosResponse<any, any>>,
  clearIdentity: () => void,
  getIdentity: () => Identity | null,
  getProvider: () => string,

  oauthAccessTokenLifeRemaining: number,
  isMakingRequest: boolean
}

export const useApi = (): ContextInterface => {
  const {
    redirectUnauthenticated,
    authorize,
    authorizeGoogle,
    reauthorize,
    confirmAccount,
    requestPasswordReset,
    updatePassword,
    register,
    registerGoogle,
    getMe,
    getParticipants,
    clearIdentity,
    getIdentity,
    getProvider,

    oauthAccessTokenLifeRemaining,
    isMakingRequest
  } = useContext(AuthenticationContext);

  return {
    redirectUnauthenticated,
    authorize,
    authorizeGoogle,
    reauthorize,
    confirmAccount,
    requestPasswordReset,
    updatePassword,
    register,
    registerGoogle,
    getMe,
    getParticipants,
    clearIdentity,
    getIdentity,
    getProvider,

    oauthAccessTokenLifeRemaining,
    isMakingRequest
  };
}

export const AuthenticationContext = createContext({} as ContextInterface);

export function AuthenticationProvider({ children }: { children: any }) {
  const [oauthAccessTokenLifeRemaining, setOAuthAccessTokenLifeRemaining] = useState(100);
  const [isMakingRequest, setIsMakingRequest] = useState(false);

  let instance = axios.create({
    baseURL: configSettings.apiRootUrl
  });

  instance.interceptors.request.use((config) => {
    setIsMakingRequest(true);

    const identity = getIdentity();

    if (identity != null) {
      if (!authTimer)
        restartTimers(identity);

      config.headers[authHeaderKey] = `Bearer ${identity.accessToken}`;
      config.headers[contentTypeHeaderKey] = "application/x-www-form-urlencoded";
    }

    return config;
  }, (error) => {
    setIsMakingRequest(false);
    return Promise.reject(error);
  });

  instance.interceptors.response.use((config) => {
    setIsMakingRequest(false);
    return config;
  }, (error) => {
    setIsMakingRequest(false);
    return Promise.reject(error);
  });

  const redirectUnauthenticated = () => {
    if (Router.pathname.indexOf("/login") < 0)
      Router.push("/login?" + encodeURIComponent(Router.pathname.toString()));
    else
      Router.push("/login");
  }

  const restartTimers = (identity: Identity) => {
    clearTimeout(authTimer);
    clearInterval(authTimerCountdown);

    const ttl = getOAuthTokenTtl(Date.parse(identity.expiration));

    authTimer = setTimeout(() => {
      reauthorize(identity.emailAddress, identity.refreshToken);
    }, ttl);

    authTimerCountdown = setInterval(function () {
      const countdown = (Date.parse(identity.expiration) - (new Date()).getTime()) / 1000;
      setOAuthAccessTokenLifeRemaining(100.0 * countdown / configSettings.oauthAccessTokenTimeout);
    }, 1000);
  }

  const getIdentity = (): Identity | null => {
    const identityCookie = Cookies.get(identityCookieName);

    if (identityCookie) {
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

  const setProvider = (provider: string) => {
    const params = { domain: configSettings.cookieDomain, secure: true, expires: 365 };
    Cookies.set(providerCookieName, provider, params);
  }

  const getOAuthTokenTtl = (expiration: number): number => {
    let margin = configSettings.oauthAccessTokenTimeout * configSettings.oauthAccessTokenRefreshMarginPercent / 100;

    if (margin < configSettings.oauthAccessTokenMinimumRefreshMargin)
      margin = configSettings.oauthAccessTokenMinimumRefreshMargin;

    const ttl = (expiration - margin * 1000) - new Date().getTime();
    return ttl;
  }

  const saveIdentity = async (emailAddress: string, role: string, accessToken: string, refreshToken: string, expiresInSeconds: number) => {
    const expiration = new Date(new Date().getTime() + expiresInSeconds * 1000).toISOString();
    const expiresInDays = (expiresInSeconds) / 60 / 60 / 24;
    const params = { domain: configSettings.cookieDomain, secure: true, expires: expiresInDays };

    var identity = new Identity(emailAddress, role, accessToken, refreshToken, null, expiration);
    Cookies.set(identityCookieName, JSON.stringify(identity), params);

    restartTimers(identity);
  }

  const clearIdentity = () => {
    Cookies.remove(identityCookieName);
  }

  const authorize = async (emailAddress: string, password: string): Promise<string> => {
    console.log("authorizing...");
    await instance.post(authEndPoint,
      new URLSearchParams({
        grant_type: "password",
        username: emailAddress,
        password: password
      })
    ).then(async result => {
      await saveIdentity(emailAddress, result.data.role, result.data.access_token, result.data.refresh_token, result.data.expires_in);
      setProvider("Local");

      return result.data.access_token;
    }
    ).catch(error => { throw error; });

    return "";
  }

  const authorizeGoogle = async (credential: string, nonce: string): Promise<string> => {
    console.log("authorizing google...");
    const item = jwt<any>(credential);
    await instance.post(authEndPoint,
      new URLSearchParams({
        grant_type: "password",
        username: item.email,
        google_credential: credential
      })
    ).then(async result => {
      if (nonce != item.nonce) {
        clearIdentity();
        throw { response: { data: { errorCode: 2201, errorCodeName: ErrorCode.GoogleOAuthNonceInvalid } } };
      }

      await saveIdentity(item.email, result.data.role, result.data.access_token, result.data.refresh_token, result.data.expires_in);
      setProvider("Google");

      return result.data.access_token;
    }
    ).catch(error => { throw error; });

    return "";
  }

  const reauthorize = async (emailAddress: string, refreshToken: string): Promise<string> => {
    console.log("reauthorizing...");
    await instance.post(authEndPoint,
      new URLSearchParams({
        grant_type: "refresh_token",
        username: emailAddress,
        refresh_token: refreshToken
      })
    ).then(async result => {
      await saveIdentity(emailAddress, result.data.role, result.data.access_token, result.data.refresh_token, result.data.expires_in);
      return result.data.access_token;
    }
    ).catch(error => { throw error; });

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
    setProvider("Local");

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

  const registerGoogle = async (credential: string, nonce: string): Promise<string> => {
    setProvider("Google");
    const item = jwt<any>(credential);

    return await instance.post("/participant",
      new URLSearchParams({
        firstName: item.given_name,
        lastName: item.family_name,
        emailAddress: item.email,
        googleCredential: credential
      })
    ).then(async result => {
      if (nonce != item.nonce) {
        clearIdentity();
        throw { response: { data: { errorCode: 2201, errorCodeName: ErrorCode.GoogleOAuthNonceInvalid } } };
      }
      return "";
    }
    ).catch(error => { throw error; });
    ;
  }

  const getMe = async (): Promise<AxiosResponse<any, any>> => {
    return await instance.get("/account/me");
  }

  const getParticipants = async (): Promise<AxiosResponse<any, any>> => {
    return await instance.get("/participant/list?pageIndex=0&pageSize=100");
  }

  return (
    <AuthenticationContext.Provider value={{
      redirectUnauthenticated,
      authorize,
      authorizeGoogle,
      reauthorize,
      confirmAccount,
      requestPasswordReset,
      updatePassword,
      register,
      registerGoogle,
      getMe,
      getParticipants,
      clearIdentity,
      getIdentity,
      getProvider,

      oauthAccessTokenLifeRemaining,
      isMakingRequest
    }}>{children}
    </AuthenticationContext.Provider>
  )
}
