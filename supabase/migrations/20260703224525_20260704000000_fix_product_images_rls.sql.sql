-- Add missing RLS policies for product_images (INSERT, UPDATE, DELETE)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'product_images_insert_authenticated') THEN
    CREATE POLICY "product_images_insert_authenticated" ON product_images FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'product_images_update_authenticated') THEN
    CREATE POLICY "product_images_update_authenticated" ON product_images FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'product_images_delete_authenticated') THEN
    CREATE POLICY "product_images_delete_authenticated" ON product_images FOR DELETE TO authenticated USING (true);
  END IF;
END $$;