# Database Setup Guide

## Overview

The Genkō admin backend uses Supabase PostgreSQL with **organization-scoped Row Level Security (RLS)** policies for multi-tenant SaaS security. Each organization's admin users can only access data within their own organization, preventing cross-company data leakage.

## Security Model

### Multi-Tenant Architecture
- **Organization-scoped access**: Users can only see data from their own organization
- **Platform admin override**: Users in the 'platform-admin' organization have global access
- **SaaS-first design**: All users are organization admins within their company context

### Access Levels
1. **Platform Admin**: Global access (users in 'platform-admin' organization)
2. **Organization Admin**: Access to their organization's data only
3. **Regular User**: Access to their own profile (not implemented in current SaaS model)

## Tables

### users
- Stores user profiles with organization associations
- Fields: id, email, role, status, organization_id, created_at, updated_at
- **Security**: Users can only see other users in their same organization

### organizations
- Stores organization information
- Fields: id, slug, name, subscription_tier, subscription_status, created_at
- **Security**: Users can only see their own organization (except platform admins)

### audit_logs
- Stores audit trails for admin actions
- Fields: id, user_id, action, resource, details, created_at
- **Security**: Users can only see audit logs from their organization

## RLS Policies

### Users Table Policies - Organization-Scoped

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Users can view other users in their organization (SaaS security)
CREATE POLICY "Users can view organization members" ON users
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  )
);

-- Users can update other users in their organization
CREATE POLICY "Users can update organization members" ON users
FOR UPDATE USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  )
);

-- Platform admins can view all users globally
CREATE POLICY "Platform admins can view all users" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND o.slug = 'platform-admin'
  )
);
```

### Organizations Table Policies - Organization-Scoped

```sql
-- Users can view their own organization
CREATE POLICY "Users can view own organization" ON organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  )
);

-- Platform admins can view all organizations
CREATE POLICY "Platform admins can view all organizations" ON organizations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND o.slug = 'platform-admin'
  )
);
```

### Audit Logs Policies - Organization-Scoped

```sql
-- Users can view audit logs from their organization
CREATE POLICY "Users can view organization audit logs" ON audit_logs
FOR SELECT USING (
  user_id IN (
    SELECT id FROM users
    WHERE organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
    )
  )
);

-- Platform admins can view all audit logs
CREATE POLICY "Platform admins can view all audit logs" ON audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND o.slug = 'platform-admin'
  )
);
```

## Setup Instructions

1. Connect to your Supabase project
2. Run the SQL commands above to set up RLS policies
3. Verify policies are active in the Supabase dashboard
4. Test with admin and regular user accounts

## Troubleshooting

- 401 errors: Check if RLS policies are correctly applied
- Access denied: Verify user roles and organization associations
- Infinite recursion: Avoid self-referencing policies