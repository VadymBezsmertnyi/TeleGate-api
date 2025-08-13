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
      <title>Processing Authentication...</title>
    </head>
    <body style="font-family: Arial; padding: 40px; text-align: center;">
      <h1>🔄 Processing Authentication...</h1>
      <p>Please wait while we process your Telegram authentication.</p>
      <div id="debug" style="background: #f0f0f0; padding: 10px; margin: 20px 0; text-align: left; font-family: monospace; font-size: 12px; max-height: 300px; overflow-y: auto;"></div>
      <script>
        console.log("Script started");
        const debugDiv = document.getElementById('debug');
        
        function addDebugLog(message) {
          console.log("Debug:", message);
          if (debugDiv) {
            debugDiv.innerHTML += new Date().toLocaleTimeString() + ': ' + message + '<br>';
            debugDiv.scrollTop = debugDiv.scrollHeight;
          }
        }
        
        // Лічильник спроб з localStorage
        let retryCount = parseInt(localStorage.getItem('telegram_auth_retry_count') || '0');
        const maxRetries = 2;
        
        addDebugLog("=== FRAGMENT PROCESSOR STARTED ===");
        addDebugLog("Full URL: " + window.location.href);
        addDebugLog("Fragment: " + window.location.hash);
        addDebugLog("UserAgent: " + navigator.userAgent);
        addDebugLog("Retry count: " + retryCount);
        
        // Test basic JavaScript functionality
        addDebugLog("JavaScript is working");
        
        function processFragment() {
          addDebugLog("=== PROCESSING FRAGMENT ===");
          const fragment = window.location.hash.substring(1);
          addDebugLog("Fragment content: " + fragment);
          
          if (fragment.includes('tgAuthResult=')) {
            addDebugLog("Found tgAuthResult in fragment");
            try {
              const match = fragment.match(/tgAuthResult=([^&]+)/);
              if (match) {
                const encodedData = match[1];
                addDebugLog("Encoded data: " + encodedData);
                
                // Custom Base64 decoder with detailed logging
                function customAtob(str) {
                  addDebugLog("customAtob called with: " + str);
                  
                  // Перевіряємо чи це "ZmFsc2U" (закодований "false")
                  if (str === "ZmFsc2U") {
                    addDebugLog("Detected 'false' in Base64, returning 'false'");
                    return "false";
                  }
                  
                  try {
                    const result = atob(str);
                    addDebugLog("Native atob succeeded: " + result);
                    addDebugLog("Native atob result type: " + typeof result);
                    return result;
                  } catch (e) {
                    addDebugLog("Native atob failed: " + e.message);
                    addDebugLog("Using custom decoder...");
                    
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                    let output = '';
                    str = String(str).replace(/=+$/, '');
                    addDebugLog("Processed string: " + str);
                    addDebugLog("String length: " + str.length);
                    
                    if (str.length % 4 === 1) {
                      addDebugLog("Invalid base64 string length");
                      throw new Error('Invalid base64 string');
                    }
                    
                    for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++);) {
                      const charIndex = chars.indexOf(buffer);
                      addDebugLog("Char: " + buffer + ", Index: " + charIndex);
                      if (charIndex !== -1) {
                        bs = bc % 4 ? bs * 64 + charIndex : charIndex;
                        if (bc++ % 4) {
                          const charCode = 255 & (bs >> ((-2 * bc) & 6));
                          const char = String.fromCharCode(charCode);
                          output += char;
                          addDebugLog("Added char: " + char + " (code: " + charCode + ")");
                        }
                      }
                    }
                    addDebugLog("Custom decoder result: " + output);
                    return output;
                  }
                }
                
                let decodedData;
                try {
                  decodedData = customAtob(encodedData);
                  addDebugLog("Final decoded data: " + decodedData);
                  addDebugLog("Final decoded data type: " + typeof decodedData);
                  addDebugLog("Final decoded data length: " + decodedData.length);
                  addDebugLog("Is equal to 'false': " + (decodedData === 'false'));
                  addDebugLog("Is equal to false: " + (decodedData === false));
                } catch (e) {
                  addDebugLog("Decode failed: " + e.message);
                  decodedData = 'false';
                }
                
                if (decodedData === 'false' || decodedData === false) {
                  addDebugLog("Auth failed - received false from Telegram");
                  addDebugLog("This might be a timing issue");
                  addDebugLog("Redirecting to error page");
                  window.location.href = 'telegate://auth-error?error=auth_denied&reason=timing_issue';
                  return;
                }
                
                try {
                  const authData = JSON.parse(decodedData);
                  addDebugLog("Parsed auth data successfully");
                  addDebugLog("Clearing retry counter on success");
                  localStorage.removeItem('telegram_auth_retry_count'); // Очищаємо лічильник при успіху
                  
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
                  window.location.href = newUrl;
                } catch (e) {
                  addDebugLog("Error parsing auth data: " + e.message);
                  window.location.href = 'telegate://auth-error?error=invalid_data';
                }
              } else {
                addDebugLog("No tgAuthResult match found");
                setTimeout(processFragment, 500);
              }
            } catch (e) {
              addDebugLog("Error processing fragment: " + e.message);
              setTimeout(processFragment, 500);
            }
          } else {
            addDebugLog("No tgAuthResult in fragment");
            addDebugLog("Checking for direct params...");
            const urlParams = new URLSearchParams(window.location.search);
            const hasParams = urlParams.has('id') || urlParams.has('auth_date') || urlParams.has('hash');
            
            if (hasParams) {
              addDebugLog("Found direct params");
              const newUrl = window.location.pathname + '?' + window.location.search.substring(1);
              addDebugLog("Redirecting to: " + newUrl);
              window.location.href = newUrl;
            } else {
              addDebugLog("No params found, waiting...");
              setTimeout(processFragment, 500);
            }
          }
        }
        
        // Start processing
        setTimeout(processFragment, 100);
        
        // Listen for hash changes
        window.addEventListener('hashchange', function() {
          addDebugLog("Hash changed");
          processFragment();
        });
        
        addDebugLog("=== SETUP COMPLETE ===");
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
