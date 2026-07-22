export const PERMISSIONS = {
  SUPERADMIN: "*",
  MANAGER: [
    "products:read", "products:write",
    "categories:read", "categories:write",
    "inventory:read", "inventory:write",
    "orders:read", "orders:write",
    "customers:read", "customers:write",
    "dashboard:read", "reports:read",
    "audit_logs:read",
  ],
  VIEWER: [
    "products:read", "categories:read", "inventory:read",
    "orders:read", "customers:read", "dashboard:read",
    "reports:read", "audit_logs:read",
  ],
} as const;

export const ROLE_HIERARCHY = {
  superadmin: 3,
  manager: 2,
  viewer: 1,
} as const;

export const ERROR_CODES = {
  INSUFFICIENT_STOCK: 409,
  BREAKING_CATEGORY_SCHEMA_CHANGE: 409,
  SOFT_DELETED_CUSTOMER_EXISTS: 409,
  RBAC_DENIED: 403,
  REFRESH_TOKEN_REUSED: 401,
  PAYMENT_INTENT_FAILED: 502,
  VALIDATION_ERROR: 422,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  RATE_LIMITED: 429,
} as const;

export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

export const ATTRIBUTE_TYPE_LABELS: Record<string, string> = {
  string: "Text",
  number: "Number",
  boolean: "Yes/No",
  enum: "Dropdown",
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "CA$",
  AUD: "A$",
};

