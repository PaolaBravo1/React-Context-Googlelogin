import { createContext, useContext, useState } from "react"
import { AxiosResponse } from "axios";
import jwt from "jwt-decode"
import { ErrorCode } from "helpers/errorcodes"
import { Participant } from "models/Participant";
import { axiosRequest } from "api/api";

interface IParticipantContext {
  register: (firstName: string, lastName: string, emailAddress: string, password: string) => Promise<AxiosResponse<any, any>>,
  registerGoogle: (credential: string, nonce: string) => Promise<string>,
  search: (terms: string) => Promise<AxiosResponse<Participant[], any>>,
  update: (participant: Participant) => Promise<AxiosResponse<any, any>>,
}

export const ParticipantContext = (): IParticipantContext => {
  const {
    register,
    registerGoogle,
    search,
    update
  } = useContext(Context);

  return {
    register,
    registerGoogle,
    search,
    update
  };
}
    
const Context = createContext({} as IParticipantContext);

export function ParticipantProvider({ children }: { children: any }) {

  const register = async (firstName: string, lastName: string, emailAddress: string, password: string): Promise<AxiosResponse<any, any>> => {
    if (password.length == 0) {
      return await axiosRequest.post("/participant/register",
        JSON.stringify({ 
          firstName,
          lastName,
          emailAddress
        }));             
    }
    else {
      return await axiosRequest.post("/participant/register",
        JSON.stringify({ 
          firstName,
          lastName,
          emailAddress,
          password
        }));   
    }
  }

  const registerGoogle = async (credential: string, nonce: string): Promise<string> => {
    const item = jwt<any>(credential);

    await axiosRequest.post("/participant/register",
      JSON.stringify({ 
        firstName: item.given_name,
        lastName: item.family_name,
        emailAddress: item.email,
        googleCredential: credential
      })   
    ).then(async result => {
      if (nonce != item.nonce) {
        throw { response: { data: { errorCode: 2201, errorCodeName: ErrorCode.GoogleOAuthNonceInvalid } } };
      }
      return "";
    }
    ).catch(error => { throw error;});
    return ""; 
  }

  const search = async (terms: string): Promise<AxiosResponse<Participant[], any>> => {
    return await axiosRequest.post("/participant/search",
      JSON.stringify({ 
        terms 
      }));     
  }

  const update = async (participant: Participant): Promise<AxiosResponse<any, any>> => {    
    if (participant.id != undefined)
      return await axiosRequest.put(`/participant/${participant.id}` + participant.id, participant);   
    else
      return await axiosRequest.post("/participant", participant);         
  }
  
  return (
    <Context.Provider value={{
      register,
      registerGoogle,
      search,
      update      
    }}>{children}
    </Context.Provider>
  )
}
