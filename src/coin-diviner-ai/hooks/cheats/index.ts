import axios from "axios";

interface PumpToken {
  id: string;
  name: string;
  symbol: string;
  created_unix_timestamp: number;
  image_uri: string;
  twitter_handle?: string;
  metadata_uri?: string;
}

export const getNewPumpTokens = async () => {
  try {
    const { data } = await axios.get<PumpToken[]>(
      "https://pump.fun/api/coins?sort=created_timestamp&limit=20"
    );

    const formatted = data.map((token) => ({
      name: token.name,
      symbol: token.symbol,
      createdAt: new Date(token.created_unix_timestamp * 1000).toLocaleString(),
      image: token.image_uri,
      twitter: token.twitter_handle || "—",
    }));

    console.table(formatted);
  } catch (error) {
    console.error("❌ Помилка при завантаженні токенів:", error);
  }
};
