-- ═══════════════════════════════════════════════════════════
-- VISITOR ANALYTICS - run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

create table if not exists visitor_events (
  id           bigserial primary key,
  session_id   text        not null,
  event        text        not null,
  step         int,
  meta         jsonb       default '{}'::jsonb,
  referrer     text,
  utm_source   text,
  device       text,
  country      text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_ve_session on visitor_events (session_id);
create index if not exists idx_ve_event   on visitor_events (event);
create index if not exists idx_ve_created on visitor_events (created_at desc);

-- Sessions rollup: one row per visitor session
create table if not exists visitor_sessions (
  session_id     text primary key,
  first_seen     timestamptz not null default now(),
  last_seen      timestamptz not null default now(),
  max_step       int         default 0,
  events_count   int         default 0,
  referrer       text,
  utm_source     text,
  device         text,
  landing_page   text,
  converted      boolean     default false,
  exit_step      int,
  duration_sec   int         default 0
);

create index if not exists idx_vs_last on visitor_sessions (last_seen desc);
create index if not exists idx_vs_conv on visitor_sessions (converted);

-- Allow the site (anon key) to write events, and read for the admin
alter table visitor_events   enable row level security;
alter table visitor_sessions enable row level security;

drop policy if exists "anon insert events" on visitor_events;
create policy "anon insert events" on visitor_events
  for insert to anon with check (true);

drop policy if exists "anon read events" on visitor_events;
create policy "anon read events" on visitor_events
  for select to anon using (true);

drop policy if exists "anon upsert sessions" on visitor_sessions;
create policy "anon upsert sessions" on visitor_sessions
  for insert to anon with check (true);

drop policy if exists "anon update sessions" on visitor_sessions;
create policy "anon update sessions" on visitor_sessions
  for update to anon using (true);

drop policy if exists "anon read sessions" on visitor_sessions;
create policy "anon read sessions" on visitor_sessions
  for select to anon using (true);
