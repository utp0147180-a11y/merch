-- Create product_variant_images table for associating images with specific color variants
-- This allows products to have different images for each color option

CREATE TABLE IF NOT EXISTS product_variant_images (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id bigint NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_color text NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index for quick lookup by product and color
CREATE INDEX IF NOT EXISTS idx_variant_images_product_color 
  ON product_variant_images(product_id, variant_color);

-- Index for sorting
CREATE INDEX IF NOT EXISTS idx_variant_images_sort 
  ON product_variant_images(product_id, variant_color, sort_order);

-- Enable RLS
ALTER TABLE product_variant_images ENABLE ROW LEVEL SECURITY;

-- Public read policy (anyone can view variant images)
CREATE POLICY "variant_images_select_public" 
  ON product_variant_images FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Authenticated insert policy
CREATE POLICY "variant_images_insert_authenticated" 
  ON product_variant_images FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Authenticated update policy
CREATE POLICY "variant_images_update_authenticated" 
  ON product_variant_images FOR UPDATE 
  TO authenticated 
  USING (true);

-- Authenticated delete policy
CREATE POLICY "variant_images_delete_authenticated" 
  ON product_variant_images FOR DELETE 
  TO authenticated 
  USING (true);

-- Update product_images table to add variant_color column for optional direct association
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS variant_color text;

-- Add index for variant_color lookups on product_images
CREATE INDEX IF NOT EXISTS idx_product_images_variant_color 
  ON product_images(product_id, variant_color) 
  WHERE variant_color IS NOT NULL;