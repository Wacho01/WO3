/*
  # Fix Categories and Products Schema

  This migration ensures the categories and products tables exist with proper relationships.
  It's safe to run multiple times as it uses IF NOT EXISTS checks.

  1. New Tables
    - `categories` table with proper structure
    - `products` table with foreign key to categories
    
  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated admin access

  3. Sample Data
    - Insert default categories
    - Insert sample products
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  label text NOT NULL,
  disabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table with proper foreign key relationship
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
  product_number text DEFAULT '',
  last_activity text DEFAULT '',
  view_count integer DEFAULT 0,
  first_name text,
  last_name text,
  activity_log jsonb DEFAULT '[]'::jsonb,
  flow_requirement_value numeric(10,2),
  flow_requirement_unit text,
  flow_requirement_lpm numeric(10,2),
  flow_requirement_lpm_unit text,
  product_data_sheet_url text,
  top_svg_file_url text,
  side_svg_file_url text,
  width_in numeric(10,2),
  width_cm numeric(10,2),
  length_in numeric(10,2),
  length_cm numeric(10,2),
  height_in numeric(10,2),
  height_cm numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Active products are publicly readable" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

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
  USING (active = true);

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

-- Insert categories (use ON CONFLICT to avoid duplicates)
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

-- Insert sample products (use ON CONFLICT DO NOTHING to avoid duplicates)
INSERT INTO products (product_name, subtitle, image, category_id, href, featured, product_number) VALUES
  ('MOUNTAIN LIONS', 'Small Slide', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/lions/index.html', true, 'ML-001'),
  ('RHINO', 'Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'colorcast', 'funforms/rhino/index.html', false, 'RH-002'),
  ('GIRAFFE', 'Sprayer', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/giraffe/index.html', false, 'GF-003'),
  ('BIGHORN', 'Medium Slide', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/bighorn/index.html', false, 'BH-004'),
  ('ASIAN ELEPHANT', 'Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/asian_elephant/index.html', true, 'AE-005'),
  ('DOLPHIN', 'Sprayer', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/dolphin/index.html', false, 'DP-006'),
  ('OCEAN WAVE', 'Large Slide', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'themed', 'themed/oceanwave/index.html', true, 'OW-007'),
  ('PIRATE SHIP', 'Adventure Play', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'themed', 'themed/pirateship/index.html', false, 'PS-008'),
  ('RAINBOW ARCH', 'Colorful Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'colorcast', 'colorcast/rainbow/index.html', false, 'RA-009'),
  ('SUNSET SPLASH', 'Color-Changing Feature', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'colorcast', 'colorcast/sunset/index.html', false, 'SS-010')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop first if they exist)
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for automatic cm conversion
CREATE OR REPLACE FUNCTION convert_inches_to_cm()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert inches to centimeters (1 inch = 2.54 cm)
  IF NEW.width_in IS NOT NULL THEN
    NEW.width_cm = NEW.width_in * 2.54;
  END IF;
  
  IF NEW.length_in IS NOT NULL THEN
    NEW.length_cm = NEW.length_in * 2.54;
  END IF;
  
  IF NEW.height_in IS NOT NULL THEN
    NEW.height_cm = NEW.height_in * 2.54;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS convert_dimensions_trigger ON products;
CREATE TRIGGER convert_dimensions_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION convert_inches_to_cm();