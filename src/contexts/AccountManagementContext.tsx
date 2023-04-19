import { createContext, useContext, useState } from "react"
import { AxiosResponse } from "axios";
import { axiosRequest } from "api/api";

interface IAccountManagementContext {
  confirmAccount: (emailAddress: string, token: string) => Promise<AxiosResponse<any, any>>,
  requestPasswordReset: (emailAddress: string) => Promise<AxiosResponse<any, any>>,
  updatePassword: (emailAddress: string, password: string, token: string) => Promise<AxiosResponse<any, any>>,
  getMe: () => Promise<AxiosResponse<any, any>>
}

export const AccountManagementContext = (): IAccountManagementContext => {
  const {
    confirmAccount,
    requestPasswordReset,
    updatePassword,
    getMe    
  } = useContext(Context);

  return {    
    confirmAccount,
    requestPasswordReset,
    updatePassword,
    getMe
  };
}
    
const Context = createContext({} as IAccountManagementContext);

export function AccountManagementProvider({ children }: { children: any }) {
  const confirmAccount = async (emailAddress: string, token: string): Promise<AxiosResponse<any, any>> => {    
    return await axiosRequest.post("/account/confirm",
      JSON.stringify({ 
        emailAddress,
        token
      }));      
  }

  const requestPasswordReset = async (emailAddress: string): Promise<AxiosResponse<any, any>> => {
    return await axiosRequest.post("/account/password/reset",
      JSON.stringify({ 
        emailAddress        
      }));  
  }

  const updatePassword = async (emailAddress: string, newPassword: string, token: string): Promise<AxiosResponse<any, any>> => {
    return await axiosRequest.put("/account/password",
      JSON.stringify({ 
        emailAddress,
        newPassword,
        token
      }));     
  }
  
  const getMe = async (): Promise<AxiosResponse<any, any>> => {     
    return await axiosRequest.get("/account/me");
  }
  
  return (
    <Context.Provider value={{
      confirmAccount,
      requestPasswordReset,
      updatePassword,
      getMe,      
    }}>{children}
    </Context.Provider>
  )
}
