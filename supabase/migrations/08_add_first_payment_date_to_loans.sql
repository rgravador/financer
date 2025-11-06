-- =====================================================
-- Add First Payment Date to Loans
-- =====================================================
-- This script adds first_payment_date column to loans table
-- to support the new payment scheduling system
-- =====================================================

-- Add first_payment_date column to loans table
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'first_payment_date'
  ) THEN
    ALTER TABLE loans 
    ADD COLUMN first_payment_date DATE;
  END IF;
END $$;

-- For existing loans, set first_payment_date based on start_date + 30 days
-- =====================================================

UPDATE loans 
SET first_payment_date = start_date + INTERVAL '30 days'
WHERE first_payment_date IS NULL;

-- Make first_payment_date NOT NULL after populating existing records
-- =====================================================

DO $$
BEGIN
  -- Check if the column allows NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'first_payment_date' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE loans 
    ALTER COLUMN first_payment_date SET NOT NULL;
  END IF;
END $$;

-- Add index for first_payment_date
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_loans_first_payment_date ON loans(first_payment_date);

-- Update comments
-- =====================================================

COMMENT ON COLUMN loans.start_date IS 'Date when the loan was created/disbursed';
COMMENT ON COLUMN loans.first_payment_date IS 'Date when the first payment is due - all subsequent payments are calculated from this date';
COMMENT ON COLUMN loans.end_date IS 'Estimated final payment date based on tenure and payment frequency';

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
    'migration', '08_add_first_payment_date_to_loans',
    'action', 'schema_updated',
    'changes', 'Added first_payment_date column to loans table',
    'timestamp', NOW()
  )
FROM users_profile 
WHERE role = 'admin' 
LIMIT 1;