import React, { useState, useRef, useEffect } from "react";
import "./styles.css";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import emailjs from "@emailjs/browser";
import { createClient } from "@supabase/supabase-js";

// ─── PayPal Client ID ─────────────────────────────────────
const PAYPAL_CLIENT_ID =
  (import.meta.env.VITE_PAYPAL_CLIENT_ID as string) ||
  "AfcPNwHZ0YCT-hTcym1lb_QtzX9NWgrOjX8wT2B6JYm0ssv4gpvtiDe5gOtaLlxMTxXNfPob1Le4Jena";

// ─── Supabase ─────────────────────────────────────────────
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || "https://zqawpdspxdcmofnmrbku.supabase.co";
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_KEY as string) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTE0MTYsImV4cCI6MjA5NzI2NzQxNn0.vRPaxLCPNPbNnHpsAClr_gr_pCpcbvBbDdAcEGhCT_E";
export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// ─── EmailJS Config ───────────────────────────────────────
const EJS_SERVICE  = "service_t2y06pc";
const EJS_TEMPLATE = "template_hy10m0m";
const EJS_KEY      = "nIJZRnASm1Krp8phX";

// ─── Types ────────────────────────────────────────────────
interface FeatureMeta {
  label: string;
  included: boolean;
}

interface Package {
  id: string;
  badge: string;
  name: string;
  basePrice: number;
  desc: string;
  features: string[];
  featuresMeta?: FeatureMeta[];
  delivery: string;
  revisions: string;
  featured: boolean;
}

type Direction = "forward" | "back";
type AiPhase = "idle" | "asking" | "loading" | "done" | "error";

interface WizardState {
  service: "clothing" | "logo" | null;
  brandName: string;
  email: string;
  whatsapp: string;
  instagram: string;
  qty: number;
  brief: string;
  briefImages: string[];
}

// ─── Constants ────────────────────────────────────────────
const GROQ_API_KEY = "isk-GNByYriUHJP1S5uFeNJJI3rW9zBVqvZbiHyRFtIN";
// Dedicated Groq key for the brief generator — fast inference (5-8s) via Groq's LPU hardware
const BRIEF_GROQ_KEY = "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";

// ─── Clothing Design Packages ─────────────────────────────
const PACKAGES: Package[] = [
  {
    id: "basic",
    badge: "BASIC",
    name: "Best for test drop single apparel",
    basePrice: 50,
    desc: "Best for testing one merch or apparel graphic before a bigger drop.",
    features: [
      "Include source file",
      "Printable resolution file",
      "Front Design Only",
    ],
    delivery: "3-day delivery",
    revisions: "2 Revisions",
    featured: false,
  },
  {
    id: "standard",
    badge: "STANDARD",
    name: "Most popular brand starter",
    basePrice: 75,
    desc: "Best value for artist merch, front & back apparel, and brand drops.",
    features: [
      "Include source file",
      "Printable resolution file",
      "Front & back design",
      "Include mockup realistic",
      "Add enhanced detailing",
      "Commercial use",
    ],
    delivery: "3-day delivery",
    revisions: "8 Revisions",
    featured: true,
  },
  {
    id: "premium",
    badge: "PREMIUM",
    name: "Full brand-ready apparel system",
    basePrice: 120,
    desc: "Complete apparel drop system with matching graphics and mockup direction.",
    features: [
      "Include source file",
      "Printable resolution file",
      "Front & back design",
      "Include mockup realistic",
      "Add enhanced detailing",
      "Commercial use",
      "Techpack included",
    ],
    delivery: "5-day delivery",
    revisions: "UNLIMITED Revisions",
    featured: false,
  },
];

// ─── Logo Brand Design Packages (per-concept pricing) ────
const LOGO_PACKAGES: Package[] = [
  {
    id: "basic",
    badge: "BASIC",
    name: "Quick-Start Logo (Guided & Safe)",
    basePrice: 80,
    desc: "Clean, readable logo concept based on your brief. Safe for testing your brand.",
    features: ["Logo transparency", "Vector file", "Printable file"],
    featuresMeta: [
      { label: "Logo transparency", included: true },
      { label: "Vector file", included: true },
      { label: "Printable file", included: true },
      { label: "Include 3D mockup", included: false },
      { label: "Include source file", included: false },
      { label: "Include social media kit", included: false },
    ],
    delivery: "5-day delivery",
    revisions: "2 Revisions",
    featured: false,
  },
  {
    id: "standard",
    badge: "STANDARD",
    name: "Popular-Ready for Brand Owner",
    basePrice: 150,
    desc: "Refined logo concepts with color and black versions, ready for real branding use.",
    features: ["Logo transparency", "Vector file", "Printable file", "Include 3D mockup", "Include source file"],
    featuresMeta: [
      { label: "Logo transparency", included: true },
      { label: "Vector file", included: true },
      { label: "Printable file", included: true },
      { label: "Include 3D mockup", included: true },
      { label: "Include source file", included: true },
      { label: "Include social media kit", included: false },
    ],
    delivery: "7-day delivery",
    revisions: "3 Revisions",
    featured: true,
  },
  {
    id: "premium",
    badge: "PREMIUM",
    name: "Ultimate Pack: Long Term Branding",
    basePrice: 200,
    desc: "Logo versions (main, alt, icon) with full files for long-term branding needs.",
    features: ["Logo transparency", "Vector file", "Printable file", "Include 3D mockup", "Include source file", "Include social media kit"],
    featuresMeta: [
      { label: "Logo transparency", included: true },
      { label: "Vector file", included: true },
      { label: "Printable file", included: true },
      { label: "Include 3D mockup", included: true },
      { label: "Include source file", included: true },
      { label: "Include social media kit", included: true },
    ],
    delivery: "7-day delivery",
    revisions: "3 Revisions",
    featured: false,
  },
];

const FEATURES = [
  "CLOTHING DESIGN",
  "BRAND IDENTITY",
  "SOURCE FILES",
  "FAST DELIVERY",
];
const WA_NUMBER = "6282221994691";
const TOTAL_STEPS = 6;

// ─── Dynamic Package Loading (DB → fallback hardcoded) ───
function useDbPackages() {
  const [clothingPkgs, setClothingPkgs] = useState<Package[]>(PACKAGES);
  const [logoPkgs, setLogoPkgs] = useState<Package[]>(LOGO_PACKAGES);

  const loadPackages = () => {
    if (!supabase) return;
    supabase
      .from("packages")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return; // keep hardcoded
        const mapPkg = (row: any): Package => ({
          id: row.id,
          badge: row.badge,
          name: row.name,
          basePrice: Number(row.base_price),
          desc: row.description || "",
          features: row.features || [],
          delivery: row.delivery || "",
          revisions: row.revisions || "",
          featured: row.featured || false,
        });
        const clothing = data.filter((r: any) => r.service === "clothing").map(mapPkg);
        const logo = data.filter((r: any) => r.service === "logo").map(mapPkg);
        if (clothing.length > 0) setClothingPkgs(clothing);
        if (logo.length > 0) setLogoPkgs(logo);
      });
  };

  useEffect(() => {
    loadPackages();
    if (!supabase) return;
    // Realtime: re-fetch instantly whenever packages table changes (price update from admin)
    const channel = supabase
      .channel("packages-realtime-" + Date.now())
      .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, () => {
        loadPackages();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { clothingPkgs, logoPkgs };
}

// ─── Background Music ─────────────────────────────────────
// Hidden YouTube player. Browsers block autoplay-with-sound, so we
// autoplay MUTED (allowed) and unmute on the first user interaction
// (click / scroll / key / touch anywhere). Loops forever.
const BG_MUSIC_VIDEO_ID = "YhUqxWR4mnE";
const BG_MUSIC_VOLUME = 35; // 0–100

function useBackgroundMusic(videoId: string, volume: number) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let player: any = null;
    let unmuted = false;
    let destroyed = false;
    let retryTimer: any = null;
    const evts = ["click", "pointerdown", "keydown", "touchstart", "scroll", "wheel", "mousemove"];

    const playerDiv = document.createElement("div");
    container.innerHTML = "";
    container.appendChild(playerDiv);

    // Attempt to unmute & play with sound on any user gesture
    const tryUnmute = () => {
      if (unmuted || destroyed || !player) return;
      try {
        const state = player.getPlayerState?.();
        // If not playing, try to play first
        if (state !== 1) player.playVideo();
        player.unMute();
        player.setVolume(volume);
        // Verify it actually unmuted after a tick
        setTimeout(() => {
          try {
            if (!player.isMuted?.()) {
              unmuted = true;
              evts.forEach((e) => window.removeEventListener(e, tryUnmute));
            }
          } catch {}
        }, 100);
      } catch {}
    };

    // Periodically retry playing if the player stalls (some browsers pause hidden tabs)
    const startRetry = () => {
      retryTimer = setInterval(() => {
        if (destroyed || !player) return;
        try {
          const state = player.getPlayerState?.();
          // -1 = unstarted, 0 = ended, 2 = paused, 5 = cued
          if (state === -1 || state === 0 || state === 2 || state === 5) {
            player.playVideo();
          }
        } catch {}
      }, 3000);
    };

    const initPlayer = () => {
      if (destroyed) return;
      const YT = (window as any).YT;
      if (!YT?.Player) return;

      try {
        player = new YT.Player(playerDiv, {
          videoId,
          width: 200,
          height: 200,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            loop: 1,
            playlist: videoId,
            playsinline: 1,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (e: any) => {
              if (destroyed) return;
              e.target.playVideo();
              startRetry();
              // Listen for ANY user gesture to unmute
              evts.forEach((ev) =>
                window.addEventListener(ev, tryUnmute, { passive: true })
              );
            },
            onStateChange: (e: any) => {
              if (destroyed) return;
              // Loop: replay when ended
              if (e.data === YT.PlayerState.ENDED) {
                e.target.playVideo();
              }
              // If playing and not yet unmuted, try on next gesture
              if (e.data === YT.PlayerState.PLAYING && !unmuted) {
                tryUnmute();
              }
            },
            onError: () => {
              // Retry init after error
              if (!destroyed) setTimeout(initPlayer, 5000);
            },
          },
        });
      } catch {}
    };

    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      const prev = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        initPlayer();
      };
      if (!document.getElementById("yt-api-script")) {
        const s = document.createElement("script");
        s.id = "yt-api-script";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    return () => {
      destroyed = true;
      if (retryTimer) clearInterval(retryTimer);
      evts.forEach((e) => window.removeEventListener(e, tryUnmute));
      try { player?.destroy?.(); } catch {}
    };
  }, [videoId, volume]);

  return containerRef;
}

// ─── Testimonials — auto-scrolling carousel ─────────────────
interface Review {
  text: string;
  name: string;
  cc: string;      // ISO 3166 lowercase for flag image
  avatar: number;  // 1-70 for pravatar.cc
  minsAgo: number;
  stars: number;   // 4 or 5 — mix for realism
}

