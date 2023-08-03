import NavItem from "./NavItem";

interface INavItemList {
  role: string
}

const NavItemList = ({ role }: INavItemList) => {
  switch (role) {
    case "Administrator":
      return (
        <ul className="nav flex-column">
          <NavItem label="Dashboard" icon="home" href="/administrator/dashboard"></NavItem>
          <NavItem label="Participants" icon="users" href="/administrator/participants"></NavItem>
          <NavItem label="Current sign-ins" icon="network-wired" href="/administrator/signins"></NavItem>   
        </ul>
      )

    case "Participant":
      return (
        <ul className="nav flex-column">
          <NavItem label="Dashboard" icon="users"></NavItem>
        </ul>
      )
    
    default: 
        return <></>
  }
}

export default NavItemList