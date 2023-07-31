import Icon from "./Icon";

interface IStatusDonut {
  id: string,
  label: string
  icon: string,
  warningAt: number
  complete: number  
}

const StatusDonut = ({ id, label, icon, warningAt, complete }: IStatusDonut) => {
  return (
    <li className={`status-donut donut${(complete < warningAt) ? " strobe" : ""}`} style={{ background: `conic-gradient(#6c757d 0deg ${3.6 * (100-complete)}deg, #79b1ff ${3.6 * (100-complete)}deg 360deg)`}}>
      <div className="hole"></div>
      <Icon toolTip={label} name={icon} />      
    </li>
  )
}

export default StatusDonut