-- ═══════════════════════════════════════════════════════════
-- GIG ORDER QUEUE — "N Orders in Queue" badge (Fiverr-style)
-- Run ONCE in Supabase SQL Editor.
--
-- The public site uses the anon key and MUST NOT be able to read the
-- orders table (it holds customer emails, briefs, prices). So instead
-- of opening up that table, this exposes a single SECURITY DEFINER
-- function that returns ONLY aggregate counts - no row data ever
-- leaves the database.
--
-- "In queue" = work that is actually active:
--   new | working | review | revision
-- Completed / delivered / cancelled orders are excluded.
--
-- orders.service is stored as a label ("Clothing Design",
-- "Logo Brand Design") and older rows use bare values like
-- "clothing", so matching is done with ILIKE on a keyword.
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_gig_queue()
RETURNS TABLE (service_type TEXT, queue_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'logo'::TEXT AS service_type,
         COUNT(*)::BIGINT AS queue_count
  FROM orders
  WHERE status IN ('new','working','review','revision')
    AND service ILIKE '%logo%'
  UNION ALL
  SELECT 'clothing'::TEXT,
         COUNT(*)::BIGINT
  FROM orders
  WHERE status IN ('new','working','review','revision')
    AND service NOT ILIKE '%logo%';
$$;

-- Only the aggregate function is callable by the public site.
REVOKE ALL ON FUNCTION get_gig_queue() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_gig_queue() TO anon, authenticated;
