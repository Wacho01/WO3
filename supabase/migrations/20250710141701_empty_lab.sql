/*
  # Add Product Data Sheet File Column

  1. New Column
    - `product_data_sheet_url` (text) - URL to uploaded data sheet file in Supabase Storage

  2. Changes
    - Add new column to existing products table
    - Column stores the public URL of the uploaded data sheet file
*/

-- Add product_data_sheet_url column to products table
DO $$
BEGIN
  -- Add product_data_sheet_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'product_data_sheet_url'
  ) THEN
    ALTER TABLE products ADD COLUMN product_data_sheet_url text;
  END IF;
END $$;

-- Add comment to clarify the purpose of the column
COMMENT ON COLUMN products.product_data_sheet_url IS 'URL to the product data sheet file stored in Supabase Storage';