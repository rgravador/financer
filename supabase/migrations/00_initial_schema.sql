-- =====================================================
-- Financer Database Migration Script
-- =====================================================
-- This script creates all necessary tables, types, and policies
-- for the Financer loan management system
-- =====================================================

-- Drop existing objects if they exist
-- =====================================================

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS penalties CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS cashout_requests CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users_profile CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS account_status CASCADE;
DROP TYPE IF EXISTS loan_status CASCADE;
DROP TYPE IF EXISTS payment_frequency CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS cashout_status CASCADE;
DROP TYPE IF EXISTS government_id_type CASCADE;
DROP TYPE IF EXISTS secondary_id_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

-- Drop functions (CASCADE will automatically drop associated triggers)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create Custom Types (Enums)
-- =====================================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'tenant_officer',
  'tenant_admin',
  'tenant_approver',
  'tenant_legal'
);

CREATE TYPE account_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

CREATE TYPE loan_status AS ENUM (
  'pending_approval',
  'approved',
  'active',
  'closed',
  'rejected'
);

CREATE TYPE payment_frequency AS ENUM (
  'bi-monthly',
  'monthly',
  'weekly'
);

CREATE TYPE payment_type AS ENUM (
  'regular',
  'penalty',
  'partial'
);

CREATE TYPE payment_status AS ENUM (
  'received',
  'pending',
  'cancelled'
);

CREATE TYPE notification_type AS ENUM (
  'past_due',
  'upcoming_due',
  'loan_approval',
  'loan_rejection',
  'cashout_approved',
  'cashout_rejected',
  'payment_received'
);

CREATE TYPE cashout_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE government_id_type AS ENUM (
  'drivers_license',
  'passport',
  'state_id',
  'military_id'
);

CREATE TYPE secondary_id_type AS ENUM (
  'birth_certificate',
  'social_security_card',
  'utility_bill'
);

CREATE TYPE transaction_type AS ENUM (
  'create_account',
  'update_account',
  'create_loan',
  'approve_loan',
  'reject_loan',
  'receive_payment',
  'cashout_request',
  'cashout_approved',
  'cashout_rejected',
  'commission_update'
);

-- Create Tables
-- =====================================================

-- Tenants Table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID
);

-- Users Profile Table
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE RESTRICT,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'tenant_officer',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts Table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_agent_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  contact_info TEXT,
  address TEXT,
  id_proof_url TEXT,
  status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users_profile(id) ON DELETE RESTRICT,

  -- Basic Identification
  date_of_birth DATE,
  ssn_tax_id TEXT,
  government_id_type government_id_type,
  government_id_number TEXT,
  secondary_id_type secondary_id_type,

  -- Contact Information
  phone_number TEXT,
  email TEXT,
  current_address TEXT,
  previous_address TEXT,
  proof_of_address_url TEXT,

  -- Employment Details
  employer_name TEXT,
  employer_phone TEXT,
  job_title TEXT,
  employment_length_months INTEGER,
  employment_verification_url TEXT,

  -- Income and Financial Information
  annual_income DECIMAL(15, 2),
  monthly_income DECIMAL(15, 2),
  pay_stubs_url TEXT,
  tax_returns_url TEXT,
  bank_statements_url TEXT,

  -- Debt and Expenses
  monthly_expenses DECIMAL(15, 2),
  monthly_debt_obligations DECIMAL(15, 2),
  debt_to_income_ratio DECIMAL(5, 2),
  existing_loans_details TEXT,
  credit_accounts_details TEXT,

  -- Backward compatibility alias
  contact_number TEXT GENERATED ALWAYS AS (phone_number) STORED
);