const REVIEWS: Review[] = [
  { text: "Dean absolutely killed it with our streetwear drop. The graphics were edgy, clean, and production-ready. We launched the next week.", name: "Marcus Thompson", cc: "us", avatar: 11, minsAgo: 3, stars: 5 },
  { text: "Very professional communication. The logo concepts exceeded all expectations. He understood exactly what our clothing line needed.", name: "Sophie Laurent", cc: "gb", avatar: 32, minsAgo: 17, stars: 5 },
  { text: "Ordered a full brand identity package. Files were organized, print-ready, and delivered ahead of schedule. Rare quality.", name: "Kenji Arakawa", cc: "jp", avatar: 52, minsAgo: 42, stars: 5 },
  { text: "This was my third order with Dean and he never disappoints. The hoodie graphic was exactly what I envisioned for my brand.", name: "Tyler Jenkins", cc: "us", avatar: 14, minsAgo: 68, stars: 4 },
  { text: "Fast turnaround, great eye for streetwear trends. The mockups helped me visualize everything before printing. 10/10.", name: "Anya Petrova", cc: "de", avatar: 26, minsAgo: 95, stars: 5 },
  { text: "Dean created three logo options and all were fantastic. I had trouble choosing because every concept was so strong.", name: "James O\'Brien", cc: "ie", avatar: 53, minsAgo: 140, stars: 5 },
  { text: "Excellent designer for anyone starting a clothing brand. He thinks about how the design works on actual garments, not just on screen.", name: "Priya Sharma", cc: "in", avatar: 28, minsAgo: 180, stars: 5 },
  { text: "Got my full brand package \u2014 logo, tag design, and three tee graphics. Everything was cohesive and on-brand. Very impressed.", name: "Liam Walker", cc: "au", avatar: 55, minsAgo: 210, stars: 4 },
  { text: "The attention to detail in the vector files was outstanding. Every curve, every line was intentional. Professional-grade output.", name: "Fatima Al-Rashid", cc: "ae", avatar: 29, minsAgo: 360, stars: 5 },
  { text: "I\'ve tried many designers on Fiverr. Dean is the only one who truly understands streetwear culture and translates it into design.", name: "Darius Monroe", cc: "us", avatar: 15, minsAgo: 420, stars: 5 },
  { text: "Ordered a single concept to test and was so impressed I immediately upgraded to the premium package. Worth every penny.", name: "Emma Johansson", cc: "se", avatar: 31, minsAgo: 480, stars: 5 },
  { text: "Dean delivered my clothing label design 2 days early. The quality was incredible. Print shop said the files were perfect.", name: "Carlos Mendez", cc: "mx", avatar: 56, minsAgo: 600, stars: 4 },
  { text: "Second time working with Dean. First was a logo, now a full apparel collection. Consistency and creativity on another level.", name: "Rachel Kim", cc: "kr", avatar: 33, minsAgo: 840, stars: 5 },
  { text: "The AI brief feature was surprisingly useful. Dean took that concept and elevated it beyond what I imagined. So talented.", name: "Oliver Hart", cc: "gb", avatar: 57, minsAgo: 960, stars: 5 },
  { text: "Our brand needed a refresh and Dean delivered a complete new direction. Modern, bold, and perfectly suited for Gen Z audience.", name: "Isabella Costa", cc: "br", avatar: 34, minsAgo: 1200, stars: 5 },
  { text: "Responsive, creative, and super easy to work with. The revision process was smooth and he nailed it by round two.", name: "Nathan Williams", cc: "ca", avatar: 16, minsAgo: 1440, stars: 4 },
  { text: "The streetwear graphic Dean made for us went viral on our Instagram. Over 50k likes. The design speaks for itself.", name: "Zara Ahmed", cc: "pk", avatar: 36, minsAgo: 1600, stars: 5 },
  { text: "I\'ve been selling merch for 5 years and this is the best designer I\'ve ever worked with. Clean lines, bold concepts, fast delivery.", name: "Brandon Lee", cc: "sg", avatar: 58, minsAgo: 1800, stars: 5 },
  { text: "Dean understood our Japanese streetwear aesthetic immediately. The typography choices were perfect for our Harajuku-inspired brand.", name: "Yuki Tanaka", cc: "jp", avatar: 59, minsAgo: 2100, stars: 5 },
  { text: "Got matching designs for hoodie front and back. The color separation files were production-ready. Saved us so much time.", name: "Michael Brown", cc: "us", avatar: 17, minsAgo: 2400, stars: 5 },
]


const ROW_A = REVIEWS.filter((_, i) => i % 2 === 0);
const ROW_B = REVIEWS.filter((_, i) => i % 2 === 1);

function relativeTime(minsAgo: number): string {
  if (minsAgo < 60) return minsAgo + " minutes ago";
  const hours = Math.floor(minsAgo / 60);
  if (hours < 24) return hours + " hours ago";
  const days = Math.floor(hours / 24);
  return days + " days ago";
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <div className="rv-card">
      <div className="rv-stars">
        <span className="rv-star-filled">{"★".repeat(r.stars)}</span>
        {r.stars < 5 && <span className="rv-star-empty">{"☆".repeat(5 - r.stars)}</span>}
      </div>
      <p className="rv-text">{r.text}</p>
      <div className="rv-footer">
        <img
          className="rv-avatar"
          src={`https://i.pravatar.cc/80?img=${r.avatar}`}
          alt={r.name}
          loading="lazy"
          decoding="async"
          width="36"
          height="36"
        />
        <div className="rv-info">
          <span className="rv-name">
            <img
              className="rv-flag"
              src={`https://flagcdn.com/w40/${r.cc}.png`}
              alt={r.cc}
              loading="lazy"
              decoding="async"
              width="16"
              height="12"
            />
            {r.name}
          </span>
          <span className="rv-meta">{relativeTime(r.minsAgo)}</span>
        </div>
      </div>
    </div>
  );
}

// Mount children only when scrolled near viewport (defers heavy images)
function LazyMount({ children, minHeight }: { children: React.ReactNode; minHeight: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShow(true);
          obs.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [show]);
  return <div ref={ref} style={{ minHeight: show ? undefined : minHeight }}>{show ? children : null}</div>;
}

function Testimonials() {
  return (
    <section className="testimonials s2">
      <div className="testimonials-head">
        <div className="testimonials-eyebrow">Client Reviews</div>
        <h2 className="testimonials-title">
          Trusted by <span>Brands Worldwide</span>
        </h2>
        <p className="testimonials-sub">
          Real feedback from clients on Fiverr. 7+ years, 1,000+ happy brands.
        </p>
      </div>
      <LazyMount minHeight={420}>
        {/* Row A → scrolls left */}
        <div className="rv-marquee rv-left">
          <div className="rv-track">
            {[...ROW_A, ...ROW_A].map((r, i) => (
              <ReviewCard key={`a${i}`} r={r} />
            ))}
          </div>
        </div>
        {/* Row B → scrolls right */}
        <div className="rv-marquee rv-right">
          <div className="rv-track">
            {[...ROW_B, ...ROW_B].map((r, i) => (
              <ReviewCard key={`b${i}`} r={r} />
            ))}
          </div>
        </div>
      </LazyMount>
    </section>
  );
}

// ─── WhatsApp Icon ─────────────────────────────────────────

// Shared pricing helper: logo gets $10/concept off + 5% for 2+ concepts
function calcPrice(pkg: Package, state: WizardState): { raw: number; final: number; discount: number; pct: number } {
  const raw = pkg.basePrice * state.qty;
  const isLogo = state.service === "logo";
  if (!isLogo) return { raw, final: raw, discount: 0, pct: 0 };
  const flatOff = 10 * state.qty;
  const volumeOff = state.qty >= 2 ? Math.round(raw * 0.05) : 0;
  const totalDiscount = flatOff + volumeOff;
  const canDiscount = totalDiscount < raw;
  const discount = canDiscount ? totalDiscount : 0;
  const pct = canDiscount ? Math.round((discount / raw) * 100) : 0;
  return { raw, final: raw - discount, discount, pct };
}

function WaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="15"
      height="15"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────
function buildWAMessage(
  pkg: Package,
  state: WizardState,
  finalPrice: number,
  discount: number
): string {
  const svcLabel =
    state.service === "clothing" ? "Clothing Design" : "Logo Brand Design";
  const briefText = state.brief.trim() || "(Brief not filled)";
  const rawTotal = pkg.basePrice * state.qty;
  const priceLine = discount > 0
    ? `💰 Total Price: US$${rawTotal} − $${discount} discount = US$${finalPrice}`
    : `💰 Total Price: US$${pkg.basePrice} × ${state.qty} concept(s) = US$${finalPrice}`;
  const contactLines = [
    state.whatsapp ? `📱 WhatsApp: ${state.whatsapp}` : "",
    state.instagram ? `📷 Instagram: ${state.instagram}` : "",
  ].filter(Boolean).join("\n");
  return [
    "Hello DEAN DESIGNERS! 👋",
    "",
    "I'd like to place a design order:",
    "",
    `🎨 Service: ${svcLabel}`,
    `🏷️ Brand Name: ${state.brandName}`,
    `📧 Email: ${state.email}`,
    contactLines,
    `📦 Package: ${pkg.badge} — ${pkg.name}`,
    `💡 Concepts: ${state.qty} Concept(s)`,
    `⏱️ Delivery: ${pkg.delivery}`,
    `🔄 Revisions: ${pkg.revisions}`,
    priceLine,
    "",
    "📝 Design Brief:",
    briefText,
    "",
    "─────────────────────",
    "💳 PAYMENT INFO",
    "─────────────────────",
    "✅ Payment completed via PayPal",
    `Amount paid: US$${finalPrice}`,
    "",
    "Please confirm, thank you!",
  ].join("\n");
}

