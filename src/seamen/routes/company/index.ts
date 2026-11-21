import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import {
  companyCreateSchema,
  companyIdParamsSchema,
  companyListSchema,
  companyPasswordQuerySchema,
  companyUpdateSchema,
} from "./company.schemas";
import {
  CompanyCreateBodyT,
  CompanyIdParamsT,
  CompanyListResponseT,
  CompanyMessageResponseT,
  CompanyPasswordQueryT,
  CompanyT,
  CompanyUpdateBodyT,
  CompanyContactSummaryT,
} from "./company.types";
import CompanyModel from "./company.model";
import CompanyContactModel from "../company-contact/company-contact.model";
import "./company.swagger";
import { normalizeCompany, validateCompanyPassword } from "./company.helps";

dotenv.config();
const router = Router();

const buildContactSummaries = async (
  companyIds: string[]
): Promise<Map<string, CompanyContactSummaryT[]>> => {
  if (companyIds.length === 0) return new Map();
  const contacts = await CompanyContactModel.find({
    companyId: { $in: companyIds },
  })
    .lean()
    .exec();
  const result = new Map<string, CompanyContactSummaryT[]>();
  contacts.forEach((contact) => {
    const companyId = String(contact.companyId);
    const sendHistory = Array.isArray(contact.sendHistory)
      ? contact.sendHistory
      : [];
    const summary: CompanyContactSummaryT = {
      contactId: String(contact._id),
      fullName: contact.fullName,
      position:
        typeof contact.position === "undefined" ? null : contact.position,
      email: typeof contact.email === "undefined" ? null : contact.email,
      success: sendHistory.filter((item: any) => item.status === "success")
        .length,
      failed: sendHistory.filter((item: any) => item.status === "failed")
        .length,
    };
    if (!result.has(companyId)) result.set(companyId, []);
    result.get(companyId)?.push(summary);
  });
  return result;
};

router.get(
  "/all",
  async (
    req: Request<
      Record<string, never>,
      CompanyListResponseT | CompanyMessageResponseT,
      unknown,
      CompanyPasswordQueryT
    >,
    res: Response<CompanyListResponseT | CompanyMessageResponseT>
  ) => {
    const queryValidation = companyPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyPassword(queryValidation.data, res)) return res;

    try {
      const companies = await CompanyModel.find().lean().exec();
      const contactMap = await buildContactSummaries(
        companies.map((company) => String(company._id))
      );
      const normalized = companyListSchema.parse(
        companies.map((company) =>
          normalizeCompany(
            company,
            contactMap.get(String(company._id)) ?? []
          )
        )
      );
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка отримання компаній", error);
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
      CompanyIdParamsT,
      CompanyT | CompanyMessageResponseT,
      unknown,
      CompanyPasswordQueryT
    >,
    res: Response<CompanyT | CompanyMessageResponseT>
  ) => {
    const queryValidation = companyPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyPassword(queryValidation.data, res)) return res;

    const paramsValidation = companyIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    try {
      const company = await CompanyModel.findById(paramsValidation.data.id)
        .lean()
        .exec();
      if (!company)
        return res.status(404).json({ message: "Компанію не знайдено" });

      const contactMap = await buildContactSummaries([
        String(company._id),
      ]);
      const normalized = normalizeCompany(
        company,
        contactMap.get(String(company._id)) ?? []
      );
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка отримання компанії", error);
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
      CompanyT | CompanyMessageResponseT,
      CompanyCreateBodyT,
      CompanyPasswordQueryT
    >,
    res: Response<CompanyT | CompanyMessageResponseT>
  ) => {
    const queryValidation = companyPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyPassword(queryValidation.data, res)) return res;

    const bodyValidation = companyCreateSchema.safeParse(req.body);
    if (!bodyValidation.success)
      return res.status(400).json({
        message:
          bodyValidation.error.issues[0]?.message ?? "Некоректні дані запиту",
      });

    try {
      const newCompany = new CompanyModel({
        name: bodyValidation.data.name,
        category: bodyValidation.data.category ?? null,
        website: bodyValidation.data.website ?? null,
        description: bodyValidation.data.description ?? null,
        country: bodyValidation.data.country ?? null,
        tags: bodyValidation.data.tags ?? [],
      });
      const savedCompany = await newCompany.save();
      const normalized = normalizeCompany(savedCompany.toObject(), []);
      return res.status(201).json(normalized);
    } catch (error) {
      console.warn("Помилка створення компанії", error);
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
      CompanyIdParamsT,
      CompanyT | CompanyMessageResponseT,
      CompanyUpdateBodyT,
      CompanyPasswordQueryT
    >,
    res: Response<CompanyT | CompanyMessageResponseT>
  ) => {
    const queryValidation = companyPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyPassword(queryValidation.data, res)) return res;

    const paramsValidation = companyIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    const bodyValidation = companyUpdateSchema.safeParse(req.body);
    if (!bodyValidation.success)
      return res.status(400).json({
        message:
          bodyValidation.error.issues[0]?.message ?? "Некоректні дані запиту",
      });

    try {
      const updateData: Record<string, unknown> = {};
      if (typeof bodyValidation.data.name !== "undefined") {
        updateData.name = bodyValidation.data.name;
      }
      if (typeof bodyValidation.data.category !== "undefined") {
        updateData.category = bodyValidation.data.category ?? null;
      }
      if (typeof bodyValidation.data.website !== "undefined") {
        updateData.website = bodyValidation.data.website ?? null;
      }
      if (typeof bodyValidation.data.description !== "undefined") {
        updateData.description = bodyValidation.data.description ?? null;
      }
      if (typeof bodyValidation.data.country !== "undefined") {
        updateData.country = bodyValidation.data.country ?? null;
      }
      if (typeof bodyValidation.data.tags !== "undefined") {
        updateData.tags = bodyValidation.data.tags ?? [];
      }

      const updatedCompany = await CompanyModel.findByIdAndUpdate(
        paramsValidation.data.id,
        { $set: updateData },
        { new: true, lean: true, runValidators: true }
      ).exec();
      if (!updatedCompany)
        return res.status(404).json({ message: "Компанію не знайдено" });

      const contactMap = await buildContactSummaries([
        String(updatedCompany._id),
      ]);
      const normalized = normalizeCompany(
        updatedCompany,
        contactMap.get(String(updatedCompany._id)) ?? []
      );
      return res.status(200).json(normalized);
    } catch (error) {
      console.warn("Помилка оновлення компанії", error);
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
      CompanyIdParamsT,
      CompanyMessageResponseT,
      unknown,
      CompanyPasswordQueryT
    >,
    res: Response<CompanyMessageResponseT>
  ) => {
    const queryValidation = companyPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        message:
          queryValidation.error.issues[0]?.message ??
          "Некоректні параметри запиту",
      });
    if (!validateCompanyPassword(queryValidation.data, res)) return res;

    const paramsValidation = companyIdParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        message:
          paramsValidation.error.issues[0]?.message ??
          "Некоректні параметри шляху",
      });

    try {
      const deletedCompany = await CompanyModel.findByIdAndDelete(
        paramsValidation.data.id
      ).exec();
      if (!deletedCompany)
        return res.status(404).json({ message: "Компанію не знайдено" });

      await CompanyContactModel.deleteMany({
        companyId: deletedCompany._id,
      }).exec();

      return res.status(200).json({ message: "Компанію успішно видалено" });
    } catch (error) {
      console.warn("Помилка видалення компанії", error);
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      return res.status(500).json({ message: "Помилка сервера: " + message });
    }
  }
);

export default router;

