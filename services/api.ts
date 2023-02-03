import axios from "axios";
import Cookies from "js-cookie";
import configSettings from '../config.json';

const DEBUG = process.env.NODE_ENV === "development";
const rootUrl = configSettings.apiRootUrl;

var ip = require('ip');


axios.interceptors.request.use((config) => {
    console.log("client ip: " + ip.address());
    return config;
}, (error) => {  
    return Promise.reject(error);
});

const defaultHeader = { "Content-Type": "application/x-www-form-urlencoded" };

export class ApiException extends Error {
    constructor(apiException: any) {
      super(apiException.message);
      this.name = apiException.errorCodeName;
    }
}
  
const getOAuthHeader = () => {
  var token = Cookies.get("access");
  var header = { "Content-Type": "application/x-www-form-urlencoded", "Authorization": "Bearer " + token };

  return header;
};

export const getMe = async (): Promise<any> => {
  
  return await axios.get(rootUrl + "/account/me",
    { headers: getOAuthHeader() }
  );
}

export const authorize = async (emailAddress: string, password: string): Promise<any> => {

    return await axios.post(rootUrl + "/oauth/authorize",
        new URLSearchParams({
            grant_type: "password",
            username: emailAddress,
            password: password
        }),
        { headers: defaultHeader}
    );
}

export const confirmAccount = async (emailAddress: string, token: string): Promise<any> => {

  return await axios.post(rootUrl + "/account/confirm",
      new URLSearchParams({
          emailAddress: emailAddress,
          token: token
      }),
      { headers: defaultHeader}
  );
}

export const requestPasswordReset = async (emailAddress: string): Promise<any> => {

  return await axios.post(rootUrl + "/account/password/reset",
      new URLSearchParams({
          emailAddress: emailAddress
      }),
      { headers: defaultHeader}
  );
}

export const setPassword = async (emailAddress: string,  password: string, token: string): Promise<any> => {

  return await axios.put(rootUrl + "/account/password",
      new URLSearchParams({
          emailAddress: emailAddress,
          newPassword: password, 
          token: token
      }),
      { headers: defaultHeader}
  );
}

export const register = async (firstName: string, lastName: string, emailAddress: string, password: string): Promise<any> => {

  if (password.length == 0)
  {
    return await axios.post(rootUrl + "/participant",
        new URLSearchParams({
            firstName,
            lastName,
            emailAddress
        }),
        { headers: defaultHeader}
    );
  }
  else
  {
    return await axios.post(rootUrl + "/participant",
      new URLSearchParams({
          firstName,
          lastName,
          emailAddress,
          password
      }),
      { headers: defaultHeader}
  );
  }
}
