-- ============================================================
-- SEED TENANT APPROVER USERS
-- ============================================================
-- Creates tenant approver users who can approve/reject loans
-- User IDs reference from auth-users.json
-- Requires: 01_seed_tenants.sql to be run first
-- ============================================================

-- Disable RLS temporarily for seeding
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;

-- Tenant Approver 1: Loan Approver (ABC Financial Services)
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
  'ab2cd585-79a8-47d4-8ea7-abdef4451431',
  '550e8400-e29b-41d4-a716-446655440001', -- ABC Financial Services
  'approver@financer.com',
  'tenant_approver',
  'Loan Approver',
  NULL,
  true,
  '2025-11-05 17:34:32.698649+00',
  '2025-11-05 17:34:32.710745+00'
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
  'Tenant approver users seeded:' as info,
  up.full_name,
  up.email,
  up.role,
  t.company_name as tenant
FROM users_profile up
LEFT JOIN tenants t ON up.tenant_id = t.id
WHERE up.role = 'tenant_approver'
ORDER BY t.company_name;
