/*
  # Fix Database Setup and Ensure All Tables Exist

  This migration ensures all required tables exist with proper relationships
  and fixes any connection issues between products and categories.

  1. Tables
    - Ensure categories table exists with proper structure
    - Ensure products table exists with all required columns
    - Ensure users table exists for admin functionality
    - Verify all foreign key relationships

  2. Security
    - Enable RLS on all tables
    - Create proper policies for public and authenticated access
    - Set up storage bucket policies

  3. Data
    - Insert default categories if they don't exist
    - Insert sample products if table is empty
*/

-- Ensure categories table exists with proper structure
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  label text NOT NULL,
  disabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure users table exists
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  first_name text,
  last_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure products table exists with all required columns
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  subtitle text,
  image text NOT NULL,
  category_id text REFERENCES categories(id) ON DELETE SET NULL,
  href text,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  file_url text,
  file_name text,
  file_type text,
  is_deleted boolean DEFAULT false,
  product_number text UNIQUE,
  last_activity timestamptz DEFAULT now(),
  view_count integer DEFAULT 0,
  first_name text,
  last_name text,
  activity_log jsonb DEFAULT '[]'::jsonb,
  flow_requirement_value numeric(10,2),
  flow_requirement_unit text DEFAULT 'GPM',
  flow_requirement_lpm numeric(10,2),
  flow_requirement_lpm_unit text DEFAULT 'LPM',
  product_data_sheet_url text,
  top_svg_file_url text,
  side_svg_file_url text,
  width_in numeric(10,2) CHECK (width_in IS NULL OR width_in >= 0),
  width_cm numeric(10,2) CHECK (width_cm IS NULL OR width_cm >= 0),
  length_in numeric(10,2) CHECK (length_in IS NULL OR length_in >= 0),
  length_cm numeric(10,2) CHECK (length_cm IS NULL OR length_cm >= 0),
  height_in numeric(10,2) CHECK (height_in IS NULL OR height_in >= 0),
  height_cm numeric(10,2) CHECK (height_cm IS NULL OR height_cm >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Active products are publicly readable" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create policies for public read access
CREATE POLICY "Categories are publicly readable"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Active products are publicly readable"
  ON products
  FOR SELECT
  TO public
  USING (active = true AND (is_deleted = false OR is_deleted IS NULL));

-- Create policies for authenticated admin access
CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- User policies
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

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('product-files', 'product-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product files" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Public can view product files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-files');

CREATE POLICY "Authenticated users can upload product files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-files');

CREATE POLICY "Authenticated users can update product files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-files');

CREATE POLICY "Authenticated users can delete product files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-files');

-- Create or replace functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION convert_inches_to_cm()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.width_in IS NOT NULL THEN
    NEW.width_cm = ROUND((NEW.width_in * 2.54)::numeric, 2);
  END IF;
  
  IF NEW.length_in IS NOT NULL THEN
    NEW.length_cm = ROUND((NEW.length_in * 2.54)::numeric, 2);
  END IF;
  
  IF NEW.height_in IS NOT NULL THEN
    NEW.height_cm = ROUND((NEW.height_in * 2.54)::numeric, 2);
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION generate_product_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer := 1;
BEGIN
  LOOP
    new_number := 'WO-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(counter::text, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM products WHERE product_number = new_number) THEN
      RETURN new_number;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_generate_product_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.product_number IS NULL OR NEW.product_number = '' THEN
    NEW.product_number := generate_product_number();
  END IF;
  
  NEW.last_activity := now();
  NEW.view_count := COALESCE(NEW.view_count, 0);
  NEW.activity_log := COALESCE(NEW.activity_log, '[]'::jsonb);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS convert_dimensions_trigger ON products;
DROP TRIGGER IF EXISTS trigger_auto_generate_product_number ON products;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER convert_dimensions_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION convert_inches_to_cm();

CREATE TRIGGER trigger_auto_generate_product_number
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_number();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default categories
INSERT INTO categories (id, label, disabled) VALUES
  ('all', 'All', false),
  ('womojis', 'WOmojis', true),
  ('colorcast', 'Color Cast', false),
  ('essentials', 'Essentials', true),
  ('themed', 'Themed Essentials', false),
  ('funforms', 'Fun Forms', false),
  ('groundsprays', 'Ground Sprays', true),
  ('interactivedevices', 'Interactive Devices', true),
  ('sprays', 'Sprayers', true)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  disabled = EXCLUDED.disabled,
  updated_at = now();

-- Insert sample products if table is empty
INSERT INTO products (product_name, subtitle, image, category_id, href, featured, product_number) 
SELECT * FROM (VALUES
  ('MOUNTAIN LIONS', 'Small Slide', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/lions/index.html', true, 'WO-2025-0001'),
  ('RHINO', 'Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'colorcast', 'funforms/rhino/index.html', false, 'WO-2025-0002'),
  ('GIRAFFE', 'Sprayer', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/giraffe/index.html', false, 'WO-2025-0003'),
  ('BIGHORN', 'Medium Slide', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/bighorn/index.html', false, 'WO-2025-0004'),
  ('ASIAN ELEPHANT', 'Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/asian_elephant/index.html', true, 'WO-2025-0005'),
  ('DOLPHIN', 'Sprayer', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/dolphin/index.html', false, 'WO-2025-0006'),
  ('OCEAN WAVE', 'Large Slide', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'themed', 'themed/oceanwave/index.html', true, 'WO-2025-0007'),
  ('PIRATE SHIP', 'Adventure Play', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'themed', 'themed/pirateship/index.html', false, 'WO-2025-0008'),
  ('RAINBOW ARCH', 'Colorful Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'colorcast', 'colorcast/rainbow/index.html', false, 'WO-2025-0009'),
  ('SUNSET SPLASH', 'Color-Changing Feature', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'colorcast', 'colorcast/sunset/index.html', false, 'WO-2025-0010')
) AS v(product_name, subtitle, image, category_id, href, featured, product_number)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1)
ON CONFLICT (product_number) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_product_number ON products(product_number);
CREATE INDEX IF NOT EXISTS idx_categories_disabled ON categories(disabled);