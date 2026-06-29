-- ═══════════════════════════════════════════════════════════
-- DEAN DESIGNERS — Invite System Migration
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Add invite flags to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_invited BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invite_token TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orders_invite_token ON orders(invite_token) WHERE invite_token IS NOT NULL;
