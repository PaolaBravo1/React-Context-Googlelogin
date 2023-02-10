import HTMLReactParser from "html-react-parser";
import Head from "next/head";
import { SetStateAction, useState } from "react";
import TextInput from "./TextInput";

interface ILayoutUnauthenticated {
    children: any,
    id: string,
    title: string,
    message: string,
    errorMessage: string,
    reversed?: boolean
}

const LayoutUnauthenticated = ({children, id, title, message, errorMessage, reversed=false}: ILayoutUnauthenticated) => {    
    return (
      <>
      <Head>
        <title>Hammerbeam</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div id={id} className="unauth-container">
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