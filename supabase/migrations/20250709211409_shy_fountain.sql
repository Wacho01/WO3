/*
  # Add Flow Requirement columns to products table

  1. New Columns
    - `flow_requirement_value` (decimal) - Numeric value for flow requirement
    - `flow_requirement_unit` (text) - Unit (GPM)
    - `flow_requirement_lpm` (decimal) - Converted value in Liters per Minute
    - `flow_requirement_lpm_unit` (text) - Unit (LPM)

  2. Changes
    - Add new columns to existing products table
    - Set default values and constraints
*/

-- Add flow requirement columns to products table
DO $$
BEGIN
  -- Add flow_requirement_value column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'flow_requirement_value'
  ) THEN
    ALTER TABLE products ADD COLUMN flow_requirement_value decimal(10,2);
  END IF;

  -- Add flow_requirement_unit column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'flow_requirement_unit'
  ) THEN
    ALTER TABLE products ADD COLUMN flow_requirement_unit text DEFAULT 'GPM';
  END IF;

  -- Add flow_requirement_lpm column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'flow_requirement_lpm'
  ) THEN
    ALTER TABLE products ADD COLUMN flow_requirement_lpm decimal(10,2);
  END IF;

  -- Add flow_requirement_lpm_unit column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'flow_requirement_lpm_unit'
  ) THEN
    ALTER TABLE products ADD COLUMN flow_requirement_lpm_unit text DEFAULT 'LPM';
  END IF;
END $$;

-- Add check constraint to ensure flow_requirement_value is positive when provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'products_flow_requirement_value_positive'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_flow_requirement_value_positive 
    CHECK (flow_requirement_value IS NULL OR flow_requirement_value >= 0);
  END IF;
END $$;

-- Add check constraint to ensure flow_requirement_lpm is positive when provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'products_flow_requirement_lpm_positive'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_flow_requirement_lpm_positive 
    CHECK (flow_requirement_lpm IS NULL OR flow_requirement_lpm >= 0);
  END IF;
END $$;

-- Create function to automatically calculate LPM from GPM
CREATE OR REPLACE FUNCTION calculate_flow_requirement_lpm()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert GPM to LPM (1 GPM = 3.78541 LPM)
  IF NEW.flow_requirement_value IS NOT NULL AND NEW.flow_requirement_unit = 'GPM' THEN
    NEW.flow_requirement_lpm := ROUND((NEW.flow_requirement_value * 3.78541)::numeric, 2);
    NEW.flow_requirement_lpm_unit := 'LPM';
  ELSIF NEW.flow_requirement_value IS NULL THEN
    NEW.flow_requirement_lpm := NULL;
    NEW.flow_requirement_lpm_unit := 'LPM';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate LPM when GPM is inserted or updated
DROP TRIGGER IF EXISTS trigger_calculate_flow_requirement_lpm ON products;
CREATE TRIGGER trigger_calculate_flow_requirement_lpm
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION calculate_flow_requirement_lpm();