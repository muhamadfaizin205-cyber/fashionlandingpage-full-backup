-- ═══════════════════════════════════════════════════════════
-- REVISIONS: Basic stays limited, Standard/Premium unlimited
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).
--
-- The site reads live package details (price, delivery, revisions)
-- from the `gigs` table when it has active rows - the code-side
-- defaults are only a fallback for when that table is empty.
--
-- Sets Standard and Premium to "Unlimited Revisions" on both the
-- Clothing Design and Logo Design gigs, while explicitly restoring
-- Basic to "2 Revisions" (in case the earlier all-tiers update was
-- already run).
-- ═══════════════════════════════════════════════════════════

UPDATE gigs
SET basic_revisions    = '2 Revisions',
    standard_revisions = 'Unlimited Revisions',
    premium_revisions  = 'Unlimited Revisions'
WHERE is_active = true;
