import HTMLReactParser from "html-react-parser";
import Head from "next/head";
import configSettings from "../../config.json";
import { useApi } from "@/contexts/useApi";

interface ILayoutUnauthenticated {
    children: any,
    id: string,
    title: string,
    message: string,
    errorMessage: string,
    reversed?: boolean
}

const LayoutUnauthenticated = ({children, id, title, message, errorMessage, reversed=false}: ILayoutUnauthenticated) => {    
  const { isMakingRequest } = useApi();
  
  return (
    <>
    <Head>
      <title>Hammerbeam</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Lato" rel="preload" as="style"/>
      <link href="https://fonts.googleapis.com/css2?family=Lato&display=swap" rel="stylesheet" media="print" />
      <noscript>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato&display=swap" />
      </noscript>
    </Head>
    <div id={id} className={`unauth-container ${isMakingRequest ? "making-api-request" : ""}`}>
      <div className="container-fluid">
        <div className="row no-gutter">
          {reversed ? <></> :
          <div className="col-md-6 d-none d-md-flex bg-image" style={{ backgroundImage: `url("/unauthenticated/${id}.jpg")` }}></div>
          }  
          <div className="col-md-6 bg-light-ex">
            <div className="login d-flex align-items-center py-5">
              <div className="container">
                <div className="row">
                  <div className="col-lg-10 col-xl-7 mx-auto">
                    <h3 className="display-4">{title}</h3>
                    <p className={"muted mb-4"}>{message}</p>
                    <div className="error-message">{HTMLReactParser(errorMessage)}</div>                              
                    <main>{children}</main>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!reversed ? <></> :
          <div className="col-md-6 d-none d-md-flex bg-image" style={{ background: `url("/unauthenticated/${id}.jpg")` }}></div>
          }   
        </div>
      </div>
    </div>
  </>
  );
}

export default LayoutUnauthenticated