import Link from "next/link";
import { useEffect, useState } from "react";
import Router from "next/router";
import Icon from "./Icon";
import NavItemList from "./NavItemList";
import StatusBar from "./StatusBar";
import configSettings from "../../config.json";

interface IPropertyBar {
  children: any,
  isVisible: boolean
}

const PropertyBar = ({ children, isVisible }: IPropertyBar) => {    
  return (
    <nav id="property-bar" className={`nav-bar property-bar${isVisible ? "" : " collapsed"}`}>
      {children}
    </nav>  
  )
}

export default PropertyBar
