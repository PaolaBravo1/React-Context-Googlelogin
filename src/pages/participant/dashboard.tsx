import "bootstrap/dist/css/bootstrap.css"
import { useEffect, useState } from "react"
import { useApi } from "contexts/useApi"
import { LayoutAuthenticated } from "components/LayoutAuthenticated"

export const Dashboard = () => {  
  const [content, setContent] = useState("");
  
  const { getMe } = useApi();
  
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
    <LayoutAuthenticated header="Dashboard">                      
      <div className="row no-gutter">       
      </div>      
    </LayoutAuthenticated>  
  );
}


