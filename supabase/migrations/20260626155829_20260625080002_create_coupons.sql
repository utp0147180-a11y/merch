-- Migration: Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL,
  min_order_value decimal(10,2) DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "coupons_select" ON coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "coupons_insert" ON coupons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "coupons_update" ON coupons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "coupons_delete" ON coupons FOR DELETE TO authenticated USING (true);

-- Create user_coupons to track usage
CREATE TABLE IF NOT EXISTS user_coupons (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  coupon_id integer REFERENCES coupons(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  used_at timestamptz DEFAULT now(),
  UNIQUE(user_id, coupon_id, order_id)
);

ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_coupons_select" ON user_coupons FOR SELECT TO authenticated USING (auth.uid() = user_id::uuid);
CREATE POLICY "user_coupons_insert" ON user_coupons FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON user_coupons(user_id);