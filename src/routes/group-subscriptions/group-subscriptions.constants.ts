export const SUBSCRIPTION_TYPES_ENUM = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
] as const;

export type SubscriptionType = (typeof SUBSCRIPTION_TYPES_ENUM)[number];
