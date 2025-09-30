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

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin', 'org_admin')
  )
);

CREATE POLICY "Admins can update users" ON users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);

-- Organizations table policies
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
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND u.organization_id IN (
      SELECT id FROM organizations WHERE slug = 'platform-admin'
    )
  )
);

CREATE POLICY "Org admins can view their organization" ON organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid()
    AND role = 'org_admin'
  )
);

-- Audit logs policies (admins only)
CREATE POLICY "Admins can view audit logs" ON audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin', 'org_admin')
  )
);

CREATE POLICY "Admins can insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin', 'org_admin')
  )
);