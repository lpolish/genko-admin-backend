# Genkō Healthcare Admin Backend

A comprehensive admin backend system for the Genkō Healthcare SaaS platform, built with Next.js 15, Supabase, and modern React technologies.

## Features

- **Role-based Authentication**: Super admin, organization admin, and user management
- **Dashboard Analytics**: Real-time metrics, KPIs, and data visualization
- **Organization Management**: Multi-tenant organization administration
- **User Management**: Global user search, role management, and bulk operations
- **Billing & Revenue Analytics**: Stripe integration and MRR/ARR tracking
- **Security & Compliance**: Audit logs and suspicious activity monitoring
- **Content Management**: Announcements, feature flags, and API management

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript 5.6.3
- **Styling**: Tailwind CSS v4 with custom healthcare theme
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth with custom role-based access control
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase project with database schema set up

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd genkobk
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Seed the database with initial admin user**
   ```bash
   pnpm run seed-admin
   ```

   This creates the first **Platform Super Admin** user with full system access.

   **⚠️ IMPORTANT: Default Ultra-Powered Credentials**
   ```
   Email: admin@getgenko.com
   Password: 97B2AD6D1FF7C02B734CBE53C6E171D236a9f5f9e1d12bf3
   ```

   **Security Notes:**
   - This is the **only Platform Super Admin** account with access to ALL organizations and users
   - **Platform Admins** can see all client data across the entire Genkō platform
   - **Organization Admins** (clients) can only see their own organization's data
   - Change these credentials immediately after first login for security

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

6. **Access the application**
   - Navigate to [http://localhost:3000/login](http://localhost:3000/login)
   - Log in with the admin credentials above
   - Access the dashboard at [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Available Scripts

- `pnpm run dev` - Start development server with Turbopack
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run seed-admin` - Seed database with initial super admin user

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── organizations/     # Organization management
│   ├── users/            # User management
│   ├── analytics/        # Analytics and reporting
│   ├── billing/          # Billing and revenue
│   ├── settings/         # System settings
│   └── login/            # Authentication
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui components
│   ├── dashboard/       # Dashboard-specific components
│   ├── auth/            # Authentication components
│   └── layout/          # Layout components
├── lib/                 # Utility libraries
│   ├── supabase/        # Supabase client and types
│   ├── auth/            # Authentication utilities
│   └── utils/           # General utilities
└── types/               # TypeScript type definitions
```

## Database Schema

The application uses Supabase with the following main tables:

- **users**: User accounts with role-based permissions
- **organizations**: Multi-tenant organization management
- **subscriptions**: Billing and subscription data
- **audit_logs**: Security and activity tracking

## Authentication & Authorization

### Security Architecture

The admin backend implements **enterprise-grade multi-tenant data isolation**:

- **Platform Super Admin**: Full system access across ALL organizations and users
  - Can manage all client organizations
  - Sees complete platform analytics
  - Manages billing and subscriptions
  - Access to audit logs and system settings

- **Organization Admin**: Limited access to their specific organization only
  - Can only see their own organization's data
  - Cannot access other clients' information
  - Manages users within their organization

- **Data Isolation**: Complete separation ensures client data privacy
  - Platform admins see everything (for Genkō owners)
  - Organization admins see only their data (for clients)
  - Zero cross-contamination risk

### User Roles

- **Super Admin** (`admin`): Platform-level administrative access
- **Organization Admin** (`org_admin`): Organization-level administrative access
- **Staff/Provider/Patient**: Healthcare-specific roles with limited access

### Security Features

- Role-based access control (RBAC)
- Multi-tenant data isolation
- Audit logging for all administrative actions
- Secure authentication with Supabase Auth
- Environment-based configuration management

## Development

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (via ESLint)

### Database Migrations

Database schema changes should be managed through Supabase migrations. Update the types in `src/types/database.ts` when the schema changes.

### Environment Variables

See `.env.example` for all required environment variables. Never commit `.env.local` to version control.

## Deployment

### Production Setup

1. **Deploy to Vercel** (or your preferred platform)
   ```bash
   pnpm run build
   # Deploy the .next folder and required files
   ```

2. **Configure Production Environment Variables in Vercel**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your production Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your production Supabase service role key
   - Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

3. **Seed Production Super Admin User**
   
   **⚠️ IMPORTANT**: Never run database seeding scripts in serverless environments like Vercel. Instead, seed the production database locally:
   
   ```bash
   # Option 1: Using environment variables
   export PRODUCTION_SUPABASE_URL="https://your-project.supabase.co"
   export PRODUCTION_SUPABASE_SERVICE_KEY="your-service-role-key"
   pnpm run seed-production-admin
   
   # Option 2: Using command line arguments
   pnpm run seed-production-admin "https://your-project.supabase.co" "your-service-role-key"
   
   # Option 3: Using the script directly
   node scripts/seed-production-admin.js "https://your-project.supabase.co" "your-service-role-key"
   ```
   
   This creates the super admin user with the documented credentials in your production database.

4. **Verify Deployment**
   - Access your Vercel deployment URL
   - Navigate to `/login`
   - Log in with the super admin credentials
   - Access the dashboard at `/dashboard`

### Local Development Setup

For local development with a separate Supabase project:

1. **Build the application**:
   ```bash
   pnpm run build
   ```

2. **Seed local admin user**:
   ```bash
   pnpm run seed-admin
   ```

3. **Start development server**:
   ```bash
   pnpm run dev
   ```

## Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commits

## License

This project is part of the Genkō Healthcare platform. See LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the project repository.
