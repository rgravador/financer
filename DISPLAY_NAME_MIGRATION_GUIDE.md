# Display Name Migration Guide

## Overview
Display names have been moved from the `users_profile` table to Supabase auth metadata (`auth.users.user_metadata`). This provides better separation of concerns and leverages Supabase's built-in user metadata features.

## What Changed

### Database Schema
- **Removed**: `display_name` column from `users_profile` table
- **New Location**: `auth.users.raw_user_meta_data.display_name`

### Code Changes

#### 1. Signup Flow (`stores/auth.ts:47-84`)
The signup function now stores display name in auth metadata:
```typescript
await supabase.auth.signUp({
  email: userData.email,
  password: userData.password,
  options: {
    data: {
      display_name: userData.display_name || userData.full_name,
      full_name: userData.full_name
    }
  }
})
```

#### 2. Auth Store (`stores/auth.ts:5-7`)
Added `UserProfileWithMeta` interface that extends `UserProfile` with display_name:
```typescript
interface UserProfileWithMeta extends UserProfile {
  display_name?: string | null
}
```

#### 3. Fetch User Profile (`stores/auth.ts:99-120`)
The `fetchUserProfile` function now retrieves display name from auth metadata:
```typescript
const { data: { user: authUser } } = await supabase.auth.getUser()
const displayName = authUser?.user_metadata?.display_name || null

this.user = Object.assign({}, data, {
  display_name: displayName
}) as UserProfileWithMeta
```

## Migration Steps

### 1. Run the Database Migration
Execute the migration SQL to remove the `display_name` column:
```sql
-- In Supabase SQL Editor
\i database-migration-remove-display-name.sql
```

Or manually:
```sql
ALTER TABLE users_profile DROP COLUMN IF EXISTS display_name;
```

### 2. Existing Users
For existing users with display names in the database, you'll need to migrate them to auth metadata. Here's a migration script you can run in Supabase:

```sql
-- This is a one-time migration script
-- Run this BEFORE dropping the display_name column

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT id, display_name
    FROM users_profile
    WHERE display_name IS NOT NULL
  LOOP
    -- Update auth metadata
    UPDATE auth.users
    SET raw_user_meta_data =
      COALESCE(raw_user_meta_data, '{}'::jsonb) ||
      jsonb_build_object('display_name', user_record.display_name)
    WHERE id = user_record.id;
  END LOOP;
END $$;
```

## Using Display Name in Your Code

### In Components
The auth store automatically includes display_name in the user object:
```vue
<script setup>
const authStore = useAuth()
const displayName = authStore.user?.display_name
</script>

<template>
  <div>{{ displayName || authStore.user?.email }}</div>
</template>
```

### Accessing Other Users' Display Names
When fetching other users (e.g., in admin pages), you'll need to join with auth data. Since direct access to auth.users is restricted, consider these approaches:

#### Option 1: Add display_name to queries via RPC function
Create a Postgres function to fetch user data with display name:

```sql
CREATE OR REPLACE FUNCTION get_user_with_metadata(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  role user_role,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.email,
    up.role,
    up.full_name,
    (au.raw_user_meta_data->>'display_name')::TEXT as display_name,
    up.avatar_url,
    up.is_active,
    up.created_at,
    up.updated_at
  FROM users_profile up
  JOIN auth.users au ON up.id = au.id
  WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Option 2: Client-side approach (for admin pages)
For admin pages that list multiple users, fetch display names separately:

```typescript
// In admin pages
const users = ref<UserProfileWithMeta[]>([])

const fetchUsers = async () => {
  const { data: profiles } = await supabase
    .from('users_profile')
    .select('*')

  // Fetch auth metadata for each user
  const usersWithMeta = await Promise.all(
    profiles.map(async (profile) => {
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
      return {
        ...profile,
        display_name: user?.user_metadata?.display_name || null
      }
    })
  )

  users.value = usersWithMeta
}
```

**Note**: The `auth.admin` methods require service role key and should only be used in server-side code or admin contexts.

### Using the useUserMetadata Composable
A helper composable is provided in `composables/useUserMetadata.ts`:

```typescript
const { getDisplayName, updateDisplayName } = useUserMetadata()

// Get display name for a user
const displayName = await getDisplayName(userId)

// Update current user's display name
await updateDisplayName('New Display Name')
```

## Benefits of This Approach

1. **Better Data Separation**: User authentication data is separate from application data
2. **Built-in Features**: Leverage Supabase's user metadata features
3. **Easier Updates**: Users can update their display name without modifying application tables
4. **Consistency**: Display name lives with other auth-related data

## Troubleshooting

### Display name not showing after migration
- Check that auth metadata was properly set during migration
- Verify the user's session is refreshed after migration
- Check browser console for any auth errors

### Admin pages not showing display names
- Ensure you're using the appropriate method to fetch user metadata
- Check RLS policies allow reading user data
- For admin operations, ensure service role access if using `auth.admin` methods

## Files Modified

1. `stores/auth.ts` - Updated signup and fetchUserProfile
2. `types/database.ts` - Removed display_name from UserProfile
3. `types/supabase.ts` - Updated Insert/Update types
4. `types/index.ts` - Removed display_name from AgentPerformance
5. `database-setup.sql` - Removed display_name column definition
6. `composables/useUserMetadata.ts` - New helper composable (created)
7. `database-migration-remove-display-name.sql` - Migration script (created)
