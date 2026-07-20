-- ═══════════════════════════════════════════════════════════
-- KANBAN UPGRADE — deadlines + deliverable checklists
-- Run ONCE in Supabase SQL Editor. Safe to re-run.
--
-- Why: the board tracked what work exists but not what is URGENT.
-- For a studio promising 3-7 day delivery, a board that cannot show
-- what is overdue is decorative. These two columns are what turn it
-- into an operational tool.
--
--   due_date   - when this card must be finished
--   checklist  - the deliverables inside one card, e.g. front print,
--                back print, mockup, source files. Stored as JSON:
--                [{"t":"Front design","d":true}, {"t":"Mockup","d":false}]
-- ═══════════════════════════════════════════════════════════

ALTER TABLE kanban_cards
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS checklist JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Boards are queried per order and sorted by urgency, so index the
-- lookup that the board actually performs.
CREATE INDEX IF NOT EXISTS kanban_cards_order_due_idx
  ON kanban_cards (order_id, due_date);
