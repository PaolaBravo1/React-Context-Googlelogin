import Link from "next/link";
import { useEffect, useState } from "react";
import Router from "next/router";
import Icon from "./Icon";

interface INavItem {
  label: string,
  iconName: string,
  href: string;
}

const NavItem = ({ label, iconName, href }: INavItem) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    setIsActive(Router.pathname === href);
  }, []);
  
  return (
    <li className="nav-item">
      <Link className={`nav-link${isActive ? " active" : ""}`} href={href}>
        <Icon name={iconName} />
        <span className="ml-2">{label}</span>
      </Link>
    </li>
  )
}

export default NavItem
