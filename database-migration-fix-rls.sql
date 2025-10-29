-- Comprehensive RLS Fix for Financer Database
-- This migration fixes:
-- 1. Infinite recursion in RLS policies
-- 2. Missing INSERT policy for earnings table

-- =====================================================
-- STEP 1: Drop existing problematic policies
-- =====================================================

-- Drop the problematic admin policy on users_profile
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_profile;

-- Drop all policies that cause infinite recursion
DROP POLICY IF EXISTS "Agents can view assigned accounts" ON accounts;
DROP POLICY IF EXISTS "Agents can update assigned accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view loans for their accounts" ON loans;
DROP POLICY IF EXISTS "Admins can update loans" ON loans;
DROP POLICY IF EXISTS "Users can view payments for their loans" ON payments;
DROP POLICY IF EXISTS "Agents can view own earnings" ON earnings;
DROP POLICY IF EXISTS "Admins can update earnings" ON earnings;
DROP POLICY IF EXISTS "Agents can view own cashout requests" ON cashout_requests;
DROP POLICY IF EXISTS "Admins can update cashout requests" ON cashout_requests;
DROP POLICY IF EXISTS "Users can view relevant transactions" ON transactions;

-- =====================================================
-- STEP 2: Create helper function to avoid recursion
-- =====================================================

-- This function uses SECURITY DEFINER to bypass RLS when checking admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: Recreate policies using helper function
-- =====================================================

-- RLS Policies for accounts
CREATE POLICY "Agents can view assigned accounts" ON accounts FOR SELECT USING (
  assigned_agent_id = auth.uid() OR is_admin()
);
CREATE POLICY "Agents can update assigned accounts" ON accounts FOR UPDATE USING (
  assigned_agent_id = auth.uid() OR is_admin()
);

-- RLS Policies for loans
CREATE POLICY "Users can view loans for their accounts" ON loans FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = loans.account_id
    AND (accounts.assigned_agent_id = auth.uid() OR is_admin())
  )
);
CREATE POLICY "Admins can update loans" ON loans FOR UPDATE USING (
  is_admin()
);

-- RLS Policies for payments
CREATE POLICY "Users can view payments for their loans" ON payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM loans
    JOIN accounts ON loans.account_id = accounts.id
    WHERE loans.id = payments.loan_id
    AND (accounts.assigned_agent_id = auth.uid() OR is_admin())
  )
);

-- RLS Policies for earnings
CREATE POLICY "Agents can view own earnings" ON earnings FOR SELECT USING (
  agent_id = auth.uid() OR is_admin()
);
-- ADD MISSING INSERT POLICY
CREATE POLICY "Agents can insert own earnings" ON earnings FOR INSERT WITH CHECK (
  agent_id = auth.uid()
);
CREATE POLICY "Admins can update earnings" ON earnings FOR UPDATE USING (
  is_admin()
);

-- RLS Policies for cashout_requests
CREATE POLICY "Agents can view own cashout requests" ON cashout_requests FOR SELECT USING (
  agent_id = auth.uid() OR is_admin()
);
CREATE POLICY "Admins can update cashout requests" ON cashout_requests FOR UPDATE USING (
  is_admin()
);

-- RLS Policies for transactions
CREATE POLICY "Users can view relevant transactions" ON transactions FOR SELECT USING (
  user_id = auth.uid() OR is_admin()
);

-- =====================================================
-- STEP 4: Update trigger function to use SECURITY DEFINER
-- =====================================================

-- Update the trigger function to use SECURITY DEFINER so it can bypass RLS
CREATE OR REPLACE FUNCTION create_agent_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'agent' THEN
    INSERT INTO earnings (agent_id, commission_percentage)
    VALUES (NEW.id, 5.0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- You can verify the policies were created correctly by running:
-- SELECT * FROM pg_policies WHERE tablename IN ('users_profile', 'accounts', 'loans', 'payments', 'earnings', 'cashout_requests', 'transactions');
