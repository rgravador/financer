-- ============================================================
-- SEED TENANT OFFICER USERS
-- ============================================================
-- Creates tenant officer users who manage accounts and loans
-- User IDs reference from auth-users.json
-- Requires: 01_seed_tenants.sql to be run first
-- ============================================================

-- Disable RLS temporarily for seeding
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;

-- Tenant Officer 1: John Officer (ABC Financial Services)
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
  'dbf20878-5f10-4528-bb35-2cab0c2c3d34',
  '550e8400-e29b-41d4-a716-446655440001', -- ABC Financial Services
  'officer1@financer.com',
  'tenant_officer',
  'John Officer',
  NULL,
  true,
  '2025-11-05 17:34:32.007284+00',
  '2025-11-05 17:39:59.708829+00'
) ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active;

-- Tenant Officer 2: Jane Officer (XYZ Lending Corporation)
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
  'dd751956-fced-4955-a8fb-dd34bb12cc17',
  '550e8400-e29b-41d4-a716-446655440002', -- XYZ Lending Corporation
  'officer2@financer.com',
  'tenant_officer',
  'Jane Officer',
  NULL,
  true,
  '2025-11-05 17:34:32.339144+00',
  '2025-11-05 17:34:32.361048+00'
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
  'Tenant officer users seeded:' as info,
  up.full_name,
  up.email,
  up.role,
  t.company_name as tenant
FROM users_profile up
LEFT JOIN tenants t ON up.tenant_id = t.id
WHERE up.role = 'tenant_officer'
ORDER BY t.company_name;
