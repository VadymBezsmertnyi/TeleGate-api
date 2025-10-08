import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const SECRET_KEY_TOKEN = process.env.JWT_SECRET_KEY_TOKEN as string;
const SECRET_KEY_REFRESH_TOKEN = process.env
  .JWT_SECRET_KEY_REFRESH_TOKEN as string;

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY_TOKEN);
    const verify = z
      .object({
        userId: z.string(),
        iat: z.number(),
        exp: z.number(),
      })
      .safeParse(decoded);
    if (!verify.success) return null;
    return verify.data;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY_REFRESH_TOKEN);
    const verify = z
      .object({
        userId: z.string(),
        iat: z.number(),
        exp: z.number(),
      })
      .safeParse(decoded);
    if (!verify.success) return null;
    return verify.data;
  } catch (error) {
    return null;
  }
};

export const setToken = (
  userId: string,
  time_token: "7d" | "30d",
  secretKeyToken: string
) => {
  const token = jwt.sign({ userId }, secretKeyToken, { expiresIn: time_token });
  return token;
};

export const setTokens = (userId: string) => {
  const accessToken = setToken(userId, "7d", SECRET_KEY_TOKEN);
  const refreshToken = setToken(userId, "30d", SECRET_KEY_REFRESH_TOKEN);
  return { accessToken, refreshToken };
};
