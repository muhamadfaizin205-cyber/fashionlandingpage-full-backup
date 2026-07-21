-- ═══════════════════════════════════════════════════════════
-- VISITOR GEO + DEVICE ENRICHMENT  (marketing analytics)
-- Run ONCE in Supabase SQL Editor. Safe to re-run.
--
-- Geo comes from Vercel's built-in edge headers (no third-party API):
--   x-vercel-ip-country / -country-region / -city
-- IP is the caller's forwarded address. These are written server-side
-- by /api/save-order (kind:'geo_enrich') because the browser cannot
-- see its own IP or Vercel's geo headers.
--
-- PRIVACY: enrichment only runs after the visitor accepts analytics in
-- the consent banner. An IP is personal data under GDPR, so it is
-- stored truncated (last octet dropped, e.g. 81.2.69.0) - enough for
-- country/city marketing insight, not enough to single out a person.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE visitor_sessions
  ADD COLUMN IF NOT EXISTS ip TEXT,           -- truncated, see above
  ADD COLUMN IF NOT EXISTS country TEXT,       -- ISO code, e.g. US
  ADD COLUMN IF NOT EXISTS region TEXT,        -- e.g. CA
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS browser TEXT,       -- e.g. Chrome
  ADD COLUMN IF NOT EXISTS os TEXT,            -- e.g. Android 14
  ADD COLUMN IF NOT EXISTS device_model TEXT,  -- e.g. SM-S911B (when UA exposes it)
  ADD COLUMN IF NOT EXISTS consent BOOLEAN NOT NULL DEFAULT false;

-- Country rollups are the main marketing query
CREATE INDEX IF NOT EXISTS visitor_sessions_country_idx ON visitor_sessions (country);
