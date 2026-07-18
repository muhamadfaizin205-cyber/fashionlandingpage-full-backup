-- ═══════════════════════════════════════════════════════════
-- SITE_THEME — homepage visual theme, editable from admin
-- Run ONCE in Supabase SQL Editor.
--
-- Single-row table (id='main'). Stores all theme settings as JSON so
-- new keys can be added without migrations. The homepage subscribes
-- to realtime changes and re-applies CSS variables instantly on save.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS site_theme (
  id TEXT PRIMARY KEY DEFAULT 'main',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_site_theme_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_theme_updated_at ON site_theme;
CREATE TRIGGER site_theme_updated_at
  BEFORE UPDATE ON site_theme
  FOR EACH ROW EXECUTE FUNCTION update_site_theme_timestamp();

-- RLS: public can read (homepage), anon can write (admin panel).
-- Matches the permissive pattern used by gigs / service_cards.
ALTER TABLE site_theme ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_theme_read" ON site_theme;
CREATE POLICY "site_theme_read" ON site_theme FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_theme_all" ON site_theme;
CREATE POLICY "site_theme_all" ON site_theme FOR ALL USING (true) WITH CHECK (true);

-- Realtime so the homepage updates the instant admin saves
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE site_theme;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Seed the single row with an empty settings object (homepage falls
-- back to its built-in defaults for any key not present).
INSERT INTO site_theme (id, settings) VALUES ('main', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
