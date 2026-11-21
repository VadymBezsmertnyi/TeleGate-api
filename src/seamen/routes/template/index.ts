import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import {
  templateCreateSchema,
  templateIdParamsSchema,
  templateListSchema,
  templatePasswordQuerySchema,
  templateUpdateSchema,
} from "./template.schemas";
import {
  TemplateT,
  TemplateCreateBodyT,
  TemplateIdParamsT,
  TemplateListResponseT,
  TemplateMessageResponseT,
  TemplatePasswordQueryT,
  TemplateUpdateBodyT,
} from "./template.types";
import TemplateModel from "./template.model";
import "./template.swagger";
import { normalizeTemplate, validatePassword } from "./template.helps";

dotenv.config();
const router = Router();

router.get(
  "/all",
  async (
    req: Request<
      Record<string, never>,
      TemplateListResponseT | TemplateMessageResponseT,
      unknown,
      TemplatePasswordQueryT
    >,
    res: Response<TemplateListResponseT | TemplateMessageResponseT>
  ) => {
    const queryValidation = templatePasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validatePassword(queryValidation.data, res))
      return res.status(401).json({ message: "Невірний код доступу" });

    try {
      const templates = await TemplateModel.find().lean().exec();
      const normalized = templateListSchema.parse(
        templates.map((item) => normalizeTemplate(item))
      );
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка отримання шаблонів", error);
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      return res.status(500).json({ message: "Помилка сервера: " + message });
    }
  }
);

router.get(
  "/by-id/:id",
  async (
    req: Request<
      TemplateIdParamsT,
      TemplateT | TemplateMessageResponseT,
      unknown,
      TemplatePasswordQueryT
    >,
    res: Response<TemplateT | TemplateMessageResponseT>
  ) => {
    const queryValidation = templatePasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validatePassword(queryValidation.data, res))
      return res.status(401).json({ message: "Невірний код доступу" });

    const paramsValidation = templateIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    try {
      const template = await TemplateModel.findById(paramsValidation.data.id)
        .lean()
        .exec();
      if (!template)
        return res.status(404).json({ message: "Шаблон не знайдено" });

      const normalized = normalizeTemplate(template);
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка отримання шаблону", error);
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      return res.status(500).json({ message: "Помилка сервера: " + message });
    }
  }
);

router.post(
  "/create",
  async (
    req: Request<
      Record<string, never>,
      TemplateT | TemplateMessageResponseT,
      TemplateCreateBodyT,
      TemplatePasswordQueryT
    >,
    res: Response<TemplateT | TemplateMessageResponseT>
  ) => {
    const queryValidation = templatePasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validatePassword(queryValidation.data, res))
      return res.status(401).json({ message: "Невірний код доступу" });

    const bodyValidation = templateCreateSchema.safeParse(req.body);
    if (!bodyValidation.success)
      return res.status(400).json({
        message:
          bodyValidation.error.issues[0]?.message ?? "Некоректні дані запиту",
      });

    try {
      const newTemplate = new TemplateModel({
        ...bodyValidation.data,
        urls: bodyValidation.data.urls ?? [],
      });
      const savedTemplate = await newTemplate.save();
      const normalized = normalizeTemplate(savedTemplate.toObject());
      return res.status(201).json(normalized);
    } catch (error) {
      console.warn("Помилка створення шаблону", error);
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      return res.status(500).json({ message: "Помилка сервера: " + message });
    }
  }
);

router.put(
  "/update/:id",
  async (
    req: Request<
      TemplateIdParamsT,
      TemplateT | TemplateMessageResponseT,
      TemplateUpdateBodyT,
      TemplatePasswordQueryT
    >,
    res: Response<TemplateT | TemplateMessageResponseT>
  ) => {
    const queryValidation = templatePasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validatePassword(queryValidation.data, res))
      return res.status(401).json({ message: "Невірний код доступу" });

    const paramsValidation = templateIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    const bodyValidation = templateUpdateSchema.safeParse(req.body);
    if (!bodyValidation.success)
      return res.status(400).json({
        message:
          bodyValidation.error.issues[0]?.message ?? "Некоректні дані запиту",
      });

    try {
      const updatedTemplate = await TemplateModel.findByIdAndUpdate(
        paramsValidation.data.id,
        { $set: bodyValidation.data },
        { new: true, lean: true, runValidators: true }
      ).exec();
      if (!updatedTemplate)
        return res.status(404).json({ message: "Шаблон не знайдено" });

      const normalized = normalizeTemplate(updatedTemplate);
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка оновлення шаблону", error);
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      return res.status(500).json({ message: "Помилка сервера: " + message });
    }
  }
);

router.delete(
  "/delete/:id",
  async (
    req: Request<
      TemplateIdParamsT,
      TemplateMessageResponseT,
      unknown,
      TemplatePasswordQueryT
    >,
    res: Response<TemplateMessageResponseT>
  ) => {
    const queryValidation = templatePasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validatePassword(queryValidation.data, res))
      return res.status(401).json({ message: "Невірний код доступу" });

    const paramsValidation = templateIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    try {
      const deletedTemplate = await TemplateModel.findByIdAndDelete(
        paramsValidation.data.id
      ).exec();
      if (!deletedTemplate)
        return res.status(404).json({ message: "Шаблон не знайдено" });

      return res.status(200).json({ message: "Шаблон успішно видалено" });
    } catch (error) {
      console.warn("Помилка видалення шаблону", error);
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      return res.status(500).json({ message: "Помилка сервера: " + message });
    }
  }
);

export default router;
