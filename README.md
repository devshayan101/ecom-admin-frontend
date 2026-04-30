# E-commerce Admin Dashboard - Frontend

A modern, high-performance, and feature-rich E-commerce Admin Dashboard built with **Next.js 16**, **TypeScript**, and **Tailwind CSS 4**. This dashboard provides a comprehensive suite of tools for managing products, orders, customers, and business operations.

## 🚀 Key Features

- **📊 Dynamic Dashboard**: Real-time overview of sales, orders, and key business metrics.
- **📦 Product Management**: Full CRUD for products with support for variants, images, and category-specific schemas.
- **📁 Category Management**: Hierarchical category structure with custom attribute definitions.
- **🛒 Order Tracking**: Manage the full lifecycle of customer orders.
- **👥 Customer Relations**: View customer history, manage profiles, and track engagement.
- **🔐 Advanced RBAC**: Role-based access control for managing admin users and permissions.
- **📜 Audit Logs**: Comprehensive logging of all administrative actions for security and transparency.
- **🌓 Dark Mode**: Premium dark and light mode support with semantic theming.
- **📱 Responsive Design**: Fully optimized for desktop and mobile viewports.
- **⚡ Performance**: Built with Next.js 16 App Router and Turbopack for lightning-fast development and runtime performance.

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: [Axios](https://axios-http.com/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Form Validation**: [Zod](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.stevenly.me/)
- **Utilities**: [clsx](https://github.com/lukeed/clsx), [dayjs](https://day.js.org/)

## 📂 Project Structure

```text
src/
├── app/              # Next.js App Router routes
│   ├── (auth)/       # Authentication routes (Login, Reset Password)
│   ├── (dashboard)/  # Main dashboard application routes
│   ├── globals.css   # Global styles and Tailwind configuration
│   └── layout.tsx    # Root layout
├── components/       # Reusable UI components
│   ├── ui/           # Base UI primitives (buttons, inputs, etc.)
│   ├── dashboard/    # Dashboard-specific components
│   └── layout/       # Shared layout components (Sidebar, Navbar)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions, API client, and shared types
├── providers/        # Context providers (Theme, Auth, Query)
└── types/            # TypeScript interface and type definitions
```

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [Bun](https://bun.sh/) (Recommended) or npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/devshayan101/ecom-admin-frontend.git
   cd ecom-admin-frontend
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_BUSINESS_TIMEZONE=UTC
   ```

4. Run the development server:
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 API Integration

The frontend communicates with the Hono backend using a centralized Axios client located in `src/lib/api-client.ts`. It includes:

- Automatic request/response interceptors.
- JWT Token management (stored in localStorage).
- Automatic token refresh logic.
- Standardized error handling.

## 🚢 Deployment

The application is optimized for deployment on [Vercel](https://vercel.com):

1. Connect your GitHub repository to Vercel.
2. Set the environment variables in the Vercel dashboard.
3. Deploy!

For other platforms, you can build and start the production server:
```bash
bun run build
bun run start
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
