import axios from "axios";

const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;
if (!REVENUECAT_API_KEY) console.warn("REVENUECAT_API_KEY не налаштований");

const revenuecatClient = axios.create({
  baseURL: "https://api.revenuecat.com/v1",
  headers: {
    Authorization: `Bearer ${REVENUECAT_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export default revenuecatClient;
