-- =====================================================
-- Add Loan Types Transaction Types
-- =====================================================
-- This script adds new enum values for loan type operations
-- Must be run before the main loan types migration
-- =====================================================

-- Add new transaction types for loan type operations
-- =====================================================

-- Add create_loan_type enum value
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'create_loan_type' AND enumtypid = 'transaction_type'::regtype) THEN
    ALTER TYPE transaction_type ADD VALUE 'create_loan_type';
  END IF;
END $$;

-- Add update_loan_type enum value
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'update_loan_type' AND enumtypid = 'transaction_type'::regtype) THEN
    ALTER TYPE transaction_type ADD VALUE 'update_loan_type';
  END IF;
END $$;

-- Add delete_loan_type enum value
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'delete_loan_type' AND enumtypid = 'transaction_type'::regtype) THEN
    ALTER TYPE transaction_type ADD VALUE 'delete_loan_type';
  END IF;
END $$;