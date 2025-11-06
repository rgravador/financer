-- ============================================================
-- SEED SYSTEM ADMIN USER
-- ============================================================
-- Creates system administrator with full access
-- User ID reference from auth-users.json
-- ============================================================

-- Disable RLS temporarily for seeding
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;

-- System Administrator (No tenant association)
INSERT INTO users_profile (
  id,
  tenant_id,
  email,
  role,
  full_name,
  avatar_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  '1572941a-8367-4bb5-a27a-adab595ba441',
  NULL, -- System admin has no tenant
  'admin@financer.com',
  'admin',
  'System Administrator',
  NULL,
  true,
  '2025-11-05 17:34:31.279401+00',
  '2025-11-05 17:34:31.296838+00'
) ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active;

-- Re-enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Verification
SELECT
  'Admin user seeded:' as info,
  full_name,
  email,
  role,
  'No Tenant' as tenant
FROM users_profile
WHERE role = 'admin';
