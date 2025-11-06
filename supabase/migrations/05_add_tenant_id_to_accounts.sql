-- Add tenant_id to accounts table for proper multi-tenant isolation
-- This migration adds the tenant_id field and updates RLS policies

-- Add tenant_id column to accounts table
ALTER TABLE accounts 
ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE RESTRICT;

-- Create index for better query performance
CREATE INDEX idx_accounts_tenant_id ON accounts(tenant_id);

-- Update existing accounts to have tenant_id based on their assigned agent's tenant
UPDATE accounts 
SET tenant_id = (
  SELECT up.tenant_id 
  FROM users_profile up 
  WHERE up.id = accounts.assigned_agent_id
  LIMIT 1
)
WHERE tenant_id IS NULL;

-- Make tenant_id NOT NULL after setting values
ALTER TABLE accounts 
ALTER COLUMN tenant_id SET NOT NULL;

-- Drop existing RLS policies for accounts
DROP POLICY IF EXISTS "Users can view accounts" ON accounts;
DROP POLICY IF EXISTS "Users can create accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update accounts" ON accounts;

-- Create new RLS policies that enforce tenant isolation
CREATE POLICY "Users can view accounts in their tenant"
  ON accounts FOR SELECT
  USING (
    is_admin() OR 
    tenant_id = get_user_tenant_id()
  );

CREATE POLICY "Users can create accounts in their tenant"
  ON accounts FOR INSERT
  WITH CHECK (
    is_admin() OR 
    tenant_id = get_user_tenant_id()
  );

CREATE POLICY "Users can update accounts in their tenant"
  ON accounts FOR UPDATE
  USING (
    is_admin() OR 
    tenant_id = get_user_tenant_id()
  )
  WITH CHECK (
    is_admin() OR 
    tenant_id = get_user_tenant_id()
  );

CREATE POLICY "Users can delete accounts in their tenant"
  ON accounts FOR DELETE
  USING (
    is_admin() OR 
    tenant_id = get_user_tenant_id()
  );