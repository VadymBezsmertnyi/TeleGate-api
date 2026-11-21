import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import {
  integrationCreateSchema,
  integrationIdParamsSchema,
  integrationListSchema,
  integrationPasswordQuerySchema,
  integrationUpdateSchema,
} from "./integration.schemas";
import {
  IntegrationCreateBodyT,
  IntegrationIdParamsT,
  IntegrationListResponseT,
  IntegrationMessageResponseT,
  IntegrationPasswordQueryT,
  IntegrationT,
  IntegrationUpdateBodyT,
} from "./integration.types";
import IntegrationModel from "./integration.model";
import "./integration.swagger";
import {
  normalizeIntegration,
  validateIntegrationPassword,
} from "./integration.helps";

dotenv.config();
const router = Router();

router.get(
  "/all",
  async (
    req: Request<
      Record<string, never>,
      IntegrationListResponseT | IntegrationMessageResponseT,
      unknown,
      IntegrationPasswordQueryT
    >,
    res: Response<IntegrationListResponseT | IntegrationMessageResponseT>
  ) => {
    const queryValidation = integrationPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateIntegrationPassword(queryValidation.data, res)) return res;

    try {
      const integrations = await IntegrationModel.find().lean().exec();
      const normalized = integrationListSchema.parse(
        integrations.map((item) => normalizeIntegration(item))
      );
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка отримання інтеграцій", error);
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
      IntegrationIdParamsT,
      IntegrationT | IntegrationMessageResponseT,
      unknown,
      IntegrationPasswordQueryT
    >,
    res: Response<IntegrationT | IntegrationMessageResponseT>
  ) => {
    const queryValidation = integrationPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateIntegrationPassword(queryValidation.data, res)) return res;

    const paramsValidation = integrationIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    try {
      const integration = await IntegrationModel.findById(
        paramsValidation.data.id
      )
        .lean()
        .exec();
      if (!integration)
        return res.status(404).json({ message: "Інтеграцію не знайдено" });

      const normalized = normalizeIntegration(integration);
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка отримання інтеграції", error);
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
      IntegrationT | IntegrationMessageResponseT,
      IntegrationCreateBodyT,
      IntegrationPasswordQueryT
    >,
    res: Response<IntegrationT | IntegrationMessageResponseT>
  ) => {
    const queryValidation = integrationPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateIntegrationPassword(queryValidation.data, res)) return res;

    const bodyValidation = integrationCreateSchema.safeParse(req.body);
    if (!bodyValidation.success)
      return res.status(400).json({
        message:
          bodyValidation.error.issues[0]?.message ?? "Некоректні дані запиту",
      });

    try {
      const newIntegration = new IntegrationModel(bodyValidation.data);
      const savedIntegration = await newIntegration.save();
      const normalized = normalizeIntegration(savedIntegration.toObject());
      return res.status(201).json(normalized);
    } catch (error) {
      console.warn("Помилка створення інтеграції", error);
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
      IntegrationIdParamsT,
      IntegrationT | IntegrationMessageResponseT,
      IntegrationUpdateBodyT,
      IntegrationPasswordQueryT
    >,
    res: Response<IntegrationT | IntegrationMessageResponseT>
  ) => {
    const queryValidation = integrationPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateIntegrationPassword(queryValidation.data, res)) return res;

    const paramsValidation = integrationIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    const bodyValidation = integrationUpdateSchema.safeParse(req.body);
    if (!bodyValidation.success)
      return res.status(400).json({
        message:
          bodyValidation.error.issues[0]?.message ?? "Некоректні дані запиту",
      });

    try {
      const updatedIntegration = await IntegrationModel.findByIdAndUpdate(
        paramsValidation.data.id,
        { $set: bodyValidation.data },
        { new: true, lean: true, runValidators: true }
      ).exec();
      if (!updatedIntegration)
        return res.status(404).json({ message: "Інтеграцію не знайдено" });

      const normalized = normalizeIntegration(updatedIntegration);
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка оновлення інтеграції", error);
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
      IntegrationIdParamsT,
      IntegrationMessageResponseT,
      unknown,
      IntegrationPasswordQueryT
    >,
    res: Response<IntegrationMessageResponseT>
  ) => {
    const queryValidation = integrationPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateIntegrationPassword(queryValidation.data, res)) return res;

    const paramsValidation = integrationIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    try {
      const deletedIntegration = await IntegrationModel.findByIdAndDelete(
        paramsValidation.data.id
      ).exec();
      if (!deletedIntegration)
        return res.status(404).json({ message: "Інтеграцію не знайдено" });

      return res.status(200).json({ message: "Інтеграцію успішно видалено" });
    } catch (error) {
      console.warn("Помилка видалення інтеграції", error);
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      return res.status(500).json({ message: "Помилка сервера: " + message });
    }
  }
);

export default router;

