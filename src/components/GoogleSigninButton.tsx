import configSettings from "settings/config.json";

const GoogleSigninButton = () => {
  return (
    <div id="google-login-button">            
      <div id="g_id_onload"
        data-client_id={configSettings.GoogleOAuthClientID}
        data-context="signin"
        data-ux_mode="popup"
        data-login_uri={configSettings.GoogleOAuthCallbackUrl}
        data-nonce=""
        data-auto_prompt="false">
      </div>

      <div className="g_id_signin"
          data-type="standard"
          data-shape="rectangular"
          data-theme="outline"
          data-text="signin_with"
          data-size="large"
          data-logo_alignment="left">
      </div>
    </div>   
  )
}

export default GoogleSigninButton