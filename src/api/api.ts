import axios from "axios";
import configSettings from "config.json";
import Cookies from "js-cookie";
import { Identity } from "models/Identity";
import { setTimers } from "react-idle-timer/dist/utils/timers";

const authHeaderKey = "Authorization";
const contentTypeHeaderKey = "Content-Type";
const authEndPoint = "/oauth/authorize";
const identityCookieName = "hammer_identity";
const providerCookieName = "hammer_provider";

var overlayTimer: ReturnType<typeof setTimeout>;

export const axiosRequest = axios.create({
  baseURL: configSettings.apiRootUrl
});

export const restartIdentityTimer = () => {
  const identity = getIdentity();
  // todo ???
}

export const getIdentity = (): Identity | null => {
  const identityCookie = Cookies.get(identityCookieName);

  if (identityCookie) {
    const identity = Identity.parse(identityCookie);

    if (identity)
      return identity;
  }

  return null;
}

const setIsMakingRequest = (isMakingRequest: boolean) => {
  // right place for this?
  const overlay = document.getElementById("overlay");

  if (!overlay)
    return;

  if (isMakingRequest) {
    overlayTimer = setTimeout(() => {
      overlay.classList.add("enabled");
    }, 500);
  } else {
    clearTimeout(overlayTimer);
    overlay.classList.remove("enabled");
  }
}

axiosRequest.interceptors.request.use((config) => {
  const identity = getIdentity();

  if (config.url == authEndPoint) {
    config.headers[contentTypeHeaderKey] = "application/x-www-form-urlencoded";
  } else {
    config.headers[contentTypeHeaderKey] = "application/json";

    if (identity)
      config.headers[authHeaderKey] = `Bearer ${identity.accessToken}`;
  } 
 
  setIsMakingRequest(true); 
  return config;
}, (error) => {
  setIsMakingRequest(false);
  return Promise.reject(error);
});

axiosRequest.interceptors.response.use((config) => {
  setIsMakingRequest(false);
  return config;
}, (error) => {
  setIsMakingRequest(false);
  return Promise.reject(error);
});

