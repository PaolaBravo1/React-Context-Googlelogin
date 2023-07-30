import { createContext, useContext, useState } from "react"
import { AxiosResponse } from "axios";
import { axiosRequest } from "api/api";
import { Account } from "@/models/Account";

interface IAdministratorContext {
    getAuthenticatedAccounts: () => Promise<AxiosResponse<Account[], any>>
}

export const AdministratorContext = (): IAdministratorContext => {
  const {
    getAuthenticatedAccounts
  } = useContext(Context);

  return {    
    getAuthenticatedAccounts
  };
}
    
const Context = createContext({} as IAdministratorContext);

export function AdministratorProvider({ children }: { children: any }) {  
  const getAuthenticatedAccounts = async (): Promise<AxiosResponse<Account[], any>> => {
    return await axiosRequest.get("/account/authenticated");
  }

  return (
    <Context.Provider value={{
      getAuthenticatedAccounts  
    }}>{children}
    </Context.Provider>
  )
}
