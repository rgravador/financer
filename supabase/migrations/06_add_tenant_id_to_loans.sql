-- Add tenant_id to loans table for proper tenant isolation
ALTER TABLE loans ADD COLUMN tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT;

-- Create index for performance
CREATE INDEX idx_loans_tenant_id ON loans(tenant_id);

-- Update existing loans to set tenant_id based on their account's tenant_id
UPDATE loans 
SET tenant_id = accounts.tenant_id 
FROM accounts 
WHERE loans.account_id = accounts.id;

-- Add RLS policy for loans table to enforce tenant isolation
CREATE POLICY "Loans are isolated by tenant" ON loans
  USING (is_admin() OR get_user_tenant_id() = tenant_id);

-- Grant necessary permissions
GRANT ALL ON loans TO authenticated;