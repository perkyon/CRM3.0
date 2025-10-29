-- RLS Policies for Production Tables
-- Enable RLS and create policies for authenticated users

-- Enable RLS on all production tables
ALTER TABLE production_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_item_stages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view production_zones" ON production_zones;
DROP POLICY IF EXISTS "Authenticated users can insert production_zones" ON production_zones;
DROP POLICY IF EXISTS "Authenticated users can update production_zones" ON production_zones;
DROP POLICY IF EXISTS "Authenticated users can delete production_zones" ON production_zones;

DROP POLICY IF EXISTS "Authenticated users can view production_items" ON production_items;
DROP POLICY IF EXISTS "Authenticated users can insert production_items" ON production_items;
DROP POLICY IF EXISTS "Authenticated users can update production_items" ON production_items;
DROP POLICY IF EXISTS "Authenticated users can delete production_items" ON production_items;

DROP POLICY IF EXISTS "Authenticated users can view production_components" ON production_components;
DROP POLICY IF EXISTS "Authenticated users can insert production_components" ON production_components;
DROP POLICY IF EXISTS "Authenticated users can update production_components" ON production_components;
DROP POLICY IF EXISTS "Authenticated users can delete production_components" ON production_components;

DROP POLICY IF EXISTS "Authenticated users can view production_stages" ON production_stages;
DROP POLICY IF EXISTS "Authenticated users can insert production_stages" ON production_stages;
DROP POLICY IF EXISTS "Authenticated users can update production_stages" ON production_stages;
DROP POLICY IF EXISTS "Authenticated users can delete production_stages" ON production_stages;

DROP POLICY IF EXISTS "Authenticated users can view production_item_stages" ON production_item_stages;
DROP POLICY IF EXISTS "Authenticated users can insert production_item_stages" ON production_item_stages;
DROP POLICY IF EXISTS "Authenticated users can update production_item_stages" ON production_item_stages;
DROP POLICY IF EXISTS "Authenticated users can delete production_item_stages" ON production_item_stages;

-- Create policies for production_zones
CREATE POLICY "Authenticated users can view production_zones"
  ON production_zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert production_zones"
  ON production_zones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update production_zones"
  ON production_zones FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete production_zones"
  ON production_zones FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for production_items
CREATE POLICY "Authenticated users can view production_items"
  ON production_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert production_items"
  ON production_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update production_items"
  ON production_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete production_items"
  ON production_items FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for production_components
CREATE POLICY "Authenticated users can view production_components"
  ON production_components FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert production_components"
  ON production_components FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update production_components"
  ON production_components FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete production_components"
  ON production_components FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for production_stages
CREATE POLICY "Authenticated users can view production_stages"
  ON production_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert production_stages"
  ON production_stages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update production_stages"
  ON production_stages FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete production_stages"
  ON production_stages FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for production_item_stages
CREATE POLICY "Authenticated users can view production_item_stages"
  ON production_item_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert production_item_stages"
  ON production_item_stages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update production_item_stages"
  ON production_item_stages FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete production_item_stages"
  ON production_item_stages FOR DELETE
  TO authenticated
  USING (true);


