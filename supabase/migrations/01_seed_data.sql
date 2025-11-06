-- ============================================================
-- SEED DATA FOR FINANCER APPLICATION (COMBINED VERSION)
-- ============================================================
-- This file seeds the database with initial data for development/testing
-- Run this after the initial schema migration (00_initial_schema.sql)
--
-- NOTE: For modular seeding by role, use the files in supabase/migrations/seeds/ directory
-- This combined version is kept for convenience but the modular version is preferred
-- ============================================================

-- Disable RLS temporarily for seeding
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- SEED TENANTS
-- ============================================================

-- Tenant 1: ABC Financial Services
INSERT INTO tenants (
  id,
  name,
  company_name,
  contact_email,
  contact_phone,
  address,
  is_active,
  created_at,
  updated_at,
  created_by
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Michael Johnson',
  'ABC Financial Services',
  'contact@abcfinancial.com',
  '+1 (555) 123-4567',
  '123 Main Street, New York, NY 10001',
  true,
  NOW(),
  NOW(),
  '1572941a-8367-4bb5-a27a-adab595ba441' -- Created by admin
);

-- Tenant 2: XYZ Lending Corporation
INSERT INTO tenants (
  id,
  name,
  company_name,
  contact_email,
  contact_phone,
  address,
  is_active,
  created_at,
  updated_at,
  created_by
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'Sarah Williams',
  'XYZ Lending Corporation',
  'info@xyzlending.com',
  '+1 (555) 987-6543',
  '456 Oak Avenue, Los Angeles, CA 90001',
  true,
  NOW(),
  NOW(),
  '1572941a-8367-4bb5-a27a-adab595ba441' -- Created by admin
);

-- ============================================================
-- SEED USER PROFILES
-- ============================================================

-- Admin User (System Administrator - No tenant)
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
);

-- User 2: Redgie Gravador (Tenant Admin for ABC Financial Services)
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
);

-- User 3: Loan Approver (Tenant Approver for ABC Financial Services)
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
);

-- User 4: Tenant Admin (Tenant Admin for XYZ Lending Corporation)
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
);

-- User 5: John Officer (Tenant Officer for ABC Financial Services)
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
);

-- User 6: Jane Officer (Tenant Officer for XYZ Lending Corporation)
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
);

-- ============================================================
-- RE-ENABLE RLS
-- ============================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICATION QUERIES (commented out - uncomment to verify)
-- ============================================================

-- SELECT 'Tenants created:' as info, COUNT(*) as count FROM tenants;
-- SELECT 'User profiles created:' as info, COUNT(*) as count FROM users_profile;
--
-- SELECT
--   up.full_name,
--   up.email,
--   up.role,
--   COALESCE(t.company_name, 'System Admin') as tenant
-- FROM users_profile up
-- LEFT JOIN tenants t ON up.tenant_id = t.id
-- ORDER BY up.role, up.full_name;
