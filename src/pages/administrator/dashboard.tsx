import "bootstrap/dist/css/bootstrap.css"
import { LayoutAuthenticated } from "components/LayoutAuthenticated"

export const Dashboard = () => {
  return (
    <LayoutAuthenticated header="Dashboard">
      <div className="row no-gutter">
      </div>
    </LayoutAuthenticated>
  );
}