-- Loans Table
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  payment_frequency payment_frequency NOT NULL,
  status loan_status NOT NULL DEFAULT 'pending_approval',
  amortization_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_balance DECIMAL(15, 2) NOT NULL,
  total_paid DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_penalties DECIMAL(15, 2) NOT NULL DEFAULT 0,
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT,
  created_by UUID NOT NULL REFERENCES users_profile(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES users_profile(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  type payment_type NOT NULL DEFAULT 'regular',
  status payment_status NOT NULL DEFAULT 'received',
  applied_to_principal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  applied_to_interest DECIMAL(15, 2) NOT NULL DEFAULT 0,
  applied_to_penalty DECIMAL(15, 2) NOT NULL DEFAULT 0,
  received_by UUID NOT NULL REFERENCES users_profile(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Earnings Table
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  total_earnings DECIMAL(15, 2) NOT NULL DEFAULT 0,
  collectible_earnings DECIMAL(15, 2) NOT NULL DEFAULT 0,
  cashed_out_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id)
);

-- Cashout Requests Table
CREATE TABLE cashout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  status cashout_status NOT NULL DEFAULT 'pending',
  request_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approval_date TIMESTAMPTZ,
  approved_by UUID REFERENCES users_profile(id) ON DELETE RESTRICT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions Table (Audit Log)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type transaction_type NOT NULL,
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE RESTRICT,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Penalties Table
CREATE TABLE penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
  amount DECIMAL(15, 2) NOT NULL,
  reason TEXT NOT NULL,
  penalty_date DATE NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes for Performance
-- =====================================================

-- Tenants Indexes
CREATE INDEX idx_tenants_is_active ON tenants(is_active);
CREATE INDEX idx_tenants_created_by ON tenants(created_by);

-- Users Profile Indexes
CREATE INDEX idx_users_profile_tenant_id ON users_profile(tenant_id);
CREATE INDEX idx_users_profile_email ON users_profile(email);
CREATE INDEX idx_users_profile_role ON users_profile(role);
CREATE INDEX idx_users_profile_is_active ON users_profile(is_active);

-- Accounts Indexes
CREATE INDEX idx_accounts_assigned_agent ON accounts(assigned_agent_id);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_created_by ON accounts(created_by);
CREATE INDEX idx_accounts_name ON accounts(name);
CREATE INDEX idx_accounts_phone ON accounts(phone_number);

-- Loans Indexes
CREATE INDEX idx_loans_account_id ON loans(account_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_created_by ON loans(created_by);
CREATE INDEX idx_loans_approved_by ON loans(approved_by);
CREATE INDEX idx_loans_start_date ON loans(start_date);
CREATE INDEX idx_loans_end_date ON loans(end_date);

-- Payments Indexes
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_received_by ON payments(received_by);

-- Notifications Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp DESC);

-- Earnings Indexes
CREATE INDEX idx_earnings_agent_id ON earnings(agent_id);

-- Cashout Requests Indexes
CREATE INDEX idx_cashout_requests_agent_id ON cashout_requests(agent_id);
CREATE INDEX idx_cashout_requests_status ON cashout_requests(status);
CREATE INDEX idx_cashout_requests_approved_by ON cashout_requests(approved_by);

-- Transactions Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_loan_id ON transactions(loan_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);

-- Penalties Indexes
CREATE INDEX idx_penalties_loan_id ON penalties(loan_id);
CREATE INDEX idx_penalties_is_paid ON penalties(is_paid);
CREATE INDEX idx_penalties_penalty_date ON penalties(penalty_date);

-- Create Functions and Triggers
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_earnings_updated_at
  BEFORE UPDATE ON earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cashout_requests_updated_at
  BEFORE UPDATE ON cashout_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- =====================================================

-- Helper function to check if current user is admin (bypasses RLS)
DROP FUNCTION IF EXISTS is_admin();
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Helper function to get current user's tenant_id (bypasses RLS)
DROP FUNCTION IF EXISTS get_user_tenant_id();
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tenant_id_val UUID;
BEGIN
  SELECT tenant_id INTO tenant_id_val
  FROM users_profile
  WHERE id = auth.uid();

  RETURN tenant_id_val;
END;
$$;

-- Tenants Policies
DROP POLICY IF EXISTS "Admins can view all tenants" ON tenants;
CREATE POLICY "Admins can view all tenants"
  ON tenants FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (get_user_tenant_id() = id);

DROP POLICY IF EXISTS "Admins can create tenants" ON tenants;
CREATE POLICY "Admins can create tenants"
  ON tenants FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update tenants" ON tenants;
CREATE POLICY "Admins can update tenants"
  ON tenants FOR UPDATE
  USING (is_admin());

-- Users Profile Policies
DROP POLICY IF EXISTS "Admins can view all users" ON users_profile;
CREATE POLICY "Admins can view all users"
  ON users_profile FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Users can view their own profile" ON users_profile;
CREATE POLICY "Users can view their own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view users in their tenant" ON users_profile;
CREATE POLICY "Users can view users in their tenant"
  ON users_profile FOR SELECT
  USING (
    tenant_id IS NOT NULL
    AND tenant_id = get_user_tenant_id()
  );

DROP POLICY IF EXISTS "Admins can update any user profile" ON users_profile;
CREATE POLICY "Admins can update any user profile"
  ON users_profile FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON users_profile;
CREATE POLICY "Users can update their own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id);

-- Accounts Policies
DROP POLICY IF EXISTS "Users can view accounts" ON accounts;
CREATE POLICY "Users can view accounts"
  ON accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create accounts" ON accounts;
CREATE POLICY "Users can create accounts"
  ON accounts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can update accounts" ON accounts;
CREATE POLICY "Users can update accounts"
  ON accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.is_active = true
    )
  );

