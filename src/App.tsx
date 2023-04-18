import "styles/globals.css"
import { AuthenticationProvider } from "./contexts/useApi"
import React from "react"

const App = ({ Component, pageProps}: any) => {
  return (
    <AuthenticationProvider>     
      <Component {...pageProps}></Component> 
    </AuthenticationProvider>    
  )
}

export default App