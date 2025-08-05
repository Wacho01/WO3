/*
  # Remove sort_order columns from products and categories tables

  1. Changes
    - Remove `sort_order` column from `products` table
    - Remove `sort_order` column from `categories` table
    - Update any indexes or constraints that reference these columns

  2. Data Migration
    - No data migration needed as sort_order was not critical for functionality
    - Categories will be ordered by creation date instead
    - Products will be ordered by creation date or other relevant fields
*/

-- Remove sort_order column from products table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE products DROP COLUMN sort_order;
  END IF;
END $$;

-- Remove sort_order column from categories table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE categories DROP COLUMN sort_order;
  END IF;
END $$;

-- Update any existing data queries to use created_at for ordering instead
-- This is handled in the application code, no database changes needed

-- Note: The application code has already been updated to:
-- 1. Remove sort_order from all forms and modals
-- 2. Use created_at for ordering categories and products
-- 3. Remove sort_order from TypeScript interfaces