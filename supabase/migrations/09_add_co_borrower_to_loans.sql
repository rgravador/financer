-- =====================================================
-- Add Co-Borrower Support to Loans
-- =====================================================
-- This script adds co_borrower_id column to loans table
-- and draft status to loan_status enum
-- =====================================================

-- Add draft status to loan_status enum
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'loan_status'
    AND e.enumlabel = 'draft'
  ) THEN
    ALTER TYPE loan_status ADD VALUE 'draft' BEFORE 'pending_approval';
  END IF;
END $$;

-- Add co_borrower_id column to loans table
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'co_borrower_id'
  ) THEN
    ALTER TABLE loans 
    ADD COLUMN co_borrower_id UUID REFERENCES accounts(id);
  END IF;
END $$;

-- Add index for co_borrower_id
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_loans_co_borrower_id ON loans(co_borrower_id);

-- Add save_loan_draft to transaction_type enum
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'transaction_type'
    AND e.enumlabel = 'save_loan_draft'
  ) THEN
    ALTER TYPE transaction_type ADD VALUE 'save_loan_draft' AFTER 'create_loan';
  END IF;
END $$;

-- Update comments
-- =====================================================

COMMENT ON COLUMN loans.co_borrower_id IS 'Optional reference to co-borrower account for joint loan applications';
COMMENT ON COLUMN loans.status IS 'Loan status: draft (saved but not submitted), pending_approval, approved, active, closed, rejected';

-- Update RLS policies to include co-borrower access
-- =====================================================

-- Allow co-borrowers to view loans where they are the co-borrower
DROP POLICY IF EXISTS "Co-borrowers can view their loans" ON loans;
CREATE POLICY "Co-borrowers can view their loans" ON loans FOR SELECT
  USING (
    co_borrower_id IS NOT NULL 
    AND co_borrower_id IN (
      SELECT id FROM accounts WHERE tenant_id = get_user_tenant_id()
    )
  );

-- Migration completion
-- =====================================================

-- Log the migration completion
INSERT INTO transactions (
  type,
  user_id,
  details
) 
SELECT 
  'update_loan_type'::transaction_type,
  id,
  jsonb_build_object(
    'migration', '09_add_co_borrower_to_loans',
    'action', 'schema_updated',
    'changes', 'Added co_borrower_id column and draft status to loans table',
    'timestamp', NOW()
  )
FROM users_profile 
WHERE role = 'admin' 
LIMIT 1;