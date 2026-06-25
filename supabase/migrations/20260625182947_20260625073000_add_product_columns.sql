-- Migration: Add new columns to products table
-- Safe: Only adds columns, does not remove or modify existing ones

ALTER TABLE products ADD COLUMN IF NOT EXISTS category_type text DEFAULT 'clothing';
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_type ON products(category_type);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;