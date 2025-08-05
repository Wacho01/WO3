/*
  # Create Admin User and Authentication Setup

  1. User Management
    - Update users table to work with Supabase Auth
    - Remove custom password field (Supabase handles this)
    - Add proper RLS policies for user management

  2. Security
    - Enable RLS on users table
    - Add policies for user self-management
    - Add admin-only policies for user management

  3. Sample Admin User
    - Instructions for creating admin user via Supabase Auth
*/

-- Update users table to work with Supabase Auth
DO $$
BEGIN
  -- Remove password column if it exists (Supabase Auth handles this)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users DROP COLUMN password;
  END IF;
END $$;

-- Ensure users table has proper structure for Supabase Auth integration
DO $$
BEGIN
  -- Make sure id is UUID and matches auth.users.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE users ALTER COLUMN id TYPE uuid USING id::uuid;
  END IF;
END $$;

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies that work with Supabase Auth
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their own user record
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin users can manage all users (for future admin features)
CREATE POLICY "Admin users can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record when someone signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert a default admin user record (this will be linked when admin signs up)
-- Note: The actual auth user must be created through Supabase Auth
INSERT INTO users (id, email, role) VALUES
  ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = now();

/*
  IMPORTANT: To create an admin user, you need to:
  
  1. Go to your Supabase Dashboard
  2. Navigate to Authentication > Users
  3. Click "Add user"
  4. Enter email: admin@example.com
  5. Enter a secure password
  6. Set "Email Confirm" to true
  
  OR use the Supabase CLI:
  supabase auth users create admin@example.com --password your-secure-password
  
  The trigger will automatically create the corresponding user record in the users table.
*/