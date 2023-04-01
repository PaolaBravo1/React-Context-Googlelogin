import Link from "next/link";
import { useEffect, useState } from "react";
import Router from "next/router";
import Icon from "./Icon";
import NavItemList from "./NavItemList";
import StatusBar from "./StatusBar";
import configSettings from "../../config.json";
import HTMLReactParser from "html-react-parser";
import { ErrorCode } from "@/helpers/errorcodes";

interface IPropertyBar {
  children: any,
  entityID: number | null,
  isVisible: boolean,
  onSave: any,
  onCancel: any
}

const PropertyBar = ({ children, entityID, isVisible, onSave, onCancel }: IPropertyBar) => {    
  const [errorMessage, setErrorMessage] = useState("");
  
  const handleSubmit = async (): Promise<boolean> => {  
    if (!validate())
      return false;

    await onSave()
        .then((result: any) => {          
          onCancel();
          flashRow(entityID!);    
          return true;
      }).catch((error: any) => { 
        if (error.response)
          setErrorMessage(error.response?.data?.message); 
        else if (error == ErrorCode.ParticipantAddressBlockIncomplete) {
          setErrorMessage("Please complete all fields in the address block, or leave the fields blank.");             
        }
        return false;
      });

      return false;
  }

  const validate = (): boolean => {   
    const invalidInputs = document.getElementsByClassName("not-valid");
        
    if (invalidInputs.length > 0) {
      setErrorMessage("Please complete all the required fields.")
      return false;
    } else {      
      setErrorMessage("");
      return true;
    }
  }
  
  const flashRow = (id: number) => {
    const row = document.getElementById(`row-${id}`);

    if (row) {
      row.classList.add("flash-row");
      setTimeout(() => { row.classList.remove("flash-row")}, 750);   
    }
  }

  useEffect(() => {
    setErrorMessage("");
  }, [entityID]);

  return (
    <form onSubmit={handleSubmit}>
      <nav id="property-bar" className={`nav-bar property-bar${isVisible ? "" : " collapsed"}`}>
        <div className="collapse-button" onClick={onCancel}>
          <Icon name="angle-double-right"></Icon>
        </div>
        {children}
        <div className="row buttons">
          <div className="col-6">   
            <button disabled={false} type="button" onClick={handleSubmit} className="styled-button">Save</button> 
          </div>
          <div className="col-6">
            <button disabled={false} type="button" onClick={onCancel} className="styled-button cancel">Cancel</button> 
          </div>
        </div>
        <div className="error-message">{HTMLReactParser(errorMessage)}</div>     
      </nav>  
    </form>
  )
}

export default PropertyBar

