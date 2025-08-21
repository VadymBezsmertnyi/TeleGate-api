import { Router, Request, Response } from "express";
import revenuecatClient from "./revenuecat.client";

const router = Router();

router.get("/subscribers", async (req: Request, res: Response) => {
  try {
    const response = await revenuecatClient.get("/subscribers/886363509");
    console.log("Отримано підписників з RevenueCat:", response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.warn("Помилка при отриманні підписників з RevenueCat:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const expectedAuth = process.env.REVENUECAT_AUTHORIZATION;
    if (!authHeader || !expectedAuth)
      return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.replace("Bearer ", "");
    if (token !== expectedAuth)
      return res.status(401).json({ error: "Invalid authorization token" });

    const webhookData = req.body;

    console.log("Received RevenueCat webhook:", webhookData);

    return res.status(200).json({
      success: true,
      message: "Webhook received successfully",
      data: webhookData,
    });
  } catch (error) {
    console.warn("Помилка при обробці RevenueCat webhook:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
