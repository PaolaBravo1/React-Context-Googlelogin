import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

interface IStatusBar {
  id: string,
  icon: string,
  warningAt: number
  complete: number  
}

const StatusBar = ({ id, icon, warningAt, complete }: IStatusBar) => {
  return (
  <div className="status-bar" id={id}>
    <Icon name={icon} className={(complete < warningAt) ? " strobe" : ""} />
    <span className="status-bar-complete" style={{width: complete + "%"}}></span>
  </div>
  )
}

export default StatusBar
