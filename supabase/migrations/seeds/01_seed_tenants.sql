-- ============================================================
-- SEED TENANTS
-- ============================================================
-- Creates sample tenant organizations
-- ============================================================

-- Disable RLS temporarily for seeding
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

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

-- Re-enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Verification
SELECT 'Tenants seeded:' as info, COUNT(*) as count FROM tenants;
