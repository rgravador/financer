# RLS Infinite Recursion Fix

## Problems Fixed

### 1. Infinite Recursion in RLS Policies
**Error:** `infinite recursion detected in policy for relation "users_profile"`

**Root Cause:**
The RLS policies were checking if a user is an admin by querying the `users_profile` table:
```sql
EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
```

This creates infinite recursion because:
1. Policy tries to check if user is admin
2. To check admin status, it queries `users_profile`
3. Querying `users_profile` triggers the same policy check
4. Loop continues infinitely ♾️

**Affected Policies:**
- "Admins can view all profiles" on `users_profile`
- "Agents can view assigned accounts" on `accounts`
- "Agents can update assigned accounts" on `accounts`
- "Users can view loans for their accounts" on `loans`
- "Admins can update loans" on `loans`
- "Users can view payments for their loans" on `payments`
- "Agents can view own earnings" on `earnings`
- "Admins can update earnings" on `earnings`
- "Agents can view own cashout requests" on `cashout_requests`
- "Admins can update cashout requests" on `cashout_requests`
- "Users can view relevant transactions" on `transactions`

### 2. Missing INSERT Policy for Earnings
**Error:** `new row violates row-level security policy for table "earnings"`

**Root Cause:**
The `earnings` table had SELECT and UPDATE policies but no INSERT policy, preventing:
- The trigger from auto-creating earnings records for new agents
- The application code from manually creating earnings records

## Solution

### Step 1: Create Helper Function with SECURITY DEFINER
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**How SECURITY DEFINER Works:**
- Functions with `SECURITY DEFINER` run with the privileges of the function owner (typically a superuser)
- This bypasses RLS policies when querying `users_profile` inside the function
- Breaks the recursion cycle because the function executes with elevated privileges

### Step 2: Replace Recursive Checks with Helper Function
**Before:**
```sql
CREATE POLICY "..." ON table_name FOR SELECT USING (
  condition OR EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role = 'admin')
);
```

**After:**
```sql
CREATE POLICY "..." ON table_name FOR SELECT USING (
  condition OR is_admin()
);
```

### Step 3: Add Missing INSERT Policy for Earnings
```sql
CREATE POLICY "Agents can insert own earnings" ON earnings FOR INSERT WITH CHECK (
  agent_id = auth.uid()
);
```

### Step 4: Update Trigger Function
```sql
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
```

Added `SECURITY DEFINER` so the trigger can insert into earnings table regardless of RLS policies.

## How to Apply the Fix

Run the migration SQL in your **Supabase SQL Editor**:

```bash
database-migration-fix-rls.sql
```

This script will:
1. ✅ Drop all problematic policies
2. ✅ Create the `is_admin()` helper function
3. ✅ Recreate all policies using the helper function
4. ✅ Add the missing INSERT policy for earnings
5. ✅ Update the trigger function to use SECURITY DEFINER

## Files Updated

1. **database-setup.sql** - Updated with corrected RLS policies
2. **database-migration-fix-rls.sql** - Migration script to apply fixes
3. **database-migration-earnings-rls.sql** - Superseded by comprehensive fix

## Testing

After applying the migration:

### Test 1: User Signup (tests earnings INSERT)
```bash
# Try signing up a new user
# Should successfully create user profile AND earnings record
```

### Test 2: Admin Access (tests is_admin() function)
```bash
# Login as admin
# Should be able to view all profiles, accounts, loans, etc.
```

### Test 3: Agent Access (tests non-recursive policies)
```bash
# Login as agent
# Should be able to view own accounts and loans
# Should NOT be able to view other agents' data
```

### Test 4: No More Infinite Recursion
```bash
# Any database query should complete without hanging
# No "infinite recursion detected" errors
```

## Why This Solution Works

1. **SECURITY DEFINER**: Elevates privileges inside the function, bypassing RLS
2. **Single Query Point**: Admin check happens in one place (the function)
3. **No Recursion**: Function runs with elevated privileges, so it doesn't trigger RLS policies
4. **Security Maintained**: Only checks if user is admin, doesn't grant other privileges
5. **Complete Policies**: Added missing INSERT policy for earnings table

## Security Notes

- The `is_admin()` function is safe because it only checks user role
- It doesn't modify data or grant additional access
- All other RLS policies remain enforced
- Agents can still only access their own data
- Admins get elevated access as intended

## Related Issues

- ✅ Fixed: "new row violates row-level security policy for table 'earnings'"
- ✅ Fixed: "infinite recursion detected in policy for relation 'users_profile'"
- ✅ Fixed: Trigger function can now create earnings records
- ✅ Fixed: Application code can create earnings as fallback
