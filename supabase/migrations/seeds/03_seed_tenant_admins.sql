-- ============================================================
-- SEED TENANT ADMIN USERS
-- ============================================================
-- Creates tenant admin users with full tenant access
-- User IDs reference from auth-users.json
-- Requires: 01_seed_tenants.sql to be run first
-- ============================================================

-- Disable RLS temporarily for seeding
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;

-- Tenant Admin 1: Redgie Gravador (ABC Financial Services)
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
  '447d2c7f-dea2-49a6-abdf-93d8a159b9d8',
  '550e8400-e29b-41d4-a716-446655440001', -- ABC Financial Services
  'redgiegravador@gmail.com',
  'tenant_admin',
  'Redgie Gravador',
  NULL,
  true,
  '2025-10-29 13:37:16.797047+00',
  '2025-11-05 16:59:03.572225+00'
) ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active;

-- Tenant Admin 2: Tenant Admin (XYZ Lending Corporation)
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
  'bb043694-ffa1-4c6e-998b-8fc4359287a3',
  '550e8400-e29b-41d4-a716-446655440002', -- XYZ Lending Corporation
  'tenant.admin@financer.com',
  'tenant_admin',
  'Tenant Admin',
  NULL,
  true,
  '2025-11-05 17:34:31.650813+00',
  '2025-11-05 17:35:47.415043+00'
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
  'Tenant admin users seeded:' as info,
  up.full_name,
  up.email,
  up.role,
  t.company_name as tenant
FROM users_profile up
LEFT JOIN tenants t ON up.tenant_id = t.id
WHERE up.role = 'tenant_admin'
ORDER BY t.company_name;
