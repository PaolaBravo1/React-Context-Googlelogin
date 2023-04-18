import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icon";

interface INavItem {
  label: string,
  iconName: string,
  href: string;
}

export const NavItem = ({ label, iconName, href }: INavItem) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const location = window.location.search;
    setIsActive(location === href);
  }, []);
  
  return (
    <li className="nav-item">
      <Link className={`nav-link${isActive ? " active" : ""}`} to={href}>
        <Icon name={iconName} />
        <span className="ml-2">{label}</span>
      </Link>
    </li>
  )
}
