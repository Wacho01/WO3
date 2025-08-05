/*
  # Add Product Dimensions

  1. New Columns
    - `width_in` (numeric) - Width in inches
    - `width_cm` (numeric) - Width in centimeters (auto-calculated)
    - `length_in` (numeric) - Length in inches  
    - `length_cm` (numeric) - Length in centimeters (auto-calculated)
    - `height_in` (numeric) - Height in inches
    - `height_cm` (numeric) - Height in centimeters (auto-calculated)

  2. Constraints
    - All dimension values must be positive numbers
    - Precision set to 2 decimal places for accurate measurements

  3. Triggers
    - Auto-calculate CM values when IN values are updated
*/

-- Add dimension columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS width_in NUMERIC(10,2) CHECK (width_in IS NULL OR width_in >= 0),
ADD COLUMN IF NOT EXISTS width_cm NUMERIC(10,2) CHECK (width_cm IS NULL OR width_cm >= 0),
ADD COLUMN IF NOT EXISTS length_in NUMERIC(10,2) CHECK (length_in IS NULL OR length_in >= 0),
ADD COLUMN IF NOT EXISTS length_cm NUMERIC(10,2) CHECK (length_cm IS NULL OR length_cm >= 0),
ADD COLUMN IF NOT EXISTS height_in NUMERIC(10,2) CHECK (height_in IS NULL OR height_in >= 0),
ADD COLUMN IF NOT EXISTS height_cm NUMERIC(10,2) CHECK (height_cm IS NULL OR height_cm >= 0);

-- Create function to calculate centimeter values from inches
CREATE OR REPLACE FUNCTION calculate_dimensions_cm()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert inches to centimeters (1 inch = 2.54 cm)
  IF NEW.width_in IS NOT NULL THEN
    NEW.width_cm := ROUND((NEW.width_in * 2.54)::numeric, 2);
  ELSE
    NEW.width_cm := NULL;
  END IF;
  
  IF NEW.length_in IS NOT NULL THEN
    NEW.length_cm := ROUND((NEW.length_in * 2.54)::numeric, 2);
  ELSE
    NEW.length_cm := NULL;
  END IF;
  
  IF NEW.height_in IS NOT NULL THEN
    NEW.height_cm := ROUND((NEW.height_in * 2.54)::numeric, 2);
  ELSE
    NEW.height_cm := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate CM values
DROP TRIGGER IF EXISTS trigger_calculate_dimensions_cm ON products;
CREATE TRIGGER trigger_calculate_dimensions_cm
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION calculate_dimensions_cm();