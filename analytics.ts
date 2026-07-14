// ═══════════════════════════════════════════════════════════
// Visitor funnel tracking
// Writes directly to Supabase (anon key) - no extra API route.
// ═══════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zqawpdspxdcmofnmrbku.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTE0MTYsImV4cCI6MjA5NzI2NzQxNn0.vRPaxLCPNPbNnHpsAClr_gr_pCpcbvBbDdAcEGhCT_E";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Session identity ──
function getSessionId(): string {
  try {
    let id = sessionStorage.getItem("dd_sid");
    if (!id) {
      id = "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem("dd_sid", id);
      sessionStorage.setItem("dd_start", String(Date.now()));
    }
    return id;
  } catch {
    return "s_anon";
  }
}

function getDevice(): string {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getUtm(): string {
  try {
    const p = new URLSearchParams(window.location.search);
    return p.get("utm_source") || p.get("fbclid") ? "meta_ads" : (p.get("utm_source") || "");
  } catch {
    return "";
  }
}

function sessionAge(): number {
  try {
    const start = Number(sessionStorage.getItem("dd_start") || Date.now());
    return Math.round((Date.now() - start) / 1000);
  } catch {
    return 0;
  }
}

let maxStep = 0;
let eventCount = 0;

// ── Public API ──
export async function track(event: string, step?: number, meta: Record<string, any> = {}) {
  const sid = getSessionId();
  eventCount++;
  if (step && step > maxStep) maxStep = step;

  const payload = {
    session_id: sid,
    event,
    step: step ?? null,
    meta,
    referrer: document.referrer || "direct",
    utm_source: getUtm(),
    device: getDevice(),
  };

  try {
    await sb.from("visitor_events").insert(payload);

    // Keep the session rollup fresh
    await sb.from("visitor_sessions").upsert(
      {
        session_id: sid,
        last_seen: new Date().toISOString(),
        max_step: maxStep,
        events_count: eventCount,
        referrer: document.referrer || "direct",
        utm_source: getUtm(),
        device: getDevice(),
        landing_page: window.location.pathname,
        converted: event === "payment_completed",
        exit_step: maxStep,
        duration_sec: sessionAge(),
      },
      { onConflict: "session_id" }
    );
  } catch {
    // analytics must never break the site
  }
}

// ── Auto-fire on load + on leave ──
export function initAnalytics() {
  if (typeof window === "undefined") return;

  track("page_view", 0, { path: window.location.pathname });

  // Heartbeat: keeps "on the site right now" accurate in the admin panel.
  // Touches the session row every 30s while the tab is visible.
  setInterval(() => {
    if (document.hidden) return;
    try {
      sb.from("visitor_sessions")
        .update({ last_seen: new Date().toISOString(), duration_sec: sessionAge() })
        .eq("session_id", getSessionId())
        .then(() => {});
    } catch {}
  }, 30000);

  // Record the exit point
  const onLeave = () => {
    try {
      const sid = getSessionId();
      const body = JSON.stringify({
        session_id: sid,
        event: "exit",
        step: maxStep,
        meta: { duration_sec: sessionAge() },
        device: getDevice(),
        referrer: document.referrer || "direct",
        utm_source: getUtm(),
      });
      navigator.sendBeacon?.(
        `${SUPABASE_URL}/rest/v1/visitor_events`,
        new Blob([body], { type: "application/json" })
      );
    } catch {}
  };

  window.addEventListener("pagehide", onLeave);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) onLeave();
  });
}
