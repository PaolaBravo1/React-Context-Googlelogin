import "bootstrap/dist/css/bootstrap.css"
import { LayoutAuthenticated } from "layouts/LayoutAuthenticated"

const Dashboard = () => {
  return (
    <LayoutAuthenticated header="Dashboard">
      <div className="row no-gutter">
      </div>
    </LayoutAuthenticated>
  );
}

export default Dashboard