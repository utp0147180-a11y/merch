-- Migration: Enhance orders for better tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id integer REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount decimal(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery date;

-- Add subcategory to products for clothing filter
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory text;  -- 'Women', 'Men', 'Kids' for clothing