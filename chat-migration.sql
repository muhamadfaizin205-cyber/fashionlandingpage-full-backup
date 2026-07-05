-- ═══════════════════════════════════════════════════════════
-- DEAN DESIGNERS — Chat System Migration
-- Run this in Supabase SQL Editor BEFORE deploying the new code
-- ═══════════════════════════════════════════════════════════

-- 1. Add new columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES messages(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT FALSE;

-- 2. Create user_presence table for online/last-seen tracking
CREATE TABLE IF NOT EXISTS user_presence (
  email TEXT PRIMARY KEY,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  user_type TEXT NOT NULL DEFAULT 'client' CHECK (user_type IN ('client','admin'))
);

-- 3. Enable RLS on user_presence
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for user_presence (permissive for anon, same as other tables)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_presence' AND policyname='presence_select') THEN
    CREATE POLICY presence_select ON user_presence FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_presence' AND policyname='presence_insert') THEN
    CREATE POLICY presence_insert ON user_presence FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_presence' AND policyname='presence_update') THEN
    CREATE POLICY presence_update ON user_presence FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Enable Realtime on user_presence
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- 6. Function to auto-update last_seen on presence change
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS presence_last_seen ON user_presence;
CREATE TRIGGER presence_last_seen
  BEFORE UPDATE ON user_presence
  FOR EACH ROW EXECUTE FUNCTION update_last_seen();

-- ═══════════════════════════════════════════════════════════
-- DONE — Now deploy the new ChatWidget.tsx code
-- ═══════════════════════════════════════════════════════════

