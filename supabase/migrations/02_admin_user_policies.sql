-- ============================================================
-- ADD ADMIN POLICIES FOR USERS_PROFILE
-- ============================================================
-- This migration adds RLS policies to allow admins to view and update all user profiles
-- Run this if you need to grant admin access to user profiles
-- ============================================================

-- Helper function to check if current user is admin (bypasses RLS)
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

-- Add policy for admins to view all users
DROP POLICY IF EXISTS "Admins can view all users" ON users_profile;
CREATE POLICY "Admins can view all users"
  ON users_profile FOR SELECT
  USING (is_admin());

-- Add policy for admins to update any user profile
DROP POLICY IF EXISTS "Admins can update any user profile" ON users_profile;
CREATE POLICY "Admins can update any user profile"
  ON users_profile FOR UPDATE
  USING (is_admin());

-- Verification query (uncomment to verify)
-- SELECT
--   'Admin user policies created successfully' as info,
--   COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename = 'users_profile'
-- AND policyname LIKE 'Admins can%';
