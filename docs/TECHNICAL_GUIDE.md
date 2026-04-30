# Technical Guide - Frontend

This document provides in-depth technical details about the frontend architecture and implementation of the E-commerce Admin Dashboard.

## 🔑 Authentication Flow

The application uses JWT-based authentication with Access and Refresh tokens.

1.  **Login**: The user submits credentials to `/auth/login`. On success, the backend returns an `accessToken` (short-lived) and sets a `refreshToken` as an HTTP-only cookie.
2.  **Persistence**: The `accessToken` is stored in `localStorage` as `access_token`.
3.  **Request Interceptor**: Every request via `api-client.ts` automatically attaches the `Authorization: Bearer <token>` header.
4.  **Token Refresh**: If a request returns a `401 Unauthorized` error, the response interceptor automatically attempts to refresh the token by calling `/auth/refresh`. If successful, it retries the original request. If refresh fails, the user is redirected to `/login`.

## 🎨 Theme System

We use `next-themes` combined with Tailwind CSS 4 for a robust light/dark mode system.

-   **Semantic Colors**: Colors are defined using CSS variables in `globals.css`. Instead of `bg-white`, we use semantic classes like `bg-background`, `text-foreground`, etc.
-   **Hook Usage**: Use the `useTheme` hook to programmatically switch themes.
-   **Persistence**: The theme preference is persisted in `localStorage`.

## 🛡 Role-Based Access Control (RBAC)

The application implements a granular RBAC system defined in `src/lib/auth.ts`.

-   **Roles**: `superadmin`, `manager`, and default `viewer`.
-   **Permissions**: Each role is mapped to a set of permissions (e.g., `products:read`, `orders:write`).
-   **Superadmin**: Has global access (`*`) and bypasses all permission checks.
-   **Usage**: Components can use the `hasPermission` method from the `useAuth` hook to conditionally render UI elements or protect actions.

## 🏗 Component Patterns

### UI Components
Base components are located in `src/components/ui`. These are low-level, reusable primitives (Button, Input, Card, etc.) that should not contain business logic.

### Page Components
Located within the `app/` directory. They handle data fetching (usually via hooks) and layout assembly.

### Forms and Validation
We use **React Hook Form** (if applicable) or standard React state with **Zod** for validation.
Example validation schema:
```typescript
const productSchema = zod.object({
  name: zod.string().min(2, "Name is required"),
  price: zod.number().positive(),
  // ...
});
```

## 📡 Data Fetching

We prefer **Server Components** for static data and **Client Components** with React hooks (or TanStack Query if added) for interactive data fetching.

-   **Standard Pattern**: Fetch data in a custom hook or directly in the component using `useEffect` (or `use` in Next.js 16).
-   **Error Handling**: Use the `getApiError` helper from `api-client.ts` to display user-friendly error messages via `sonner` toasts.

## 📂 Key Directories and Files

-   `src/lib/api-client.ts`: The central Axios instance.
-   `src/providers/`: Contains `ThemeProvider`, `AuthProvider`, and other global contexts.
-   `src/app/(dashboard)/layout.tsx`: Defines the sidebar and top navigation for all dashboard pages.
-   `src/middleware.ts`: Handles route protection (redirecting unauthenticated users from `/dashboard` to `/login`).

## 🛠 Adding a New Page

1.  Create a new directory in `src/app/(dashboard)/`.
2.  Add a `page.tsx` file.
3.  Define any page-specific components in a `components/` subfolder if they are not reusable elsewhere.
4.  Update the sidebar navigation in `src/components/layout/Sidebar.tsx` (if applicable).

## 🧪 Best Practices

-   **TypeScript Everywhere**: Use strict type definitions for all data structures and API responses.
-   **Early Returns**: Use early returns for loading and error states to keep component logic clean.
-   **CSS Variables**: Use the design system's CSS variables instead of hardcoded hex values.
-   **Component Splitting**: Keep components small and focused on a single responsibility.
