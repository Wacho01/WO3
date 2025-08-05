/*
  # Add sort_order columns to categories and products tables

  1. New Columns
    - Add `sort_order` (integer) to categories table with default 0
    - Add `sort_order` (integer) to products table with default 0

  2. Data Migration
    - Set initial sort_order values based on creation date
    - Use subqueries instead of window functions in UPDATE statements

  3. Indexes
    - Add indexes for better query performance on sort_order columns
*/

-- Add sort_order column to categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE categories ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

-- Add sort_order column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE products ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

-- Set initial sort_order values for categories using a different approach
DO $$
DECLARE
  cat_record RECORD;
  counter integer := 1;
BEGIN
  FOR cat_record IN 
    SELECT id FROM categories ORDER BY created_at
  LOOP
    UPDATE categories 
    SET sort_order = counter 
    WHERE id = cat_record.id AND (sort_order = 0 OR sort_order IS NULL);
    counter := counter + 1;
  END LOOP;
END $$;

-- Set initial sort_order values for products using a different approach
DO $$
DECLARE
  prod_record RECORD;
  counter integer := 1;
BEGIN
  FOR prod_record IN 
    SELECT id FROM products ORDER BY created_at
  LOOP
    UPDATE products 
    SET sort_order = counter 
    WHERE id = prod_record.id AND (sort_order = 0 OR sort_order IS NULL);
    counter := counter + 1;
  END LOOP;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);