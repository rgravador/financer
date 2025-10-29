# Row-Level Security Fix and Display Name Addition

## Problem
Users were unable to sign up due to a "new row violates row-level security policy for table 'users_profile'" error.

## Root Causes
1. **Missing INSERT Policy**: The `users_profile` table had RLS enabled with SELECT and UPDATE policies, but no INSERT policy was defined
2. **Username Field**: The table had a `username` field that was removed from the signup form but still present in the database schema
3. **Missing Display Name**: Users wanted an optional display name field separate from their full legal name

## Solution

### 1. Database Migration (REQUIRED)
Run the following SQL commands in your **Supabase SQL Editor**:

```sql
-- Add INSERT policy for users_profile
CREATE POLICY "Users can insert own profile" ON users_profile FOR INSERT WITH CHECK (auth.uid() = id);

-- Remove username column from users_profile table
ALTER TABLE users_profile DROP COLUMN IF EXISTS username;

-- Add display_name column to users_profile table
ALTER TABLE users_profile ADD COLUMN IF NOT EXISTS display_name TEXT;
```

**File**: `database-migration.sql` (created for your convenience)

### 2. Files Updated

#### Database Schema
- **database-setup.sql**:
  - Added INSERT policy: `CREATE POLICY "Users can insert own profile" ON users_profile FOR INSERT WITH CHECK (auth.uid() = id);`
  - Removed `username` column from `users_profile` table definition
  - Added `display_name TEXT` column to `users_profile` table definition

#### TypeScript Types
- **types/database.ts**:
  - Removed `username: string` from `UserProfile` interface
  - Added `display_name: string | null` to `UserProfile` interface

- **types/index.ts**:
  - Removed `username: string` from `SignupForm` interface
  - Added `display_name?: string` to `SignupForm` interface
  - Removed `username?: string` from `AgentPerformance` interface

#### UI Components
- **pages/auth/signup.vue**:
  - Removed username input field
  - Added display_name input field (optional)
  - Removed role selector field
  - Set role to 'agent' by default in form data
  - Removed `minLength` validation rule
  - Removed `roleOptions` constant

- **pages/auth/login.vue**: No changes needed

- **stores/auth.ts**:
  - Updated signup function signature to accept `display_name?: string`
  - Added `display_name` to the profile insert operation

- **Admin Pages** (users.vue, audit.vue, cashouts.vue, dashboard.vue):
  - Replaced all `username` references with `display_name || email`
  - Updated search filters to include display_name and email instead of username

## How RLS Works Now

### For users_profile table:
1. **SELECT**: Users can view their own profile, admins can view all profiles
2. **UPDATE**: Users can update their own profile
3. **INSERT**: Users can insert their own profile (NEWLY ADDED)

### Policy Details:
```sql
CREATE POLICY "Users can insert own profile"
ON users_profile
FOR INSERT
WITH CHECK (auth.uid() = id);
```

This policy ensures that:
- Users can only insert a profile for themselves
- The `id` in the new row must match their authenticated user ID (`auth.uid()`)
- Prevents users from creating profiles for other users

## Testing

After running the migration:

1. Try to sign up a new user via `/auth/signup`
2. Verify the user profile is created successfully
3. Check that the user can log in
4. Confirm the user role is set to 'agent' by default

## Important Notes

- The username field has been completely removed from the system
- A new optional `display_name` field has been added for users to set a friendly name
- Display name is shown in the UI when available, otherwise email is shown
- All new signups will be registered as 'agent' role by default
- Admins must be created directly in the database or through a separate admin interface
- The INSERT policy is crucial for the signup flow to work

## Display Name Usage

The `display_name` field:
- Is **optional** during signup
- Allows users to set a friendly name separate from their legal full name
- Is displayed in the UI alongside the full name (e.g., "John Doe - johndoe" or "John Doe - john@example.com")
- Can be updated by users through their profile settings (if implemented)
- Defaults to showing email address when not set
