import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import { Types } from "mongoose";
import {
  emailPasswordQuerySchema,
  emailSendSchema,
  emailSendResponseSchema,
} from "./email.schemas";
import {
  EmailMessageResponseT,
  EmailPasswordQueryT,
  EmailSendBodyT,
  EmailSendResponseT,
  EmailSendResultT,
} from "./email.types";
import { sendEmailFromIntegration } from "./email.helps";
import CompanyContactModel from "../company-contact/company-contact.model";
import TemplateModel from "../template/template.model";
import "./email.swagger";

dotenv.config();

const router = Router();

const validatePassword = (
  query: EmailPasswordQueryT,
  res: Response<EmailMessageResponseT>
): boolean => {
  const currentPassword = process.env.SEAMEN_PASSWORD;
  if (!currentPassword) {
    res.status(500).json({ message: "Секретний код не налаштований" });
    return false;
  }
  if (query.passwordToken !== currentPassword) {
    res.status(401).json({ message: "Невірний код доступу" });
    return false;
  }
  return true;
};

const buildHistoryEntry = (
  data: EmailSendBodyT,
  status: "success" | "failed",
  error: string | null
) => {
  const history: Record<string, unknown> = {
    type: data.templateId ? "template" : "custom",
    status,
    sentAt: new Date(),
  };
  if (data.templateId) {
    history.templateId = new Types.ObjectId(data.templateId);
  } else {
    history.subject = data.subject;
    history.content = data.html;
  }
  if (error) {
    history.errorMessage = error;
  }
  return history;
};

router.post(
  "/send",
  async (
    req: Request<
      Record<string, never>,
      EmailSendResponseT | EmailMessageResponseT,
      EmailSendBodyT,
      EmailPasswordQueryT
    >,
    res: Response<EmailSendResponseT | EmailMessageResponseT>
  ) => {
    const queryValidation = emailPasswordQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res
        .status(400)
        .json({ message: queryValidation.error.issues[0]?.message ?? "Некоректні параметри запиту" });
    }
    if (!validatePassword(queryValidation.data, res)) {
      return res;
    }

    const bodyValidation = emailSendSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res
        .status(400)
        .json({ message: bodyValidation.error.issues[0]?.message ?? "Некоректні дані запиту" });
    }
    const body = bodyValidation.data;

    try {
      const companyObjectId = new Types.ObjectId(body.companyId);
      const normalizedEmails = Array.from(
        new Set(body.to.map((item) => item.trim().toLowerCase()))
      );

      if (body.templateId) {
        const templateExists = await TemplateModel.exists({
          _id: body.templateId,
        }).exec();
        if (!templateExists) {
          return res.status(404).json({ message: "Шаблон не знайдено" });
        }
      }

      const sendResult = await sendEmailFromIntegration(
        body.integrationId,
        normalizedEmails,
        body.subject,
        body.html
      );

      const nodemailerResult = sendResult.result as
        | {
            accepted?: string[];
            rejected?: string[];
          }
        | undefined;
      const acceptedSet = new Set(
        Array.isArray(nodemailerResult?.accepted)
          ? nodemailerResult!.accepted.map((item) => item.toLowerCase())
          : []
      );
      const rejectedSet = new Set(
        Array.isArray(nodemailerResult?.rejected)
          ? nodemailerResult!.rejected.map((item) => item.toLowerCase())
          : []
      );

      const results: EmailSendResultT[] = [];

      for (const email of normalizedEmails) {
        const status: "success" | "failed" =
          sendResult.success &&
          (acceptedSet.has(email) ||
            (acceptedSet.size === 0 && !rejectedSet.has(email)))
            ? "success"
            : "failed";
        const errorMessage =
          status === "failed" ? sendResult.error ?? null : null;
        const historyEntry = buildHistoryEntry(body, status, errorMessage);

        const updatedContact = await CompanyContactModel.findOneAndUpdate(
          { companyId: companyObjectId, email },
          {
            $setOnInsert: {
              companyId: companyObjectId,
              fullName: email,
              email,
              position: null,
              phone: null,
              notes: null,
              tags: [],
            },
            $push: { sendHistory: historyEntry },
          },
          { upsert: true, new: true, lean: true, setDefaultsOnInsert: true }
        ).exec();

        results.push({
          email,
          contactId: String(updatedContact?._id ?? ""),
          status,
          error: errorMessage,
        });
      }

      const successCount = results.filter(
        (item) => item.status === "success"
      ).length;
      const response = emailSendResponseSchema.parse({
        message:
          successCount === results.length
            ? "Листи успішно відправлено"
            : successCount > 0
            ? "Деякі листи відправлено з помилками"
            : "Не вдалося відправити листи",
        results,
      });

      return res.status(200).json(response);
    } catch (error) {
      console.warn("Помилка обробки відправки листів", error);
      const message =
        error instanceof Error ? error.message : "Невідома помилка";
      return res
        .status(500)
        .json({ message: "Помилка сервера: " + message });
    }
  }
);

export default router;

