-- ═══════════════════════════════════════════════════════════
-- GIG REVIEWS  (real testimonials the owner enters)
-- Run ONCE in Supabase SQL Editor. Safe to re-run.
--
-- These are meant for REAL reviews - e.g. the ones from your Fiverr
-- profile. Do not enter invented names or testimonials: fake reviews
-- are deceptive and illegal in many places (FTC, EU consumer law).
-- The gig page renders whatever is in this table; if it is empty, the
-- reviews list simply shows nothing.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gig_reviews (
  id           BIGSERIAL PRIMARY KEY,
  author_name  TEXT NOT NULL,
  country      TEXT DEFAULT '',        -- e.g. "United States"
  country_code TEXT DEFAULT '',        -- e.g. "US" (for the flag)
  rating       INT  NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  body         TEXT NOT NULL,
  price_range  TEXT DEFAULT '',        -- optional, e.g. "$100-$200"
  duration     TEXT DEFAULT '',        -- optional, e.g. "3 weeks"
  repeat_client BOOLEAN DEFAULT false,
  seller_response TEXT DEFAULT '',
  reviewed_at  DATE DEFAULT CURRENT_DATE,
  sort_order   INT DEFAULT 0,          -- lower shows first
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gig_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone may read (they show on the public gig page)
DROP POLICY IF EXISTS gig_reviews_read ON gig_reviews;
CREATE POLICY gig_reviews_read ON gig_reviews FOR SELECT USING (true);

-- Anon may write (the admin panel uses the anon key). If you later add
-- real auth, tighten this to authenticated only.
DROP POLICY IF EXISTS gig_reviews_write ON gig_reviews;
CREATE POLICY gig_reviews_write ON gig_reviews FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS gig_reviews_order_idx ON gig_reviews (sort_order, reviewed_at DESC);
