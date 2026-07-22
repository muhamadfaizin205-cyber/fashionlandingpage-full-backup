-- ═══════════════════════════════════════════════════════════
-- DESIGNER WORKSPACE
-- Run ONCE in Supabase SQL Editor. Safe to re-run.
--
-- Lets you assign an order to a contracted designer, who signs in to a
-- SEPARATE workspace (its own URL, neutral branding) and only ever sees
-- the projects assigned to them - never your client's email, the price,
-- or your studio branding.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS designers (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  access_code TEXT NOT NULL UNIQUE,   -- what they type to sign in
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Which designer is working an order (NULL = unassigned / you)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS assigned_designer_id BIGINT REFERENCES designers(id);

CREATE INDEX IF NOT EXISTS orders_designer_idx ON orders (assigned_designer_id);

ALTER TABLE designers ENABLE ROW LEVEL SECURITY;

-- The workspace signs in with the anon key and matches the access code,
-- so anon needs read. Codes are the credential - use long random ones.
DROP POLICY IF EXISTS designers_read ON designers;
CREATE POLICY designers_read ON designers FOR SELECT USING (true);

-- Admin panel (anon key) manages the roster.
DROP POLICY IF EXISTS designers_write ON designers;
CREATE POLICY designers_write ON designers FOR ALL USING (true) WITH CHECK (true);

-- Example (change the code before using!):
-- INSERT INTO designers (name, access_code) VALUES ('Rina', 'RINA-7Q4M-2K9X');
