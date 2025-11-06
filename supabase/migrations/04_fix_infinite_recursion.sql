-- ============================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================================
-- This migration fixes the infinite recursion error in RLS policies
-- by creating helper functions with SECURITY DEFINER that bypass RLS
-- ============================================================

-- Helper function to check if current user is admin (bypasses RLS)
DROP FUNCTION IF EXISTS is_admin();
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Helper function to get current user's tenant_id (bypasses RLS)
DROP FUNCTION IF EXISTS get_user_tenant_id();
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tenant_id_val UUID;
BEGIN
  SELECT tenant_id INTO tenant_id_val
  FROM users_profile
  WHERE id = auth.uid();

  RETURN tenant_id_val;
END;
$$;

-- Recreate Tenant Policies with helper functions
DROP POLICY IF EXISTS "Admins can view all tenants" ON tenants;
CREATE POLICY "Admins can view all tenants"
  ON tenants FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (get_user_tenant_id() = id);

DROP POLICY IF EXISTS "Admins can create tenants" ON tenants;
CREATE POLICY "Admins can create tenants"
  ON tenants FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update tenants" ON tenants;
CREATE POLICY "Admins can update tenants"
  ON tenants FOR UPDATE
  USING (is_admin());

-- Recreate User Profile Policies with helper functions
DROP POLICY IF EXISTS "Admins can view all users" ON users_profile;
CREATE POLICY "Admins can view all users"
  ON users_profile FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own profile" ON users_profile;
CREATE POLICY "Users can view their own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view users in their tenant" ON users_profile;
CREATE POLICY "Users can view users in their tenant"
  ON users_profile FOR SELECT
  USING (
    tenant_id IS NOT NULL
    AND tenant_id = get_user_tenant_id()
  );

DROP POLICY IF EXISTS "Admins can update any user profile" ON users_profile;
CREATE POLICY "Admins can update any user profile"
  ON users_profile FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON users_profile;
CREATE POLICY "Users can update their own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id);

-- Verify functions were created
SELECT 'Helper functions created:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('is_admin', 'get_user_tenant_id');

-- Verify policies were updated
SELECT 'Policies updated successfully' as status;
