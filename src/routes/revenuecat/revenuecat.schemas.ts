import { z } from "zod";

export const RevenueCatSubscriberAttributeSchema = z.object({
  updated_at_ms: z.number(),
  value: z.string(),
});

export const RevenueCatSubscriberAttributesSchema = z
  .object({
    $apnsTokens: RevenueCatSubscriberAttributeSchema.optional(),
    $deviceVersion: RevenueCatSubscriberAttributeSchema.optional(),
    $displayName: RevenueCatSubscriberAttributeSchema.optional(),
    $idfv: RevenueCatSubscriberAttributeSchema.optional(),
    $mediaSource: RevenueCatSubscriberAttributeSchema.optional(),
    $email: RevenueCatSubscriberAttributeSchema.optional(),
    $phoneNumber: RevenueCatSubscriberAttributeSchema.optional(),
  })
  .catchall(RevenueCatSubscriberAttributeSchema.optional());

export const RevenueCatEventSchema = z.object({
  aliases: z.array(z.string()),
  app_id: z.string(),
  app_user_id: z.string(),
  commission_percentage: z.number().nullable(),
  country_code: z.string(),
  currency: z.string().nullable(),
  entitlement_id: z.string().nullable(),
  entitlement_ids: z.array(z.string()).nullable(),
  environment: z.enum(["SANDBOX", "PRODUCTION"]),
  event_timestamp_ms: z.number(),
  expiration_at_ms: z.number(),
  id: z.string(),
  is_family_share: z.boolean().nullable(),
  metadata: z.record(z.any()).nullable(),
  offer_code: z.string().nullable(),
  original_app_user_id: z.string(),
  original_transaction_id: z.string().nullable(),
  period_type: z.enum(["NORMAL", "TRIAL", "INTRO"]),
  presented_offering_id: z.string().nullable(),
  price: z.number().nullable(),
  price_in_purchased_currency: z.number().nullable(),
  product_id: z.string(),
  purchased_at_ms: z.number(),
  renewal_number: z.number().nullable(),
  store: z.enum(["APP_STORE", "PLAY_STORE", "STRIPE", "PROMOTIONAL"]),
  subscriber_attributes: RevenueCatSubscriberAttributesSchema,
  takehome_percentage: z.number().nullable(),
  tax_percentage: z.number().nullable(),
  transaction_id: z.string().nullable(),
  type: z.enum([
    "INITIAL_PURCHASE",
    "RENEWAL",
    "CANCELLATION",
    "UNCANCELLATION",
    "NON_RENEWING_PURCHASE",
    "EXPIRATION",
    "BILLING_ISSUE",
    "PRODUCT_CHANGE",
    "TEST",
  ]),
});

export const RevenueCatWebhookPayloadSchema = z.object({
  api_version: z.string(),
  event: RevenueCatEventSchema,
});

export const RevenueCatSubscriberSchema = z.object({
  entitlements: z.record(z.any()),
  first_seen: z.string(),
  last_seen: z.string(),
  management_url: z.string().nullable(),
  non_subscriptions: z.record(z.any()),
  original_app_user_id: z.string(),
  original_application_version: z.string().nullable(),
  original_purchase_date: z.string().nullable(),
  other_purchases: z.record(z.any()),
  subscriber_attributes: RevenueCatSubscriberAttributesSchema,
  subscriptions: z.record(z.any()),
});

export const RevenueCatSubscriptionResponseSchema = z.object({
  request_date: z.string(),
  request_date_ms: z.number(),
  subscriber: RevenueCatSubscriberSchema,
});
