import { Router, Request, Response } from "express";
import { createHash, createHmac } from "crypto";
import dotenv from "dotenv";

dotenv.config();
const router = Router();

// Function to validate Telegram authentication
function validateTelegramAuth(authData: any, botToken: string): boolean {
  const { hash, ...dataToCheck } = authData;

  if (!hash) return false;

  // Create data-check-string
  const dataCheckString = Object.keys(dataToCheck)
    .filter(
      (key) => dataToCheck[key] !== undefined && dataToCheck[key] !== null
    )
    .sort()
    .map((key) => `${key}=${dataToCheck[key]}`)
    .join("\n");

  console.log("Data check string:", dataCheckString);

  // Create secret key (SHA256 of bot token)
  const secretKey = createHash("sha256").update(botToken).digest();

  // Create HMAC-SHA256 signature
  const hmac = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  console.log("Expected hash:", hmac);
  console.log("Received hash:", hash);

  return hmac === hash;
}

router.get("/login", async (req: Request, res: Response) => {
  try {
    const botId =
      process.env.TELEGRAM_BOT_ID || process.env.EXPO_PUBLIC_TELEGRAM_BOT_ID;
    const originDomain =
      process.env.TELEGRAM_ORIGIN_DOMAIN ||
      process.env.EXPO_PUBLIC_TELEGRAM_ORIGIN_DOMAIN;
    const redirectUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth-telegram/redirect`;

    console.log("Redirecting to Telegram OAuth for bot:", botId);
    console.log("Origin domain:", originDomain);
    console.log("Redirect URL:", redirectUrl);

    if (!botId) {
      console.error("Bot ID not configured");
      return res.status(500).json({ error: "Bot ID not configured" });
    }

    // Ensure we have a valid origin domain
    const validOriginDomain = originDomain || req.get("host") || "localhost";

    // Direct redirect to Telegram OAuth instead of showing HTML page
    const telegramOAuthUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(
      validOriginDomain
    )}&embed=1&request_access=write&return_to=${encodeURIComponent(
      redirectUrl
    )}`;

    console.log("Telegram OAuth URL:", telegramOAuthUrl);
    res.redirect(telegramOAuthUrl);
    return;
  } catch (error) {
    console.error("Error redirecting to Telegram OAuth:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

router.get("/close", async (req: Request, res: Response) => {
  try {
    const authData = req.query["auth-data"];
    const error = req.query["error"];
    console.log("Close page requested", { authData: !!authData, error });

    const isSuccess = authData && !error;

    res.send(`
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Authentication ${isSuccess ? "Complete" : "Failed"}</title>
        </head>
        <body style="font-family: Arial; padding: 40px; text-align: center; background: ${
          isSuccess ? "#f0f8ff" : "#fff5f5"
        };">
          <h1 style="color: ${isSuccess ? "#28a745" : "#dc3545"};">
            ${
              isSuccess
                ? "✅ Authentication Successful!"
                : "❌ Authentication Failed"
            }
          </h1>
          <p style="font-size: 18px; margin: 20px 0;">
            ${
              isSuccess
                ? "You can now close this window."
                : "Please try again or contact support."
            }
          </p>
          <div style="margin: 30px 0;">
            <button onclick="closeWindow()" style="
              background: ${isSuccess ? "#007bff" : "#dc3545"};
              color: white;
              border: none;
              padding: 15px 30px;
              font-size: 16px;
              border-radius: 5px;
              cursor: pointer;
            ">Close Window</button>
          </div>
          <script>
            // Add data to URL fragment
            if ('${authData}') {
              window.location.hash = 'auth-data=' + '${authData}';
            } else if ('${error}') {
              window.location.hash = 'error=' + '${error}';
            }
            
            function closeWindow() {
              // Try multiple close methods
              if (window.close) {
                window.close();
              }
              // Also try to navigate away
              window.location = 'about:blank';
            }
            
            // Auto-attempt to close after a short delay
            setTimeout(() => {
              closeWindow();
            }, 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error serving close page:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    console.log("Fetching user data...", req.query);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/redirect", async (req: Request, res: Response) => {
  try {
    console.log("=== TELEGRAM REDIRECT DEBUG ===");
    console.log("Full request URL:", req.url);
    console.log("Query params:", JSON.stringify(req.query, null, 2));
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Method:", req.method);
    console.log("================================");

    // Check if we have query params (direct access)
    const { id, username, first_name, last_name, photo_url, auth_date, hash } =
      req.query;

    if (id && auth_date && hash) {
      // We have direct query params - process normally
      console.log("Processing direct query params");
    } else {
      // No query params - return HTML page to process fragment
      console.log("No query params - returning fragment processor");

      // Add cache-busting headers to prevent 304 responses
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        ETag: Math.random().toString(), // Force different ETag each time
      });

      res.send(`
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
                console.log(message);
                debugDiv.innerHTML += message + '<br>';
              }
              
              addDebugLog("Fragment processor loaded at " + new Date().toISOString());
              addDebugLog("Full URL: " + window.location.href);
              addDebugLog("Fragment: " + window.location.hash);
              
              // Check for tgAuthResult in fragment
              const fragment = window.location.hash;
              if (fragment.includes('tgAuthResult=')) {
                try {
                  // Extract tgAuthResult data
                  const match = fragment.match(/tgAuthResult=([^&]+)/);
                  if (match) {
                    const encodedData = match[1];
                    addDebugLog("Encoded data: " + encodedData);
                    
                    // First try base64 decode (if it's base64)
                    let decodedData;
                    try {
                      decodedData = atob(encodedData);
                      addDebugLog("Base64 decoded: " + decodedData);
                    } catch (e) {
                      // If not base64, try URL decode
                      decodedData = decodeURIComponent(encodedData);
                      addDebugLog("URL decoded: " + decodedData);
                    }
                    
                    // Check if result is "false" (failed auth)
                    if (decodedData === 'false' || decodedData === false) {
                      addDebugLog("Auth failed - received false");
                      window.location.href = 'telegate://auth-error?error=auth_denied';
                      return;
                    }
                    
                    const authData = JSON.parse(decodedData);
                    addDebugLog("Parsed auth data: " + JSON.stringify(authData));
                    
                    // Build query string from auth data
                    const params = new URLSearchParams();
                    if (authData.id) params.append('id', authData.id.toString());
                    if (authData.username) params.append('username', authData.username);
                    if (authData.first_name) params.append('first_name', authData.first_name);
                    if (authData.last_name) params.append('last_name', authData.last_name);
                    if (authData.photo_url) params.append('photo_url', authData.photo_url);
                    if (authData.auth_date) params.append('auth_date', authData.auth_date.toString());
                    if (authData.hash) params.append('hash', authData.hash);
                    
                    // Redirect to same endpoint with query params
                    const newUrl = window.location.pathname + '?' + params.toString();
                    addDebugLog("Redirecting to: " + newUrl);
                    setTimeout(() => {
                      window.location.href = newUrl;
                    }, 1000); // Small delay to see debug info
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
            </script>
          </body>
        </html>
      `);
      return;
    }

    if (!id || !auth_date || !hash) {
      console.error("Missing required params:", {
        id: !!id,
        auth_date: !!auth_date,
        hash: !!hash,
        allParams: req.query,
      });
      res.status(400).send(`
        <html>
          <body>
            <h1>Missing Parameters</h1>
            <p>Required: id, auth_date, hash</p>
            <p>Received: ${JSON.stringify(req.query)}</p>
            <script>
              setTimeout(() => {
                window.location.href = 'telegate://auth-error?error=missing_params';
              }, 3000);
            </script>
          </body>
        </html>
      `);
      return;
    }

    // Validate Telegram authentication
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN not configured");
      res.redirect(`telegate://auth-error?error=server_config`);
      return;
    }

    const authData = {
      id: id as string,
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
      auth_date: auth_date as string,
      hash: hash as string,
    };

    if (!validateTelegramAuth(authData, botToken)) {
      console.error("Invalid Telegram authentication signature");
      res.redirect(`telegate://auth-error?error=invalid_signature`);
      return;
    }

    // Check auth_date (not older than 1 day)
    const authDate = parseInt(auth_date as string);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours in seconds

    if (now - authDate > maxAge) {
      console.error("Auth data is too old");
      res.redirect(`telegate://auth-error?error=expired`);
      return;
    }

    const user = {
      id: parseInt(id as string),
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
    };

    // Generate a proper JWT token or session token here
    const token = `token_${user.id}_${Date.now()}`;

    console.log("Authentication successful for user:", user.id);

    // Check if request comes from mobile app or browser
    const userAgent = req.get("User-Agent") || "";
    const isMobile =
      userAgent.includes("Expo") || userAgent.includes("TeleGate");

    if (isMobile) {
      // For mobile WebView, redirect directly to deep link
      const deepLink = `telegate://auth-success?token=${token}&userId=${
        user.id
      }&username=${user.username || ""}&firstName=${
        user.first_name || ""
      }&lastName=${user.last_name || ""}&photoUrl=${user.photo_url || ""}`;

      console.log("Redirecting WebView to deep link:", deepLink);
      res.redirect(deepLink);
    } else {
      // Browser - show success page with data
      res.send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>✅ Authentication Successful!</h1>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>User Data:</h3>
              <p><strong>ID:</strong> ${user.id}</p>
              <p><strong>Username:</strong> ${user.username || "N/A"}</p>
              <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
              <p><strong>Token:</strong> ${token}</p>
            </div>
            <div style="background: #e8f5e8; padding: 15px; border-radius: 10px;">
              <p><strong>Deep Link (for mobile app):</strong></p>
              <code style="word-break: break-all;">telegate://auth-success?token=${token}&userId=${
        user.id
      }&username=${user.username || ""}&firstName=${
        user.first_name || ""
      }&lastName=${user.last_name || ""}&photoUrl=${user.photo_url || ""}</code>
            </div>
            <p style="margin-top: 20px; color: #666;">
              This page shows in browser. In mobile app, you would be redirected automatically.
            </p>
          </body>
        </html>
      `);
    }
    return;
  } catch (error) {
    console.error("Error during redirect:", error);

    // For mobile WebView, redirect directly to error deep link
    const userAgent = req.get("User-Agent") || "";
    const isMobileError =
      userAgent.includes("Expo") || userAgent.includes("TeleGate");

    if (isMobileError) {
      res.redirect(`telegate://auth-error?error=server_error`);
    } else {
      res.send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center; background: #fff5f5;">
            <h1 style="color: #dc3545;">❌ Authentication Failed</h1>
            <p>Server error occurred during authentication.</p>
            <p><a href="javascript:history.back()">Go Back</a></p>
          </body>
        </html>
      `);
    }
    return;
  }
});

// Also handle POST requests from Telegram
router.post("/redirect", async (req: Request, res: Response) => {
  try {
    console.log("=== TELEGRAM POST REDIRECT DEBUG ===");
    console.log("POST Body:", JSON.stringify(req.body, null, 2));
    console.log("Query params:", JSON.stringify(req.query, null, 2));
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("====================================");

    // Try to get params from body or query
    const params = { ...req.query, ...req.body };
    const { id, username, first_name, last_name, photo_url, auth_date, hash } =
      params;

    if (id && auth_date && hash) {
      // We have direct params - process normally
      console.log("Processing direct POST params");
    } else {
      // No params - return HTML page to process fragment (same as GET)
      console.log("No POST params - returning fragment processor");
      res.send(`
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Processing Authentication...</title>
          </head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>🔄 Processing Authentication...</h1>
            <p>Please wait while we process your Telegram authentication.</p>
            <script>
              console.log("Fragment processor loaded (POST)");
              console.log("Full URL:", window.location.href);
              console.log("Fragment:", window.location.hash);
              
              // Check for tgAuthResult in fragment
              const fragment = window.location.hash;
              if (fragment.includes('tgAuthResult=')) {
                try {
                  // Extract tgAuthResult data
                  const match = fragment.match(/tgAuthResult=([^&]+)/);
                  if (match) {
                    const encodedData = match[1];
                    console.log("Encoded data:", encodedData);
                    
                    // Decode the data
                    const decodedData = decodeURIComponent(encodedData);
                    console.log("Decoded data:", decodedData);
                    
                    const authData = JSON.parse(decodedData);
                    console.log("Parsed auth data:", authData);
                    
                    // Build query string from auth data
                    const params = new URLSearchParams();
                    if (authData.id) params.append('id', authData.id.toString());
                    if (authData.username) params.append('username', authData.username);
                    if (authData.first_name) params.append('first_name', authData.first_name);
                    if (authData.last_name) params.append('last_name', authData.last_name);
                    if (authData.photo_url) params.append('photo_url', authData.photo_url);
                    if (authData.auth_date) params.append('auth_date', authData.auth_date.toString());
                    if (authData.hash) params.append('hash', authData.hash);
                    
                    // Redirect to GET endpoint with query params
                    const newUrl = window.location.pathname.replace('/redirect', '/redirect') + '?' + params.toString();
                    console.log("Redirecting to:", newUrl);
                    window.location.href = newUrl;
                  } else {
                    console.error("No tgAuthResult found in fragment");
                    window.location.href = 'telegate://auth-error?error=no_auth_result';
                  }
                } catch (error) {
                  console.error("Error processing auth data:", error);
                  window.location.href = 'telegate://auth-error?error=parse_error';
                }
              } else {
                console.error("No tgAuthResult in fragment");
                window.location.href = 'telegate://auth-error?error=missing_fragment';
              }
            </script>
          </body>
        </html>
      `);
      return;
    }

    if (!id || !auth_date || !hash) {
      console.error("Missing required params in POST:", {
        id: !!id,
        auth_date: !!auth_date,
        hash: !!hash,
        allParams: params,
      });
      res.status(400).send(`
        <html>
          <body>
            <h1>Missing Parameters (POST)</h1>
            <p>Required: id, auth_date, hash</p>
            <p>Received: ${JSON.stringify(params)}</p>
            <script>
              setTimeout(() => {
                window.location.href = 'telegate://auth-error?error=missing_params';
              }, 3000);
            </script>
          </body>
        </html>
      `);
      return;
    }

    // Validate Telegram authentication
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN not configured");
      res.redirect(`telegate://auth-error?error=server_config`);
      return;
    }

    const authData = {
      id: id as string,
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
      auth_date: auth_date as string,
      hash: hash as string,
    };

    if (!validateTelegramAuth(authData, botToken)) {
      console.error("Invalid Telegram authentication signature");
      res.redirect(`telegate://auth-error?error=invalid_signature`);
      return;
    }

    // Check auth_date (not older than 1 day)
    const authDate = parseInt(auth_date as string);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours in seconds

    if (now - authDate > maxAge) {
      console.error("Auth data is too old");
      res.redirect(`telegate://auth-error?error=expired`);
      return;
    }

    const user = {
      id: parseInt(id as string),
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
    };

    const token = `token_${user.id}_${Date.now()}`;

    console.log("Authentication successful for user:", user.id);

    res.redirect(
      `telegate://auth-success?token=${token}&userId=${user.id}&username=${
        user.username || ""
      }&firstName=${user.first_name || ""}&lastName=${
        user.last_name || ""
      }&photoUrl=${user.photo_url || ""}`
    );
  } catch (error) {
    console.error("Error during POST redirect:", error);
    res.redirect(`telegate://auth-error?error=server_error`);
  }
});

export default router;
