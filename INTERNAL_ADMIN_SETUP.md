# Internal Admin Dashboard Setup Guide

This document outlines the implementation of the Internal Admin dashboard for managing companies/tenants and admin users.

## Overview

The Internal Admin dashboard provides a separate administrative layer above tenant admins, allowing for:
- **Company/Tenant Management**: Create, edit, archive, and view companies
- **Admin User Management**: Manage both tenant admins and internal admins
- **Separation of Concerns**: Internal admins are distinct from tenant admins

## Key Differences

### Roles
- **Internal Admin** (`internal_admin`): Super admin role for managing the entire system
- **Tenant Admin** (`admin`): Company-specific admin for managing loans, agents, accounts
- **Agent** (`agent`): Loan agents who work with borrowers

### Access Control
- Internal admins can only access `/internal-admin/*` routes
- Tenant admins can only access `/admin/*` routes
- Both use separate middleware for route protection

## File Structure

```
/stores/
  companies.ts              # Pinia store for company management

/middleware/
  internal-admin.ts         # Route protection for internal admin pages

/pages/internal-admin/
  dashboard.vue             # Internal admin dashboard
  companies.vue             # Company CRUD operations
  users.vue                 # Admin user management

/supabase/migrations/
  20250105_create_companies_table.sql  # Database schema
```

## Database Schema

### Companies Table

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  registration_number TEXT,
  tax_id TEXT,
  logo_url TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES users_profile(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Row Level Security (RLS)

The companies table uses RLS to restrict access to internal admins only:

```sql
-- View Policy
CREATE POLICY "Internal admins can view all companies"
  ON companies FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users_profile WHERE role = 'internal_admin'
  ));

-- Insert/Update/Delete policies follow the same pattern
```

## Setup Instructions

### 1. Run Database Migration

Apply the migration to create the companies table:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase Studio
# Go to SQL Editor and run the migration file
```

### 2. Create First Internal Admin User

You need to create your first internal admin manually in the database:

**Option A: Using Supabase Studio**
1. Go to Authentication > Users
2. Create a new user with email/password
3. Note the user's UUID
4. Go to Table Editor > users_profile
5. Find the user and update their `role` to `'internal_admin'`

**Option B: Using SQL**
```sql
-- First create the auth user (via Supabase Auth UI)
-- Then update the profile:
UPDATE users_profile
SET role = 'internal_admin'
WHERE email = 'your-email@example.com';
```

### 3. Verify Storage Bucket

The migration creates a `company-logos` storage bucket. Verify it exists:

1. Go to Supabase Dashboard > Storage
2. Check if `company-logos` bucket exists
3. Verify it has public read access

### 4. Test Internal Admin Access

1. Login with your internal admin credentials
2. Navigate to `/internal-admin/dashboard`
3. You should see the internal admin navigation in the sidebar

## Features

### Company Management (`/internal-admin/companies`)

**Capabilities:**
- ✅ Create new companies with logo upload
- ✅ Edit company details
- ✅ View company information
- ✅ Change company status (active/inactive/archived)
- ✅ Delete companies
- ✅ Search and filter by status

**Company Fields:**
- Name (required)
- Description
- Address
- Contact Email
- Contact Phone
- Registration Number
- Tax ID
- Logo (image upload)
- Status (active/inactive/archived)

### Admin User Management (`/internal-admin/users`)

**Capabilities:**
- ✅ Create new tenant admins
- ✅ Create new internal admins
- ✅ Edit user details
- ✅ View user profiles
- ✅ Activate/deactivate users
- ✅ Delete users
- ✅ Filter by role

**User Fields:**
- Full Name (required)
- Email (required)
- Password (required for new users)
- Display Name
- Role (admin or internal_admin)
- Active Status

### Internal Admin Dashboard (`/internal-admin/dashboard`)

**Statistics:**
- Total Companies
- Active Companies
- Total Tenant Admins
- Total Internal Admins

**Quick Actions:**
- Add New Company
- Create Tenant Admin
- Manage Companies
- Manage Users

**Recent Activity:**
- Shows recent system activities
- Displays company creation/updates
- User management actions

## Navigation

### Desktop Sidebar
Internal admins will see a dedicated "Internal Admin" section:
- 🛡️ Internal Dashboard
- 🏢 Companies
- 👥 Manage Admins

### Mobile Bottom Navigation
Internal admins get a dedicated "Internal" button with shield-star icon.

## Security Considerations

### 1. Row Level Security
- All company operations are restricted to internal admins via RLS
- Tenant admins cannot access or modify companies table

### 2. Middleware Protection
- `/internal-admin/*` routes protected by `internal-admin` middleware
- Checks for `isInternalAdmin` before allowing access
- Redirects unauthorized users to dashboard

### 3. Storage Policies
- Company logos bucket has insert/update restricted to internal admins
- Public read access allows logos to be displayed

### 4. Audit Trail
- `created_by` field tracks who created each company
- `created_at` and `updated_at` timestamps for all changes
- Consider adding a separate audit log table for production

## API Integration

### Using the Companies Store

```typescript
// In a Vue component (Options API)
export default {
  computed: {
    companiesStore() {
      return useCompaniesStore()
    }
  },

  async mounted() {
    await this.companiesStore.fetchCompanies()
  },

  methods: {
    async createCompany() {
      const result = await this.companiesStore.createCompany({
        name: 'Acme Corp',
        contact_email: 'contact@acme.com',
        // ... other fields
      })

      if (result.success) {
        console.log('Company created:', result.data)
      }
    }
  }
}
```

### Store Type Export

```typescript
import type { CompaniesStore } from '~/stores/companies'

// Use the store type in your components
const companiesStore: CompaniesStore = useCompaniesStore()
```

## Future Enhancements

### 1. Multi-Tenancy
- Associate tenant admins with specific companies
- Add `company_id` to users_profile table
- Filter data by company for tenant admins

### 2. Audit Logging
- Create audit_logs table
- Track all CRUD operations
- Display in dashboard activity feed

### 3. Company Settings
- Custom branding per company
- Company-specific configurations
- Billing and subscription management

### 4. Advanced Permissions
- Granular role-based permissions
- Custom permission sets
- Role inheritance

### 5. Analytics
- Company performance metrics
- User activity tracking
- System usage statistics

## Troubleshooting

### Issue: Cannot access internal admin routes
**Solution:** Verify user role is set to `'internal_admin'` in users_profile table

### Issue: Companies not loading
**Solution:**
1. Check RLS policies are applied correctly
2. Verify user is authenticated
3. Check browser console for errors

### Issue: Logo upload fails
**Solution:**
1. Verify `company-logos` bucket exists
2. Check storage policies are applied
3. Ensure file size is within limits

### Issue: Cannot create users
**Solution:**
1. Check Supabase Auth is configured
2. Verify email/password requirements
3. Check users_profile table insert policy

## Support

For issues or questions:
1. Check Supabase logs in Dashboard
2. Review browser console errors
3. Verify RLS policies are working
4. Check middleware is applied to routes

## Migration Checklist

- [ ] Run database migration
- [ ] Create company-logos storage bucket
- [ ] Apply storage policies
- [ ] Create first internal admin user
- [ ] Test login as internal admin
- [ ] Test company creation
- [ ] Test user management
- [ ] Verify RLS policies work correctly
- [ ] Test on mobile/responsive view
