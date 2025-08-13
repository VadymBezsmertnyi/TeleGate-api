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
      <script>
        function addDebugLog(message) {
          // Debug logging disabled in production
        }
        
        function processFragment() {
          const fragment = window.location.hash;
          
          if (fragment.includes('tgAuthResult=')) {
            try {
              const match = fragment.match(/tgAuthResult=([^&]+)/);
              if (match) {
                const encodedData = match[1];
                
                let decodedData;
                
                // Custom Base64 decoder fallback
                function customAtob(str) {
                  try {
                    return atob(str);
                  } catch (e) {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                    let output = '';
                    str = String(str).replace(/=+$/, '');
                    if (str.length % 4 === 1) {
                      throw new Error('Invalid base64 string');
                    }
                    for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++);) {
                      if (buffer = chars.indexOf(buffer)) {
                        bs = bc % 4 ? bs * 64 + buffer : buffer;
                        if (bc++ % 4) output += String.fromCharCode(255 & bs >> (-2 * bc & 6));
                      }
                    }
                    return output;
                  }
                }
                
                try {
                  decodedData = customAtob(encodedData);
                } catch (e) {
                  try {
                    decodedData = decodeURIComponent(encodedData);
                  } catch (e2) {
                    decodedData = encodedData;
                  }
                }
                
                if (decodedData === 'false' || decodedData === false) {
                  window.location.href = 'telegate://auth-error?error=auth_denied&reason=user_cancelled';
                  return;
                }
                
                const authData = JSON.parse(decodedData);
                
                const params = new URLSearchParams();
                if (authData.id) params.append('id', authData.id.toString());
                if (authData.username) params.append('username', authData.username);
                if (authData.first_name) params.append('first_name', authData.first_name);
                if (authData.last_name) params.append('last_name', authData.last_name);
                if (authData.photo_url) params.append('photo_url', authData.photo_url);
                if (authData.auth_date) params.append('auth_date', authData.auth_date.toString());
                if (authData.hash) params.append('hash', authData.hash);
                
                const newUrl = window.location.pathname + '?' + params.toString();
                setTimeout(() => {
                  window.location.href = newUrl;
                }, 1000);
              } else {
                window.location.href = 'telegate://auth-error?error=no_auth_result';
              }
            } catch (error) {
              window.location.href = 'telegate://auth-error?error=parse_error';
            }
          } else {
            const urlParams = new URLSearchParams(window.location.search);
            const hasParams = urlParams.has('id') || urlParams.has('auth_date') || urlParams.has('hash');
            
            if (hasParams) {
              const newUrl = window.location.pathname + '?' + window.location.search.substring(1);
              setTimeout(() => {
                window.location.href = newUrl;
              }, 1000);
            } else {
              setTimeout(processFragment, 100);
            }
          }
        }
        
        // Initial check with delay
        setTimeout(processFragment, 100);
        
        // Also listen for hash changes
        window.addEventListener('hashchange', function() {
          processFragment();
        });
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