function openWA(pkg: Package, state: WizardState): void {
  const { final: finalPrice, discount } = calcPrice(pkg, state);
  const msg = buildWAMessage(pkg, state, finalPrice, discount);
  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

// ─── Progress Bar ──────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="progress-bar">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const n = i + 1;
        const isDone = n < step;
        const isActive = n === step;
        const cls = isDone ? "done" : isActive ? "active" : "pending";
        return (
          <React.Fragment key={n}>
            {i > 0 && (
              <div className="progress-track">
                <div
                  className="progress-track-fill"
                  style={{ width: n <= step ? "100%" : "0%" }}
                />
              </div>
            )}
            <div className={`progress-dot ${cls}`}>{isDone ? "✓" : n}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1 ────────────────────────────────────────────────
// Rotating background slideshow for service cards (changes every 2s)
const CLOTHING_SLIDES = [
  "/clothing%20slide%201.jpg",
  "/clothing%20slide%202.png",
  "/clothing%20slide%203.png",
];
const LOGO_SLIDES = [
  "/logo%20slide%201.png",
  "/logo%20slide%202.png",
];

function CardSlideshow({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, 2000);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <div className="svc-slides" aria-hidden="true">
      {images.map((src, i) => (
        <div
          key={src}
          className={`svc-slide ${i === idx ? "active" : ""}`}
          style={{ backgroundImage: `url("${src}")` }}
        />
      ))}
      <div className="svc-slide-overlay" />
    </div>
  );
}

function Step1({
  service,
  onSelect,
}: {
  service: WizardState["service"];
  onSelect: (s: "clothing" | "logo") => void;
}) {
  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 1 / 6</div>
        <h2 className="step-question">
          Choose Your <span>Service</span>
        </h2>
        <p className="step-hint">Select one to get started</p>
      </div>
      <div className="service-grid">
        <div
          className={`service-card has-bg ${service === "clothing" ? "active" : ""}`}
          onClick={() => onSelect("clothing")}
        >
          <CardSlideshow images={CLOTHING_SLIDES} />
          <div className="svc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
              <path d="M6.5 2L2 6.5l3 1.5V20a1 1 0 001 1h12a1 1 0 001-1V8l3-1.5L17.5 2h-3.25a2.25 2.25 0 01-4.5 0H6.5z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="svc-body">
            <div className="service-name">Clothing Design</div>
            <div className="service-sub">
              T-shirts, jackets, hoodies &amp; apparel design
            </div>
          </div>
          <div className="svc-arrow">{service === "clothing" ? "✓" : "→"}</div>
        </div>
        <div
          className={`service-card has-bg ${service === "logo" ? "active" : ""}`}
          onClick={() => onSelect("logo")}
        >
          <CardSlideshow images={LOGO_SLIDES} />
          <div className="svc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="svc-body">
            <div className="service-name">Logo Brand Design</div>
            <div className="service-sub">Professional brand visual identity</div>
          </div>
          <div className="svc-arrow">{service === "logo" ? "✓" : "→"}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ────────────────────────────────────────────────
function Step2({
  brandName,
  email,
  whatsapp,
  instagram,
  onChangeBrand,
  onChangeEmail,
  onChangeWA,
  onChangeIG,
  onNext,
  onBack,
}: {
  brandName: string;
  email: string;
  whatsapp: string;
  instagram: string;
  onChangeBrand: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeWA: (v: string) => void;
  onChangeIG: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 2 / 6</div>
        <h2 className="step-question">
          Tell Us About <span>You</span>
        </h2>
        <p className="step-hint">We'll use this info to deliver your order.</p>
      </div>

      {/* Brand Name + Email: side by side on desktop */}
      <div className="step2-form-grid">
        <div>
          <label className="field-label">Brand Name</label>
          <input
            className="step-input"
            type="text"
            placeholder="e.g. KINARA, VORTEX, ASPHALT..."
            value={brandName}
            onChange={(e) => onChangeBrand(e.target.value)}
            maxLength={60}
            autoFocus
          />
        </div>
        <div>
          <label className="field-label">Email (for file delivery)</label>
          <input
            className="step-input"
            type="email"
            placeholder="e.g. hello@yourbrand.com"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            maxLength={100}
          />
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <span className="contact-section-label">Contact Information</span>
        <p className="contact-tip">💡 We recommend filling in both to ensure smooth communication with your designer.</p>

        <div className="contact-fields">
          <div className="contact-field-group">
            <label className="contact-field-label">
              <svg viewBox="0 0 24 24" fill="#25D366" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp
            </label>
            <input
              className="step-input"
              type="text"
              placeholder="e.g. +1 234 567 8900"
              value={whatsapp}
              onChange={(e) => onChangeWA(e.target.value)}
              maxLength={30}
            />
          </div>
          <div className="contact-field-group">
            <label className="contact-field-label">
              <svg viewBox="0 0 24 24" fill="#E4405F" width="14" height="14"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </label>
            <input
              className="step-input"
              type="text"
              placeholder="e.g. @yourbrand"
              value={instagram}
              onChange={(e) => onChangeIG(e.target.value)}
              maxLength={40}
            />
          </div>
        </div>
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <button className="btn-next" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 3 ────────────────────────────────────────────────
function Step3({
  qty,
  onChange,
  onNext,
  onBack,
}: {
  qty: number;
  onChange: (q: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [inputVal, setInputVal] = useState<string>(String(qty));
  const clamp = (n: number) => Math.min(10, Math.max(1, n));

  const dec = () => {
    const next = clamp(qty - 1);
    onChange(next);
    setInputVal(String(next));
  };
  const inc = () => {
    const next = clamp(qty + 1);
    onChange(next);
    setInputVal(String(next));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputVal(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(clamp(n));
  };

  const handleBlur = () => {
    const n = parseInt(inputVal, 10);
    const clamped = isNaN(n) ? 1 : clamp(n);
    onChange(clamped);
    setInputVal(String(clamped));
  };

  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 3 / 6</div>
        <h2 className="step-question">
          How Many <span>Concepts</span> Do You Want?
        </h2>
        <p className="step-hint">
          Type a number or use the + / − buttons (max. 10)
        </p>
      </div>
      <div className="qty-counter-wrap">
        <button className="qty-btn" onClick={dec} disabled={qty <= 1}>
          −
        </button>
        <div className="qty-display">
          <input
            className="qty-input"
            type="number"
            min={1}
            max={10}
            value={inputVal}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          <span className="qty-label">Design Concepts</span>
        </div>
        <button className="qty-btn" onClick={inc} disabled={qty >= 10}>
          +
        </button>
      </div>
      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-next" onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 ────────────────────────────────────────────────
function Step4({
  brief,
  onChange,
  onNext,
  onBack,
  wizardService,
  wizardBrand,
  briefImages,
  onImagesChange,
}: {
  brief: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  wizardService: "clothing" | "logo" | null;
  wizardBrand: string;
  briefImages: string[];
  onImagesChange: (imgs: string[]) => void;
}) {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [phase, setPhase] = useState<AiPhase>("idle");
  const [uploading, setUploading] = useState(false);
  const [answers, setAnswers] = useState({
    concept: "",
    colors: "",
    references: "",
  });
  const [aiError, setAiError] = useState("");

  const svcLabel =
    wizardService === "clothing" ? "Clothing Design" : "Logo Brand Design";

  const handleGenerate = async () => {
    setPhase("loading");
    setAiError("");
    const userContext = [
      `Brand name: ${wizardBrand || "not specified"}`,
      `Service type: ${svcLabel}`,
      `Design concept/theme: ${answers.concept || "-"}`,
      `Color references: ${answers.colors || "-"}`,
      `Brand/design references: ${answers.references || "-"}`,
    ].join("\n");
    const prompt = `You are an elite creative director writing a comprehensive design brief for a top-tier graphic designer. Based on the client's input below, produce a highly detailed, professional, and production-ready brief.

CLIENT INPUT:
${userContext}

CRITICAL FORMATTING RULES:
- Write in plain natural human language. NO asterisks (*), NO markdown, NO bold formatting, NO bullet symbols.
- Use section headers like "PROJECT OVERVIEW", "DESIGN DIRECTION" etc. on their own line followed by a colon.
- Write in flowing paragraphs, like a professional document — not a list.
- Do NOT use dashes as bullet points. Write full sentences.

STRUCTURE:

PROJECT OVERVIEW:
Summarize the project scope, brand identity, and target audience in 2-3 natural sentences.

DESIGN DIRECTION:
Describe the visual style, mood, and aesthetic in detail. Reference specific design movements, visual metaphors, or cultural influences. Be specific about typography feel, layout approach, and overall visual weight.

COLOR PALETTE:
Define the primary and secondary color direction. Expand on complementary tones, contrast strategy, and how colors should evoke the brand mood.

REFERENCES AND INSPIRATION:
Expand on the client's references. Describe what elements to draw from each reference. If no references given, suggest relevant visual references from the streetwear and brand design world.

TECHNICAL REQUIREMENTS:
Describe expected deliverables, file formats, resolution requirements, and any print-specific or digital-specific notes in full sentences.

DOS AND DONTS:
Write 3-4 specific guidelines to direct the designer, in full sentence form. No bullet points.

Write at least 400 words. Be specific, opinionated, and actionable. Every sentence should give the designer clear direction. Do not use placeholder language.`;

    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${BRIEF_GROQ_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2000,
            temperature: 0.7,
          }),
        }
      );
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content ?? "";
      if (!text) {
        const errMsg = data?.error?.message ?? "Empty response from AI";
        throw new Error(errMsg);
      }
      onChange(text.trim());
      setPhase("done");
    } catch (err: any) {
      setAiError(err?.message ?? "Failed to connect to AI.");
      setPhase("error");
    }
  };

  const switchToManual = () => {
    setMode("manual");
    setPhase("idle");
  };
  const switchToAi = () => {
    setMode("ai");
    if (phase === "idle" || phase === "error") setPhase("asking");
  };
  const handleRedo = () => {
    setPhase("asking");
    onChange("");
  };

  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 4 / 6</div>
        <h2 className="step-question">
          Describe Your Vision <span>for the Designer</span>
        </h2>
      </div>

      <div className="brief-mode-tabs">
        <button
          className={`brief-tab ${mode === "manual" ? "active-tab" : ""}`}
          onClick={switchToManual}
        >
          ✏️ Write Your Brief
        </button>
        <button
          className={`brief-tab ${mode === "ai" ? "active-tab" : ""}`}
          onClick={switchToAi}
        >
          ✨ AI-Assisted Brief
        </button>
      </div>

      {mode === "ai" && (
        <div className="ai-panel">
          {phase === "asking" || phase === "loading" ? (
            <>
              <div className="ai-field">
                <label className="ai-label">Your design concept or theme</label>
                <input
                  className="step-input"
                  placeholder="e.g. minimalist bold, modern streetwear..."
                  value={answers.concept}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, concept: e.target.value }))
                  }
                  disabled={phase === "loading"}
                />
              </div>
              <div className="ai-field">
                <label className="ai-label">Color references</label>
                <input
                  className="step-input"
                  placeholder="e.g. black & cream, navy & gold..."
                  value={answers.colors}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, colors: e.target.value }))
                  }
                  disabled={phase === "loading"}
                />
              </div>
              <div className="ai-field">
                <label className="ai-label">
                  Brand / design references you like
                </label>
                <input
                  className="step-input"
                  placeholder="e.g. Supreme, Off-White, Palace..."
                  value={answers.references}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, references: e.target.value }))
                  }
                  disabled={phase === "loading"}
                />
              </div>
              <button
                className="btn-ai-generate"
                onClick={handleGenerate}
                disabled={phase === "loading"}
              >
                {phase === "loading" ? (
                  <>
                    <span className="ai-spinner" /> Generating brief...
                  </>
                ) : (
                  <>✨ Generate Brief Now</>
                )}
              </button>
            </>
          ) : phase === "done" ? (
            <div className="ai-success-note">
              Brief successfully generated! You can edit it below.
              <button className="ai-redo" onClick={handleRedo}>
                ↩ Regenerate
              </button>
            </div>
          ) : phase === "error" ? (
            <div className="ai-error-note">{aiError}</div>
          ) : null}
        </div>
      )}

      {(mode === "manual" || phase === "done" || phase === "error") && (
        <>
          <textarea
            className="brief-ta"
            placeholder={`e.g. "KINARA" is a local streetwear brand targeting young adults aged 18-25. Bold minimalist concept with modern cultural touches...`}
            value={brief}
            onChange={(e) => onChange(e.target.value)}
            maxLength={10000}
          />
          <div className="brief-count">{brief.length} / 10,000 characters</div>
        </>
      )}

      {/* ── Reference Images Upload ── */}
      <div className="ref-upload-section">
        <label className="ref-upload-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Attach Reference Images <span className="ref-optional">(optional)</span>
        </label>
        <p className="ref-hint">Upload design references, mood boards, or inspiration images to help your designer understand your vision.</p>
        
        {briefImages.length > 0 && (
          <div className="ref-preview-grid">
            {briefImages.map((url, idx) => (
              <div key={idx} className="ref-preview-item">
                <img src={url} alt={`Reference ${idx + 1}`} />
                <button className="ref-remove" onClick={() => {
                  onImagesChange(briefImages.filter((_, i) => i !== idx));
                }}>×</button>
              </div>
            ))}
          </div>
        )}
        
        {briefImages.length < 5 && (
          <label className="ref-upload-btn">
            <input
              type="file"
              accept="image/*,.pdf,.ai,.psd,.zip,.rar,.svg,.eps"
              multiple
              style={{ display: "none" }}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                if (!supabase) {
                  alert("Upload service is not available right now. Please try again later.");
                  return;
                }
                setUploading(true);
                const newUrls: string[] = [];
                let failCount = 0;
                for (const file of files.slice(0, 5 - briefImages.length)) {
                  const ext = file.name.split('.').pop() || 'jpg';
                  const path = `brief/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                  const { error } = await supabase.storage.from('uploads').upload(path, file);
                  if (!error) {
                    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
                    if (data?.publicUrl) newUrls.push(data.publicUrl);
                  } else {
                    failCount++;
                    console.error("Brief image upload error:", error);
                  }
                }
                if (newUrls.length) onImagesChange([...briefImages, ...newUrls]);
                if (failCount > 0) alert(`${failCount} image(s) failed to upload. Please try again.`);
                setUploading(false);
                e.target.value = '';
              }}
            />
            {uploading ? (
              <><span className="ai-spinner" /> Uploading...</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload Images ({briefImages.length}/5)
              </>
            )}
          </label>
        )}
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-next" onClick={onNext}>
          View Pricing →
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Choose Package ────────────────────────────────
function Step5({
  state,
  onBack,
  onSelectPkg,
  clothingPkgs,
  logoPkgs,
}: {
  state: WizardState;
  onBack: () => void;
  onSelectPkg: (pkg: Package) => void;
  clothingPkgs: Package[];
  logoPkgs: Package[];
}) {
  const isLogo = state.service === "logo";
  const svcLabel = isLogo ? "Logo Brand Design" : "Clothing Design";
  const activePkgs = isLogo ? logoPkgs : clothingPkgs;

  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 5 / 6</div>
        <h2 className="step-question">
          Choose Your <span>Package</span>
        </h2>
        <p className="step-hint">Tap a package to continue to order confirmation.</p>
      </div>

      <div className="summary-box">
        <div className="summary-item">
          <div className="summary-lbl">Service</div>
          <div className="summary-val">{svcLabel}</div>
        </div>
        <div className="summary-item">
          <div className="summary-lbl">Brand Name</div>
          <div className="summary-val">{state.brandName}</div>
        </div>
        <div className="summary-item">
          <div className="summary-lbl">Concepts</div>
          <div className="summary-val">{state.qty} Concept(s)</div>
        </div>
      </div>

      <p className="pkg-note">
        All packages below reflect your custom selection of <strong>{state.qty} concept(s)</strong>.
        Pricing is calculated per concept.
      </p>

      <div className="pkg-grid">
        {activePkgs.map((pkg) => {
          const rawTotal = pkg.basePrice * state.qty;

          // Logo discount: $10 off per concept + 5% off for 2+ concepts
          let discount = 0;
          let discountLabel = "";
          if (isLogo) {
            const flatOff = 10 * state.qty; // $10 off per concept
            const volumePct = state.qty >= 2 ? 0.05 : 0;
            const volumeOff = Math.round(rawTotal * volumePct);
            discount = flatOff + volumeOff;
            const pct = Math.round((discount / rawTotal) * 100);
            discountLabel = `${pct}% OFF`;
          }
          const finalPrice = rawTotal - discount;

          // Build feature list: prepend dynamic concept count for logo (checklist)
          const dynamicMeta = isLogo && pkg.featuresMeta
            ? [
                { label: `${state.qty} concept(s) included`, included: true },
                ...pkg.featuresMeta,
              ]
            : pkg.featuresMeta;

          // For clothing: prepend concept count to plain features
          const dynamicFeatures = !isLogo
            ? [`${state.qty} initial concept(s)`, ...pkg.features]
            : pkg.features;

          return (
            <div key={pkg.id} className="pkg-card">
              <div className="pkg-badge-row">
                <div className="pkg-badge">{pkg.badge}</div>
                {pkg.featured && <div className="pkg-recommended">Recommended</div>}
                {discount > 0 && <div className="pkg-discount-badge">{discountLabel}</div>}
              </div>
              {discount > 0 ? (
                <>
                  <div className="pkg-base-price">
                    <span className="pkg-original-price">US${rawTotal}</span>{" "}
                    US${pkg.basePrice} × {state.qty} − ${discount} off
                  </div>
                  <div className="pkg-price">US${finalPrice}</div>
                </>
              ) : (
                <>
                  <div className="pkg-base-price">
                    US${pkg.basePrice} × {state.qty} concept(s)
                  </div>
                  <div className="pkg-price">US${finalPrice}</div>
                </>
              )}
              <div className="pkg-name">{pkg.name}</div>
              <p className="pkg-desc">{pkg.desc}</p>
              <div className="pkg-meta">
                <span className="pkg-meta-item"><span className="ic">●</span> {pkg.delivery}</span>
                <span className="pkg-meta-item"><span className="ic">●</span> {pkg.revisions}</span>
              </div>
              <div className="pkg-divider" />
              <ul className="feat-list">
                {dynamicMeta
                  ? dynamicMeta.map((f, i) => (
                      <li key={i} className={f.included ? "feat-included" : "feat-excluded"}>
                        <span className="feat-check">{f.included ? "✓" : "✗"}</span>
                        {f.label}
                      </li>
                    ))
                  : dynamicFeatures.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <button className="btn-order" onClick={() => onSelectPkg(pkg)}>
                Choose This Package →
              </button>
            </div>
          );
        })}
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>
          ← Edit Brief
        </button>
      </div>
    </div>
  );
}

// ─── PayPal Guide (collapsible, for first-time users) ──────
function PayPalGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="pp-guide">
      <button className="pp-guide-toggle" onClick={() => setOpen(!open)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>New to PayPal? Learn how to pay</span>
        <span className={`pp-guide-arrow ${open ? "open" : ""}`}>›</span>
      </button>
      {open && (
        <div className="pp-guide-content">
          <div className="pp-guide-section">
            <div className="pp-guide-label">From iPhone / Android</div>
            <ol className="pp-steps">
              <li>Download the <strong>PayPal</strong> app from App Store or Play Store.</li>
              <li>Create an account or log in with your email.</li>
              <li>Link your bank account, debit card, or credit card.</li>
              <li>Tap <strong>Send</strong>, then enter <strong>muhamadfaizin205@gmail.com</strong> as recipient.</li>
              <li>Enter the total amount in <strong>USD</strong> and confirm payment.</li>
            </ol>
          </div>
          <div className="pp-guide-divider" />
          <div className="pp-guide-section">
            <div className="pp-guide-label">From Web Browser</div>
            <ol className="pp-steps">
              <li>Go to <strong>paypal.com</strong> and sign in or create a free account.</li>
              <li>Click <strong>Send &amp; Request</strong> at the top menu.</li>
              <li>Enter <strong>muhamadfaizin205@gmail.com</strong> as recipient.</li>
              <li>Enter the amount in <strong>USD</strong> and add your brand name as a note.</li>
              <li>Choose <strong>Sending to a friend</strong> to avoid extra fees, then confirm.</li>
            </ol>
          </div>
          <div className="pp-guide-tip">
            After payment, send the receipt screenshot via WhatsApp so we can start working immediately.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PayPal Checkout Buttons ───────────────────────────────
function PayPalCheckout({
  finalPrice,
  description,
  emailData,
  orderData,
  onSuccess,
}: {
  finalPrice: number;
  description: string;
  emailData: Record<string, string | number>;
  orderData: Record<string, unknown>;
  onSuccess: () => void;
}) {
  const [errMsg, setErrMsg] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <div className="paypal-checkout">
      {sending ? (
        <div className="stripe-loading">
          <span className="stripe-spinner" />
          <span>Confirming payment…</span>
        </div>
      ) : (
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 50 }}
          fundingSource={undefined}
          createOrder={(_data, actions) =>
            actions.order.create({
              intent: "CAPTURE",
              purchase_units: [{
                amount: {
                  value: String(Number(finalPrice).toFixed(2)),
                  currency_code: "USD",
                },
                description,
              }],
              application_context: {
                shipping_preference: "NO_SHIPPING",
                user_action: "PAY_NOW",
              },
            })
          }
          onApprove={(_data, actions) => {
            return actions.order!.capture().then(() => {
              // Mark UI as success immediately
              onSuccess();

              // Run side effects in background — fire and forget, don't block PayPal
              setTimeout(() => {
                if (supabase) {
                  supabase.from("orders").insert([orderData]).select().single()
                    .then((res: { data?: { id?: string } | null }) => {
                      if (res?.data?.id) {
                        try { sessionStorage.setItem("dd_last_order_id", res.data.id); } catch {}
                      }
                      console.log("Order saved to Supabase", res?.data?.id);
                    })
                    .catch((e: unknown) => console.error("Supabase save failed:", e));
                }
                emailjs.send(EJS_SERVICE, EJS_TEMPLATE, emailData, EJS_KEY)
                  .then(() => console.log("Email sent"))
                  .catch((e: unknown) => console.error("Email failed:", e));
              }, 0);
            });
          }}
          onError={(err) => {
            console.error("PayPal error:", err);
            setErrMsg("Payment failed. Please check your card details or try logging in to PayPal directly. If the problem persists, contact us on WhatsApp: +62 831-3153-3097");
          }}
          onCancel={() => setErrMsg("Payment cancelled. Click the PayPal or Debit/Credit Card button above to try again.")}
        />
      )}
      {errMsg && <p className="stripe-error-msg">⚠️ {errMsg}</p>}
    </div>
  );
}

// ─── Step 6: Order Confirmation + PayPal Payment ───────────
function Step6({
  state,
  pkg,
  onBack,
}: {
  state: WizardState;
  pkg: Package;
  onBack: () => void;
}) {
  const svcLabel = state.service === "clothing" ? "Clothing Design" : "Logo Brand Design";
  const { final: finalPrice, discount, pct: discPct } = calcPrice(pkg, state);
  const [paymentDone, setPaymentDone] = useState(false);
  const description = `Dean Designers — ${svcLabel} (${pkg.name}, ${state.qty} concept(s))`;

  const emailData = {
    service:      svcLabel,
    brand_name:   state.brandName,
    email:        state.email,
    contact:      [state.whatsapp ? `WhatsApp: ${state.whatsapp}` : "", state.instagram ? `IG: ${state.instagram}` : ""].filter(Boolean).join(" | "),
    package_name: pkg.name,
    concepts:     `${state.qty} Concept(s)`,
    delivery:     pkg.delivery,
    revisions:    pkg.revisions,
    price:        finalPrice,
    brief:        state.brief.trim() || "(Brief not filled)",
    order_date:   new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  };

  const orderData = {
    service:       svcLabel,
    brand_name:    state.brandName,
    email:         state.email,
    whatsapp:      state.whatsapp,
    instagram:     state.instagram,
    qty:           state.qty,
    brief:         state.brief.trim(),
    brief_images:  state.briefImages || [],
    package_id:    pkg.id,
    package_name:  pkg.name,
    package_badge: pkg.badge,
    delivery:      pkg.delivery,
    revisions:     pkg.revisions,
    price:         finalPrice,
    status:        "new",
    paid_via:      "paypal",
    priority:      "normal",
  };

  // ── Success screen — auto-redirect to order tracker ─────
  useEffect(() => {
    if (paymentDone) {
      const timer = setTimeout(() => {
        window.location.href = `/order-tracker.html?email=${encodeURIComponent(state.email)}&new=1`;
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [paymentDone, state.email]);

  if (paymentDone) {
    return (
      <div className="step-panel">
        <div className="payment-success-box">
          <div className="success-check">✓</div>
          <h2 className="success-title">Payment Confirmed!</h2>
          <p className="success-sub">
            US${finalPrice} received — your order is secured.
          </p>

          <div className="redirect-notice">
            <div className="redirect-spinner"></div>
            <p>Redirecting to your order dashboard...</p>
          </div>

          <a
            href={`/order-tracker.html?email=${encodeURIComponent(state.email)}&new=1`}
            className="btn-track-order btn-track-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            Continue to Order Dashboard
          </a>
        </div>
      </div>
    );
  }


  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 6 / 6</div>
        <h2 className="step-question">Confirm &amp; <span>Pay</span></h2>
        <p className="step-hint">Review your order and complete payment to get started.</p>
      </div>

      <div className="confirm-box">
        {/* Package header */}
        <div className="confirm-pkg-header">
          <div className="confirm-pkg-left">
            <div className="pkg-badge" style={{ marginBottom: 0 }}>{pkg.badge}</div>
            <div className="confirm-pkg-name">{pkg.name}</div>
          </div>
          <div className="confirm-pkg-right">
            <div className="confirm-price-note">
              US${pkg.basePrice} × {state.qty} concept(s)
              {discount > 0 && ` − $${discount} (${discPct}% off)`}
            </div>
            <div className="confirm-price-total">US${finalPrice}</div>
          </div>
        </div>

        <div className="confirm-divider" />

        {/* Detail rows */}
        <div className="confirm-rows">
          <div className="confirm-row">
            <span className="confirm-lbl"><span className="ic">●</span> Service</span>
            <span className="confirm-val">{svcLabel}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-lbl"><span className="ic">●</span> Brand Name</span>
            <span className="confirm-val">{state.brandName}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-lbl"><span className="ic">●</span> Concepts</span>
            <span className="confirm-val">{state.qty} Concept(s)</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-lbl"><span className="ic">●</span> Estimated Delivery</span>
            <span className="confirm-val">{pkg.delivery}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-lbl"><span className="ic">●</span> Revisions</span>
            <span className="confirm-val">{pkg.revisions}</span>
          </div>
        </div>

        <div className="confirm-divider" />

        {/* Brief preview */}
        <div className="confirm-brief-wrap">
          <div className="confirm-brief-label">Design Brief</div>
          <div className="confirm-brief-text">
            {state.brief.trim() || "(Brief not filled)"}
          </div>
        </div>

        <div className="confirm-divider" />

        {/* ── PayPal Payment Section ── */}
        <div className="stripe-section">
          <div className="stripe-section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>Secure Payment</span>
            <div className="stripe-badges">
              <span className="pay-logo pay-pp"><span>Pay</span><span>Pal</span></span>
              <span className="pay-logo pay-visa">VISA</span>
              <span className="pay-logo pay-mc"><span className="mc-dot mc-red" /><span className="mc-dot mc-yellow" /></span>
            </div>
          </div>
          <PayPalScriptProvider options={{
            clientId: PAYPAL_CLIENT_ID,
            currency: "USD",
            locale: "en_US",
            components: "buttons",
            disableFunding: "paylater,venmo,sepa",
            enableFunding: "card",
          }}>
            <PayPalCheckout
              finalPrice={finalPrice}
              description={description}
              emailData={emailData}
              orderData={orderData}
              onSuccess={() => {
                setPaymentDone(true);
                try {
                  sessionStorage.removeItem("dd_checkout_step");
                  sessionStorage.removeItem("dd_checkout_pkg");
                  sessionStorage.removeItem("dd_checkout_wizard");
                } catch {}
              }}
            />
          </PayPalScriptProvider>
        </div>

        {/* ── PayPal Guide for first-time users ── */}
        <PayPalGuide />

        <div className="confirm-divider" />

        {/* ── How It Works — Premium Education Card ── */}
        <div className="hiw-card">
          <div className="hiw-header">
            <div className="hiw-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <span className="hiw-title">What happens after payment?</span>
          </div>
          <div className="hiw-steps">
            <div className="hiw-step">
              <div className="hiw-num">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="hiw-text">
                <strong>Send your brief &amp; we're instantly notified</strong>
                <span>The moment you pay, your designer receives an automatic email notification — tap send on WhatsApp to confirm your details, and we'll get started right away</span>
              </div>
            </div>
            <div className="hiw-connector" />
            <div className="hiw-step">
              <div className="hiw-num">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div className="hiw-text">
                <strong>Designer starts working</strong>
                <span>Your project begins within 24 hours</span>
              </div>
            </div>
            <div className="hiw-connector" />
            <div className="hiw-step">
              <div className="hiw-num">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div className="hiw-text">
                <strong>Review &amp; revisions</strong>
                <span>Receive drafts, give feedback — {pkg.revisions} included</span>
              </div>
            </div>
            <div className="hiw-connector" />
            <div className="hiw-step">
              <div className="hiw-num hiw-num-final">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="hiw-text">
                <strong>Files delivered</strong>
                <span>Final designs sent to your email, WhatsApp &amp; Instagram</span>
              </div>
            </div>
          </div>
          <div className="hiw-guarantee">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure payment · 100% money-back guarantee if not delivered
          </div>
        </div>

        <div className="confirm-divider" />

        {/* Total */}
        <div className="confirm-total-row">
          <span className="confirm-total-lbl">TOTAL PAYMENT</span>
          <span className="confirm-total-price">US${finalPrice}</span>
        </div>
      </div>

      <div className="step-nav">
        <button className="btn-back" style={{ width: "100%", textAlign: "center" }} onClick={onBack}>
          ← Change Package
        </button>
      </div>
    </div>
  );
}

// ─── Articles Section (Blog) ──────────────────────────────
// ─── Articles Full Page ───────────────────────────────────
// ─── Articles Page (Gemini Design × Dean Designers) ────────────────────────
const articleStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  .dd-articles-root { --bg-dark:#0F1115; --bg-card:#1A1D24; --accent:#1DBF73; --txt:#fff; --txt-gray:#A0AAB2; font-family:'Poppins',sans-serif; background:var(--bg-dark); color:var(--txt); min-height:100vh; }
  .dd-btn-primary { background:var(--accent); color:#000; padding:10px 24px; border-radius:4px; font-weight:600; font-size:.9rem; border:none; cursor:pointer; font-family:inherit; transition:all .25s; display:inline-flex; align-items:center; gap:6px; }
  .dd-btn-primary:hover { background:#179b5d; transform:translateY(-2px); }
  .dd-btn-ghost { background:transparent; color:var(--txt-gray); padding:10px 20px; border-radius:4px; font-weight:500; font-size:.9rem; border:1px solid rgba(255,255,255,.15); cursor:pointer; font-family:inherit; transition:all .25s; }
  .dd-btn-ghost:hover { border-color:var(--accent); color:var(--txt); }
  /* Nav */
  .dd-nav { display:flex; justify-content:space-between; align-items:center; padding:18px 5%; border-bottom:1px solid rgba(255,255,255,.05); position:sticky; top:0; z-index:100; background:rgba(15,17,21,.95); backdrop-filter:blur(12px); }
  .dd-nav-logo { font-size:1.3rem; font-weight:700; letter-spacing:1px; color:var(--txt); }
  .dd-nav-right { display:flex; align-items:center; gap:16px; }
  /* Hero */
  .dd-hero { display:flex; align-items:center; padding:60px 5%; gap:50px; background:radial-gradient(circle at top right, rgba(29,191,115,.1) 0%, var(--bg-dark) 55%); }
  .dd-hero-content { flex:1; }
  .dd-hero-badge { background:rgba(29,191,115,.15); color:var(--accent); padding:4px 12px; border-radius:20px; font-size:.78rem; font-weight:600; text-transform:uppercase; letter-spacing:1px; display:inline-block; margin-bottom:18px; }
  .dd-hero h1 { font-size:clamp(2rem,4vw,3.2rem); line-height:1.2; margin:0 0 16px; font-weight:700; }
  .dd-hero-excerpt { color:var(--txt-gray); font-size:1.05rem; margin-bottom:24px; max-width:90%; line-height:1.7; }
  .dd-hero-meta { color:var(--txt-gray); font-size:.87rem; margin-bottom:28px; }
  .dd-hero-meta .author { color:var(--accent); font-weight:500; }
  .dd-hero-img { flex:1; border-radius:12px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,.5); aspect-ratio:4/3; }
  .dd-hero-img img { width:100%; height:100%; object-fit:cover; display:block; }
  .dd-hero-img-placeholder { width:100%; height:100%; background:linear-gradient(135deg,#1a2420,#0f1115); display:flex; align-items:center; justify-content:center; }
  /* Tag filter */
  .dd-tag-bar { padding:32px 5% 0; }
  .dd-tag-scroll { display:flex; gap:10px; overflow-x:auto; white-space:nowrap; padding-bottom:8px; scrollbar-width:none; -ms-overflow-style:none; }
  .dd-tag-scroll::-webkit-scrollbar { display:none; }
  .dd-tag { background:var(--bg-card); border:1px solid rgba(255,255,255,.08); color:var(--txt-gray); padding:8px 18px; border-radius:30px; cursor:pointer; font-family:inherit; font-size:.88rem; transition:all .2s; white-space:nowrap; }
  .dd-tag:hover { border-color:var(--accent); color:var(--txt); }
  .dd-tag.active { background:var(--accent); color:#000; border-color:var(--accent); font-weight:600; }
  /* Search */
  .dd-search-wrap { padding:0 5%; margin-top:24px; }
  .dd-search { position:relative; max-width:380px; }
  .dd-search svg { position:absolute; left:13px; top:50%; transform:translateY(-50%); pointer-events:none; }
  .dd-search input { width:100%; padding:10px 14px 10px 38px; background:var(--bg-card); border:1px solid rgba(255,255,255,.08); border-radius:8px; color:var(--txt); font-family:inherit; font-size:.9rem; outline:none; transition:border-color .2s; }
  .dd-search input::placeholder { color:var(--txt-gray); }
  .dd-search input:focus { border-color:var(--accent); }
  /* Grid */
  .dd-grid-section { padding:40px 5% 80px; }
  .dd-section-head { margin-bottom:32px; }
  .dd-section-head h2 { font-size:1.8rem; margin-bottom:6px; }
  .dd-section-head p { color:var(--txt-gray); }
  .dd-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:28px; }
  .dd-card { background:var(--bg-card); border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,.04); cursor:pointer; transition:transform .3s, box-shadow .3s, border-color .3s; display:flex; flex-direction:column; }
  .dd-card:hover { transform:translateY(-5px); box-shadow:0 12px 32px rgba(0,0,0,.5); border-color:rgba(29,191,115,.3); }
  .dd-card-thumb { aspect-ratio:16/9; overflow:hidden; flex-shrink:0; }
  .dd-card-thumb img { width:100%; height:100%; object-fit:cover; transition:transform .5s; display:block; }
  .dd-card:hover .dd-card-thumb img { transform:scale(1.05); }
  .dd-card-thumb-placeholder { width:100%; height:100%; background:linear-gradient(135deg,#1a2420,#111); display:flex; align-items:center; justify-content:center; }
  .dd-card-body { padding:20px 22px 22px; flex:1; display:flex; flex-direction:column; }
  .dd-card-category { color:var(--accent); font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; display:block; }
  .dd-card-title { font-size:1.1rem; line-height:1.45; margin:0 0 10px; flex:1; }
  .dd-card-excerpt { color:var(--txt-gray); font-size:.88rem; margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .dd-card-meta { display:flex; justify-content:space-between; font-size:.82rem; color:var(--txt-gray); border-top:1px solid rgba(255,255,255,.05); padding-top:12px; margin-top:auto; }
  .dd-card-meta .author { color:var(--txt); font-weight:500; }
  .dd-card-read { color:var(--accent); font-weight:600; }
  /* Article detail */
  .dd-article-root { --bg-dark:#0F1115; --bg-card:#1A1D24; --accent:#1DBF73; --txt:#F1F3F5; --txt-gray:#A0AAB2; font-family:'Poppins',sans-serif; background:var(--bg-dark); color:var(--txt); min-height:100vh; }
  .dd-article-topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 5%; background:rgba(15,17,21,.95); backdrop-filter:blur(12px); border-bottom:1px solid rgba(255,255,255,.05); position:sticky; top:0; z-index:100; gap:12px; flex-wrap:wrap; }
  .dd-article-topbar-left { display:flex; align-items:center; gap:12px; }
  .dd-breadcrumb { font-size:.8rem; color:rgba(255,255,255,.35); }
  .dd-breadcrumb-title { font-size:.8rem; color:rgba(255,255,255,.55); max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .dd-article-body-wrap { max-width:720px; margin:0 auto; padding:52px 24px 100px; }
  .dd-article-tags-top { display:flex; gap:6px; flex-wrap:nowrap; overflow-x:auto; margin-bottom:22px; scrollbar-width:none; }
  .dd-article-tags-top::-webkit-scrollbar { display:none; }
  .dd-article-tag { flex-shrink:0; background:rgba(29,191,115,.12); color:var(--accent); padding:3px 11px; border-radius:20px; font-size:.72rem; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
  .dd-article-h1 { font-size:clamp(1.7rem,4vw,2.8rem); font-weight:700; line-height:1.18; letter-spacing:-.3px; margin:0 0 18px; }
  .dd-article-byline { display:flex; align-items:center; gap:16px; padding:14px 0; border-top:1px solid rgba(255,255,255,.07); border-bottom:1px solid rgba(255,255,255,.07); margin-bottom:32px; flex-wrap:wrap; }
  .dd-byline-avatar { width:36px; height:36px; background:var(--accent); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .dd-byline-name { font-size:.9rem; font-weight:600; color:var(--txt); }
  .dd-byline-meta { font-size:.82rem; color:var(--txt-gray); }
  .dd-article-cover { border-radius:10px; overflow:hidden; margin-bottom:36px; aspect-ratio:16/9; }
  .dd-article-cover img { width:100%; height:100%; object-fit:cover; display:block; }
  .dd-article-content h1,.dd-article-content h2,.dd-article-content h3 { color:var(--txt); font-weight:700; line-height:1.3; margin:2em 0 .7em; }
  .dd-article-content h2 { font-size:1.4rem; border-bottom:1px solid rgba(255,255,255,.08); padding-bottom:.5em; }
  .dd-article-content h3 { font-size:1.15rem; }
  .dd-article-content p { color:var(--txt-gray); line-height:1.85; margin:0 0 1.4em; font-size:1.01rem; }
  .dd-article-content ul,.dd-article-content ol { color:var(--txt-gray); margin:0 0 1.4em 1.4em; line-height:1.8; }
  .dd-article-content li { margin-bottom:.5em; }
  .dd-article-content strong { color:var(--txt); font-weight:600; }
  .dd-article-content a { color:var(--accent); text-underline-offset:3px; }
  .dd-article-content blockquote { border-left:3px solid var(--accent); background:rgba(29,191,115,.07); margin:1.5em 0; padding:.9em 1.3em; border-radius:0 8px 8px 0; color:var(--txt); font-style:italic; }
  .dd-article-content img { width:100%; height:auto; border-radius:8px; aspect-ratio:16/9; object-fit:cover; margin:1.5em 0; }
  .dd-article-content code { background:rgba(255,255,255,.07); padding:2px 6px; border-radius:4px; font-size:.87em; color:var(--accent); }
  .dd-cta-box { margin-top:52px; padding:36px 32px; background:linear-gradient(135deg,#1a2420,#111318); border:1px solid rgba(29,191,115,.2); border-radius:14px; text-align:center; }
  .dd-cta-box .badge { background:rgba(29,191,115,.15); color:var(--accent); padding:4px 14px; border-radius:20px; font-size:.75rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; display:inline-block; margin-bottom:14px; }
  .dd-cta-box h3 { font-size:1.5rem; font-weight:700; margin-bottom:8px; }
  .dd-cta-box p { color:var(--txt-gray); margin-bottom:22px; font-size:.93rem; }
  .dd-bottom-nav { margin-top:40px; display:flex; gap:10px; flex-wrap:wrap; }
  /* Empty & Loading */
  .dd-empty { text-align:center; padding:80px 20px; }
  .dd-empty p { color:var(--txt-gray); margin:10px 0 0; }
  /* Shimmer */
  .dd-shimmer { animation:ddShimmer 1.5s infinite; background:linear-gradient(90deg,#1a1d24 25%,#212530 50%,#1a1d24 75%); background-size:200% 100%; border-radius:8px; }
  @keyframes ddShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  /* Responsive */
  @media(max-width:860px){
    .dd-hero{flex-direction:column-reverse;padding:36px 5%;gap:28px;text-align:center}
    .dd-hero-excerpt{margin:0 auto 24px;max-width:100%}
    .dd-hero-img{width:100%;max-height:280px}
    .dd-nav-links{display:none}
  }
  @media(max-width:560px){
    .dd-grid{grid-template-columns:1fr}
    .dd-article-h1{font-size:1.55rem}
  }
`;

function ArticlesFullPage({ onBack }: { onBack: () => void }) {
  const [articles, setArticles] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeTag, setActiveTag] = React.useState("");

  React.useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from("articles").select("*").eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Articles fetch error:", error);
        if (data) {
          setArticles(data);
          const parts = window.location.pathname.split("/").filter(Boolean);
          if (parts[0] === "articles" && parts[1]) {
            const match = data.find((a: any) => a.slug === parts[1]);
            if (match) setSelected(match);
          }
        }
        setLoading(false);
      });
  }, []);

  const openArticle = (a: any) => {
    setSelected(a);
    window.history.pushState({}, "", `/articles/${a.slug || a.id}`);
    window.scrollTo(0, 0);
  };

  const closeArticle = () => {
    setSelected(null);
    window.history.pushState({}, "", "/articles");
    window.scrollTo(0, 0);
  };

  React.useEffect(() => {
    const onPop = () => {
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (parts[0] === "articles" && parts[1]) {
        const match = articles.find((a: any) => a.slug === parts[1]);
        setSelected(match || null);
      } else setSelected(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [articles]);

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags || []))).slice(0, 14);
  const filtered = articles.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title?.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q);
    const matchTag = !activeTag || (a.tags || []).includes(activeTag);
    return matchSearch && matchTag;
  });

  const readTime = (a: any) => Math.max(1, Math.ceil((a.content || "").replace(/<[^>]*>/g,"").split(/\s+/).length / 200));

  const BackBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button onClick={onClick} className="dd-btn-ghost" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:".82rem",padding:"7px 14px"}}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      {label}
    </button>
  );

  // ── ARTICLE DETAIL ──────────────────────────────────
  if (selected) {
    return (
      <div className="dd-article-root">
        <style>{articleStyles}</style>
        <div className="dd-article-topbar">
          <div className="dd-article-topbar-left">
            <BackBtn onClick={closeArticle} label="Journal" />
            <span className="dd-breadcrumb">›</span>
            <span className="dd-breadcrumb-title">{selected.title}</span>
          </div>
          <BackBtn onClick={onBack} label="Home" />
        </div>

        <div className="dd-article-body-wrap">
          {selected.tags?.length > 0 && (
            <div className="dd-article-tags-top">
              {selected.tags.map((t: string, i: number) => (
                <span key={i} className="dd-article-tag">{t}</span>
              ))}
            </div>
          )}

          <h1 className="dd-article-h1">{selected.title}</h1>

          <div className="dd-article-byline">
            <div className="dd-byline-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div className="dd-byline-name">{selected.author_name || "Xavian"}</div>
              <div className="dd-byline-meta">{new Date(selected.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})} · {readTime(selected)} min read</div>
            </div>
          </div>

          {selected.cover_image && (
            <div className="dd-article-cover">
              <img src={selected.cover_image} alt={selected.title} />
            </div>
          )}

          <div className="dd-article-content" dangerouslySetInnerHTML={{__html: selected.content}} />

          {selected.tags?.length > 0 && (
            <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid rgba(255,255,255,.07)"}}>
              <div style={{fontSize:".75rem",fontWeight:700,color:"#A0AAB2",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10}}>Topics</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {selected.tags.map((t: string, i: number) => (
                  <button key={i} onClick={()=>{closeArticle();setActiveTag(t);}} className="dd-article-tag" style={{border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="dd-cta-box">
            <span className="badge">Ready to build your brand?</span>
            <h3>Professional Clothing & Logo Design</h3>
            <p>5.0★ · 1,000+ projects · 25+ countries · 7+ years experience · Files in 1–3 days</p>
            <button onClick={onBack} className="dd-btn-primary">Start Your Order →</button>
          </div>

          <div className="dd-bottom-nav">
            <BackBtn onClick={closeArticle} label="← Back to Journal" />
            <BackBtn onClick={onBack} label="Go to Homepage" />
          </div>
        </div>
      </div>
    );
  }

  // ── ARTICLE LIST ─────────────────────────────────────
  const featured = filtered[0];
  const rest = search || activeTag ? filtered : filtered.slice(1);

  return (
    <div className="dd-articles-root">
      <style>{articleStyles}</style>

      {/* Nav */}
      <nav className="dd-nav">
        <div className="dd-nav-logo">DEAN DESIGNERS.</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div className="dd-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A0AAB2" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search articles..." />
          </div>
          <button onClick={onBack} className="dd-btn-primary" style={{padding:"9px 18px",fontSize:".82rem"}}>← Home</button>
        </div>
      </nav>

      {/* Hero — featured article */}
      {!loading && featured && !search && !activeTag && (
        <header className="dd-hero">
          <div className="dd-hero-content">
            <span className="dd-hero-badge">✦ Featured Article</span>
            <h1>{featured.title}</h1>
            {featured.excerpt && <p className="dd-hero-excerpt">{featured.excerpt.substring(0,160)}{featured.excerpt.length > 160 ? "..." : ""}</p>}
            <div className="dd-hero-meta">
              <span className="author">{featured.author_name || "Xavian"}</span>
              {" · "}
              <span>{new Date(featured.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
              {" · "}
              <span>{readTime(featured)} min read</span>
            </div>
            <button onClick={()=>openArticle(featured)} className="dd-btn-primary">
              Read Article →
            </button>
          </div>
          <div className="dd-hero-img">
            {featured.cover_image
              ? <img src={featured.cover_image} alt={featured.title} />
              : <div className="dd-hero-img-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(29,191,115,.4)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
            }
          </div>
        </header>
      )}

      {/* Tag filter */}
      <div className="dd-tag-bar">
        <div className="dd-tag-scroll">
          <button className={`dd-tag${!activeTag?" active":""}`} onClick={()=>setActiveTag("")}>All Articles</button>
          {allTags.map((t, i) => (
            <button key={i} className={`dd-tag${activeTag===t?" active":""}`} onClick={()=>setActiveTag(activeTag===t?"":t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Article grid */}
      <section className="dd-grid-section">
        <div className="dd-section-head">
          <h2>{search ? `Results for "${search}"` : activeTag ? activeTag : "Latest Releases"}</h2>
          <p>{filtered.length} article{filtered.length!==1?"s":""} · Dive into our latest thoughts on design, culture, and streetwear</p>
        </div>

        {loading ? (
          <div className="dd-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{background:"#1A1D24",borderRadius:12,overflow:"hidden"}}>
                <div className="dd-shimmer" style={{aspectRatio:"16/9"}} />
                <div style={{padding:20}}>
                  <div className="dd-shimmer" style={{height:10,width:"40%",marginBottom:12}} />
                  <div className="dd-shimmer" style={{height:16,marginBottom:8}} />
                  <div className="dd-shimmer" style={{height:12,width:"70%"}} />
                </div>
              </div>
            ))}
          </div>
        ) : !rest.length && !featured ? (
          <div className="dd-empty">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#A0AAB2" strokeWidth="1.5" style={{margin:"0 auto 12px",display:"block"}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p style={{color:"#A0AAB2",fontWeight:600}}>No articles found</p>
            <p>Try a different search or tag</p>
          </div>
        ) : (
          <div className="dd-grid">
            {rest.map((a) => (
              <article key={a.id} className="dd-card" onClick={()=>openArticle(a)}>
                <div className="dd-card-thumb">
                  {a.cover_image
                    ? <img src={a.cover_image} alt={a.title} loading="lazy" />
                    : <div className="dd-card-thumb-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(29,191,115,.3)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                  }
                </div>
                <div className="dd-card-body">
                  {a.tags?.[0] && <span className="dd-card-category">{a.tags[0]}</span>}
                  <h3 className="dd-card-title">{a.title}</h3>
                  {a.excerpt && <p className="dd-card-excerpt">{a.excerpt}</p>}
                  <div className="dd-card-meta">
                    <span className="author">{a.author_name || "Xavian"}</span>
                    <span className="dd-card-read">{readTime(a)} min read →</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{background:"#090a0d",padding:"50px 5% 20px",borderTop:"1px solid rgba(255,255,255,.05)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:24,marginBottom:32}}>
          <div>
            <h2 style={{fontSize:"1.3rem",fontWeight:700,marginBottom:8}}>DEAN DESIGNERS.</h2>
            <p style={{color:"#A0AAB2",maxWidth:360,fontSize:".9rem"}}>Elevating streetwear through intentional design and uncompromising quality.</p>
          </div>
          <div style={{display:"flex",gap:20}}>
            <button onClick={onBack} style={{background:"none",border:"none",color:"#A0AAB2",cursor:"pointer",fontFamily:"inherit",fontSize:".9rem"}}>Home</button>
            <a href="https://createclothingdesign.com" style={{color:"#A0AAB2",fontSize:".9rem"}}>Main Site</a>
          </div>
        </div>
        <div style={{textAlign:"center",color:"#A0AAB2",fontSize:".8rem",paddingTop:16,borderTop:"1px solid rgba(255,255,255,.05)"}}>
          © {new Date().getFullYear()} Dean Designers. All rights reserved.
        </div>
      </footer>
    </div>
  );
}


// ─── Main App ──────────────────────────────────────────────
export default function App() {

  // ── Dynamic packages from DB (fallback to hardcoded) ────
  const { clothingPkgs, logoPkgs } = useDbPackages();

  // ── Social Proof Toast ───────────────────────────────────
  const [toastVisible, setToastVisible] = useState(false);
  const [toastData, setToastData] = useState({ name: "", country: "", service: "", time: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<"home"|"articles">(() => {
    // Read initial page from URL so refresh stays on the same page
    if (typeof window !== "undefined") {
      const path = window.location.pathname.replace(/\/$/, "");
      if (path === "/articles" || window.location.hash === "#articles") return "articles";
    }
    return "home";
  });

  // Keep the URL in sync with the current page (without full reload)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const targetPath = currentPage === "articles" ? "/articles" : "/";
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: currentPage }, "", targetPath);
    }
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.replace(/\/$/, "");
      setCurrentPage(path === "/articles" ? "articles" : "home");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Large pool — randomize each session so customers never see same names
  const proofPool = React.useMemo(() => {
    const names = [
      "Alex R.","James K.","Yuki T.","Sophie M.","Carlos D.","Emma L.","Liam W.","Aisha N.",
      "Marcus B.","Olivia P.","Noah S.","Charlotte H.","Ethan G.","Mia F.","Lucas J.","Isabella V.",
      "Mason O.","Amelia C.","Logan T.","Harper Q.","Daniel R.","Evelyn M.","Henry W.","Abigail B.",
      "Sebastian K.","Emily D.","Jack P.","Ella N.","Owen L.","Avery S.","Caleb F.","Scarlett T.",
      "Nathan H.","Grace W.","Wyatt B.","Chloe R.","Hudson J.","Lily M.","Theodore G.","Zoey D.",
      "Aiden V.","Hannah P.","Connor O.","Aria K.","Levi C.","Layla N.","Asher M.","Audrey F.",
      "Jordan B.","Riley T.","Sawyer L.","Brooklyn S.","Easton W.","Bella H.","Beckett P.","Penelope G.",
      "Kai D.","Stella V.","Felix M.","Maya R.","Ezra J.","Ruby N.","Silas L.","Iris K.",
      "Diego A.","Camille F.","Mateo P.","Eloise B.","Leo H.","Hazel W.","Adrian T.","Violet S.",
      "Julian R.","Naomi D.","Anthony G.","Aurora M.","Jackson V.","Eliza C.","Eli J.","Nora P.",
      "Hassan I.","Fatima Z.","Wei C.","Anya P.","Ravi M.","Priya S.","Andre L.","Camila O.",
      "Dmitri V.","Lena K.","Tobias H.","Saskia W.","Mateusz N.","Zofia B.","Bjorn E.","Freya O.",
    ];
    const services = ["Clothing Design","Logo Brand Design"];
    const flags = ["🇺🇸","🇬🇧","🇨🇦","🇦🇺","🇩🇪","🇫🇷","🇯🇵","🇧🇷","🇲🇽","🇳🇬","🇮🇳","🇪🇸","🇮🇹","🇰🇷","🇸🇪","🇳🇱","🇨🇭","🇸🇬","🇦🇪","🇮🇪"];
    const times = ["just now","1 min ago","2 min ago","4 min ago","7 min ago","12 min ago","18 min ago","25 min ago","32 min ago","41 min ago","58 min ago","1 hour ago","2 hours ago","3 hours ago"];
    
    // Shuffle helper
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    
    return shuffle(names).slice(0, 25).map((name, i) => ({
      name,
      country: flags[Math.floor(Math.random() * flags.length)],
      service: services[Math.floor(Math.random() * services.length)],
      time: times[Math.min(i, times.length - 1)],
    }));
  }, []);

  useEffect(() => {
    let idx = 0;
    const show = () => {
      setToastData(proofPool[idx % proofPool.length]);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4000);
      idx++;
    };
    const timer = setTimeout(() => { show(); }, 5000);
    const interval = setInterval(show, 14000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [proofPool]);
  const [step, setStep] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const saved = sessionStorage.getItem("dd_checkout_step");
      return saved ? Number(saved) : 1;
    } catch { return 1; }
  });
  const [direction, setDirection] = useState<Direction>("forward");
  const [animKey, setAnimKey] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = sessionStorage.getItem("dd_checkout_pkg");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    const fallback: WizardState = {
      service: null,
      brandName: "",
      email: "",
      whatsapp: "",
      instagram: "",
      qty: 1,
      brief: "",
      briefImages: [],
    };
    if (typeof window === "undefined") return fallback;
    try {
      const saved = sessionStorage.getItem("dd_checkout_wizard");
      return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
    } catch { return fallback; }
  });

  // Persist checkout progress so a refresh resumes exactly where the customer left off
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { sessionStorage.setItem("dd_checkout_step", String(step)); } catch {}
  }, [step]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (selectedPkg) sessionStorage.setItem("dd_checkout_pkg", JSON.stringify(selectedPkg));
      else sessionStorage.removeItem("dd_checkout_pkg");
    } catch {}
  }, [selectedPkg]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { sessionStorage.setItem("dd_checkout_wizard", JSON.stringify(wizardState)); } catch {}
  }, [wizardState]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // hidden, looping background music (unmutes on first interaction)
  // Music removed

  // Force-play hero video (some browsers block autoplay even when muted)
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (step !== 1) return;
    const v = heroVideoRef.current;
    if (!v) return;

    const forcePlay = () => {
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Retry on first user interaction if blocked
          const retry = () => {
            v.muted = true;
            v.play().catch(() => {});
            window.removeEventListener("pointerdown", retry);
            window.removeEventListener("touchstart", retry);
            window.removeEventListener("scroll", retry);
          };
          window.addEventListener("pointerdown", retry, { passive: true });
          window.addEventListener("touchstart", retry, { passive: true });
          window.addEventListener("scroll", retry, { passive: true });
        });
      }
    };

    // Try immediately and again once metadata loads
    forcePlay();
    v.addEventListener("loadeddata", forcePlay);
    v.addEventListener("canplay", forcePlay);

    return () => {
      v.removeEventListener("loadeddata", forcePlay);
      v.removeEventListener("canplay", forcePlay);
    };
  }, [step]);

  const goTo = (next: number, dir: Direction = "forward") => {
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setStep(next);
  };

  const handleSelectService = (s: "clothing" | "logo") => {
    setWizardState((p) => ({ ...p, service: s }));
    goTo(2, "forward");
  };
  const handleNextStep2 = () => {
    if (wizardState.brandName.trim().length < 2) {
      showToast("Brand name must be at least 2 characters");
      return;
    }
    if (!wizardState.email.trim() || !/\S+@\S+\.\S+/.test(wizardState.email)) {
      showToast("Please enter a valid email address");
      return;
    }
    if (!wizardState.whatsapp.trim() && !wizardState.instagram.trim()) {
      showToast("Please enter at least one contact method (WhatsApp or Instagram)");
      return;
    }
    goTo(3, "forward");
  };
  const handleNextStep3 = () => goTo(4, "forward");
  const handleNextStep4 = () => {
    if (wizardState.brief.trim().length < 10) {
      showToast("Brief must be at least 10 characters for best results");
      return;
    }
    goTo(5, "forward");
  };
  const handleSelectPkg = (pkg: Package) => {
    setSelectedPkg(pkg);
    goTo(6, "forward");
  };

  const panelClass = `step-panel${direction === "back" ? " from-back" : ""}`;

  return (
    <div>
      {/* NAVBAR */}
      {/* ── NAVBAR with Hamburger ── */}
      <nav className="navbar">
        <div className="nav-wrap">
          <button className="nav-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <a className="nav-logo" href="#home">
            DEAN DESIGNERS
          </a>
          <a href="/order-tracker.html" className="nav-profile" title="My Orders">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </a>
        </div>
      </nav>

      {/* ── Drawer Overlay ── */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div className="drawer-logo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <span className="drawer-brand">Dean <span style={{color:"#1DBF73"}}>Designers</span></span>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            <div className="drawer-items">
              <a className="drawer-item" href="#home" onClick={() => { setCurrentPage("home"); setDrawerOpen(false); window.scrollTo(0,0); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>Home
              </a>
              <a className="drawer-item" href="#wizard" onClick={() => setDrawerOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>Services
              </a>
              <a className="drawer-item" href="#about" onClick={() => setDrawerOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Portfolio
              </a>
              <a className="drawer-item" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("articles"); setDrawerOpen(false); window.scrollTo(0,0); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Articles
              </a>
              <div className="drawer-divider" />
              <a className="drawer-item" href="/order-tracker.html">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>My Orders
              </a>
              <a className="drawer-item" href="#home" onClick={() => setDrawerOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ══ FULL ARTICLES PAGE ══ */}
      {currentPage === "articles" && (
        <ArticlesFullPage onBack={() => { setCurrentPage("home"); window.scrollTo(0,0); }} />
      )}

      {/* HERO + FEATURE BAR — only visible on Step 1 AND home page */}
      {currentPage === "home" && step === 1 && (
        <>
          <section className="hero hero-yt-section s0" id="home">
            {/* Local video background — no controls ever */}
            <video
              ref={heroVideoRef}
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9'%3E%3Crect width='16' height='9' fill='%23050505'/%3E%3C/svg%3E"
            >
              <source src="/process%20design.mp4" type="video/mp4" />
            </video>
            <div className="hero-overlay" />

            {/* Minimal content */}
            <div className="hero-content">
              <button className="hero-cta" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const el = document.getElementById("wizard"); if(el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 20; window.scrollTo({ top: y, behavior: "smooth" }); } }}>
                Start Your Order
                <span className="hero-cta-arrow">→</span>
              </button>
            </div>

            {/* Scroll hint */}
            <div className="hero-scroll-hint">
              <svg className="scroll-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10l5 5 5-5"/>
              </svg>
              <svg className="scroll-arrow scroll-arrow-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10l5 5 5-5"/>
              </svg>
            </div>
          </section>

          <div className="feat-bar s1" id="services">
            <div className="feat-ticker">
              <div className="feat-track">
                {[...FEATURES, ...FEATURES].map((f, i) => (
                  <React.Fragment key={i}>
                    <span className="feat-lbl">{f}</span>
                    <span className="feat-sep">✦</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* ── Trust Stats Bar ── */}
          <div className="trust-bar">
            <div className="trust-bar-inner">
              <div className="tb-item">
                <div className="tb-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div className="tb-text">
                  <strong>2,000+</strong>
                  <span>Designs Delivered</span>
                </div>
              </div>
              <div className="tb-divider" />
              <div className="tb-item">
                <div className="tb-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="tb-text">
                  <strong>100%</strong>
                  <span>Money-Back Guarantee</span>
                </div>
              </div>
              <div className="tb-divider" />
              <div className="tb-item">
                <div className="tb-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="tb-text">
                  <strong>&lt;24h</strong>
                  <span>Average Response</span>
                </div>
              </div>
              <div className="tb-divider" />
              <div className="tb-item">
                <div className="tb-icon tb-icon-star">★</div>
                <div className="tb-text">
                  <strong>5.0 / 5.0</strong>
                  <span>Client Satisfaction</span>
                </div>
              </div>
            </div>
          </div>

          <Testimonials />

          {/* ── ABOUT SECTION ── */}
          <section className="about-section s2" id="about" style={{padding:"60px 20px",background:"linear-gradient(135deg,#E8F5E9 0%,#F1F8E9 50%,#E0F2F1 100%)"}}>
            <div style={{maxWidth:800,margin:"0 auto",textAlign:"center"}}>
              <span style={{display:"inline-block",padding:"8px 18px",background:"rgba(29,191,115,0.12)",color:"#1DBF73",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:14,letterSpacing:1,border:"1px solid rgba(29,191,115,0.15)"}}>ABOUT US</span>
              <h2 style={{fontSize:28,fontWeight:800,marginBottom:8,letterSpacing:"-0.5px"}}>About Dean Designers</h2>
              <p style={{fontSize:14,color:"#64748B",lineHeight:1.7,marginBottom:28,maxWidth:600,margin:"0 auto 28px"}}>
                Professional streetwear and logo design studio serving global clients since 2018. We turn brand visions into production-ready designs that stand out.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:32}}>
                {[
                  {num:"1,000+",label:"Projects Completed"},
                  {num:"5.0★",label:"Fiverr Rating"},
                  {num:"25+",label:"Countries Served"},
                  {num:"7+",label:"Years Experience"}
                ].map((s,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,0.7)",backdropFilter:"blur(10px)",borderRadius:18,padding:"20px 14px",border:"1px solid rgba(255,255,255,0.5)",boxShadow:"0 4px 16px rgba(0,0,0,0.04)",transition:"all .2s"}}>
                    <div style={{fontSize:26,fontWeight:800,color:"#1DBF73",marginBottom:4}}>{s.num}</div>
                    <div style={{fontSize:11,color:"#64748B",fontWeight:600}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:"left",maxWidth:600,margin:"0 auto"}}>
                <p style={{fontSize:13,lineHeight:1.8,color:"#475569",marginBottom:14}}>
                  <strong>Deep expertise in streetwear aesthetics.</strong> Every design is crafted with attention to detail — organized layers, color separations, and files ready for screen printing, DTG, sublimation, or embroidery.
                </p>
                <p style={{fontSize:13,lineHeight:1.8,color:"#475569",marginBottom:14}}>
                  <strong>We work with brands worldwide.</strong> From independent clothing startups to established fashion labels across the US, UK, Japan, Germany, and 20+ other countries.
                </p>
                <p style={{fontSize:13,lineHeight:1.8,color:"#475569"}}>
                  <strong>AI-powered workflow.</strong> Our design brief generator helps clients articulate their vision clearly, resulting in faster turnaround and better outcomes every time.
                </p>
              </div>
            </div>
          </section>

                  </>
      )}

      {/* WIZARD */}
      {currentPage === "home" && (
      <>
      <section className="wizard-section s2" id="wizard">
        <div className="wizard-wrap">
          <ProgressBar step={step} />
          <div className="step-outer">
            {step === 1 && (
              <div key={`s1-${animKey}`} className={panelClass}>
                <Step1
                  service={wizardState.service}
                  onSelect={handleSelectService}
                />
              </div>
            )}
            {step === 2 && (
              <div key={`s2-${animKey}`} className={panelClass}>
                <Step2
                  brandName={wizardState.brandName}
                  email={wizardState.email}
                  whatsapp={wizardState.whatsapp}
                  instagram={wizardState.instagram}
                  onChangeBrand={(v) => setWizardState((p) => ({ ...p, brandName: v }))}
                  onChangeEmail={(v) => setWizardState((p) => ({ ...p, email: v }))}
                  onChangeWA={(v) => setWizardState((p) => ({ ...p, whatsapp: v }))}
                  onChangeIG={(v) => setWizardState((p) => ({ ...p, instagram: v }))}
                  onNext={handleNextStep2}
                  onBack={() => goTo(1, "back")}
                />
              </div>
            )}
            {step === 3 && (
              <div key={`s3-${animKey}`} className={panelClass}>
                <Step3
                  qty={wizardState.qty}
                  onChange={(q) => setWizardState((p) => ({ ...p, qty: q }))}
                  onNext={handleNextStep3}
                  onBack={() => goTo(2, "back")}
                />
              </div>
            )}
            {step === 4 && (
              <div key={`s4-${animKey}`} className={panelClass}>
                <Step4
                  brief={wizardState.brief}
                  onChange={(v) => setWizardState((p) => ({ ...p, brief: v }))}
                  onNext={handleNextStep4}
                  onBack={() => goTo(3, "back")}
                  wizardService={wizardState.service}
                  wizardBrand={wizardState.brandName}
                  briefImages={wizardState.briefImages}
                  onImagesChange={(imgs: string[]) => setWizardState((p) => ({ ...p, briefImages: imgs }))}
                />
              </div>
            )}
            {step === 5 && (
              <div key={`s5-${animKey}`} className={panelClass}>
                <Step5
                  state={wizardState}
                  onBack={() => goTo(4, "back")}
                  onSelectPkg={handleSelectPkg}
                  clothingPkgs={clothingPkgs}
                  logoPkgs={logoPkgs}
                />
              </div>
            )}
            {step === 6 && selectedPkg && (
              <div key={`s6-${animKey}`} className={panelClass}>
                <Step6
                  state={wizardState}
                  pkg={selectedPkg}
                  onBack={() => goTo(5, "back")}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}

      {/* ── Social Proof Toast ── */}
      <div className={`sp-toast${toastVisible ? " sp-show" : ""}`}>
        <div className="sp-dot" />
        <div className="sp-body">
          <span className="sp-name">{toastData.name} {toastData.country}</span>
          <span className="sp-detail">just ordered <strong>{toastData.service}</strong></span>
          <span className="sp-time">{toastData.time}</span>
        </div>
      </div>

      {/* ── Guarantee Section (visible on step 1) ── */}
      {step === 1 && (
        <section className="guarantee-section">
          <div className="guarantee-inner">
            <h3 className="guarantee-title">Why 1,000+ brands trust Dean Designers</h3>
            <div className="guarantee-grid">
              <div className="g-card">
                <div className="g-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <strong>100% Money-Back Guarantee</strong>
                <p>Not satisfied? Get a full refund — no questions asked. Your investment is protected.</p>
              </div>
              <div className="g-card">
                <div className="g-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <strong>Secure PayPal Payment</strong>
                <p>Encrypted checkout via PayPal. Pay with card, PayPal balance, or bank — buyer protection included.</p>
              </div>
              <div className="g-card">
                <div className="g-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <strong>Production-Ready Files</strong>
                <p>Every design comes with source files, high-res exports, and commercial license. Print-shop ready.</p>
              </div>
              <div className="g-card">
                <div className="g-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <strong>24-Hour Kickoff</strong>
                <p>Your designer starts within 24 hours and keeps you updated at every stage until delivery.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ Section (visible on step 1) ── */}
      {step === 1 && <FAQSection />}

      {/* ── Sticky Mobile CTA ── */}
      {step === 1 && (
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); const el = document.getElementById("wizard"); if(el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 20; window.scrollTo({ top: y, behavior: "smooth" }); } }} className="sticky-cta">
          Start Your Order →
        </button>
      )}
      </>
      )}

      {/* Hidden background music player */}
      {/* Music removed */}
    </div>
  );
}