-- Loans Policies
DROP POLICY IF EXISTS "Users can view loans" ON loans;
CREATE POLICY "Users can view loans"
  ON loans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create loans" ON loans;
CREATE POLICY "Users can create loans"
  ON loans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can update loans" ON loans;
CREATE POLICY "Users can update loans"
  ON loans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.is_active = true
    )
  );

-- Payments Policies
DROP POLICY IF EXISTS "Users can view payments" ON payments;
CREATE POLICY "Users can view payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can update payments" ON payments;
CREATE POLICY "Users can update payments"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.is_active = true
    )
  );

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Earnings Policies
DROP POLICY IF EXISTS "Users can view their own earnings" ON earnings;
CREATE POLICY "Users can view their own earnings"
  ON earnings FOR SELECT
  USING (agent_id = auth.uid());

-- Cashout Requests Policies
DROP POLICY IF EXISTS "Users can view their own cashout requests" ON cashout_requests;
CREATE POLICY "Users can view their own cashout requests"
  ON cashout_requests FOR SELECT
  USING (agent_id = auth.uid());

DROP POLICY IF EXISTS "Users can create cashout requests" ON cashout_requests;
CREATE POLICY "Users can create cashout requests"
  ON cashout_requests FOR INSERT
  WITH CHECK (agent_id = auth.uid());

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view transactions" ON transactions;
CREATE POLICY "Users can view transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
    )
  );

-- Penalties Policies
DROP POLICY IF EXISTS "Users can view penalties" ON penalties;
CREATE POLICY "Users can view penalties"
  ON penalties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create penalties" ON penalties;
CREATE POLICY "Users can create penalties"
  ON penalties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can update penalties" ON penalties;
CREATE POLICY "Users can update penalties"
  ON penalties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can delete penalties" ON penalties;
CREATE POLICY "Users can delete penalties"
  ON penalties FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.is_active = true
    )
  );

-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE users_profile IS 'User profiles with roles and authentication information';
COMMENT ON TABLE accounts IS 'Customer accounts with full KYC information';
COMMENT ON TABLE loans IS 'Loan records with amortization schedules';
COMMENT ON TABLE payments IS 'Payment records for loans';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE earnings IS 'Agent earnings and commission tracking';
COMMENT ON TABLE cashout_requests IS 'Cashout requests from agents';
COMMENT ON TABLE transactions IS 'Audit log of all system transactions';
COMMENT ON TABLE penalties IS 'Loan penalty records';

-- Grant Permissions
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant all on tables to authenticated users (will be restricted by RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Auto-create user profile on signup
-- =====================================================

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users_profile (id, email, role, full_name, is_active)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'tenant_officer')::user_role,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    true
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Complete
-- =====================================================

-- Migration completed successfully
