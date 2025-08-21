import axios, { AxiosInstance } from "axios";

const REVENUECAT_API_KEY_V1 = process.env.REVENUECAT_API_KEY_V1;
const REVENUECAT_API_KEY_V1_READ_ONLY =
  process.env.REVENUECAT_API_KEY_V1_READ_ONLY;
if (!REVENUECAT_API_KEY_V1)
  console.warn("REVENUECAT_API_KEY_V1 не налаштований");
if (!REVENUECAT_API_KEY_V1_READ_ONLY)
  console.warn("REVENUECAT_API_KEY_V1_READ_ONLY не налаштований");

const createRevenueCatClient = (
  apiKey: string,
  isV2: boolean = false
): AxiosInstance => {
  return axios.create({
    baseURL: `https://api.revenuecat.com/v${isV2 ? "2" : "1"}`,
    headers: {
      "X-Platform": "ios",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });
};

const revenuecatClientV1 = createRevenueCatClient(REVENUECAT_API_KEY_V1 || "");
const revenuecatReadOnlyClientV2 = createRevenueCatClient(
  REVENUECAT_API_KEY_V1_READ_ONLY || "",
  true
);

export const deleteCustomer = async (projectId: string, customerId: string) => {
  return revenuecatReadOnlyClientV2.delete(
    `/projects/${projectId}/customers/${customerId}`
  );
};

export const getCustomerSubscriptions = async (projectId: string, customerId: string) => {
  return revenuecatReadOnlyClientV2.get(
    `/projects/${projectId}/customers/${customerId}/subscriptions`
  );
};

export { revenuecatClientV1, revenuecatReadOnlyClientV2 };
