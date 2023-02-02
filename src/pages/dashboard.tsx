import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css'
import TextInput from '@/components/TextInput'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import * as api from 'services/api'
import Link from 'next/link'
import Head from 'next/head'
import HTMLReactParser from 'html-react-parser'

const Dashboard = () => {
  
  const [content, setContent] = useState("");
  
  useEffect(() => {
    api.getMe()
    .then(result => 
      {                    
        setContent(JSON.stringify(result))
      }
    )
    .catch(error => {        
      
        if (error?.response?.data?.errorCodeName != null)
        {
          setContent(JSON.stringify(error.response.data))
        }
        else
          setContent(JSON.stringify(error))
       
      });    

  }, []);
  return (
    <>
    <Head>
      <title>Hammerbeam</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div id="dashboard" className="auth-container">
      <div className="container-fluid">
        <div className="row no-gutter">
          {HTMLReactParser(content)}
        </div>
      </div>
    </div>
  </>
  );
}


export default Dashboard