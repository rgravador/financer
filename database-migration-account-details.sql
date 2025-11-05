-- Migration to add comprehensive account details based on AccountDetails.md
-- Run this in your Supabase SQL Editor

-- Step 1: Add new columns to accounts table for comprehensive borrower information
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS ssn_tax_id TEXT,
ADD COLUMN IF NOT EXISTS government_id_type TEXT,
ADD COLUMN IF NOT EXISTS government_id_number TEXT,
ADD COLUMN IF NOT EXISTS secondary_id_type TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS current_address TEXT,
ADD COLUMN IF NOT EXISTS previous_address TEXT,
ADD COLUMN IF NOT EXISTS proof_of_address_url TEXT,
ADD COLUMN IF NOT EXISTS employer_name TEXT,
ADD COLUMN IF NOT EXISTS employer_phone TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS employment_length_months INTEGER,
ADD COLUMN IF NOT EXISTS employment_verification_url TEXT,
ADD COLUMN IF NOT EXISTS annual_income NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS monthly_income NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS pay_stubs_url TEXT,
ADD COLUMN IF NOT EXISTS tax_returns_url TEXT,
ADD COLUMN IF NOT EXISTS bank_statements_url TEXT,
ADD COLUMN IF NOT EXISTS monthly_expenses NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS monthly_debt_obligations NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS debt_to_income_ratio NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS existing_loans_details TEXT,
ADD COLUMN IF NOT EXISTS credit_accounts_details TEXT;

-- Step 2: Update existing contact_info column to be optional (since we now have phone_number and email)
ALTER TABLE accounts ALTER COLUMN contact_info DROP NOT NULL;

-- Step 3: Update existing address column to be optional (since we now have current_address)
ALTER TABLE accounts ALTER COLUMN address DROP NOT NULL;

-- Step 4: Add comments for documentation
COMMENT ON COLUMN accounts.date_of_birth IS 'Borrower date of birth for age verification';
COMMENT ON COLUMN accounts.ssn_tax_id IS 'Social Security Number or Tax ID for identity verification';
COMMENT ON COLUMN accounts.government_id_type IS 'Type of government-issued ID (drivers_license, passport, state_id)';
COMMENT ON COLUMN accounts.government_id_number IS 'Government ID number';
COMMENT ON COLUMN accounts.secondary_id_type IS 'Secondary ID type (birth_certificate, social_security_card)';
COMMENT ON COLUMN accounts.phone_number IS 'Primary phone number';
COMMENT ON COLUMN accounts.email IS 'Email address';
COMMENT ON COLUMN accounts.current_address IS 'Current residential address';
COMMENT ON COLUMN accounts.previous_address IS 'Previous address if recently moved';
COMMENT ON COLUMN accounts.proof_of_address_url IS 'URL to uploaded proof of address document';
COMMENT ON COLUMN accounts.employer_name IS 'Current employer name';
COMMENT ON COLUMN accounts.employer_phone IS 'Employer contact phone number';
COMMENT ON COLUMN accounts.job_title IS 'Current job title/position';
COMMENT ON COLUMN accounts.employment_length_months IS 'Length of current employment in months';
COMMENT ON COLUMN accounts.employment_verification_url IS 'URL to employment verification letter';
COMMENT ON COLUMN accounts.annual_income IS 'Annual gross income';
COMMENT ON COLUMN accounts.monthly_income IS 'Monthly gross income';
COMMENT ON COLUMN accounts.pay_stubs_url IS 'URL to uploaded pay stubs';
COMMENT ON COLUMN accounts.tax_returns_url IS 'URL to uploaded tax returns';
COMMENT ON COLUMN accounts.bank_statements_url IS 'URL to uploaded bank statements';
COMMENT ON COLUMN accounts.monthly_expenses IS 'Total monthly expenses';
COMMENT ON COLUMN accounts.monthly_debt_obligations IS 'Total monthly debt payments';
COMMENT ON COLUMN accounts.debt_to_income_ratio IS 'Calculated debt-to-income ratio';
COMMENT ON COLUMN accounts.existing_loans_details IS 'JSON details of existing loans';
COMMENT ON COLUMN accounts.credit_accounts_details IS 'JSON details of credit accounts';

-- Step 5: Create enum types for better data consistency
DO $$ BEGIN
    CREATE TYPE government_id_type AS ENUM ('drivers_license', 'passport', 'state_id', 'military_id');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE secondary_id_type AS ENUM ('birth_certificate', 'social_security_card', 'utility_bill');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 6: Update the government_id_type and secondary_id_type columns to use enums
-- (Only if the columns don't have data yet, otherwise this would need to be done carefully)
-- ALTER TABLE accounts ALTER COLUMN government_id_type TYPE government_id_type USING government_id_type::government_id_type;
-- ALTER TABLE accounts ALTER COLUMN secondary_id_type TYPE secondary_id_type USING secondary_id_type::secondary_id_type;

-- Step 7: Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_phone_number ON accounts(phone_number);
CREATE INDEX IF NOT EXISTS idx_accounts_ssn_tax_id ON accounts(ssn_tax_id);
CREATE INDEX IF NOT EXISTS idx_accounts_annual_income ON accounts(annual_income);

-- Step 8: Add check constraints for data validation
DO $$ BEGIN
    ALTER TABLE accounts ADD CONSTRAINT chk_debt_to_income_ratio
      CHECK (debt_to_income_ratio IS NULL OR (debt_to_income_ratio >= 0 AND debt_to_income_ratio <= 100));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE accounts ADD CONSTRAINT chk_employment_length
      CHECK (employment_length_months IS NULL OR employment_length_months >= 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE accounts ADD CONSTRAINT chk_income_positive
      CHECK (annual_income IS NULL OR annual_income > 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE accounts ADD CONSTRAINT chk_monthly_income_positive
      CHECK (monthly_income IS NULL OR monthly_income > 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 9: Update RLS policies if needed (accounts table should already have proper RLS)
-- The existing RLS policies should cover the new columns automatically