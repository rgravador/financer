# Display Name Migration - Changes Summary

## What Was Done

The `display_name` field has been successfully moved from the `users_profile` database table to Supabase's auth metadata (`auth.users.user_metadata.display_name`).

## Key Changes

### 1. Database Schema (`database-setup.sql`)
- **Removed**: `display_name TEXT` column from `users_profile` table definition
- **Added**: Comment explaining that display_name is now stored in auth metadata

### 2. Type Definitions

#### `types/database.ts`
- **Removed**: `display_name` from `UserProfile` interface
- **Added**: `UserProfileWithMeta` interface that extends `UserProfile` with optional `display_name`
- **Updated**: All "WithRelations" interfaces to use `UserProfileWithMeta` instead of `UserProfile`
- **Updated**: `CashoutRequest.agent` and `CashoutRequest.processed_by_user` to use `UserProfileWithMeta`

#### `types/supabase.ts`
- **Added**: Imports for `UserRole`, `AccountStatus`, `TransactionType`
- **Updated**: `users_profile.Insert` type to remove `display_name`
- **Updated**: `users_profile.Update` type to remove `display_name`

#### `types/index.ts`
- **Removed**: `display_name` from `AgentPerformance` interface

### 3. Auth Store (`stores/auth.ts`)
- **Changed**: State user type from `UserProfile` to `UserProfileWithMeta`
- **Updated**: `signup()` method to store display_name in auth metadata via `options.data`
- **Updated**: `signup()` method to create profile without display_name column
- **Updated**: `fetchUserProfile()` to retrieve display_name from auth metadata and merge it with profile

### 4. New Files Created

#### `composables/useUserMetadata.ts`
A composable providing utilities to:
- Get display name for any user ID
- Get current user's display name
- Update current user's display name

#### `database-migration-remove-display-name.sql`
SQL migration script to remove the `display_name` column from existing databases.

#### `DISPLAY_NAME_MIGRATION_GUIDE.md`
Comprehensive guide covering:
- What changed and why
- Migration steps
- How to use display names in components
- How to handle existing data
- Troubleshooting tips

## How It Works Now

### During Signup
```typescript
// User signs up with display_name
await supabase.auth.signUp({
  email: "user@example.com",
  password: "password",
  options: {
    data: {
      display_name: "John Doe",  // Stored in auth metadata
      full_name: "John Doe"
    }
  }
})

// Profile created without display_name
await supabase.from('users_profile').insert({
  id: userId,
  email: "user@example.com",
  full_name: "John Doe",
  role: "agent"
  // No display_name field
})
```

### When Fetching User Profile
```typescript
// Fetch profile from database
const { data } = await supabase
  .from('users_profile')
  .select('*')
  .eq('id', userId)
  .single()

// Get display name from auth metadata
const { data: { user: authUser } } = await supabase.auth.getUser()
const displayName = authUser?.user_metadata?.display_name || null

// Merge them
this.user = Object.assign({}, data, {
  display_name: displayName
})
```

### In Components
```vue
<template>
  <div>{{ authStore.user?.display_name || authStore.user?.email }}</div>
</template>

<script setup>
const authStore = useAuthStore()
</script>
```

## Files Modified

1. `stores/auth.ts` - Updated signup and fetchUserProfile methods
2. `types/database.ts` - Removed display_name, added UserProfileWithMeta
3. `types/supabase.ts` - Updated Insert/Update types, added imports
4. `types/index.ts` - Removed display_name from AgentPerformance
5. `database-setup.sql` - Removed display_name column from schema

## Files Created

1. `composables/useUserMetadata.ts` - Helper composable for auth metadata
2. `database-migration-remove-display-name.sql` - Migration script
3. `DISPLAY_NAME_MIGRATION_GUIDE.md` - Comprehensive migration guide
4. `CHANGES_SUMMARY.md` - This file

## Next Steps

### To Apply These Changes:

1. **Run the database migration**:
   ```sql
   -- In Supabase SQL Editor
   ALTER TABLE users_profile DROP COLUMN IF EXISTS display_name;
   ```

2. **Migrate existing display names** (if you have existing users):
   Run the migration script from `DISPLAY_NAME_MIGRATION_GUIDE.md` to copy existing display names to auth metadata.

3. **Test the signup flow**:
   - Create a new user
   - Verify display_name is stored in auth metadata
   - Verify profile is created without display_name column

4. **Test existing users**:
   - Login with existing users
   - Verify their display names are shown correctly

## Benefits

1. **Better separation of concerns**: Auth data stays with auth system
2. **Simpler schema**: One less column in application tables
3. **Native Supabase features**: Leverage built-in user metadata
4. **Easier updates**: Users can update display name through auth system
5. **Consistency**: All auth-related data in one place

## Admin Pages Note

Admin pages that fetch multiple users and need to display their display names will need to:
- Either use a server-side RPC function to join auth.users data
- Or fetch display names client-side using the `useUserMetadata` composable
- See the `DISPLAY_NAME_MIGRATION_GUIDE.md` for detailed examples

## Type Safety

All TypeScript types have been updated to reflect the new structure:
- `UserProfile` = base profile from database (no display_name)
- `UserProfileWithMeta` = profile + display_name from auth metadata
- All relation interfaces use `UserProfileWithMeta` for user references
