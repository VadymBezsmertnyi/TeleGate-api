import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import { Types } from "mongoose";
import {
  companyContactCreateSchema,
  companyContactIdParamsSchema,
  companyContactListSchema,
  companyContactPasswordQuerySchema,
  companyContactUpdateSchema,
} from "./company-contact.schemas";
import {
  CompanyContactCreateBodyT,
  CompanyContactIdParamsT,
  CompanyContactListResponseT,
  CompanyContactMessageResponseT,
  CompanyContactPasswordQueryT,
  CompanyContactT,
  CompanyContactUpdateBodyT,
} from "./company-contact.types";
import CompanyContactModel from "./company-contact.model";
import CompanyModel from "../company/company.model";
import TemplateModel from "../template/template.model";
import "./company-contact.swagger";
import {
  normalizeCompanyContact,
  validateCompanyContactPassword,
} from "./company-contact.helps";

dotenv.config();
const router = Router();

const buildTemplateMap = async (templateIds: string[]) => {
  if (templateIds.length === 0) return new Map<string, string | null>();
  const templates = await TemplateModel.find({ _id: { $in: templateIds } })
    .select(["name"])
    .lean()
    .exec();
  return new Map(
    templates.map((template) => [String(template._id), template.name ?? null])
  );
};

const buildCompanyMap = async (companyIds: string[]) => {
  if (companyIds.length === 0) return new Map<string, string | null>();
  const companies = await CompanyModel.find({ _id: { $in: companyIds } })
    .select(["name"])
    .lean()
    .exec();
  return new Map(
    companies.map((company) => [String(company._id), company.name ?? null])
  );
};

const collectTemplateIds = (contacts: any[]) => {
  const templateIds = new Set<string>();
  contacts.forEach((contact) => {
    if (Array.isArray(contact.sendHistory)) {
      contact.sendHistory.forEach((item: any) => {
        if (item?.type === "template" && item.templateId)
          templateIds.add(String(item.templateId));
      });
    }
  });
  return Array.from(templateIds);
};

const collectCompanyIds = (contacts: any[]) => {
  const companyIds = new Set<string>();
  contacts.forEach((contact) => {
    if (contact?.companyId) companyIds.add(String(contact.companyId));
  });
  return Array.from(companyIds);
};

const mapSendHistoryToDb = (sendHistory: any[] | undefined) =>
  sendHistory?.map((item) => ({
    type: item.type,
    templateId:
      item.type === "template" && item.templateId
        ? new Types.ObjectId(item.templateId)
        : undefined,
    subject: typeof item.subject === "undefined" ? null : item.subject,
    content: typeof item.content === "undefined" ? null : item.content,
    status: item.status,
    sentAt: item.sentAt,
    errorMessage:
      typeof item.errorMessage === "undefined" ? null : item.errorMessage,
  }));

