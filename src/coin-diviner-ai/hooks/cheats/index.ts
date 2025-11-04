import axios from "axios";
import dayjs from "dayjs";
import { PumpTokenResponse } from "./cheats.types";

const MORALIS_API_KEY = process.env.MORALIS_API_KEY || "";

const threeHoursInMs = 3 * 60 * 60 * 1000;

export const getNewPumpTokensMoralis = async () => {
  try {
    const { data } = await axios.get<PumpTokenResponse>(
      "https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/new?limit=10",
      { headers: { "X-API-Key": MORALIS_API_KEY } }
    );
    console.log("✅ Успішно завантажено нові токени:", data.result);

    const formatted = data.result.map((token) => ({
      name: token.name,
      symbol: token.symbol,
      createdAt: new Date(token.createdAt).toLocaleString(),
      spentTime: dayjs(
        new Date().getTime() -
          new Date(token.createdAt).getTime() -
          threeHoursInMs
      ).format("HH:mm:ss"),
      tokenAddress: token.tokenAddress,
      priceUsd: token.priceUsd || "N/A",
    }));

    console.table(formatted);
  } catch (error) {
    console.error("❌ Помилка при завантаженні токенів:", error);
  }
};
