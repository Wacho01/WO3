/*
  # Add SVG file URL columns to products table

  1. New Columns
    - `top_svg_file_url` (text, nullable) - URL to the top view SVG file stored in Supabase Storage
    - `side_svg_file_url` (text, nullable) - URL to the side view SVG file stored in Supabase Storage

  2. Changes
    - Add two new optional text columns to the products table
    - Both columns allow NULL values since SVG files are optional
    - No constraints or indexes needed as these are simple URL storage fields
*/

-- Add top_svg_file_url column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'top_svg_file_url'
  ) THEN
    ALTER TABLE products ADD COLUMN top_svg_file_url text;
  END IF;
END $$;

-- Add side_svg_file_url column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'side_svg_file_url'
  ) THEN
    ALTER TABLE products ADD COLUMN side_svg_file_url text;
  END IF;
END $$;