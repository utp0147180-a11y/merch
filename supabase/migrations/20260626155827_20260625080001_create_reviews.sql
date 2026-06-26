-- Migration: Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  product_id integer REFERENCES products(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  images text[] DEFAULT '{}',
  helpful_count integer DEFAULT 0,
  verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "reviews_select" ON product_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviews_insert" ON product_reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reviews_update" ON product_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id::uuid);
CREATE POLICY "reviews_delete" ON product_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id::uuid);

-- Allow public read for reviews
CREATE POLICY "reviews_select_public" ON product_reviews FOR SELECT TO anon USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);