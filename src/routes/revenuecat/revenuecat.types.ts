export interface RevenueCatSubscriberAttribute {
  updated_at_ms: number;
  value: string;
}

export interface RevenueCatSubscriberAttributes {
  $apnsTokens?: RevenueCatSubscriberAttribute;
  $deviceVersion?: RevenueCatSubscriberAttribute;
  $displayName?: RevenueCatSubscriberAttribute;
  $idfv?: RevenueCatSubscriberAttribute;
  $mediaSource?: RevenueCatSubscriberAttribute;
  $email?: RevenueCatSubscriberAttribute;
  $phoneNumber?: RevenueCatSubscriberAttribute;
  [key: string]: RevenueCatSubscriberAttribute | undefined;
}

export interface RevenueCatEvent {
  aliases: string[];
  app_id: string;
  app_user_id: string;
  commission_percentage: number | null;
  country_code: string;
  currency: string | null;
  entitlement_id: string | null;
  entitlement_ids: string[] | null;
  environment: "SANDBOX" | "PRODUCTION";
  event_timestamp_ms: number;
  expiration_at_ms: number;
  id: string;
  is_family_share: boolean | null;
  metadata: Record<string, any> | null;
  offer_code: string | null;
  original_app_user_id: string;
  original_transaction_id: string | null;
  period_type: "NORMAL" | "TRIAL" | "INTRO";
  presented_offering_id: string | null;
  price: number | null;
  price_in_purchased_currency: number | null;
  product_id: string;
  purchased_at_ms: number;
  renewal_number: number | null;
  store: "APP_STORE" | "PLAY_STORE" | "STRIPE" | "PROMOTIONAL";
  subscriber_attributes: RevenueCatSubscriberAttributes;
  takehome_percentage: number | null;
  tax_percentage: number | null;
  transaction_id: string | null;
  type:
    | "INITIAL_PURCHASE"
    | "RENEWAL"
    | "CANCELLATION"
    | "UNCANCELLATION"
    | "NON_RENEWING_PURCHASE"
    | "EXPIRATION"
    | "BILLING_ISSUE"
    | "PRODUCT_CHANGE"
    | "TEST";
}

export interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

export interface RevenueCatProject {
  created_at: number;
  id: string;
  name: string;
  object: "project";
}

export interface RevenueCatCustomer {
  experiment: string | null;
  first_seen_at: number;
  id: string;
  last_seen_app_version: string;
  last_seen_at: number;
  last_seen_country: string;
  last_seen_platform: "iOS" | "android";
  last_seen_platform_version: string;
  object: "customer";
  project_id: string;
}

export interface RevenueCatListResponse<T> {
  items: T[];
  next_page: string | null;
  object: "list";
  url: string;
}

export interface RevenueCatProjectsResponse
  extends RevenueCatListResponse<RevenueCatProject> {}

export interface RevenueCatCustomersResponse
  extends RevenueCatListResponse<RevenueCatCustomer> {}

export interface RevenueCatSubscriber {
  entitlements: Record<string, any>;
  first_seen: string;
  last_seen: string;
  management_url: string | null;
  non_subscriptions: Record<string, any>;
  original_app_user_id: string;
  original_application_version: string | null;
  original_purchase_date: string | null;
  other_purchases: Record<string, any>;
  subscriber_attributes: RevenueCatSubscriberAttributes;
  subscriptions: Record<string, any>;
}

export interface RevenueCatSubscriptionResponse {
  request_date: string;
  request_date_ms: number;
  subscriber: RevenueCatSubscriber;
}
