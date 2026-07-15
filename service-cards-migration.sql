-- ═══════════════════════════════════════════════════════════
-- SERVICE_CARDS TABLE — "What we design" cards on the homepage
-- Run this ONCE in Supabase SQL Editor (Dashboard > SQL Editor)
--
-- Also make sure the "uploads" storage bucket exists and is
-- public — it should already be (used by the gigs feature). If
-- for some reason it isn't:
--   Dashboard > Storage > New bucket > name: uploads > public: on
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS service_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content
  slug TEXT UNIQUE NOT NULL,         -- links to /:slug (must match a vercel.json rewrite)
  line1 TEXT NOT NULL DEFAULT '',    -- first line of the title, e.g. "Streetwear"
  line2 TEXT NOT NULL DEFAULT '',    -- second line, e.g. "Design"
  price INTEGER NOT NULL DEFAULT 50, -- shown as "from $X"
  tone TEXT NOT NULL DEFAULT 't-ink',-- background tone class: t-ink | t-plum | t-forest | t-clay | t-teal | t-wine
  img_url TEXT NOT NULL DEFAULT '',  -- public URL (Supabase Storage or /public asset)

  -- Ordering + visibility
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_cards_sort_idx ON service_cards (sort_order, created_at);
CREATE INDEX IF NOT EXISTS service_cards_active_idx ON service_cards (is_active);

-- RLS
ALTER TABLE service_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_cards_public_read" ON service_cards;
CREATE POLICY "service_cards_public_read" ON service_cards
  FOR SELECT USING (is_active = true);

-- Matches the gigs pattern: permissive ALL policy so the admin panel
-- can write via the anon key. Tighten later once real auth is added.
DROP POLICY IF EXISTS "service_cards_service_all" ON service_cards;
CREATE POLICY "service_cards_service_all" ON service_cards
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_service_cards_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_cards_updated_at ON service_cards;
CREATE TRIGGER service_cards_updated_at
  BEFORE UPDATE ON service_cards
  FOR EACH ROW EXECUTE FUNCTION update_service_cards_timestamp();

-- Realtime — required for the homepage to auto-refresh when the admin
-- edits a card. If this is skipped, the homepage will still pick up
-- changes on the next page load, just not instantly.
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE service_cards;
  EXCEPTION WHEN duplicate_object THEN
    NULL;  -- already added, ignore
  END;
END $$;

-- ═══ SEED DATA — the 6 default cards that were previously hardcoded ═══

INSERT INTO service_cards (slug, line1, line2, price, tone, img_url, sort_order, is_active)
VALUES
  ('streetwear-design',     'Streetwear', 'Design',         50,  't-ink',    '/clothing-1.jpg', 10, true),
  ('tshirt-design',         'T-Shirt',    'Design',         50,  't-plum',   '/clothing-2.png', 20, true),
  ('hoodie-design',         'Hoodie',     'Design',         50,  't-forest', '/clothing-3.png', 30, true),
  ('logo-design',           'Logo &',     'Brand Identity', 80,  't-clay',   '/logo-1.png',     40, true),
  ('clothing-brand-design', 'Complete',   'Brand Kit',      200, 't-teal',   '/logo-2.png',     50, true),
  ('merch-design',          'Merch',      'Design',         50,  't-wine',   '/clothing-1.jpg', 60, true)
ON CONFLICT (slug) DO NOTHING;
