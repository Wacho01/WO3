/*
  # Add Product Numbering and Activity Tracking

  1. New Columns
    - `product_number` (text) - Unique product identifier/SKU
    - `last_activity` (timestamp) - Last time product was viewed/accessed
    - `view_count` (integer) - Number of times product has been viewed
    - `activity_log` (jsonb) - Log of product activities

  2. Functions
    - Auto-generate product numbers
    - Track product activity

  3. Indexes
    - Index on product_number for fast lookups
    - Index on last_activity for sorting by recent activity
*/

-- Add new columns to products table
DO $$
BEGIN
  -- Add product_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'product_number'
  ) THEN
    ALTER TABLE products ADD COLUMN product_number text UNIQUE;
  END IF;

  -- Add last_activity column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE products ADD COLUMN last_activity timestamptz DEFAULT now();
  END IF;

  -- Add view_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE products ADD COLUMN view_count integer DEFAULT 0;
  END IF;

  -- Add activity_log column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'activity_log'
  ) THEN
    ALTER TABLE products ADD COLUMN activity_log jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_product_number ON products(product_number);
CREATE INDEX IF NOT EXISTS idx_products_last_activity ON products(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_products_view_count ON products(view_count DESC);

-- Function to generate product numbers
CREATE OR REPLACE FUNCTION generate_product_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer := 1;
BEGIN
  LOOP
    -- Generate format: WO-YYYY-NNNN (e.g., WO-2025-0001)
    new_number := 'WO-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(counter::text, 4, '0');
    
    -- Check if this number already exists
    IF NOT EXISTS (SELECT 1 FROM products WHERE product_number = new_number) THEN
      RETURN new_number;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to log product activity
CREATE OR REPLACE FUNCTION log_product_activity(
  product_id uuid,
  activity_type text,
  activity_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
  activity_entry jsonb;
BEGIN
  -- Create activity entry
  activity_entry := jsonb_build_object(
    'timestamp', now(),
    'type', activity_type,
    'data', activity_data
  );

  -- Update product with new activity
  UPDATE products 
  SET 
    last_activity = now(),
    activity_log = COALESCE(activity_log, '[]'::jsonb) || activity_entry,
    view_count = CASE 
      WHEN activity_type = 'view' THEN COALESCE(view_count, 0) + 1
      ELSE COALESCE(view_count, 0)
    END
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate product numbers for new products
CREATE OR REPLACE FUNCTION auto_generate_product_number()
RETURNS trigger AS $$
BEGIN
  -- Only generate if product_number is not provided
  IF NEW.product_number IS NULL OR NEW.product_number = '' THEN
    NEW.product_number := generate_product_number();
  END IF;
  
  -- Set initial activity
  NEW.last_activity := now();
  NEW.view_count := COALESCE(NEW.view_count, 0);
  NEW.activity_log := COALESCE(NEW.activity_log, '[]'::jsonb);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating product numbers
DROP TRIGGER IF EXISTS trigger_auto_generate_product_number ON products;
CREATE TRIGGER trigger_auto_generate_product_number
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_number();

-- Update existing products to have product numbers
DO $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN 
    SELECT id FROM products WHERE product_number IS NULL OR product_number = ''
  LOOP
    UPDATE products 
    SET 
      product_number = generate_product_number(),
      last_activity = COALESCE(last_activity, created_at, now()),
      view_count = COALESCE(view_count, 0),
      activity_log = COALESCE(activity_log, '[]'::jsonb)
    WHERE id = product_record.id;
  END LOOP;
END $$;

-- Function to get product activity summary
CREATE OR REPLACE FUNCTION get_product_activity_summary(product_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'product_id', p.id,
    'product_number', p.product_number,
    'title', p.title,
    'view_count', COALESCE(p.view_count, 0),
    'last_activity', p.last_activity,
    'created_at', p.created_at,
    'days_since_created', EXTRACT(DAYS FROM (now() - p.created_at)),
    'days_since_activity', EXTRACT(DAYS FROM (now() - p.last_activity)),
    'recent_activities', (
      SELECT jsonb_agg(activity ORDER BY (activity->>'timestamp')::timestamptz DESC)
      FROM jsonb_array_elements(COALESCE(p.activity_log, '[]'::jsonb)) AS activity
      LIMIT 10
    )
  )
  INTO result
  FROM products p
  WHERE p.id = product_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create a view for product analytics
CREATE OR REPLACE VIEW product_analytics AS
SELECT 
  p.id,
  p.product_number,
  p.title,
  p.subtitle,
  p.category_id,
  c.label as category_name,
  p.active,
  p.featured,
  p.view_count,
  p.last_activity,
  p.created_at,
  p.updated_at,
  EXTRACT(DAYS FROM (now() - p.created_at)) as days_since_created,
  EXTRACT(DAYS FROM (now() - p.last_activity)) as days_since_activity,
  CASE 
    WHEN p.last_activity > now() - interval '7 days' THEN 'active'
    WHEN p.last_activity > now() - interval '30 days' THEN 'moderate'
    ELSE 'inactive'
  END as activity_status,
  jsonb_array_length(COALESCE(p.activity_log, '[]'::jsonb)) as total_activities
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_deleted = false OR p.is_deleted IS NULL;

-- Grant permissions
GRANT SELECT ON product_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION log_product_activity(uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_activity_summary(uuid) TO authenticated;