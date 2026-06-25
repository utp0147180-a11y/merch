-- Add missing columns to product_variants
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add missing columns to product_images
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false;
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS alt_text text;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_active ON product_variants(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_images_sort_order ON product_images(product_id, sort_order);

-- Add RLS policies for anon (public read)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'product_variants_select_public') THEN
    CREATE POLICY "product_variants_select_public" ON product_variants FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'product_images_select_public') THEN
    CREATE POLICY "product_images_select_public" ON product_images FOR SELECT TO anon USING (true);
  END IF;
END $$;