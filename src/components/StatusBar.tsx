import { Icon } from "./Icon";

interface IStatusBar {
  id: string,
  icon: string,
  warningAt: number
  complete: number  
}

export const StatusBar = ({ id, icon, warningAt, complete }: IStatusBar) => {
  return (
  <div className={`status-bar ${(complete < warningAt) ? " strobe" : ""}`} id={id}>
    <Icon name={icon} />
    <span className="status-bar-complete" style={{width: complete + "%"}}></span>
  </div>
  )
}
