# API Documentation - Frontend Integration

This document outlines how the frontend integrates with the backend API and provides a reference for the common data fetching patterns used in the application.

## 📡 Base Configuration

-   **Base URL**: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3000`)
-   **Client**: Axios instance in `src/lib/api-client.ts`
-   **Authentication**: Bearer Token in `Authorization` header.

## 🛠 API Helpers

We use a set of generic helper functions for API calls:

-   `apiGet<T>(url, config)`: Standard GET request.
-   `apiPost<T>(url, data, config)`: Standard POST request.
-   `apiPut<T>(url, data, config)`: Standard PUT request.
-   `apiDelete<T>(url, config)`: Standard DELETE request.
-   `apiGetPaginated<T>(url, params)`: Helper for paginated endpoints that returns a `PaginatedResponse<T>`.

## 📂 Data Models (Types)

Common types are defined in `src/lib/types.ts`. Key models include:

### User
```typescript
interface User {
  id: string;
  email: string;
  role: 'admin' | 'superadmin' | 'editor';
  name: string;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  variants: ProductVariant[];
}
```

## 🛤 Common Endpoints

### Authentication
-   `POST /auth/login`: Login with email and password.
-   `POST /auth/refresh`: Refresh the access token using the refresh cookie.
-   `POST /auth/logout`: Revoke tokens and clear session.

### Products
-   `GET /products`: List products (paginated).
-   `POST /products`: Create a new product.
-   `GET /products/:id`: Get product details.
-   `PUT /products/:id`: Update a product.
-   `DELETE /products/:id`: Delete a product.

### Categories
-   `GET /categories`: List all categories.
-   `POST /categories`: Create a category.
-   `GET /categories/:id`: Get category details and custom attributes.

### Orders
-   `GET /orders`: List orders (paginated).
-   `GET /orders/:id`: Get order details and items.
-   `PATCH /orders/:id/status`: Update order status.

## ⚠️ Error Handling

Errors from the API are caught and parsed using `getApiError(error)`. This function extracts the message from the backend's standard error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## 🔄 Pagination Pattern

Paginated requests expect `page` and `limit` parameters and return data in this format:

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```
Use `apiGetPaginated` to handle these responses with full TypeScript support.
