import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

interface INavItem {
  label: string,
  icon: string,
  href?: string;
}

const NavItem = ({ label, icon, href=""}: INavItem) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const location = window.location.pathname;
    setIsActive(location === href);
  }, []);
  
  return (
    <li className="nav-item">
      <Link className={`nav-link${isActive ? " active" : ""}${href == "" ? " disabled-links": "" }`} to={href}>
        <Icon toolTip={label} name={icon} />
      </Link>
    </li>
  )
}

export default NavItem