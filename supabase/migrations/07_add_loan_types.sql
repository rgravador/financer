-- =====================================================
-- Loan Types Migration Script
-- =====================================================
-- This script adds the loan_types table and related functionality
-- to support configurable loan products per tenant
-- =====================================================

-- Create loan_types table (if it doesn't exist)
-- =====================================================

CREATE TABLE IF NOT EXISTS loan_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  min_amount DECIMAL(15,2) NOT NULL CHECK (min_amount >= 0),
  max_amount DECIMAL(15,2) NOT NULL CHECK (max_amount > min_amount),
  min_tenure_months INTEGER NOT NULL CHECK (min_tenure_months >= 1),
  max_tenure_months INTEGER NOT NULL CHECK (max_tenure_months > min_tenure_months),
  interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 100),
  payment_frequencies payment_frequency[] NOT NULL CHECK (array_length(payment_frequencies, 1) > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users_profile(id)
);

-- Add indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_loan_types_tenant_id ON loan_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loan_types_is_active ON loan_types(is_active);
CREATE INDEX IF NOT EXISTS idx_loan_types_created_at ON loan_types(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_types_tenant_name_unique ON loan_types(tenant_id, name) WHERE is_active = true;

-- Add updated_at trigger
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_loan_types_updated_at'
  ) THEN
    CREATE TRIGGER update_loan_types_updated_at
      BEFORE UPDATE ON loan_types
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add loan_type_id to loans table (optional foreign key)
-- =====================================================

-- Add the column first (allows NULL initially for existing loans)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'loan_type_id'
  ) THEN
    ALTER TABLE loans 
    ADD COLUMN loan_type_id UUID REFERENCES loan_types(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_loans_loan_type_id ON loans(loan_type_id);

-- Note: Transaction type enum values are added in 07a_add_transaction_types.sql

-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on loan_types table
ALTER TABLE loan_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all loan types" ON loan_types;
DROP POLICY IF EXISTS "Tenant users can view their tenant loan types" ON loan_types;
DROP POLICY IF EXISTS "Admins can create loan types" ON loan_types;
DROP POLICY IF EXISTS "Tenant admins can create loan types for their tenant" ON loan_types;
DROP POLICY IF EXISTS "Admins can update loan types" ON loan_types;
DROP POLICY IF EXISTS "Tenant admins can update their tenant loan types" ON loan_types;
DROP POLICY IF EXISTS "Admins can delete loan types" ON loan_types;
DROP POLICY IF EXISTS "Tenant admins can delete their tenant loan types" ON loan_types;

-- Policy: Admins can see all loan types
CREATE POLICY "Admins can view all loan types" ON loan_types 
  FOR SELECT 
  USING (is_admin());

-- Policy: Tenant users can see loan types for their tenant
CREATE POLICY "Tenant users can view their tenant loan types" ON loan_types 
  FOR SELECT 
  USING (
    NOT is_admin() 
    AND tenant_id = get_user_tenant_id()
  );

-- Policy: Admins can insert loan types for any tenant
CREATE POLICY "Admins can create loan types" ON loan_types 
  FOR INSERT 
  WITH CHECK (is_admin());

-- Policy: Tenant admins can insert loan types for their tenant
CREATE POLICY "Tenant admins can create loan types for their tenant" ON loan_types 
  FOR INSERT 
  WITH CHECK (
    NOT is_admin()
    AND EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() 
      AND role = 'tenant_admin' 
      AND tenant_id = loan_types.tenant_id
    )
  );

-- Policy: Admins can update any loan type
CREATE POLICY "Admins can update loan types" ON loan_types 
  FOR UPDATE 
  USING (is_admin());

-- Policy: Tenant admins can update loan types for their tenant
CREATE POLICY "Tenant admins can update their tenant loan types" ON loan_types 
  FOR UPDATE 
  USING (
    NOT is_admin()
    AND tenant_id = get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() 
      AND role = 'tenant_admin'
    )
  );

-- Policy: Admins can delete any loan type
CREATE POLICY "Admins can delete loan types" ON loan_types 
  FOR DELETE 
  USING (is_admin());

-- Policy: Tenant admins can delete loan types for their tenant
CREATE POLICY "Tenant admins can delete their tenant loan types" ON loan_types 
  FOR DELETE 
  USING (
    NOT is_admin()
    AND tenant_id = get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() 
      AND role = 'tenant_admin'
    )
  );

-- Add helpful comments
-- =====================================================

COMMENT ON TABLE loan_types IS 'Loan type templates that provide default values for loan creation. Values can be overridden when creating individual loans.';
COMMENT ON COLUMN loan_types.tenant_id IS 'The tenant this loan type template belongs to';
COMMENT ON COLUMN loan_types.name IS 'Display name for the loan type template (e.g., Personal Loan, Business Loan)';
COMMENT ON COLUMN loan_types.description IS 'Optional description of the loan type template';
COMMENT ON COLUMN loan_types.min_amount IS 'Suggested minimum loan amount for this type (can be overridden)';
COMMENT ON COLUMN loan_types.max_amount IS 'Suggested maximum loan amount for this type (can be overridden)';
COMMENT ON COLUMN loan_types.min_tenure_months IS 'Suggested minimum loan tenure in months (can be overridden)';
COMMENT ON COLUMN loan_types.max_tenure_months IS 'Suggested maximum loan tenure in months (can be overridden)';
COMMENT ON COLUMN loan_types.interest_rate IS 'Default/suggested interest rate for this loan type (can be overridden)';
COMMENT ON COLUMN loan_types.payment_frequencies IS 'Suggested payment frequencies for this loan type (can be overridden)';
COMMENT ON COLUMN loan_types.is_active IS 'Whether this loan type template is currently available for selection';
COMMENT ON COLUMN loan_types.created_by IS 'User who created this loan type template';

-- Migration completion
-- =====================================================

-- Log the migration completion (enum values should be committed by now)
INSERT INTO transactions (
  type,
  user_id,
  details
) 
SELECT 
  'create_loan_type'::transaction_type,
  id,
  jsonb_build_object(
    'migration', '07_add_loan_types',
    'action', 'schema_created',
    'timestamp', NOW()
  )
FROM users_profile 
WHERE role = 'admin' 
LIMIT 1;