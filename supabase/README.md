# Supabase Database Migration

This directory contains the database migration scripts for the Financer application.

## Migration File

- `migrations/00_initial_schema.sql` - Complete database schema including all tables, types, indexes, and RLS policies

## What's Included

### Custom Types (Enums)
- `user_role` - User role types (admin, tenant_officer, tenant_admin, tenant_approver, tenant_legal)
- `account_status` - Account status (active, inactive, suspended)
- `loan_status` - Loan status (pending_approval, approved, active, closed, rejected)
- `payment_frequency` - Payment frequency (bi-monthly, monthly, weekly)
- `payment_type` - Payment type (regular, penalty, partial)
- `payment_status` - Payment status (received, pending, cancelled)
- `notification_type` - Notification types
- `cashout_status` - Cashout status (pending, approved, rejected)
- `government_id_type` - Government ID types
- `secondary_id_type` - Secondary ID types
- `transaction_type` - Transaction types for audit log

### Tables
1. **users_profile** - User profiles with roles
2. **accounts** - Customer accounts with full KYC information
3. **loans** - Loan records with amortization schedules
4. **payments** - Payment records
5. **notifications** - User notifications
6. **earnings** - Agent earnings tracking
7. **cashout_requests** - Cashout requests
8. **transactions** - Audit log
9. **penalties** - Loan penalties

### Features
- ✅ All tables include `DROP IF EXISTS` statements
- ✅ Comprehensive indexes for performance
- ✅ Automatic `updated_at` triggers
- ✅ Row Level Security (RLS) enabled
- ✅ RLS policies for data access control
- ✅ Foreign key constraints
- ✅ Audit logging via transactions table
- ✅ Proper CASCADE and RESTRICT rules

## How to Run the Migration

### Option 1: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

3. Run the migration:
```bash
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `migrations/00_initial_schema.sql`
5. Paste and run the query

### Option 3: Direct SQL Execution

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase/migrations/00_initial_schema.sql
```

## Post-Migration Steps

### 1. Create Initial Admin User

After running the migration, create an admin user profile:

```sql
-- First, sign up a user through Supabase Auth
-- Then insert their profile:

INSERT INTO users_profile (id, email, role, full_name, is_active)
VALUES (
  '[USER_UUID_FROM_AUTH]',
  'admin@example.com',
  'admin',
  'Admin User',
  true
);
```

### 2. Verify Tables

Check that all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 3. Verify RLS Policies

Check that RLS is enabled:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## Database Schema Overview

```
users_profile (auth integration)
    ↓
accounts (assigned_agent_id, created_by)
    ↓
loans (account_id, created_by, approved_by)
    ↓
├── payments (loan_id, received_by)
├── penalties (loan_id)
└── notifications (loan_id, account_id, user_id)

earnings (agent_id)
    ↓
cashout_requests (agent_id, approved_by)

transactions (audit log for all operations)
```

## Security Notes

- All tables have RLS enabled
- Tenant officers can only access their assigned accounts
- Admins have broader access through application logic
- All sensitive operations are logged in the transactions table
- Authentication is handled by Supabase Auth

## Rollback

To rollback the migration, the script already includes `DROP IF EXISTS` statements at the beginning. Simply re-run the migration to start fresh.

Or manually drop all objects:

```sql
-- Drop all tables
DROP TABLE IF EXISTS penalties, transactions, notifications,
  cashout_requests, earnings, payments, loans, accounts, users_profile CASCADE;

-- Drop all types
DROP TYPE IF EXISTS user_role, account_status, loan_status,
  payment_frequency, payment_type, payment_status, notification_type,
  cashout_status, government_id_type, secondary_id_type, transaction_type CASCADE;
```

## Troubleshooting

### Error: relation already exists
- The script includes `DROP IF EXISTS` statements
- Make sure to run the entire script from the beginning

### Error: permission denied
- Ensure you're connected as a superuser (postgres role)
- Check your Supabase connection string

### Error: type already exists
- The script drops types before creating them
- Run the DROP TYPE statements manually if needed

## Next Steps

After successful migration:
1. Create your first admin user
2. Test TRPC routes with proper authentication
3. Build out the UI components
4. Configure backup strategy
5. Set up monitoring and alerts
