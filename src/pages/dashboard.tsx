import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css'
import TextInput from '@/components/TextInput'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import HTMLReactParser from 'html-react-parser'
import { useAuthentication } from '../contexts/useAuthentication';
import LayoutAuthenticated from '@/components/LayoutAuthenticated'

const Dashboard = () => {  
  const [content, setContent] = useState("");
  const {getMe, oauthAccessTokenLifetime} = useAuthentication();
  
  useEffect(() => {
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

  }, []);

  return (
    <LayoutAuthenticated>                      
      <div className="row no-gutter">
        <div>{oauthAccessTokenLifetime}</div>
        {HTMLReactParser(content)}
      </div>      
    </LayoutAuthenticated>  
  );
}

export default Dashboard

