-- Migration: Remove display_name from users_profile table
-- Display name is now stored in auth.users metadata

-- Remove display_name column from users_profile
ALTER TABLE users_profile DROP COLUMN IF EXISTS display_name;

-- Note: Display name will now be accessed via:
-- auth.users -> raw_user_meta_data -> display_name
-- This is set during signup using supabase.auth.signUp with options.data
