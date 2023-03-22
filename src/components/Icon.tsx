import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome"
const { library, config } = require('@fortawesome/fontawesome-svg-core');
import { fas } from "@fortawesome/free-solid-svg-icons"
import "@fortawesome/fontawesome-svg-core/styles.css"

library.add(fas)
config.autoAddCss = false

interface IIcon {
  name: any,
  className?: string
}

const Icon = ({ name, className }: IIcon) => {
  return (
    <span className="icon">
      <FontAwesomeIcon className={className} icon={name} />
    </span>
  )
}

export default Icon
