import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import { TBodyLogin } from "./auth.types";
import "./auth.swagger";

dotenv.config();
const router = Router();

router.get("/login", (req: Request<{}, {}, TBodyLogin>, res: Response) => {
  const { login, password } = req.body;
  try {
    if (
      login === process.env.ADMIN_LOGIN &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return res.status(200).json({ message: "Login successful" });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

export default router;
