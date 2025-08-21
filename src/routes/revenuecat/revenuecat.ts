import { Router, Request, Response } from "express";
import { revenuecatReadOnlyClientV2 } from "./revenuecat.client";

const router = Router();

router.get("/subscribers/:projectId", async (req: Request, res: Response) => {
  const { projectId } = req.params;
  if (!projectId)
    return res.status(400).json({ error: "Project ID is required" });

  try {
    const response = await revenuecatReadOnlyClientV2.get(
      `/projects/${projectId}/customers`
    );
    console.log("Отримано підписників з RevenueCat:", response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.warn("Помилка при отриманні підписників з RevenueCat:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/projects", async (req: Request, res: Response) => {
  try {
    const response = await revenuecatReadOnlyClientV2.get("/projects");
    console.log("Отримано проекти з RevenueCat:", response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.warn("Помилка при отриманні проектів з RevenueCat:", error);
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