router.get(
  "/all",
  async (
    req: Request<
      Record<string, never>,
      CompanyContactListResponseT | CompanyContactMessageResponseT,
      unknown,
      CompanyContactPasswordQueryT
    >,
    res: Response<CompanyContactListResponseT | CompanyContactMessageResponseT>
  ) => {
    const queryValidation = companyContactPasswordQuerySchema.safeParse(
      req.query
    );
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyContactPassword(queryValidation.data, res)) return res;

    try {
      const contacts = await CompanyContactModel.find().lean().exec();
      const templateIds = collectTemplateIds(contacts);
      const companyIds = collectCompanyIds(contacts);
      const [templateMap, companyMap] = await Promise.all([
        buildTemplateMap(templateIds),
        buildCompanyMap(companyIds),
      ]);
      const normalized = companyContactListSchema.parse(
        contacts.map((contact) =>
          normalizeCompanyContact(
            contact,
            contact.companyId
              ? companyMap.get(String(contact.companyId)) ?? null
              : null,
            templateMap
          )
        )
      );
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка отримання контактів компаній", error);
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
      CompanyContactIdParamsT,
      CompanyContactT | CompanyContactMessageResponseT,
      unknown,
      CompanyContactPasswordQueryT
    >,
    res: Response<CompanyContactT | CompanyContactMessageResponseT>
  ) => {
    const queryValidation = companyContactPasswordQuerySchema.safeParse(
      req.query
    );
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyContactPassword(queryValidation.data, res)) return res;

    const paramsValidation = companyContactIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    try {
      const contact = await CompanyContactModel.findById(
        paramsValidation.data.id
      )
        .lean()
        .exec();
      if (!contact)
        return res.status(404).json({ message: "Контакт не знайдено" });

      const templateIds = collectTemplateIds([contact]);
      const companyIds = collectCompanyIds([contact]);
      const [templateMap, companyMap] = await Promise.all([
        buildTemplateMap(templateIds),
        buildCompanyMap(companyIds),
      ]);
      const normalized = normalizeCompanyContact(
        contact,
        contact.companyId
          ? companyMap.get(String(contact.companyId)) ?? null
          : null,
        templateMap
      );
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка отримання контакту компанії", error);
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
      CompanyContactT | CompanyContactMessageResponseT,
      CompanyContactCreateBodyT,
      CompanyContactPasswordQueryT
    >,
    res: Response<CompanyContactT | CompanyContactMessageResponseT>
  ) => {
    const queryValidation = companyContactPasswordQuerySchema.safeParse(
      req.query
    );
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyContactPassword(queryValidation.data, res)) return res;

    const bodyValidation = companyContactCreateSchema.safeParse(req.body);
    if (!bodyValidation.success)
      return res.status(400).json({
        message:
          bodyValidation.error.issues[0]?.message ?? "Некоректні дані запиту",
      });

    try {
      let companyName: string | null = null;
      let companyObjectId: Types.ObjectId | null = null;
      if (bodyValidation.data.companyId) {
        const company = await CompanyModel.findById(
          bodyValidation.data.companyId
        )
          .lean()
          .exec();
        if (!company)
          return res.status(404).json({ message: "Компанію не знайдено" });
        companyName = company.name ?? null;
        companyObjectId = new Types.ObjectId(bodyValidation.data.companyId);
      }

      const templateIds =
        bodyValidation.data.sendHistory
          ?.filter((item) => item.type === "template")
          .map((item) => item.templateId as string) ?? [];
      if (templateIds.length > 0) {
        const templatesCount = await TemplateModel.countDocuments({
          _id: { $in: templateIds },
        }).exec();
        if (templatesCount !== templateIds.length)
          return res.status(404).json({ message: "Шаблон не знайдено" });
      }

      const sendHistory = mapSendHistoryToDb(bodyValidation.data.sendHistory);

      const newContact = new CompanyContactModel({
        companyId: companyObjectId,
        fullName: bodyValidation.data.fullName,
        position: bodyValidation.data.position ?? null,
        email: bodyValidation.data.email ?? null,
        phone: bodyValidation.data.phone ?? null,
        notes: bodyValidation.data.notes ?? null,
        tags: bodyValidation.data.tags ?? [],
        sendHistory: sendHistory ?? [],
      });
      const savedContact = await newContact.save();
      const savedObject = savedContact.toObject();
      const templateMap = await buildTemplateMap(
        collectTemplateIds([savedObject])
      );
      const normalized = normalizeCompanyContact(
        savedObject,
        companyName,
        templateMap
      );
      return res.status(201).json(normalized);
    } catch (error) {
      console.warn("Помилка створення контакту компанії", error);
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
      CompanyContactIdParamsT,
      CompanyContactT | CompanyContactMessageResponseT,
      CompanyContactUpdateBodyT,
      CompanyContactPasswordQueryT
    >,
    res: Response<CompanyContactT | CompanyContactMessageResponseT>
  ) => {
    const queryValidation = companyContactPasswordQuerySchema.safeParse(
      req.query
    );
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyContactPassword(queryValidation.data, res)) return res;

    const paramsValidation = companyContactIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    const bodyValidation = companyContactUpdateSchema.safeParse(req.body);
    if (!bodyValidation.success)
      return res.status(400).json({
        message:
          bodyValidation.error.issues[0]?.message ?? "Некоректні дані запиту",
      });

    try {
      let companyName: string | null = null;
      if (bodyValidation.data.companyId) {
        const company = await CompanyModel.findById(
          bodyValidation.data.companyId
        )
          .lean()
          .exec();
        if (!company)
          return res.status(404).json({ message: "Компанію не знайдено" });
        companyName = company.name ?? null;
      }

      const templateIds =
        bodyValidation.data.sendHistory
          ?.filter((item) => item.type === "template")
          .map((item) => item.templateId as string) ?? [];
      if (templateIds.length > 0) {
        const templatesCount = await TemplateModel.countDocuments({
          _id: { $in: templateIds },
        }).exec();
        if (templatesCount !== templateIds.length)
          return res.status(404).json({ message: "Шаблон не знайдено" });
      }

      const sendHistory = mapSendHistoryToDb(bodyValidation.data.sendHistory);

      const updateData: Record<string, unknown> = {};
      if (bodyValidation.data.companyId) {
        updateData.companyId = new Types.ObjectId(
          bodyValidation.data.companyId
        );
      }
      if (typeof bodyValidation.data.fullName !== "undefined") {
        updateData.fullName = bodyValidation.data.fullName;
      }
      if (typeof bodyValidation.data.position !== "undefined") {
        updateData.position = bodyValidation.data.position ?? null;
      }
      if (typeof bodyValidation.data.email !== "undefined") {
        updateData.email = bodyValidation.data.email ?? null;
      }
      if (typeof bodyValidation.data.phone !== "undefined") {
        updateData.phone = bodyValidation.data.phone ?? null;
      }
      if (typeof bodyValidation.data.notes !== "undefined") {
        updateData.notes = bodyValidation.data.notes ?? null;
      }
      if (typeof bodyValidation.data.tags !== "undefined") {
        updateData.tags = bodyValidation.data.tags ?? [];
      }
      if (typeof bodyValidation.data.sendHistory !== "undefined") {
        updateData.sendHistory = sendHistory ?? [];
      }

      const updatedContact = await CompanyContactModel.findByIdAndUpdate(
        paramsValidation.data.id,
        { $set: updateData },
        { new: true, lean: true, runValidators: true }
      ).exec();
      if (!updatedContact)
        return res.status(404).json({ message: "Контакт не знайдено" });

      const templateMap = await buildTemplateMap(
        collectTemplateIds([updatedContact])
      );
      const companyId = updatedContact.companyId
        ? String(updatedContact.companyId)
        : bodyValidation.data.companyId ?? null;
      let resolvedCompanyName = companyName;
      if (!resolvedCompanyName && companyId) {
        const company = await CompanyModel.findById(companyId)
          .select(["name"])
          .lean()
          .exec();
        resolvedCompanyName = company?.name ?? null;
      }

      const normalized = normalizeCompanyContact(
        updatedContact,
        resolvedCompanyName ?? null,
        templateMap
      );
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка оновлення контакту компанії", error);
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
      CompanyContactIdParamsT,
      CompanyContactMessageResponseT,
      unknown,
      CompanyContactPasswordQueryT
    >,
    res: Response<CompanyContactMessageResponseT>
  ) => {
    const queryValidation = companyContactPasswordQuerySchema.safeParse(
      req.query
    );
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyContactPassword(queryValidation.data, res)) return res;

    const paramsValidation = companyContactIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    try {
      const deletedContact = await CompanyContactModel.findByIdAndDelete(
        paramsValidation.data.id
      ).exec();
      if (!deletedContact)
        return res.status(404).json({ message: "Контакт не знайдено" });

      return res.status(200).json({ message: "Контакт успішно видалено" });
    } catch (error) {
      console.warn("Помилка видалення контакту компанії", error);
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      return res.status(500).json({ message: "Помилка сервера: " + message });
    }
  }
);

export default router;
