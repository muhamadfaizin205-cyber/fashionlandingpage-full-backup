-- ═══════════════════════════════════════════════════════════
-- KANBAN — per-order design progress board
-- Run ONCE in Supabase SQL Editor.
--
-- Two tables:
--   kanban_cards     — the task cards admin creates & drags
--   kanban_feedback  — customer comments / approvals per card
--
-- Storage: customer feedback images go to the existing "uploads"
-- bucket under kanban/  (same bucket used by chat & gigs).
-- ═══════════════════════════════════════════════════════════

-- ─── CARDS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kanban_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,                 -- which order this board belongs to

  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',

  -- Column the card sits in. One of: backlog | todo | progress | done
  column_key TEXT NOT NULL DEFAULT 'backlog',

  -- Priority pill shown on the card: low | medium | high (empty = none)
  priority TEXT NOT NULL DEFAULT '',

  -- Ordering within a column (lower = higher up)
  position INTEGER NOT NULL DEFAULT 0,

  -- Optional image the admin attaches to show progress (a preview render)
  image_url TEXT NOT NULL DEFAULT '',

  -- Customer's approval state on this card, driven by the tracker:
  -- ''(none) | approved | revision
  review_state TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kanban_cards_order_idx ON kanban_cards (order_id, column_key, position);

-- ─── FEEDBACK ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kanban_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL,
  order_id UUID NOT NULL,

  -- Who wrote it: 'customer' | 'admin'
  author TEXT NOT NULL DEFAULT 'customer',

  body TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',

  -- If this feedback row represents an action rather than a plain
  -- comment: '' | approved | revision
  kind TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kanban_feedback_card_idx ON kanban_feedback (card_id, created_at);
CREATE INDEX IF NOT EXISTS kanban_feedback_order_idx ON kanban_feedback (order_id, created_at);

-- ─── updated_at trigger for cards ────────────────────────
CREATE OR REPLACE FUNCTION update_kanban_cards_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kanban_cards_updated_at ON kanban_cards;
CREATE TRIGGER kanban_cards_updated_at
  BEFORE UPDATE ON kanban_cards
  FOR EACH ROW EXECUTE FUNCTION update_kanban_cards_timestamp();

-- ─── RLS ─────────────────────────────────────────────────
-- Matches the permissive pattern used by gigs/service_cards. The
-- anon key can read+write; access is scoped in the app by order_id
-- (the customer only ever loads their own order's board because the
-- tracker already authenticates them by email + fetches their orders).
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kanban_cards_all" ON kanban_cards;
CREATE POLICY "kanban_cards_all" ON kanban_cards
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "kanban_feedback_all" ON kanban_feedback;
CREATE POLICY "kanban_feedback_all" ON kanban_feedback
  FOR ALL USING (true) WITH CHECK (true);

-- ─── Realtime ────────────────────────────────────────────
-- Required so the customer tracker updates the instant the admin
-- drags a card, and the admin sees new feedback instantly.
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE kanban_cards;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE kanban_feedback;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
