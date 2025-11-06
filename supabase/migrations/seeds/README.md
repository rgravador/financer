# Database Seed Files

This directory contains SQL seed files for populating the Financer database with initial data for development and testing.

## Execution Order

Run these files in the following order:

1. **01_seed_tenants.sql** - Creates sample tenant organizations
2. **02_seed_admin.sql** - Creates system administrator
3. **03_seed_tenant_admins.sql** - Creates tenant admin users
4. **04_seed_tenant_officers.sql** - Creates tenant officer users
5. **05_seed_tenant_approvers.sql** - Creates tenant approver users
6. **06_seed_tenant_legal.sql** - Template for tenant legal officers (optional)

## Prerequisites

- Run `00_initial_schema.sql` migration first
- Ensure auth users exist in `auth.users` table (import from `auth-users.json`)

## Running Seeds

### Option 1: Run all seeds at once
```bash
psql -d your_database -f 01_seed_tenants.sql
psql -d your_database -f 02_seed_admin.sql
psql -d your_database -f 03_seed_tenant_admins.sql
psql -d your_database -f 04_seed_tenant_officers.sql
psql -d your_database -f 05_seed_tenant_approvers.sql
```

### Option 2: Run specific role seeds
```bash
# Seed only officers
psql -d your_database -f 04_seed_tenant_officers.sql

# Seed only admins
psql -d your_database -f 03_seed_tenant_admins.sql
```

### Option 3: Via Supabase CLI
```bash
supabase db reset  # Reset and run all migrations
```

## Seeded Data

### Tenants (2 organizations)
- **ABC Financial Services** (ID: 550e8400-e29b-41d4-a716-446655440001)
- **XYZ Lending Corporation** (ID: 550e8400-e29b-41d4-a716-446655440002)

### Users (6 users, 4 roles)

| Email | Role | Full Name | Tenant |
|-------|------|-----------|--------|
| admin@financer.com | admin | System Administrator | None (System Admin) |
| redgiegravador@gmail.com | tenant_admin | Redgie Gravador | ABC Financial Services |
| tenant.admin@financer.com | tenant_admin | Tenant Admin | XYZ Lending Corporation |
| officer1@financer.com | tenant_officer | John Officer | ABC Financial Services |
| officer2@financer.com | tenant_officer | Jane Officer | XYZ Lending Corporation |
| approver@financer.com | tenant_approver | Loan Approver | ABC Financial Services |

## User Credentials

User passwords are defined in `auth-users.json`. Default password for all test users is: **password123**

## Notes

- All seed files use `ON CONFLICT` to allow re-running without errors
- RLS is temporarily disabled during seeding and re-enabled after
- User IDs match those in `auth-users.json`
- Each file includes verification queries at the end
- The legal officer seed file (06) is a template only

## Cleaning Up

To remove seeded data:

```sql
-- Clear user profiles (except admin if needed)
DELETE FROM users_profile WHERE role != 'admin';

-- Clear tenants
DELETE FROM tenants;

-- Or reset entire database
-- supabase db reset
```

## Customization

To add more seed data:
1. Add new tenant in `01_seed_tenants.sql`
2. Create users in Supabase Auth
3. Add corresponding user profiles in the appropriate role seed file
4. Update this README with new data
