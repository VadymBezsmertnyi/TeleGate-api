import { TFavoriteRecord } from "./favorites.types";

export const getDataFavoriteData = (favorite: any) => {
  if (!favorite || typeof favorite !== "object" || !favorite._id) return null;

  const coin =
    favorite.coinId && typeof favorite.coinId === "object" ? favorite : null;

  const responseData: TFavoriteRecord = {
    _id: favorite._id.toString(),
    userId: favorite.userId.toString(),
    coinId:
      typeof favorite.coinId === "object"
        ? favorite.coinId._id.toString()
        : favorite.coinId.toString(),
    coin,
    createdAt: favorite.createdAt.toISOString(),
    updatedAt: favorite.updatedAt.toISOString(),
  };

  return responseData;
};
