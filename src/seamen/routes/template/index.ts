import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import TemplateModel from "./template.model";

dotenv.config();
const router = Router();

router.get("/all", async (req: Request, res: Response) => {
  try {
    const response = await TemplateModel.find().exec();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.get("/by-id/:id", async (req: Request, res: Response) => {
  try {
    const templateId = req.params.id;
    const response = await TemplateModel.findById(templateId).exec();
    if (!response)
      return res.status(404).json({ message: "Template not found" });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.post("/create", async (req: Request, res: Response) => {
  try {
    const { name, description, content, urls } = req.body;
    const newTemplate = new TemplateModel({
      name,
      description,
      content,
      urls,
    });
    const savedTemplate = await newTemplate.save();
    return res.status(201).json(savedTemplate);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.put("/update/:id", async (req: Request, res: Response) => {
  try {
    const templateId = req.params.id;
    const { name, description, content, urls } = req.body;
    const updatedTemplate = await TemplateModel.findByIdAndUpdate(
      templateId,
      { name, description, content, urls },
      { new: true }
    ).exec();
    if (!updatedTemplate)
      return res.status(404).json({ message: "Template not found" });

    return res.status(200).json(updatedTemplate);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
  try {
    const templateId = req.params.id;
    const deletedTemplate = await TemplateModel.findByIdAndDelete(
      templateId
    ).exec();
    if (!deletedTemplate)
      return res.status(404).json({ message: "Template not found" });

    return res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

export default router;
