import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css'
import { useEffect, useState } from 'react'
import HTMLReactParser from 'html-react-parser'
import { useAuthentication } from '../contexts/useAuthentication'
import LayoutAuthenticated from '@/components/LayoutAuthenticated'
import Icon from '@/components/Icon'

const Dashboard = () => {  
  const [content, setContent] = useState("");
  const { getMe } = useAuthentication();
  
  useEffect(() => {
    async() => {
      getMe()
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
  }, []);

  return (
    <LayoutAuthenticated>                      
      <div className="row no-gutter">
        {HTMLReactParser(content)}
      </div>      
    </LayoutAuthenticated>  
  );
}

export default Dashboard

