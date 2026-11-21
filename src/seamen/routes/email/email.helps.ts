import nodemailer from "nodemailer";
import striptags from "striptags";
import IntegrationModel from "../integration/integration.model";
import { IntegrationT } from "../integration/integration.types";

export const sendEmailFromIntegration = async (
  integrationId: string,
  to: string[],
  subject: string,
  html: string
): Promise<{ success: boolean; result?: unknown; error?: string }> => {
  try {
    const integration = (await IntegrationModel.findById(integrationId)
      .lean()
      .exec()) as IntegrationT | null;
    if (!integration)
      return {
        success: false,
        error: "Інтеграцію не знайдено",
      };

    if (!integration.data || integration.data.type !== "email") {
      return {
        success: false,
        error: "Неправильний тип інтеграції",
      };
    }

    const transporter = nodemailer.createTransport({
      host: integration.data.host,
      port: integration.data.port,
      secure: integration.data.secure,
      auth: {
        user: integration.data.user,
        pass: integration.data.pass,
      },
    });

    const result = await transporter.sendMail({
      from: integration.data.user,
      to: to.join(", "),
      subject,
      html,
      text: striptags(html),
    });

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.warn("Помилка відправки email через інтеграцію:", error);
    let errorMessage = "Помилка відправки email через інтеграцію";
    if (error && typeof error === "object") {
      const err = error as any;
      if (err.code === "EAUTH") {
        errorMessage =
          "Помилка автентифікації. Перевірте логін, пароль або App Password";
      } else if (err.responseCode) {
        errorMessage = `Помилка SMTP: ${err.response || err.message}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
};
