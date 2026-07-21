// =========================================
// Auth Types
// =========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface AuthPayload {
  userId: string;
  role: 'superadmin' | 'manager' | 'viewer';
  jti: string;
}

// =========================================
// Product Types
// =========================================

export interface ProductVariant {
  _id: string;
  sku: string;
  price: number;
  image?: string;
  stock?: number;
  low_stock_threshold?: number;
  attributes: Record<string, any>;
}

export interface TaxSlab {
  region: string;
  rate: number;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  category_id: string;
  tags: string[];
  images: string[];
  status: 'active' | 'draft' | 'archived';
  variants: ProductVariant[];
  tax_slabs?: TaxSlab[];
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category_id: string;
  tags: string[];
  images: string[];
  status: 'active' | 'draft' | 'archived';
  variants: Omit<ProductVariant, '_id'>[];
  tax_slabs?: TaxSlab[];
}

// =========================================
// Category Types
// =========================================

export interface AttributeSchema {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'enum';
  values?: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent_id?: string;
  attribute_schema: AttributeSchema[];
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parent_id?: string;
  attribute_schema: AttributeSchema[];
}

// =========================================
// Order Types
// =========================================

export interface Address {
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  variant_id: string;
  sku: string;
  price_at_purchase: number;
  quantity: number;
  product_name?: string;
}

export interface Order {
  _id: string;
  customer_id: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'UNPAID' | 'PAID';
  stripe_payment_intent_id?: string;
  idempotency_key?: string;
  payment_deadline_at?: string;
  paid_at?: string;
  cancel_reason?: 'PAYMENT_TIMEOUT' | 'ADMIN_CANCELLED' | 'MANUAL_REMEDIATION' | null;
  shipping_address: Address;
  items: OrderItem[];
  total_amount: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
}

export interface UpdateOrderStatusRequest {
  status: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  cancel_reason?: string;
}

// =========================================
// Customer Types
// =========================================

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  address?: Address;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: Address;
}

// =========================================
// Inventory Types
// =========================================

export interface InventoryItem {
  _id: string;
  product_id: string;
  sku: string;
  stock: number;
  reserved: number;
  low_stock_threshold: number;
  product_name?: string;
  available?: number;
}

export interface ManualAdjustmentRequest {
  delta: number;
  reason: string;
}

// =========================================
// Dashboard Types
// =========================================

export interface DashboardSummary {
  today_revenue: number;
  weekly_revenue: number;
  monthly_revenue: number;
  order_counts: Record<string, number>;
  today_order_count?: number;
}

export interface TopProduct {
  product_id: string;
  name: string;
  sku: string;
  units_sold: number;
  revenue: number;
}

// =========================================
// Report Types
// =========================================

export interface SalesReport {
  total_revenue: number;
  order_count: number;
  revenue_by_day: { date: string; revenue: number; orders: number }[];
  top_products: TopProduct[];
}

export interface InventoryReport {
  low_stock_items: (InventoryItem & { product_name: string })[];
  summary: { total_low_stock: number; total_out_of_stock: number };
}

// =========================================
// Audit Log Types
// =========================================

export interface AuditLog {
  _id: string;
  actor_type: 'admin' | 'system' | 'webhook';
  actor_id?: string;
  actor_name?: string;
  action: string;
  result: 'success' | 'rejected' | 'failed';
  entity_type: string;
  entity_id?: string;
  changes?: { before?: any; after?: any };
  error_code?: string;
  error_message?: string;
  ip?: string;
  created_at: string;
}

// =========================================
// Pagination Types
// =========================================

export interface PaginatedResponse<T> {
  items: T[];
  next_cursor?: string;
  has_more: boolean;
}

export interface PaginationParams {
  limit?: number;
  cursor?: string;
  sort?: string;
  [key: string]: any;
}

// =========================================
// User/Role Types
// =========================================

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'manager' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

// =========================================
// Error Types
// =========================================

export interface ApiError {
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface UploadUrlResponse {
  uploadUrl: string;
  objectUrl: string;
}

// =========================================
// Settings Types
// =========================================

export interface TaxRule {
  _id?: string;
  country: string;
  countryCode?: string;
  state: string;
  stateCode?: string;
  rate: number;
  name: string;
  active: boolean;
}

export interface GstVatSettings {
  enabled: boolean;
  gstin?: string;
  vatNumber?: string;
  inclusive: boolean;
}

export interface GeneralSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  logoUrl?: string;
  faviconUrl?: string;
  currency: string;
  timeZone: string;
  language: string;
}

export interface StateConfig {
  name: string;
  code: string;
}

export interface CountryConfig {
  _id?: string;
  name: string;
  code: string;
  states: StateConfig[];
}

export interface TaxSettings {
  taxRules: TaxRule[];
  gstVatSettings: GstVatSettings;
  countriesConfig?: CountryConfig[];
}

export interface PaymentGatewayConfig {
  enabled: boolean;
  sandbox: boolean;
  keyId: string;
  secretKey: string;
  webhookSecret: string;
}

export interface CodSettings {
  enabled: boolean;
  minOrderAmount: number;
  maxOrderAmount: number;
  instructions: string;
}

export interface Settings {
  _id: string;
  general: GeneralSettings;
  taxes: TaxSettings;
  reviews?: {
    auto_publish: boolean;
  };
  payments?: {
    razorpay: PaymentGatewayConfig;
    stripe: PaymentGatewayConfig;
    cod: CodSettings;
  };
  created_at: string;
  updated_at: string;
}

// =========================================
// Review Types
// =========================================

export interface AdminReply {
  text: string;
  replied_at: string;
  replied_by: string;
}

export interface Review {
  _id: string;
  product_id: {
    _id: string;
    name: string;
  } | string;
  customer_id: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_reply?: AdminReply;
  created_at: string;
  updated_at: string;
}


