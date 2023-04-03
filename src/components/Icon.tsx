import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome"
const { library, config } = require('@fortawesome/fontawesome-svg-core');
import { fas } from "@fortawesome/free-solid-svg-icons"
import "@fortawesome/fontawesome-svg-core/styles.css"

library.add(fas)
config.autoAddCss = false

interface IIcon {
  name: any,
  className?: string,
  toolTip?: string,
  onClick?: any
}

const Icon = ({ name, className, toolTip, onClick }: IIcon) => {
  return (
    <span className={`icon ${className ?? ""}`}>
      <FontAwesomeIcon title={toolTip} icon={name} onClick={onClick} />
    </span>
  )
}

export default Icon
