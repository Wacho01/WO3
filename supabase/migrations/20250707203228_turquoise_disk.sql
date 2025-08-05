/*
  # Add file storage columns to products table

  1. New Columns
    - `file_url` (text) - URL to uploaded file in Supabase Storage
    - `file_name` (text) - Original filename for display
    - `file_type` (text) - MIME type of the uploaded file
    - `is_deleted` (boolean) - Soft delete flag for products

  2. Storage
    - Create storage buckets for product images and files
    - Set up RLS policies for file access

  3. Changes
    - Add new columns to existing products table
    - Create storage buckets with proper permissions
*/

-- Add new columns to products table
DO $$
BEGIN
  -- Add file_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE products ADD COLUMN file_url text;
  END IF;

  -- Add file_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE products ADD COLUMN file_name text;
  END IF;

  -- Add file_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE products ADD COLUMN file_type text;
  END IF;

  -- Add is_deleted column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE products ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('product-files', 'product-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage buckets

-- Product Images Bucket Policies
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

-- Product Files Bucket Policies
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

-- Update products RLS policy to exclude soft-deleted items from public view
DROP POLICY IF EXISTS "Active products are publicly readable" ON products;

CREATE POLICY "Active products are publicly readable"
  ON products
  FOR SELECT
  TO public
  USING (active = true AND (is_deleted = false OR is_deleted IS NULL));