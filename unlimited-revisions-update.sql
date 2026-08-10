-- ═══════════════════════════════════════════════════════════
-- UNLIMITED REVISIONS ON EVERY PACKAGE TIER
-- Run in Supabase SQL Editor.
--
-- The site reads live package details (price, delivery, revisions)
-- from the `gigs` table when it has active rows - the code-side
-- defaults are only a fallback for when that table is empty. This
-- updates the real, live values so Basic/Standard/Premium all show
-- "Unlimited Revisions" on both the Clothing Design and Logo Design
-- gigs (matches the code change already deployed).
-- ═══════════════════════════════════════════════════════════

UPDATE gigs
SET basic_revisions    = 'Unlimited Revisions',
    standard_revisions = 'Unlimited Revisions',
    premium_revisions  = 'Unlimited Revisions'
WHERE is_active = true;
