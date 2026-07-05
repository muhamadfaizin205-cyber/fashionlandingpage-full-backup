-- ═══════════════════════════════════════════════════════════
-- DEAN DESIGNERS — Profile System Migration
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  email TEXT PRIMARY KEY,
  display_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  status TEXT DEFAULT 'available' CHECK (status IN ('available','busy','away','offline')),
  user_type TEXT NOT NULL DEFAULT 'client' CHECK (user_type IN ('client','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies (permissive for anon)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_profiles' AND policyname='profiles_select') THEN
    CREATE POLICY profiles_select ON user_profiles FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_profiles' AND policyname='profiles_insert') THEN
    CREATE POLICY profiles_insert ON user_profiles FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_profiles' AND policyname='profiles_update') THEN
    CREATE POLICY profiles_update ON user_profiles FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- 5. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profile_timestamp ON user_profiles;
CREATE TRIGGER profile_timestamp
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_timestamp();

-- 6. Seed admin profile
INSERT INTO user_profiles (email, display_name, bio, status, user_type)
VALUES ('admin@deandesigners.com', 'Dean Designers', 'Professional Streetwear & Logo Design Studio', 'available', 'admin')
ON CONFLICT (email) DO NOTHING;

