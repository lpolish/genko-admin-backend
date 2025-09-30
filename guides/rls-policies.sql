-- Database RLS Policies Setup for Genkō Admin Backend
-- Run this script in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Platform admins can view all organizations" ON organizations;
DROP POLICY IF EXISTS "Org admins can view their organization" ON organizations;

-- Users table policies - Organization-scoped for SaaS security
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view organization members" ON users
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update organization members" ON users
FOR UPDATE USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Platform admins can view all users" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND o.slug = 'platform-admin'
  )
);

CREATE POLICY "Platform admins can update all users" ON users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND o.slug = 'platform-admin'
  )
);

-- Organizations table policies - Organization-scoped for SaaS security
CREATE POLICY "Users can view own organization" ON organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Platform admins can view all organizations" ON organizations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND o.slug = 'platform-admin'
  )
);

-- Audit logs policies - Organization-scoped for SaaS security
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

CREATE POLICY "Users can insert organization audit logs" ON audit_logs
FOR INSERT WITH CHECK (
  user_id IN (
    SELECT id FROM users
    WHERE organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Platform admins can view all audit logs" ON audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND o.slug = 'platform-admin'
  )
);

CREATE POLICY "Platform admins can insert all audit logs" ON audit_logs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
    AND o.slug = 'platform-admin'
  )
);