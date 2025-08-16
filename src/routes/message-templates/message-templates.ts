import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import {
  createTemplateSchema,
  updateTemplateSchema,
  filterTemplatesSchema,
  templateResponseSchema,
} from "./message-templates.schemas";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateById,
  getTemplates,
  getTemplateStats,
} from "./message-templates.helper";
import { getAuthenticatedUser } from "../groups/groups.helper";

dotenv.config();
const router = Router();

// Створення шаблону
router.post("/", async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    const validationResult = createTemplateSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Invalid request data",
        details: validationResult.error,
      });

    const template = await createTemplate(
      validationResult.data,
      user._id.toString()
    );

    const responseResult = templateResponseSchema.safeParse(template);
    if (!responseResult.success)
      return res.status(500).json({ error: "Data validation error" });

    return res.status(201).json({ data: responseResult.data });
  } catch (error) {
    console.error("Error creating template:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Отримання всіх шаблонів з фільтрацією
router.get("/", async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    const validationResult = filterTemplatesSchema.safeParse({
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });
    if (!validationResult.success)
      return res.status(400).json({
        error: "Invalid query parameters",
        details: validationResult.error,
      });

    const result = await getTemplates(
      user._id.toString(),
      validationResult.data
    );

    return res.json(result);
  } catch (error) {
    console.error("Error getting templates:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Отримання конкретного шаблону
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    const { id } = req.params;
    const template = await getTemplateById(id, user._id.toString());
    if (!template) return res.status(404).json({ error: "Template not found" });

    const responseResult = templateResponseSchema.safeParse(template);
    if (!responseResult.success)
      return res.status(500).json({ error: "Data validation error" });

    return res.json({ data: responseResult.data });
  } catch (error) {
    console.error("Error getting template:", error);
    if (error instanceof Error)
      return res.status(400).json({ error: error.message });

    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Оновлення шаблону
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    const { id } = req.params;
    const validationResult = updateTemplateSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Invalid request data",
        details: validationResult.error,
      });

    const template = await updateTemplate(
      id,
      user._id.toString(),
      validationResult.data
    );
    if (!template) return res.status(404).json({ error: "Template not found" });

    const responseResult = templateResponseSchema.safeParse(template);
    if (!responseResult.success)
      return res.status(500).json({ error: "Data validation error" });

    return res.json({ data: responseResult.data });
  } catch (error) {
    console.error("Error updating template:", error);
    if (error instanceof Error)
      return res.status(400).json({ error: error.message });

    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Видалення шаблону
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    const { id } = req.params;
    const template = await deleteTemplate(id, user._id.toString());
    if (!template) return res.status(404).json({ error: "Template not found" });

    return res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    if (error instanceof Error)
      return res.status(400).json({ error: error.message });

    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Статистика шаблонів
router.get("/stats/overview", async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    const stats = await getTemplateStats(user._id.toString());

    return res.json(stats);
  } catch (error) {
    console.error("Error getting template stats:", error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
