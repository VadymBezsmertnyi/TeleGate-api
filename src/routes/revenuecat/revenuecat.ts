import { Router, Request, Response } from "express";
import {
  revenuecatReadOnlyClientV2,
  deleteCustomer,
  getCustomerSubscriptions,
  getProjectOfferings,
  getOfferingPackages,
  getProjectProducts,
} from "./revenuecat.client";
import { getAuthenticatedUser } from "../../helpers/auth";
import {
  RevenueCatCustomersResponse,
  RevenueCatProjectsResponse,
} from "./revenuecat.types";

const router = Router();

router.get("/customers/:projectId", async (req: Request, res: Response) => {
  const authenticatedUser = await getAuthenticatedUser(req);
  if (!authenticatedUser)
    return res.status(401).json({ error: "Authentication required" });

  const { projectId } = req.params;
  if (!projectId)
    return res.status(400).json({ error: "Project ID is required" });

  try {
    const response =
      await revenuecatReadOnlyClientV2.get<RevenueCatCustomersResponse>(
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
    const response =
      await revenuecatReadOnlyClientV2.get<RevenueCatProjectsResponse>(
        "/projects"
      );
    return res.status(200).json(response.data);
  } catch (error) {
    console.warn("Помилка при отриманні проектів з RevenueCat:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get(
  "/customers/:projectId/:customerId/subscriptions",
  async (req: Request, res: Response) => {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({ error: "Authentication required" });

    const { projectId, customerId } = req.params;
    if (!projectId || !customerId)
      return res
        .status(400)
        .json({ error: "Project ID and Customer ID are required" });

    try {
      const response = await getCustomerSubscriptions(projectId, customerId);
      return res.status(200).json(response.data);
    } catch (error) {
      console.warn(
        "Помилка при отриманні підписок клієнта з RevenueCat:",
        error
      );
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/projects/:projectId/offerings",
  async (req: Request, res: Response) => {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({ error: "Authentication required" });

    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    try {
      const response = await getProjectOfferings(projectId);
      return res.status(200).json(response.data);
    } catch (error) {
      console.warn("Помилка при отриманні офірів проекту з RevenueCat:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/projects/:projectId/offerings/:offeringId/packages",
  async (req: Request, res: Response) => {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({ error: "Authentication required" });

    const { projectId, offeringId } = req.params;
    if (!projectId || !offeringId)
      return res
        .status(400)
        .json({ error: "Project ID and Offering ID are required" });

    try {
      const response = await getOfferingPackages(projectId, offeringId);
      return res.status(200).json(response.data);
    } catch (error) {
      console.warn("Помилка при отриманні пакетів офера з RevenueCat:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/projects/:projectId/products",
  async (req: Request, res: Response) => {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({ error: "Authentication required" });

    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ error: "Project ID is required" });

    try {
      const response = await getProjectProducts(projectId);
      return res.status(200).json(response.data);
    } catch (error) {
      console.warn(
        "Помилка при отриманні продуктів проекту з RevenueCat:",
        error
      );
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

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

router.get("/user-subscriptions", async (req: Request, res: Response) => {
  const authenticatedUser = await getAuthenticatedUser(req);
  if (!authenticatedUser)
    return res.status(401).json({ error: "Authentication required" });

  try {
    const projectsResponse =
      await revenuecatReadOnlyClientV2.get<RevenueCatProjectsResponse>(
        "/projects"
      );
    const projects = projectsResponse.data.items || [];

    const allUserSubscriptions: Array<{
      projectId: string;
      projectName: string;
      customerId: string;
      telegramId: number;
      subscriptions: any;
    }> = [];

    for (const project of projects) {
      try {
        const customersResponse =
          await revenuecatReadOnlyClientV2.get<RevenueCatCustomersResponse>(
            `/projects/${project.id}/customers`
          );
        const customers = customersResponse.data.items || [];

        for (const customer of customers) {
          if (customer.id && !customer.id.includes("RCAnonymousID")) {
            const UserModel = (await import("../../routes/users/users.model"))
              .default;
            const user = await UserModel.findOne({
              telegramId: parseInt(customer.id),
            }).lean();

            if (user) {
              try {
                const subscriptionsResponse = await getCustomerSubscriptions(
                  project.id,
                  customer.id
                );
                allUserSubscriptions.push({
                  projectId: project.id,
                  projectName: project.name,
                  customerId: customer.id,
                  telegramId: parseInt(customer.id),
                  subscriptions: subscriptionsResponse.data,
                });
              } catch (subscriptionError) {
                console.warn(
                  `Помилка при отриманні підписок для користувача ${customer.id}:`,
                  subscriptionError
                );
              }
            }
          }
        }
      } catch (projectError) {
        console.warn(
          `Помилка при отриманні клієнтів для проекту ${project.id}:`,
          projectError
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: allUserSubscriptions,
      totalUsers: allUserSubscriptions.length,
    });
  } catch (error) {
    console.warn(
      "Помилка при отриманні підписок користувачів з RevenueCat:",
      error
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
