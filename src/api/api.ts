import { faClosedCaptioning } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Cookies from "js-cookie";
import { Identity } from "models/Identity";
import { setTimers } from "react-idle-timer/dist/utils/timers";
import configSettings from "settings/config.json";

const authHeaderKey = "Authorization";
const contentTypeHeaderKey = "Content-Type";
const authEndPoint = "/oauth/authorize";
const identityCookieName = "hammer_identity";
const providerCookieName = "hammer_provider";

var overlayTimer: ReturnType<typeof setTimeout>;
let apiRootUrl = configSettings.ApiRootUrl;

/* todo there has to be a way to deploy this via azure application settings */

if (window.location.hostname.startsWith("web-01"))
  apiRootUrl = "https://api-01.hammerbeam.com";
else if (window.location.hostname.startsWith("web-02"))
  apiRootUrl = "https://api-02.hammerbeam.com";
else if (window.location.hostname.startsWith("web-03"))
  apiRootUrl = "https://api-03.hammerbeam.com";

console.log("apirooturl: " + apiRootUrl);

export const axiosRequest = axios.create({
  baseURL: apiRootUrl,
  withCredentials: true
});

export const restartIdentityTimer = () => {
  const identity = getIdentity();
}

export const getIdentity = (): Identity | null => {
  const identityCookie = Cookies.get(identityCookieName);
  
  if (identityCookie != undefined) {
    const identity = Identity.parse(identityCookie);

    if (identity)
      return identity;
  }

  return null;
}

const showOverlay = (isMakingRequest: boolean) => {
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
  let isShowOverlay = true;

  if (config.url == authEndPoint) {
    config.headers[contentTypeHeaderKey] = "application/x-www-form-urlencoded";
  } else {
    config.headers[contentTypeHeaderKey] = "application/json";
  } 

  if (config.url == authEndPoint && config?.data?.refresh_token !== undefined)
    isShowOverlay = false;
   
  showOverlay(isShowOverlay); 
  return config;
}, (error) => {
  showOverlay(false);
  return Promise.reject(error);
});

axiosRequest.interceptors.response.use((config) => {
  showOverlay(false);
  return config;
}, (error) => {
  showOverlay(false);
  return Promise.reject(error);
});

