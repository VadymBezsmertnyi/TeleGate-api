import { z } from "zod";
import { cryptoCoinSchema } from "../aggregator/aggregator.schemas";

export const addFavoriteSchema = z.object({
  coinId: z.string().min(1).describe("ID криптовалюти"),
});

export const favoriteRecordSchema = z.object({
  _id: z.string().describe("ID запису"),
  userId: z.string().describe("ID користувача"),
  coinId: z.string().describe("ID крипти"),
  coin: cryptoCoinSchema
    .optional()
    .nullable()
    .describe("Дані про криптовалюту"),
  createdAt: z.string().describe("Час додавання"),
  updatedAt: z.string().describe("Час оновлення"),
});

export const favoriteResponseSchema = z.object({
  success: z.boolean().describe("Успішність операції"),
  data: favoriteRecordSchema.nullable().describe("Дані улюбленої криптовалюти"),
});

export const favoriteListResponseSchema = z.object({
  success: z.boolean().describe("Успішність операції"),
  data: z.array(favoriteRecordSchema).describe("Список улюблених криптовалют"),
});

export const deleteResponseSchema = z.object({
  success: z.boolean().describe("Успішність операції"),
  message: z.string().describe("Повідомлення про результат"),
});

export const checkFavoriteResponseSchema = z.object({
  success: z.boolean().describe("Успішність операції"),
  isFavorite: z.boolean().describe("Чи є монета в улюблених"),
});
