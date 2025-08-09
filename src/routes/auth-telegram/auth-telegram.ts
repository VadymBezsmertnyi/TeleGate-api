import { Router, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
const router = Router();

router.get("/me", async (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/redirect", async (req: Request, res: Response) => {
  try {
    const { id, username, first_name, last_name, photo_url, auth_date, hash } =
      req.query;
    console.log("Redirect params:", req.query);

    if (!id || !auth_date || !hash)
      return res.redirect(`telegate://auth-error?error=missing_params`);

    const telegramParams = {
      id: parseInt(id as string),
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
      auth_date: parseInt(auth_date as string),
      hash: hash as string,
    };

    const user = {
      id: telegramParams.id,
      username: telegramParams.username,
      first_name: telegramParams.first_name,
      last_name: telegramParams.last_name,
      photo_url: telegramParams.photo_url,
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
    console.error("Error during redirect:", error);
    res.redirect(`telegate://auth-error?error=server_error`);
  }
});

export default router;
