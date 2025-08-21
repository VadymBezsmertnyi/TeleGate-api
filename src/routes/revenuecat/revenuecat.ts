import { Router, Request, Response } from "express";
import {
  revenuecatReadOnlyClientV2,
  deleteCustomer,
} from "./revenuecat.client";
import { getAuthenticatedUser } from "../../helpers/auth";

const router = Router();

router.get("/customers/:projectId", async (req: Request, res: Response) => {
  const authenticatedUser = await getAuthenticatedUser(req);
  if (!authenticatedUser)
    return res.status(401).json({ error: "Authentication required" });

  const { projectId } = req.params;
  if (!projectId)
    return res.status(400).json({ error: "Project ID is required" });

  try {
    const response = await revenuecatReadOnlyClientV2.get(
      `/projects/${projectId}/customers`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    console.warn("Помилка при отриманні клієнтів з RevenueCat:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/projects", async (req: Request, res: Response) => {
  const authenticatedUser = await getAuthenticatedUser(req);
  if (!authenticatedUser)
    return res.status(401).json({ error: "Authentication required" });

  try {
    const response = await revenuecatReadOnlyClientV2.get("/projects");
    return res.status(200).json(response.data);
  } catch (error) {
    console.warn("Помилка при отриманні проектів з RevenueCat:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete(
  "/customers/anonymous/:projectId",
  async (req: Request, res: Response) => {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({ error: "Authentication required" });

    try {
      const { projectId } = req.params;
      if (!projectId)
        return res.status(400).json({ error: "Project ID is required" });

      const customersResponse = await revenuecatReadOnlyClientV2.get(
        `/projects/${projectId}/customers`
      );
      const customers = customersResponse.data.items || [];
      const anonymousCustomers = customers.filter(
        (customer: any) => customer.id && customer.id.includes("RCAnonymousID")
      );
      if (anonymousCustomers.length === 0)
        return res.status(200).json({
          message: "No anonymous customers found",
          deletedCount: 0,
        });

      const deletePromises = anonymousCustomers.map((customer: any) =>
        deleteCustomer(projectId, customer.id)
      );
      await Promise.all(deletePromises);

      console.warn(
        `Видалено ${anonymousCustomers.length} анонімних користувачів з RevenueCat`
      );

      return res.status(200).json({
        success: true,
        message: `Successfully deleted ${anonymousCustomers.length} anonymous customers`,
        deletedCount: anonymousCustomers.length,
        deletedCustomers: anonymousCustomers.map((customer: any) => ({
          id: customer.id,
          last_seen_at: customer.last_seen_at,
          last_seen_country: customer.last_seen_country,
        })),
      });
    } catch (error: any) {
      console.warn(
        "Помилка при видаленні анонімних користувачів з RevenueCat:",
        error
      );
      return res
        .status(500)
        .json({ error: `Internal Server Error: ${error?.message}` });
    }
  }
);

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
