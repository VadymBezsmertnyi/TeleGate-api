import z from "zod";
import {
  addFavoriteSchema,
  favoriteResponseSchema,
  favoriteListResponseSchema,
  deleteResponseSchema,
  favoriteRecordSchema,
  checkFavoriteResponseSchema,
} from "./favorites.schemas";

export type TAddFavorite = z.infer<typeof addFavoriteSchema>;
export type TFavoriteResponse = z.infer<typeof favoriteResponseSchema>;
export type TFavoriteListResponse = z.infer<typeof favoriteListResponseSchema>;
export type TDeleteResponse = z.infer<typeof deleteResponseSchema>;
export type TFavoriteRecord = z.infer<typeof favoriteRecordSchema>;
export type TCheckFavoriteResponse = z.infer<
  typeof checkFavoriteResponseSchema
>;
