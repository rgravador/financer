-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  registration_number TEXT,
  tax_id TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID NOT NULL REFERENCES users_profile(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Create index on created_by for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: Allow internal_admin to view all companies
CREATE POLICY "Internal admins can view all companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'internal_admin'
    )
  );

-- Policy: Allow internal_admin to insert companies
CREATE POLICY "Internal admins can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'internal_admin'
    )
  );

-- Policy: Allow internal_admin to update companies
CREATE POLICY "Internal admins can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'internal_admin'
    )
  );

-- Policy: Allow internal_admin to delete companies (soft delete via status)
CREATE POLICY "Internal admins can delete companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'internal_admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_companies_updated_at();

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow internal_admin to upload company logos
CREATE POLICY "Internal admins can upload company logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos' AND
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'internal_admin'
    )
  );

-- Storage policy: Allow internal_admin to update company logos
CREATE POLICY "Internal admins can update company logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'company-logos' AND
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'internal_admin'
    )
  );

-- Storage policy: Allow public read access to company logos
CREATE POLICY "Public can view company logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'company-logos');
