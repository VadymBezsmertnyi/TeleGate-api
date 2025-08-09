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
    // Here you would typically exchange the code for an access token
    // and fetch user data from Telegram API.

    res.status(200).json({ message: "Redirect successful" });
  } catch (error) {
    console.error("Error during redirect:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
