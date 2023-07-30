import "bootstrap/dist/css/bootstrap.css"
import { useEffect, useState } from "react"
import { AuthenticationContext } from "contexts/AuthenticationContext"
import { AuthenticatedLayout } from "layouts/AuthenticatedLayout"
import { AccountManagementContext } from "contexts/AccountManagementContext"

const Dashboard = () => {  
  const [content, setContent] = useState("");
  
  const { getMe } = AccountManagementContext();
  
  useEffect(() => {   
    const asyncGetDashboard = async () => {    
      await getMe()
      .then(result => {          
          setContent(JSON.stringify(result.data))
        }
      )
      .catch(error => {        
          if (error?.response?.data?.errorCodeName != null)
            setContent(JSON.stringify(error.response.data))
          else
            setContent(JSON.stringify(error))       
        });    
    }    

    asyncGetDashboard();
  }, []);

  return (
    <AuthenticatedLayout header="Dashboard">                      
      <div className="row no-gutter">       
      </div>      
    </AuthenticatedLayout>  
  );
}

export default Dashboard
