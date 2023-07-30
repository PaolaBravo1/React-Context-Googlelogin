import "bootstrap/dist/css/bootstrap.css"
import { AuthenticatedLayout } from "layouts/AuthenticatedLayout"

const Dashboard = () => {
  return (
    <AuthenticatedLayout header="Dashboard">
      <div className="row no-gutter">
      </div>
    </AuthenticatedLayout>
  );
}

export default Dashboard