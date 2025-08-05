/*
  # Rename title column to product_name in products table

  1. Changes
    - Rename `title` column to `product_name` in products table
    - Update any indexes or constraints that reference the old column name
    - Maintain data integrity during the rename operation

  2. Notes
    - This is a breaking change that requires application code updates
    - All existing data will be preserved during the rename
    - The column type remains text and all constraints are maintained
*/

-- Rename the title column to product_name
ALTER TABLE products RENAME COLUMN title TO product_name;

-- Update the product_analytics view to use the new column name
DROP VIEW IF EXISTS product_analytics;

CREATE OR REPLACE VIEW product_analytics AS
SELECT 
  p.id,
  p.product_number,
  p.product_name,
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

-- Grant permissions on the updated view
GRANT SELECT ON product_analytics TO authenticated;