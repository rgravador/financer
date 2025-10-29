-- Fix RLS policy for earnings table
-- This adds the missing INSERT policy that allows agents to create their own earnings records

-- Add INSERT policy for earnings
CREATE POLICY "Agents can insert own earnings" ON earnings FOR INSERT WITH CHECK (
  agent_id = auth.uid()
);
