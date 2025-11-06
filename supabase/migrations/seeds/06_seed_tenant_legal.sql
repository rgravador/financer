-- ============================================================
-- SEED TENANT LEGAL OFFICER USERS
-- ============================================================
-- Creates tenant legal officer users (example/template)
-- No legal officers exist in auth-users.json, so this is a template
-- Uncomment and modify as needed
-- Requires: 01_seed_tenants.sql to be run first
-- ============================================================

-- Disable RLS temporarily for seeding
-- ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;

-- Example Tenant Legal Officer (ABC Financial Services)
-- Uncomment and modify the ID to match your auth user
/*
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
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', -- Replace with actual user ID from auth
  '550e8400-e29b-41d4-a716-446655440001', -- ABC Financial Services
  'legal@financer.com',
  'tenant_legal',
  'Legal Officer',
  NULL,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active;
*/

-- Re-enable RLS
-- ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Verification
/*
SELECT
  'Tenant legal officer users seeded:' as info,
  up.full_name,
  up.email,
  up.role,
  t.company_name as tenant
FROM users_profile up
LEFT JOIN tenants t ON up.tenant_id = t.id
WHERE up.role = 'tenant_legal'
ORDER BY t.company_name;
*/

SELECT 'No tenant legal officers to seed (template file)' as info;
