import NavItem from "./NavItem";

interface INavItemList {
  role: string
}

const NavItemList = ({ role }: INavItemList) => {
  switch (role) {
    case "Administrator":
      return (
        <ul className="nav flex-column">
          <NavItem label="Dashboard" iconName="home" href="/administrator/dashboard"></NavItem>
          <NavItem label="Participants" iconName="users" href="/administrator/participants"></NavItem>
          <NavItem label="Sign-ins" iconName="sign-in" href="/administrator/signins"></NavItem>
        </ul>
      )

    case "Participant":
      return (
        <ul className="nav flex-column">
          <NavItem label="Dashboard" iconName="users" href="/participant/dashboard"></NavItem>
        </ul>
      )
    
    default: 
        return <></>
  }
}

export default NavItemList