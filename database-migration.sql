-- Migration to fix RLS policy and update users_profile table
-- Run this in your Supabase SQL Editor

-- Step 1: Add INSERT policy for users_profile
CREATE POLICY "Users can insert own profile" ON users_profile FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 2: Remove username column from users_profile table (if it exists)
ALTER TABLE users_profile DROP COLUMN IF EXISTS username;

-- Step 3: Add display_name column to users_profile table
ALTER TABLE users_profile ADD COLUMN IF NOT EXISTS display_name TEXT;
