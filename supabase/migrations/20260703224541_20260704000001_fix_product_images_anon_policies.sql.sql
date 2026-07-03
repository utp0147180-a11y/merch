-- Fix: Add policies for anon/public role on product_images and product_variant_images
-- to match the pattern used by product_variants

-- product_images policies for anon
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'Allow all insert product_images') THEN
    CREATE POLICY "Allow all insert product_images" ON product_images FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'Allow all update product_images') THEN
    CREATE POLICY "Allow all update product_images" ON product_images FOR UPDATE TO anon USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'Allow all delete product_images') THEN
    CREATE POLICY "Allow all delete product_images" ON product_images FOR DELETE TO anon USING (true);
  END IF;
END $$;

-- product_variant_images policies for anon
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variant_images' AND policyname = 'Allow all insert variant_images') THEN
    CREATE POLICY "Allow all insert variant_images" ON product_variant_images FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variant_images' AND policyname = 'Allow all update variant_images') THEN
    CREATE POLICY "Allow all update variant_images" ON product_variant_images FOR UPDATE TO anon USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variant_images' AND policyname = 'Allow all delete variant_images') THEN
    CREATE POLICY "Allow all delete variant_images" ON product_variant_images FOR DELETE TO anon USING (true);
  END IF;
END $$;