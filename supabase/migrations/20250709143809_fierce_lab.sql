/*
  # Fix infinite recursion in users RLS policy

  1. Problem
    - The "Admin users can manage all users" policy creates infinite recursion
    - It queries the users table from within a users table policy
    - This causes a circular dependency when evaluating permissions

  2. Solution
    - Remove the problematic recursive policy
    - Create a simpler, non-recursive policy structure
    - Use auth.uid() directly without querying the users table from within the policy

  3. Security Changes
    - Drop the recursive admin policy
    - Keep the basic user policies (users can manage their own data)
    - Admin functionality will be handled at the application level
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admin users can manage all users" ON users;

-- Ensure the basic user policies remain intact
-- Users can read their own data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Users can update their own data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Users can insert their own data (for registration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can insert own data'
  ) THEN
    CREATE POLICY "Users can insert own data"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;