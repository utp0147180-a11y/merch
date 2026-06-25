-- Add variant_id to order_items (bigint to match product_variants.id)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_id bigint REFERENCES product_variants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);