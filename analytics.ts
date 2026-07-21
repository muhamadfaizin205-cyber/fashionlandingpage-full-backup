// ═══════════════════════════════════════════════════════════
// Visitor funnel tracking
// Writes directly to Supabase (anon key) - no extra API route.
// ═══════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zqawpdspxdcmofnmrbku.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTE0MTYsImV4cCI6MjA5NzI2NzQxNn0.vRPaxLCPNPbNnHpsAClr_gr_pCpcbvBbDdAcEGhCT_E";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Session identity ──
// visitor_id : permanent, survives tabs and days (localStorage)
// session_id : rolls over after 30 min of inactivity (industry standard)

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function newId(prefix: string): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getVisitorId(): string {
  try {
    let vid = localStorage.getItem("dd_vid");
    if (!vid) {
      vid = newId("v_");
      localStorage.setItem("dd_vid", vid);
    }
    return vid;
  } catch {
    return "v_anon";
  }
}

function getSessionId(): string {
  try {
    const now = Date.now();
    const sid = localStorage.getItem("dd_sid");
    const last = Number(localStorage.getItem("dd_last") || 0);

    // Same session if the last activity was under 30 minutes ago
    if (sid && last && now - last < SESSION_TIMEOUT) {
      localStorage.setItem("dd_last", String(now));
      return sid;
    }

    // Otherwise start a fresh session
    const fresh = newId("s_");
    localStorage.setItem("dd_sid", fresh);
    localStorage.setItem("dd_last", String(now));
    localStorage.setItem("dd_start", String(now));
    return fresh;
  } catch {
    return "s_anon";
  }
}

function sessionAge(): number {
  try {
    const start = Number(localStorage.getItem("dd_start") || Date.now());
    return Math.max(0, Math.round((Date.now() - start) / 1000));
  } catch {
    return 0;
  }
}

function getDevice(): string {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// Parse browser / OS / phone model from the user-agent. The UA is a
// coarse signal - it gives "Chrome on Android 14", and only some
// phones expose a model code (e.g. SM-S911B). It is NOT a precise
// device fingerprint, and that's fine for marketing rollups.
function parseUA() {
  const ua = navigator.userAgent || "";
  let browser = "Other";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = "Safari";

  let os = "Other";
  let m;
  if ((m = ua.match(/Android[ /]([\d.]+)/))) os = "Android " + m[1];
  else if (/iPhone|iPad|iPod/.test(ua)) { m = ua.match(/OS ([\d_]+)/); os = "iOS" + (m ? " " + m[1].replace(/_/g, ".") : ""); }
  else if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  // Phone model, where the UA carries one (mostly Android)
  let model = "";
  if ((m = ua.match(/;\s*([A-Z]{2}[A-Z0-9-]{3,});?\s*(?:Build|\))/))) model = m[1];
  else if (/iPhone/.test(ua)) model = "iPhone";
  else if (/iPad/.test(ua)) model = "iPad";

  return { browser, os, model };
}

// Consent: enrichment (IP/geo) only runs once the visitor opts in.
export function hasAnalyticsConsent(): boolean {
  try { return localStorage.getItem("dd_consent") === "granted"; } catch { return false; }
}
export function setAnalyticsConsent(granted: boolean) {
  try { localStorage.setItem("dd_consent", granted ? "granted" : "denied"); } catch {}
  if (granted) enrichGeoOnce();
}

// Ask the server (which can see the IP + Vercel geo headers) to stamp
// this session with country/city/device. Runs at most once per session.
let enriched = false;
async function enrichGeoOnce() {
  if (enriched || !hasAnalyticsConsent()) return;
  enriched = true;
  try {
    const { browser, os, model } = parseUA();
    await fetch("/api/save-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "geo_enrich",
        session_id: getSessionId(),
        browser, os, device_model: model,
      }),
    });
  } catch {
    // never break the site over analytics
  }
}


function getUtm(): string {
  try {
    const p = new URLSearchParams(window.location.search);
    return p.get("utm_source") || p.get("fbclid") ? "meta_ads" : (p.get("utm_source") || "");
  } catch {
    return "";
  }
}

let maxStep = 0;
let eventCount = 0;
let initialised = false;

// ── Public API ──
export async function track(event: string, step?: number, meta: Record<string, any> = {}) {
  const sid = getSessionId();
  eventCount++;
  if (step && step > maxStep) maxStep = step;

  const payload = {
    session_id: sid,
    event,
    step: step ?? null,
    meta: { ...meta, visitor_id: getVisitorId() },
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
  if (initialised) return;          // never fire twice in one page load
  initialised = true;

  // If the visitor already accepted analytics on a past visit, enrich now.
  if (hasAnalyticsConsent()) enrichGeoOnce();

  // Only count a page_view once per session, not on every reload
  const sid = getSessionId();
  let alreadySeen = false;
  try {
    alreadySeen = localStorage.getItem("dd_pv") === sid;
    if (!alreadySeen) localStorage.setItem("dd_pv", sid);
  } catch {}

  if (!alreadySeen) {
    track("page_view", 0, { path: window.location.pathname });
  } else {
    // Still touch the session so "on the site right now" stays accurate
    track("return_view", 0, { path: window.location.pathname });
  }

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
