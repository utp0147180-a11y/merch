-- Migration: Create wishlist table for user favorites
CREATE TABLE IF NOT EXISTS wishlist (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id integer REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "wishlist_select" ON wishlist FOR SELECT TO authenticated USING (auth.uid() = user_id::uuid);
CREATE POLICY "wishlist_insert" ON wishlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id::uuid);
CREATE POLICY "wishlist_delete" ON wishlist FOR DELETE TO authenticated USING (auth.uid() = user_id::uuid);

-- Index
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);