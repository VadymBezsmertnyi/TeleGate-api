export const TELEGRAM_CLOSE_PAGE_HTML = `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Authentication Complete</title>
    </head>
    <body style="font-family: Arial; padding: 40px; text-align: center; background: #f0f8ff;">
      <h1 style="color: #28a745;">✅ Authentication Complete!</h1>
      <p style="font-size: 18px; margin: 20px 0;">You can now close this window.</p>
      <div style="margin: 30px 0;">
        <button onclick="closeWindow()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
        ">Close Window</button>
      </div>
      <script>
        function closeWindow() {
          if (window.close) {
            window.close();
          }
          window.location = 'about:blank';
        }
        
        setTimeout(() => {
          closeWindow();
        }, 2000);
      </script>
    </body>
  </html>
`;

export const TELEGRAM_CLOSE_PAGE_ERROR_HTML = `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Authentication Failed</title>
    </head>
    <body style="font-family: Arial; padding: 40px; text-align: center; background: #fff5f5;">
      <h1 style="color: #dc3545;">❌ Authentication Failed</h1>
      <p style="font-size: 18px; margin: 20px 0;">Please try again or contact support.</p>
      <div style="margin: 30px 0;">
        <button onclick="closeWindow()" style="
          background: #dc3545;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
        ">Close Window</button>
      </div>
      <script>
        function closeWindow() {
          if (window.close) {
            window.close();
          }
          window.location = 'about:blank';
        }
        
        setTimeout(() => {
          closeWindow();
        }, 2000);
      </script>
    </body>
  </html>
`;

export const TELEGRAM_FRAGMENT_PROCESSOR_HTML = `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
      <meta http-equiv="Pragma" content="no-cache">
      <meta http-equiv="Expires" content="0">
      <title>Processing Authentication...</title>
    </head>
    <body style="font-family: Arial; padding: 40px; text-align: center;">
      <h1>🔄 Processing Authentication...</h1>
      <p>Please wait while we process your Telegram authentication.</p>
      <div id="debug" style="background: #f0f0f0; padding: 10px; margin: 20px 0; text-align: left; font-family: monospace; font-size: 12px;"></div>
      <script>
        const debugDiv = document.getElementById('debug');
        function addDebugLog(message) {
          debugDiv.innerHTML += message + '<br>';
        }
        
        addDebugLog("Fragment processor loaded at " + new Date().toISOString());
        addDebugLog("Full URL: " + window.location.href);
        addDebugLog("Fragment: " + window.location.hash);
        addDebugLog("UserAgent: " + navigator.userAgent);
        
        setTimeout(() => {
          addDebugLog("Checking fragment after delay...");
          const fragment = window.location.hash;
          addDebugLog("Fragment after delay: " + fragment);
          
          if (fragment.includes('tgAuthResult=')) {
            try {
              const match = fragment.match(/tgAuthResult=([^&]+)/);
              if (match) {
                const encodedData = match[1];
                addDebugLog("Encoded data: " + encodedData);
                
                let decodedData;
                try {
                  decodedData = atob(encodedData);
                  addDebugLog("Base64 decoded: " + decodedData);
                } catch (e) {
                  decodedData = decodeURIComponent(encodedData);
                  addDebugLog("URL decoded: " + decodedData);
                }
                
                if (decodedData === 'false' || decodedData === false) {
                  addDebugLog("Auth failed - received false");
                  window.location.href = 'telegate://auth-error?error=auth_denied';
                  return;
                }
                
                const authData = JSON.parse(decodedData);
                addDebugLog("Parsed auth data: " + JSON.stringify(authData));
                
                const params = new URLSearchParams();
                if (authData.id) params.append('id', authData.id.toString());
                if (authData.username) params.append('username', authData.username);
                if (authData.first_name) params.append('first_name', authData.first_name);
                if (authData.last_name) params.append('last_name', authData.last_name);
                if (authData.photo_url) params.append('photo_url', authData.photo_url);
                if (authData.auth_date) params.append('auth_date', authData.auth_date.toString());
                if (authData.hash) params.append('hash', authData.hash);
                
                const newUrl = window.location.pathname + '?' + params.toString();
                addDebugLog("Redirecting to: " + newUrl);
                setTimeout(() => {
                  window.location.href = newUrl;
                }, 1000);
              } else {
                addDebugLog("ERROR: No tgAuthResult found in fragment");
                window.location.href = 'telegate://auth-error?error=no_auth_result';
              }
            } catch (error) {
              addDebugLog("ERROR processing auth data: " + error.message);
              window.location.href = 'telegate://auth-error?error=parse_error';
            }
          } else {
            addDebugLog("ERROR: No tgAuthResult in fragment");
            window.location.href = 'telegate://auth-error?error=missing_fragment';
          }
        }, 500);
      </script>
    </body>
  </html>
`;

export const TELEGRAM_MISSING_PARAMS_HTML = `
  <html>
    <body>
      <h1>Missing Parameters</h1>
      <p>Required: id, auth_date, hash</p>
      <script>
        setTimeout(() => {
          window.location.href = 'telegate://auth-error?error=missing_params';
        }, 3000);
      </script>
    </body>
  </html>
`;

export const TELEGRAM_SUCCESS_PAGE_HTML = `
  <html>
    <body style="font-family: Arial; padding: 40px; text-align: center;">
      <h1>✅ Authentication Successful!</h1>
      <div style="background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3>User Data:</h3>
      </div>
      <div style="background: #e8f5e8; padding: 15px; border-radius: 10px;">
        <p><strong>Deep Link (for mobile app):</strong></p>
      </div>
      <p style="margin-top: 20px; color: #666;">
        This page shows in browser. In mobile app, you would be redirected automatically.
      </p>
    </body>
  </html>
`;

export const TELEGRAM_ERROR_PAGE_HTML = `
  <html>
    <body style="font-family: Arial; padding: 40px; text-align: center; background: #fff5f5;">
      <h1 style="color: #dc3545;">❌ Authentication Failed</h1>
      <p>Server error occurred during authentication.</p>
      <p><a href="javascript:history.back()">Go Back</a></p>
    </body>
  </html>
`;
