import React from "react";
import App from ".//pages/App";
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import configSettings from "settings/config.json";

const root = createRoot(document.getElementById('root'));

root.render(
  <GoogleOAuthProvider clientId={configSettings.GoogleOAuthClientID}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);