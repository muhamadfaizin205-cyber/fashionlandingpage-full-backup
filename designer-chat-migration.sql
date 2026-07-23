-- ═══════════════════════════════════════════════════════════
-- DESIGNER CHAT  (fixes: designer messages never sent)
-- Run ONCE in Supabase SQL Editor. Safe to re-run.
--
-- The designer workspace writes to messages with room='designer:<id>',
-- but the table had no `room` column, its sender_type only allowed
-- client/admin, order_email was required, and anon writes were blocked
-- (the client chat goes through /api/messages with the service key).
-- So every designer message failed. This adds exactly what that thread
-- needs, and nothing more.
-- ═══════════════════════════════════════════════════════════

-- 1. Thread key for designer conversations
ALTER TABLE messages ADD COLUMN IF NOT EXISTS room TEXT;
CREATE INDEX IF NOT EXISTS messages_room_idx ON messages (room);

-- 2. Designer messages are internal - they carry no client email.
--    (Client chat filters by order_email, so it can never see them.)
ALTER TABLE messages ALTER COLUMN order_email DROP NOT NULL;

-- 3. Allow 'designer' as a sender. Drops any existing CHECK on
--    sender_type first, whatever it was named.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'messages'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%sender_type%'
  LOOP
    EXECUTE format('ALTER TABLE messages DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE messages
  ADD CONSTRAINT messages_sender_type_chk
  CHECK (sender_type IN ('client','admin','designer'));

-- 4. Let the workspace and admin panel (both anon key) use ONLY the
--    designer threads. Client/admin messages have room NULL, so they
--    stay unreadable to anon exactly as before - this does not widen
--    access to the existing chat.
DROP POLICY IF EXISTS messages_designer_read ON messages;
CREATE POLICY messages_designer_read ON messages
  FOR SELECT TO anon USING (room LIKE 'designer:%');

DROP POLICY IF EXISTS messages_designer_insert ON messages;
CREATE POLICY messages_designer_insert ON messages
  FOR INSERT TO anon WITH CHECK (room LIKE 'designer:%');
