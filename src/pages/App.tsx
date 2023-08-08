import "styles/globals.scss"
import { AuthenticationProvider } from "../contexts/AuthenticationContext"
import React from "react"
import { Routes, Route, Navigate } from "react-router-dom";
import ConfirmAccount from "./public/ConfirmAccount";
import ForgotPassword from "./public/ForgotPassword";
import Register from "./public/Register";
import SetPassword from "./public/SetPassword";
import SignIn from "./public/SignIn";
import ThankYou from "./public/ThankYou";

import AdministratorDashboard from "./administrator/Dashboard";
import Participants from "./administrator/Participants";
import SignIns from "./administrator/Signins";

import ParticipantDashboard from "./participant/Dashboard";

import { ParticipantProvider } from "contexts/ParticipantContext";
import { AccountManagementProvider } from "contexts/AccountManagementContext";
import { AdministratorProvider } from "contexts/AdministratorContext";
import Privacy from "./public/Privacy";

const App = () => {
  return (
    // todo this nesting looks bizarre
    <AuthenticationProvider>
      <ParticipantProvider>
        <AccountManagementProvider>
          <AdministratorProvider>
            <Routes>
              <Route path="/" element={ <Navigate to="/signin" /> } />           
              <Route path="confirmaccount" element={<ConfirmAccount />} />
              <Route path="forgotpassword" element={<ForgotPassword />} />
              <Route path="privacy" element={<Privacy />} />      
              <Route path="register" element={<Register />} />
              <Route path="setpassword" element={<SetPassword />} />
              <Route path="signin" element={<SignIn />} />
              <Route path="thankyou" element={<ThankYou />} />      

              <Route path="participant">
                <Route path="dashboard" element={ <ParticipantDashboard />} ></Route>
              </Route>     

              <Route path="administrator">
                <Route path="dashboard" element={ <AdministratorDashboard />} ></Route>
                <Route path="participants" element={ <Participants />} ></Route>
                <Route path="signins" element={ <SignIns />} ></Route>
              </Route>    
            </Routes>    
          </AdministratorProvider>
        </AccountManagementProvider>
      </ParticipantProvider>
    </AuthenticationProvider>
  );
}

export default App;