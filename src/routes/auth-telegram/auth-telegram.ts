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

    const { id, username, first_name, last_name, photo_url, auth_date, hash } =
      req.query;

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

    res.redirect(
      `telegate://auth-success?token=${token}&userId=${user.id}&username=${
        user.username || ""
      }&firstName=${user.first_name || ""}&lastName=${
        user.last_name || ""
      }&photoUrl=${user.photo_url || ""}`
    );
    return;
  } catch (error) {
    console.error("Error during redirect:", error);
    res.redirect(`telegate://auth-error?error=server_error`);
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

    const user = {
      id: parseInt(id as string),
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
    };

    const token = `token_${user.id}_${Date.now()}`;

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
