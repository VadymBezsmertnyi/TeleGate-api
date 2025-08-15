export const GROUPS_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_SORT_BY: "createdAt",
  DEFAULT_ORDER: "desc",
  SORT_FIELDS: ["createdAt", "updatedAt", "name", "membersCount"] as const,
  ORDER_VALUES: ["asc", "desc"] as const,
  STATUS_VALUES: [
    "creator",
    "administrator",
    "member",
    "restricted",
    "left",
    "kicked",
  ] as const,
  GROUP_TYPES: ["private", "group", "supergroup", "channel"] as const,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
