-- ============================================================
-- VERIFY AND FIX ADMIN POLICIES
-- ============================================================
-- Run this to verify admin policies are working correctly
-- ============================================================

-- Check existing policies on users_profile table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users_profile'
ORDER BY policyname;

-- If policies are missing, uncomment and run below:

/*
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

-- Recreate admin policies
DROP POLICY IF EXISTS "Admins can view all users" ON users_profile;
CREATE POLICY "Admins can view all users"
  ON users_profile FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own profile" ON users_profile;
CREATE POLICY "Users can view their own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any user profile" ON users_profile;
CREATE POLICY "Admins can update any user profile"
  ON users_profile FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON users_profile;
CREATE POLICY "Users can update their own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id);

-- Verify policies were created
SELECT 'Policies created successfully' as status;
*/

-- Test query to see if admin can view all profiles
-- (Run this while logged in as admin user)
-- SELECT * FROM users_profile;
