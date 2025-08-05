/*
  # Create Products and Categories Schema

  1. New Tables
    - `categories`
      - `id` (text, primary key)
      - `label` (text)
      - `disabled` (boolean, default false)
      - `sort_order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `title` (text)
      - `subtitle` (text)
      - `image` (text, URL)
      - `category_id` (text, foreign key)
      - `href` (text)
      - `featured` (boolean, default false)
      - `active` (boolean, default true)
      - `sort_order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated admin access

  3. Sample Data
    - Insert categories from the original design
    - Insert products with proper categorization
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  label text NOT NULL,
  disabled boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image text NOT NULL,
  category_id text REFERENCES categories(id) ON DELETE CASCADE,
  href text,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

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

-- Insert categories
INSERT INTO categories (id, label, disabled, sort_order) VALUES
  ('all', 'All', false, 1),
  ('womojis', 'WOmojis', true, 2),
  ('colorcast', 'Color Cast', false, 3),
  ('essentials', 'Essentials', true, 4),
  ('themed', 'Themed Essentials', false, 5),
  ('funforms', 'Fun Forms', false, 6),
  ('groundsprays', 'Ground Sprays', true, 7),
  ('interactivedevices', 'Interactive Devices', true, 8),
  ('sprays', 'Sprayers', true, 9)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  disabled = EXCLUDED.disabled,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Insert products
INSERT INTO products (title, subtitle, image, category_id, href, featured, sort_order) VALUES
  ('MOUNTAIN LIONS', 'Small Slide', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/lions/index.html', true, 1),
  ('RHINO', 'Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'colorcast', 'funforms/rhino/index.html', false, 2),
  ('GIRAFFE', 'Sprayer', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/giraffe/index.html', false, 3),
  ('BIGHORN', 'Medium Slide', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/bighorn/index.html', false, 4),
  ('ASIAN ELEPHANT', 'Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/asian_elephant/index.html', true, 5),
  ('DOLPHIN', 'Sprayer', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/dolphin/index.html', false, 6),
  ('FLAT TRACTOR', 'Sprayer', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/flattractor/index.html', false, 7),
  ('LADLE', 'Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/ladle/index.html', false, 8),
  ('TRUCK', 'Triple Slide', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/truck/index.html', true, 9),
  ('TREE HOUSE', 'Medium Slide', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', 'funforms', 'funforms/treehouse/index.html', false, 10),
  ('OCEAN WAVE', 'Large Slide', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'themed', 'themed/oceanwave/index.html', true, 11),
  ('PIRATE SHIP', 'Adventure Play', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'themed', 'themed/pirateship/index.html', false, 12),
  ('WATER CASTLE', 'Multi-Level Play', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', 'themed', 'themed/watercastle/index.html', false, 13),
  ('RAINBOW ARCH', 'Colorful Sprayer', 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600', 'colorcast', 'colorcast/rainbow/index.html', false, 14),
  ('SUNSET SPLASH', 'Color-Changing Feature', 'https://images.pexels.com/photos/802112/pexels-photo-802112.jpeg?auto=compress&cs=tinysrgb&w=600', 'colorcast', 'colorcast/sunset/index.html', false, 15)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();