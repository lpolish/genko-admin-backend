# Database Setup Guide

## Overview

The Genkō admin backend uses Supabase PostgreSQL with Row Level Security (RLS) policies to ensure secure data access.

## Tables

### users
- Stores user profiles with roles and organization associations
- Fields: id, email, role, status, organization_id, created_at, updated_at

### organizations
- Stores organization information
- Fields: id, slug, name, subscription_tier, subscription_status, created_at

### audit_logs
- Stores audit trails for admin actions
- Fields: id, user_id, action, resource, details, created_at

## RLS Policies

### Users Table Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Allow admins to view all users
CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin', 'org_admin')
  )
);

-- Allow admins to update users
CREATE POLICY "Admins can update users" ON users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);
```

### Organizations Table Policies

```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own organization
CREATE POLICY "Users can view own organization" ON organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  )
);

-- Allow platform admins to view all organizations
CREATE POLICY "Platform admins can view all organizations" ON organizations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND o.slug = 'platform-admin'
    AND u.role IN ('admin', 'super_admin')
  )
);

-- Allow org admins to view their organization
CREATE POLICY "Org admins can view their organization" ON organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
    AND role = 'org_admin'
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