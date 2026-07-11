import React, { useState, useRef, useEffect } from "react";
import "./styles.css";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import emailjs from "@emailjs/browser";
import { createClient } from "@supabase/supabase-js";
import { ChatWidget } from "./ChatWidget";

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

// ─── Gig Types ──────────────────────────────────────────
interface Gig {
  id: string;
  title: string;
  slug: string;
  short_desc: string;
  description: string;
  category: string;
  cover_url: string;
  gallery_urls: string[];
  basic_price: number;
  basic_delivery: number;
  basic_revisions: string;
  basic_features: string[];
  basic_desc: string;
  standard_price: number;
  standard_delivery: number;
  standard_revisions: string;
  standard_features: string[];
  standard_desc: string;
  premium_price: number;
  premium_delivery: number;
  premium_revisions: string;
  premium_features: string[];
  premium_desc: string;
  rating: number;
  review_count: number;
  orders_count: number;
  service_type: "clothing" | "logo";
  is_active: boolean;
  sort_order: number;
  seo_title: string;
  seo_description: string;
}

// ─── Constants ────────────────────────────────────────────
// C1 FIX: API keys moved to server-side /api/generate-brief.js

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

// ─── Default Gigs (hardcoded fallback — DB overrides when available) ──
const DEFAULT_GIGS: Gig[] = [
  {
    id: "gig-clothing",
    title: "I will create custom streetwear clothing design and apparel graphics",
    slug: "custom-streetwear-clothing-design",
    short_desc: "Professional streetwear, t-shirt, hoodie, and merch graphic design. Production-ready files included.",
    description: "",
    category: "clothing-design",
    cover_url: "/clothing-1.jpg",
    gallery_urls: ["/clothing-1.jpg","/clothing-2.png","/clothing-3.png"],
    basic_price: 50, basic_delivery: 3, basic_revisions: "2 Revisions",
    basic_features: ["Source file included","Print-ready resolution","Front design only"],
    basic_desc: "Simple single-side apparel graphic. Best for testing one design.",
    standard_price: 75, standard_delivery: 3, standard_revisions: "8 Revisions",
    standard_features: ["Source file included","Print-ready resolution","Front & back design","Realistic mockup","Enhanced detailing","Commercial use"],
    standard_desc: "Front & back with mockup. Most popular for brand drops.",
    premium_price: 120, premium_delivery: 5, premium_revisions: "Unlimited",
    premium_features: ["Source file included","Print-ready resolution","Front & back design","Realistic mockup","Enhanced detailing","Commercial use","Techpack included"],
    premium_desc: "Complete apparel system with techpack. Full brand-ready.",
    rating: 4.9, review_count: 1247, orders_count: 3200,
    service_type: "clothing" as const, is_active: true, sort_order: 1,
    seo_title: "", seo_description: "",
  },
  {
    id: "gig-logo",
    title: "I will design a professional logo and brand identity for your clothing line",
    slug: "professional-logo-brand-identity",
    short_desc: "Unique logo design with brand identity package. Vector files, mockups, and social media kit included.",
    description: "",
    category: "logo-design",
    cover_url: "/logo-1.png",
    gallery_urls: ["/logo-1.png","/logo-2.png"],
    basic_price: 80, basic_delivery: 5, basic_revisions: "2 Revisions",
    basic_features: ["Logo transparency","Vector file","Printable file"],
    basic_desc: "Clean logo concept. Safe for testing your brand direction.",
    standard_price: 150, standard_delivery: 7, standard_revisions: "3 Revisions",
    standard_features: ["Logo transparency","Vector file","Printable file","3D mockup","Source file"],
    standard_desc: "Refined logo with mockup and source files. Ready for branding.",
    premium_price: 200, premium_delivery: 7, premium_revisions: "3 Revisions",
    premium_features: ["Logo transparency","Vector file","Printable file","3D mockup","Source file","Social media kit"],
    premium_desc: "Complete brand identity with social media kit.",
    rating: 5.0, review_count: 986, orders_count: 8100,
    service_type: "logo" as const, is_active: true, sort_order: 2,
    seo_title: "", seo_description: "",
  },
];

function useGigs() {
  const [gigs, setGigs] = useState<Gig[]>(DEFAULT_GIGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase
      .from("gigs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          // Merge DB data with defaults: use DB gallery if present, else fallback to default images
          const merged = data.map((dbGig: any) => {
            const def = DEFAULT_GIGS.find(d => d.service_type === dbGig.service_type);
            return {
              ...dbGig,
              gallery_urls: (dbGig.gallery_urls && dbGig.gallery_urls.length > 0) ? dbGig.gallery_urls : (def?.gallery_urls || []),
              cover_url: dbGig.cover_url || def?.cover_url || "",
            };
          }) as Gig[];
          setGigs(merged);
        }
        setLoading(false);
      });
  }, []);

  return { gigs, loading };
}

// ─── My Orders Page (customer-facing order tracker) ─────────
function MyOrdersPage({ onBack }: { onBack: () => void }) {
  const [customerEmail, setCustomerEmail] = useState(() => {
    try { return localStorage.getItem("dd_customer_email") || ""; } catch { return ""; }
  });
  const [inputEmail, setInputEmail] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"orders"|"chat">("orders");

  const isLoggedIn = !!customerEmail;

  useEffect(() => { if (isLoggedIn) fetchOrders(customerEmail); }, [customerEmail]);

  const fetchOrders = async (em: string) => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/get-orders?email=${encodeURIComponent(em.toLowerCase())}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
      else setError(data.error || "Something went wrong");
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const handleLogin = async () => {
    const em = inputEmail.trim().toLowerCase();
    if (!em || !em.includes("@")) { setError("Please enter a valid email"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/get-orders?email=${encodeURIComponent(em)}`);
      const data = await res.json();
      if (data.success && data.orders && data.orders.length > 0) {
        setCustomerEmail(em);
        try { localStorage.setItem("dd_customer_email", em); } catch {}
        setOrders(data.orders);
      } else {
        setError("No orders found for this email. Please use the email you ordered with.");
      }
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const handleLogout = () => {
    setCustomerEmail(""); setOrders([]);
    try { localStorage.removeItem("dd_customer_email"); } catch {}
  };

  const statusColor = (s: string) => {
    if (s === "completed" || s === "delivered") return "#1DBF73";
    if (s === "in_progress" || s === "processing") return "#446EE7";
    if (s === "cancelled") return "#DC2626";
    return "#F59E0B";
  };

  if (!isLoggedIn) return (
    <section className="gigs-page">
      <div className="gigs-page-header">
        <button className="gigs-back-btn" onClick={onBack}>\u2190 Back</button>
        <h1 className="gigs-page-title">Customer Login</h1>
        <p className="gigs-page-subtitle">Sign in with the email you used when placing your order</p>
      </div>
      <div className="cust-login-box">
        <img src="/favicon-96x96.png" alt="Dean Designers" style={{width:48,height:48,borderRadius:12,marginBottom:16}} />
        <h2 style={{fontSize:18,fontWeight:800,margin:"0 0 4px",color:"#111827"}}>Welcome to Dean Designers</h2>
        <p style={{fontSize:13,color:"#6b7280",margin:"0 0 20px"}}>Enter your order email to continue</p>
        <input type="email" value={inputEmail} onChange={e => setInputEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="your@email.com"
          style={{width:"100%",padding:"12px 16px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}} />
        <button onClick={handleLogin} disabled={loading}
          style={{width:"100%",padding:"12px",background:"#1DBF73",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",opacity:loading?0.6:1}}>
          {loading ? "Checking..." : "Sign In"}
        </button>
        {error && <p style={{color:"#DC2626",fontSize:13,marginTop:12}}>{error}</p>}
      </div>
    </section>
  );

  return (
    <section className="gigs-page">
      <div className="gigs-page-header">
        <button className="gigs-back-btn" onClick={onBack}>\u2190 Back</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 className="gigs-page-title" style={{marginBottom:2}}>My Account</h1>
            <p style={{fontSize:13,color:"#6b7280",margin:0}}>{customerEmail}</p>
          </div>
          <button onClick={handleLogout} style={{padding:"8px 16px",background:"none",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:12,fontWeight:600,color:"#6b7280",cursor:"pointer"}}>Sign Out</button>
        </div>
      </div>

      <div className="cust-tabs">
        <button className={`cust-tab ${tab==="orders"?"active":""}`} onClick={()=>setTab("orders")}>
          <i className="ri-inbox-line" /> My Orders
        </button>
        <button className={`cust-tab ${tab==="chat"?"active":""}`} onClick={()=>setTab("chat")}>
          <i className="ri-chat-3-line" /> Chat with Designer
        </button>
      </div>

      {tab === "orders" && (
        <div>
          {loading && <p style={{color:"#6b7280",padding:20}}>Loading...</p>}
          {error && <p style={{color:"#DC2626",padding:20}}>{error}</p>}
          {!loading && orders.length === 0 && (
            <div style={{textAlign:"center",padding:"40px 20px",color:"#6b7280"}}>
              <i className="ri-inbox-line" style={{fontSize:48,opacity:0.3,display:"block",marginBottom:12}} />
              <p>No orders found.</p>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {orders.map((o: any) => (
              <div key={o.id} style={{background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"16px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}>
                  <div>
                    <span style={{fontSize:15,fontWeight:700,color:"#111827"}}>{o.service === "logo" ? "Logo Design" : "Clothing Design"}</span>
                    <span style={{fontSize:12,color:"#6b7280",marginLeft:8}}>{o.package_name || o.badge || ""}</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:6,background:statusColor(o.status||"pending")+"15",color:statusColor(o.status||"pending"),textTransform:"uppercase"}}>{o.status||"pending"}</span>
                </div>
                <div style={{display:"flex",gap:16,fontSize:12,color:"#6b7280",flexWrap:"wrap"}}>
                  <span><strong>Brand:</strong> {o.brand_name||"-"}</span>
                  <span><strong>Qty:</strong> {o.qty||1}</span>
                  <span><strong>Total:</strong> ${Number(o.total_price||o.price||0).toFixed(2)}</span>
                  <span><strong>Date:</strong> {new Date(o.created_at).toLocaleDateString()}</span>
                </div>
                {o.brief && <p style={{fontSize:12,color:"#374151",marginTop:8,lineHeight:1.5,background:"#f9fafb",padding:"8px 12px",borderRadius:8}}>{o.brief.substring(0,200)}{o.brief.length>200?"...":""}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "chat" && (
        <div style={{minHeight:400}}>
          <ChatWidget orderEmail={customerEmail} embedded />
        </div>
      )}
    </section>
  );
}

// ─── GigCard component (Fiverr-style) ───────────────────────
function GigCard({ gig, onOrder }: { gig: Gig; onOrder: (gig: Gig) => void }) {
  const [activeTab, setActiveTab] = useState<"basic"|"standard"|"premium">("standard");
  const [slideIdx, setSlideIdx] = useState(0);
  const imgs = (gig.gallery_urls && gig.gallery_urls.length > 0) ? gig.gallery_urls.slice(0,5) : (gig.cover_url ? [gig.cover_url] : []);

  const tier = activeTab === "basic"
    ? { price: gig.basic_price, delivery: gig.basic_delivery, revisions: gig.basic_revisions, features: gig.basic_features, desc: gig.basic_desc }
    : activeTab === "standard"
    ? { price: gig.standard_price, delivery: gig.standard_delivery, revisions: gig.standard_revisions, features: gig.standard_features, desc: gig.standard_desc }
    : { price: gig.premium_price, delivery: gig.premium_delivery, revisions: gig.premium_revisions, features: gig.premium_features, desc: gig.premium_desc };

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(gig.rating) ? "★" : "☆").join("");

  return (
    <article className="gig-card">
      {imgs.length > 0 ? (
        <div className="gig-gallery">
          <div className="gig-gallery-track" style={{transform:`translateX(-${slideIdx*100}%)`}}>
            {imgs.map((src, i) => (
              <img key={i} src={src} alt={i===0 ? gig.title : ""} className="gig-gallery-slide" />
            ))}
          </div>
          {imgs.length > 1 && (
            <>
              <button className="gig-gallery-btn gig-gallery-prev" onClick={() => setSlideIdx(i => (i - 1 + imgs.length) % imgs.length)}>‹</button>
              <button className="gig-gallery-btn gig-gallery-next" onClick={() => setSlideIdx(i => (i + 1) % imgs.length)}>›</button>
              <div className="gig-gallery-dots">
                {imgs.map((_, i) => <span key={i} className={`gig-gallery-dot ${i===slideIdx?"active":""}`} />)}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="gig-cover-placeholder"><i className="ri-palette-line" style={{fontSize:48,color:"rgba(29,191,115,0.3)"}} /></div>
      )}
      <div className="gig-body">
        <div className="gig-seller">
          <img className="gig-seller-avatar" src="/favicon-96x96.png" alt="Dean Designers" />
          <div className="gig-seller-info">
            <span className="gig-seller-name">Dean Designers</span>
            <span className="gig-seller-level">Top Rated Seller</span>
          </div>
        </div>
        <h3 className="gig-title">{gig.title}</h3>
        <p className="gig-short-desc">{gig.short_desc}</p>
        <div className="gig-rating">
          <span className="gig-stars">{stars}</span>
          <span className="gig-rating-num">{gig.rating.toFixed(1)}</span>
          <span className="gig-review-count">({gig.review_count})</span>
          <span className="gig-orders">{gig.orders_count}+ orders</span>
        </div>

        {/* Pricing tabs */}
        <div className="gig-tabs">
          <button className={`gig-tab ${activeTab==="basic"?"active":""}`} onClick={()=>setActiveTab("basic")}>Basic</button>
          <button className={`gig-tab ${activeTab==="standard"?"active":""}`} onClick={()=>setActiveTab("standard")}>Standard</button>
          <button className={`gig-tab ${activeTab==="premium"?"active":""}`} onClick={()=>setActiveTab("premium")}>Premium</button>
        </div>
        <div className="gig-tier">
          <div className="gig-tier-price">${tier.price}<span>/concept</span></div>
          <p className="gig-tier-desc">{tier.desc}</p>
          <div className="gig-tier-meta">
            <span><i className="ri-time-line" /> {tier.delivery}-day delivery</span>
            <span><i className="ri-refresh-line" /> {tier.revisions}</span>
          </div>
          <ul className="gig-tier-features">
            {(typeof tier.features === "string" ? JSON.parse(tier.features) : tier.features).map((f: string, i: number) => (
              <li key={i}><i className="ri-check-line" /> {f}</li>
            ))}
          </ul>
        </div>
        <button className="gig-order-btn" onClick={() => onOrder(gig)}>
          Continue →
        </button>
      </div>
    </article>
  );
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
          Trusted by <span>Brands Worldwide</span> Who Create Clothing Design With Us
        </h2>
        <p className="testimonials-sub">
          Real feedback from our clients. 136,000+ designs completed for 7,000+ brands since 2018.
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

// ─── Contextual Step Guide (appears on each wizard step) ──
const STEP_GUIDES: Record<number, { icon: string; title: string; color: string; tips: string[] }> = {
  1: {
    icon: "ri-palette-line", title: "Choose Service", color: "#1DBF73",
    tips: [
      "Clothing Design — t-shirts, hoodies, jerseys, streetwear, all apparel",
      "Logo Brand Design — logos, icons, full brand identity",
    ],
  },
  2: {
    icon: "ri-user-line", title: "Your Info", color: "#8B5CF6",
    tips: [
      "Email — your order confirmation and login link will be sent here",
      "WhatsApp — designer contacts you here if needed",
      "Instagram — helps designer understand your brand style",
    ],
  },
  3: {
    icon: "ri-apps-line", title: "Concepts", color: "#F59E0B",
    tips: [
      "1 concept = 1 unique design variation to choose from",
      "More concepts = more options. We recommend 2–3",
    ],
  },
  4: {
    icon: "ri-edit-line", title: "Design Brief", color: "#3B82F6",
    tips: [
      "Describe your style: streetwear, vintage, minimal, sporty, etc.",
      "Mention colors, text, and any must-haves",
      "Upload reference images for best results",
    ],
  },
  5: {
    icon: "ri-box-3-line", title: "Package", color: "#EC4899",
    tips: [
      "Basic — simple design, limited revisions",
      "Standard — detailed design + mockup, more revisions",
      "Premium — full package, unlimited revisions, priority",
    ],
  },
  6: {
    icon: "ri-bank-card-line", title: "Payment", color: "#14B8A6",
    tips: [
      "Pay with PayPal or debit/credit card (Visa, Mastercard)",
      "After payment you'll receive a confirmation email with your login link",
      "Use email + code to track order, chat with designer, download files",
    ],
  },
};

function StepGuide({ stepNum }: { stepNum: number }) {
  const [open, setOpen] = useState(false);
  const guide = STEP_GUIDES[stepNum];
  if (!guide) return null;

  return (
    <div style={{marginBottom:16}}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width:"100%",
          display:"flex",
          alignItems:"center",
          gap:10,
          padding:"10px 14px",
          background: open ? `${guide.color}10` : "#F9FAFB",
          border: `1px solid ${open ? guide.color + "30" : "#E5E7EB"}`,
          borderRadius: open ? "10px 10px 0 0" : 10,
          cursor:"pointer",
          fontFamily:"inherit",
          transition:"all .2s",
        }}
      >
        <i className={guide.icon} style={{fontSize:15,color:guide.color,flexShrink:0}} />
        <span style={{fontSize:12.5,fontWeight:600,color:"#374151",flex:1,textAlign:"left"}}>
          Step {stepNum}: {guide.title}
        </span>
        <span style={{fontSize:11,color:guide.color,fontWeight:600}}>{open ? "Hide" : "Guide"}</span>
        <i className={open ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} style={{fontSize:16,color:guide.color}} />
      </button>
      {open && (
        <div style={{
          padding:"14px 16px",
          background:"#fff",
          border:`1px solid ${guide.color}20`,
          borderTop:"none",
          borderRadius:"0 0 10px 10px",
          animation:"fadeUp .2s",
        }}>
          {guide.tips.map((tip, i) => (
            <div key={i} style={{display:"flex",gap:8,marginBottom: i < guide.tips.length - 1 ? 10 : 0,alignItems:"flex-start"}}>
              <i className="ri-checkbox-circle-fill" style={{fontSize:13,color:guide.color,flexShrink:0,marginTop:2}} />
              <span style={{fontSize:12.5,color:"#4B5563",lineHeight:1.6}}>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 1 ────────────────────────────────────────────────
// Rotating background slideshow for service cards (changes every 2s)
const CLOTHING_SLIDES = [
  "/clothing-1.jpg",
  "/clothing-2.png",
  "/clothing-3.png",
];
const LOGO_SLIDES = [
  "/logo-1.png",
  "/logo-2.png",
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
      <StepGuide stepNum={1} />
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
            <i className="ri-t-shirt-2-line" style={{fontSize:28}} />
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
            <i className="ri-stack-line" style={{fontSize:28}} />
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
      <StepGuide stepNum={2} />
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
              <i className="ri-whatsapp-fill" style={{fontSize:14,color:"#25D366"}} />
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
              <i className="ri-instagram-fill" style={{fontSize:14,color:"#E4405F"}} />
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
      <StepGuide stepNum={3} />
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
    try {
      const res = await fetch("/api/ai-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "brief",
          brandName: wizardBrand,
          serviceType: wizardService,
          concept: answers.concept,
          colors: answers.colors,
          references: answers.references,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate brief");
      }
      onChange(data.brief);
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
      <StepGuide stepNum={4} />
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
          <i className="ri-image-line" style={{fontSize:16}} />
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
                <i className="ri-upload-2-line" style={{fontSize:18}} />
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
      <StepGuide stepNum={5} />
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
          const { raw: rawTotal, final: finalPrice, discount, pct } = calcPrice(pkg, state);
          const discountLabel = pct > 0 ? `${pct}% OFF` : "";

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
        <i className="ri-question-line" style={{fontSize:16}} />
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
            After payment, you'll receive a confirmation email. You can log in to your Order Tracker using your email to chat directly with your designer.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PayPal Checkout Buttons (SERVER-SIDE price — P1 fix) ──
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

  return (
    <div className="paypal-checkout">
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
          return actions.order!.capture().then(async () => {
            // Save order FIRST before showing success (fixes race condition)
            try {
              const result = await fetch("/api/save-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderData, capturedAmount: finalPrice }),
              }).then(r => r.json());
              if (result.orderId) {
                try { sessionStorage.setItem("dd_last_order_id", result.orderId); } catch {}
              }
              console.log("Order saved:", result.orderId);
            } catch (e) {
              console.error("Order save failed:", e);
            }
            // Send email (fire and forget)
            emailjs.send(EJS_SERVICE, EJS_TEMPLATE, emailData, EJS_KEY)
              .catch((e: unknown) => console.error("Email failed:", e));
            // NOW show success + redirect
            onSuccess();
          });
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
          setErrMsg("Payment failed. Please try again or contact us on WhatsApp: +62 831-3153-3097");
        }}
        onCancel={() => setErrMsg("Payment cancelled.")}
      />
      {errMsg && <p className="payment-error-msg">⚠️ {errMsg}</p>}
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
      // Save customer email for auto-login
      try { localStorage.setItem("dd_customer_email", state.email.toLowerCase()); } catch {}
      const timer = setTimeout(() => {
        window.location.href = `/order-tracker.html?email=${encodeURIComponent(state.email)}`;
      }, 4000);
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
            href={`/order-tracker.html?email=${encodeURIComponent(state.email)}`}
            className="btn-track-order btn-track-primary"
          >
            <i className="ri-arrow-right-s-line" style={{fontSize:18}} />
            Continue to Order Dashboard
          </a>
        </div>
      </div>
    );
  }


  return (
    <div className="step-panel">
      <StepGuide stepNum={6} />
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
            <i className="ri-bank-card-line" style={{fontSize:18}} />
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
              <i className="ri-information-line" style={{fontSize:16}} />
            </div>
            <span className="hiw-title">What happens after payment?</span>
          </div>
          <div className="hiw-steps">
            <div className="hiw-step">
              <div className="hiw-num">
                <i className="ri-chat-3-line" style={{fontSize:16}} />
              </div>
              <div className="hiw-text">
                <strong>Send your brief &amp; we're instantly notified</strong>
                <span>The moment you pay, your designer is instantly notified. Log in to your Order Tracker to chat, share details, and track progress in real time.</span>
              </div>
            </div>
            <div className="hiw-connector" />
            <div className="hiw-step">
              <div className="hiw-num">
                <i className="ri-edit-line" style={{fontSize:16}} />
              </div>
              <div className="hiw-text">
                <strong>Designer starts working</strong>
                <span>Your project begins within 24 hours</span>
              </div>
            </div>
            <div className="hiw-connector" />
            <div className="hiw-step">
              <div className="hiw-num">
                <i className="ri-eye-line" style={{fontSize:16}} />
              </div>
              <div className="hiw-text">
                <strong>Review &amp; revisions</strong>
                <span>Receive drafts, give feedback — {pkg.revisions} included</span>
              </div>
            </div>
            <div className="hiw-connector" />
            <div className="hiw-step">
              <div className="hiw-num hiw-num-final">
                <i className="ri-checkbox-circle-line" style={{fontSize:16}} />
              </div>
              <div className="hiw-text">
                <strong>Files delivered</strong>
                <span>Final designs sent to your email, WhatsApp &amp; Instagram</span>
              </div>
            </div>
          </div>
          <div className="hiw-guarantee">
            <i className="ri-lock-line" style={{fontSize:14}} />
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
function ArticlesFullPage({ onBack }: { onBack: () => void }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
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
    const slug = a.slug || a.id;
    window.history.pushState({}, "", `/articles/${slug}`);
    window.scrollTo(0,0);
  };

  const closeArticle = () => {
    setSelected(null);
    window.history.pushState({}, "", "/articles");
    window.scrollTo(0,0);
  };

  useEffect(() => {
    const onPop = () => {
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (parts[0] === "articles" && parts[1]) {
        const match = articles.find((a: any) => a.slug === parts[1]);
        setSelected(match || null);
      } else {
        setSelected(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [articles]);

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags || []))).slice(0, 12);
  const filtered = articles.filter((a) => {
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || (a.tags || []).includes(activeTag);
    return matchSearch && matchTag;
  });

  const BackButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#fff",border:"1.5px solid #E2E8F0",color:"#374151",fontSize:13,fontWeight:600,cursor:"pointer",padding:"8px 16px",borderRadius:8,transition:"all .15s",fontFamily:"inherit"}}
      onMouseOver={(e)=>{(e.currentTarget as HTMLElement).style.borderColor="#1DBF73";(e.currentTarget as HTMLElement).style.color="#1DBF73";}}
      onMouseOut={(e)=>{(e.currentTarget as HTMLElement).style.borderColor="#E2E8F0";(e.currentTarget as HTMLElement).style.color="#374151";}}>
      <i className="ri-arrow-left-line" style={{fontSize:14}} />
      {label}
    </button>
  );

  // ── ARTICLE DETAIL VIEW ──
  if (selected) {
    const readTime = selected.content ? Math.max(1, Math.ceil(selected.content.replace(/<[^>]*>/g,"").split(/\s+/).length / 200)) : 3;
    return (
      <div style={{background:"#FAFAFA",minHeight:"100vh",fontFamily:"inherit"}}>
        {/* Sticky top bar */}
        <div style={{background:"#fff",borderBottom:"1px solid #F0F0F0",padding:"12px 24px",position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <BackButton onClick={closeArticle} label="All Articles" />
            <span style={{color:"#D1D5DB",fontSize:14}}>›</span>
            <span style={{fontSize:13,color:"#6B7280",maxWidth:300,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.title}</span>
          </div>
          <BackButton onClick={onBack} label="Home" />
        </div>

        <div style={{maxWidth:740,margin:"0 auto",padding:"48px 24px 100px"}}>
          {/* Tags row — single line, clean pills */}
          {selected.tags?.length > 0 && (
            <div style={{display:"flex",gap:6,flexWrap:"nowrap",overflowX:"auto",marginBottom:20,paddingBottom:4,scrollbarWidth:"none"}}>
              {selected.tags.map((t: string, i: number) => (
                <span key={i} style={{flexShrink:0,background:"#F3F4F6",color:"#374151",padding:"4px 12px",borderRadius:4,fontSize:11,fontWeight:600,letterSpacing:".4px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{t}</span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 style={{fontSize:"clamp(26px,4.5vw,40px)",fontWeight:800,lineHeight:1.15,letterSpacing:"-0.5px",color:"#111827",marginBottom:18,margin:"0 0 18px"}}>{selected.title}</h1>

          {/* Meta row */}
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32,paddingBottom:24,borderBottom:"1px solid #F0F0F0",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:32,height:32,background:"linear-gradient(135deg,#1DBF73,#17B169)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <i className="ri-user-line" style={{fontSize:14,color:"#fff"}} />
              </div>
              <span style={{fontSize:13,fontWeight:600,color:"#111827"}}>{selected.author_name || "Dean Designers"}</span>
            </div>
            <span style={{color:"#D1D5DB",fontSize:13}}>·</span>
            <span style={{fontSize:13,color:"#6B7280"}}>{new Date(selected.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
            <span style={{color:"#D1D5DB",fontSize:13}}>·</span>
            <span style={{fontSize:13,color:"#6B7280"}}>{readTime} min read</span>
          </div>

          {/* Cover image */}
          {selected.cover_image && (
            <div style={{borderRadius:12,overflow:"hidden",marginBottom:36,boxShadow:"0 2px 20px rgba(0,0,0,0.08)"}}>
              <div style={{position:"relative",aspectRatio:"16/9",overflow:"hidden"}}>
                <img src={selected.cover_image} alt={selected.title} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",display:"block"}} />
              </div>
            </div>
          )}

          {/* Article body */}
          <div className="article-body" style={{fontSize:16.5,lineHeight:1.85,color:"#374151",letterSpacing:".01em"}} dangerouslySetInnerHTML={{__html: selected.content}} />

          {/* Tags at bottom */}
          {selected.tags?.length > 0 && (
            <div style={{marginTop:40,paddingTop:24,borderTop:"1px solid #F0F0F0"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10}}>Topics</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {selected.tags.map((t: string, i: number) => (
                  <button key={i} onClick={() => { closeArticle(); setActiveTag(t); }} style={{background:"#F3F4F6",color:"#374151",padding:"5px 12px",borderRadius:4,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",fontFamily:"inherit"}}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div style={{marginTop:48,padding:"32px 28px",background:"linear-gradient(135deg,#0F1115,#1a2420)",borderRadius:16,textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#1DBF73",marginBottom:8,textTransform:"uppercase",letterSpacing:1.5}}>Ready to build your brand?</div>
            <h3 style={{fontSize:22,fontWeight:800,color:"#fff",marginBottom:8,lineHeight:1.2}}>Get professional clothing & logo design</h3>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.55)",marginBottom:20}}>5.0★ · 136,000+ designs · 7,000+ brands · Since 2018</p>
            <button onClick={onBack} style={{background:"#1DBF73",color:"#fff",border:"none",padding:"13px 28px",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Start Your Order →
            </button>
          </div>

          {/* Bottom back button */}
          <div style={{marginTop:40,display:"flex",gap:12}}>
            <BackButton onClick={closeArticle} label="← Back to Articles" />
            <BackButton onClick={onBack} label="Go to Homepage" />
          </div>
        </div>
      </div>
    );
  }

  // ── ARTICLES LIST VIEW ──
  return (
    <div style={{background:"#FAFAFA",minHeight:"100vh",fontFamily:"inherit"}}>
      {/* Sticky header */}
      <div style={{background:"#fff",borderBottom:"1px solid #F0F0F0",padding:"12px 24px",position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <BackButton onClick={onBack} label="Home" />
        <div style={{flex:1,maxWidth:360,position:"relative"}}>
          <i className="ri-search-line" style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:14,color:"#9CA3AF"}} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." style={{width:"100%",paddingLeft:34,paddingRight:12,paddingTop:8,paddingBottom:8,border:"1.5px solid #E5E7EB",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box" as const,background:"#F9FAFB",color:"#111827"}} />
        </div>
        <span style={{fontSize:12,color:"#9CA3AF",fontWeight:500,marginLeft:"auto"}}>{filtered.length} article{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div style={{maxWidth:1120,margin:"0 auto",padding:"40px 20px 80px"}}>
        {/* Page header */}
        <div style={{marginBottom:36}}>
          <div style={{display:"inline-block",background:"#F0FDF4",color:"#16A34A",padding:"4px 12px",borderRadius:4,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Design Blog</div>
          <h1 style={{fontSize:"clamp(26px,4vw,38px)",fontWeight:800,letterSpacing:"-0.5px",color:"#111827",marginBottom:8,lineHeight:1.1}}>Articles & Insights</h1>
          <p style={{fontSize:15,color:"#6B7280",maxWidth:480}}>Expert guides, trends, and behind-the-scenes from our streetwear design studio</p>
        </div>

        {/* Tag filter — single horizontal scroll row, no wrapping chaos */}
        {allTags.length > 0 && (
          <div style={{marginBottom:32}}>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none",WebkitOverflowScrolling:"touch" as any}}>
              <button onClick={() => setActiveTag("")} style={{flexShrink:0,padding:"6px 14px",borderRadius:4,border:"1.5px solid",borderColor:!activeTag?"#1DBF73":"#E5E7EB",background:!activeTag?"#F0FDF4":"#fff",color:!activeTag?"#16A34A":"#6B7280",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>All</button>
              {allTags.map((t, i) => (
                <button key={i} onClick={() => setActiveTag(activeTag === t ? "" : t)} style={{flexShrink:0,padding:"6px 14px",borderRadius:4,border:"1.5px solid",borderColor:activeTag===t?"#1DBF73":"#E5E7EB",background:activeTag===t?"#F0FDF4":"#fff",color:activeTag===t?"#16A34A":"#6B7280",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",whiteSpace:"nowrap"}}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* States */}
        {loading ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{background:"#fff",borderRadius:10,overflow:"hidden",border:"1px solid #F0F0F0"}}>
                <div style={{aspectRatio:"16/9",background:"linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}} />
                <div style={{padding:18}}><div style={{height:10,background:"#F3F4F6",borderRadius:3,marginBottom:10,width:"50%"}} /><div style={{height:16,background:"#F3F4F6",borderRadius:3,marginBottom:8}} /><div style={{height:12,background:"#F3F4F6",borderRadius:3,width:"75%"}} /></div>
              </div>
            ))}
          </div>
        ) : !filtered.length ? (
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <i className="ri-file-text-line" style={{fontSize:40,color:"#D1D5DB",margin:"0 auto 14px",display:"block"}} />
            <p style={{fontSize:15,color:"#9CA3AF",fontWeight:600,margin:"0 0 4px"}}>No articles found</p>
            <p style={{fontSize:13,color:"#D1D5DB",margin:0}}>Try a different search or tag</p>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {filtered.length > 0 && !search && !activeTag && (
              <div onClick={() => openArticle(filtered[0])}
                style={{background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #F0F0F0",cursor:"pointer",marginBottom:28,display:"grid",gridTemplateColumns:"1.1fr 0.9fr",boxShadow:"0 1px 6px rgba(0,0,0,0.04)",transition:"all .2s"}}
                onMouseOver={(e)=>{(e.currentTarget as HTMLElement).style.boxShadow="0 6px 28px rgba(0,0,0,0.08)";(e.currentTarget as HTMLElement).style.transform="translateY(-2px)";}}
                onMouseOut={(e)=>{(e.currentTarget as HTMLElement).style.boxShadow="0 1px 6px rgba(0,0,0,0.04)";(e.currentTarget as HTMLElement).style.transform="";}}>
                <div style={{position:"relative",aspectRatio:"3/2",overflow:"hidden"}}>
                  {filtered[0].cover_image
                    ? <img src={filtered[0].cover_image} alt={filtered[0].title} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} />
                    : <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#0F1115,#1a2420)"}} />
                  }
                </div>
                <div style={{padding:"32px 28px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                    <span style={{background:"#F0FDF4",color:"#16A34A",padding:"3px 10px",borderRadius:4,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>Featured</span>
                    <span style={{fontSize:11,color:"#9CA3AF"}}>{new Date(filtered[0].created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                  </div>
                  <h2 style={{fontSize:22,fontWeight:800,lineHeight:1.25,color:"#111827",marginBottom:10,margin:"0 0 10px"}}>{filtered[0].title}</h2>
                  {filtered[0].excerpt && <p style={{fontSize:13.5,color:"#6B7280",lineHeight:1.65,marginBottom:18,margin:"0 0 18px"}}>{filtered[0].excerpt.substring(0,140)}{filtered[0].excerpt.length > 140 ? "..." : ""}</p>}
                  {/* Tags in featured — clean row */}
                  {filtered[0].tags?.length > 0 && (
                    <div style={{display:"flex",gap:4,flexWrap:"nowrap",overflowX:"auto",marginBottom:18,scrollbarWidth:"none"}}>
                      {filtered[0].tags.slice(0,3).map((t: string, i: number) => (
                        <span key={i} style={{flexShrink:0,background:"#F3F4F6",color:"#6B7280",padding:"3px 8px",borderRadius:3,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".3px"}}>{t}</span>
                      ))}
                    </div>
                  )}
                  <div style={{display:"flex",alignItems:"center",gap:6,color:"#1DBF73",fontSize:13,fontWeight:700}}>
                    Read article <i className="ri-arrow-right-line" style={{fontSize:13}} />
                  </div>
                </div>
              </div>
            )}

            {/* Article grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
              {(search || activeTag ? filtered : filtered.slice(1)).map((a) => (
                <div key={a.id} onClick={() => openArticle(a)}
                  style={{background:"#fff",borderRadius:10,overflow:"hidden",border:"1px solid #F0F0F0",cursor:"pointer",transition:"all .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",display:"flex",flexDirection:"column"}}
                  onMouseOver={(e)=>{(e.currentTarget as HTMLElement).style.transform="translateY(-3px)";(e.currentTarget as HTMLElement).style.boxShadow="0 8px 24px rgba(0,0,0,0.08)";(e.currentTarget as HTMLElement).style.borderColor="#E5E7EB";}}
                  onMouseOut={(e)=>{(e.currentTarget as HTMLElement).style.transform="";(e.currentTarget as HTMLElement).style.boxShadow="0 1px 3px rgba(0,0,0,0.04)";(e.currentTarget as HTMLElement).style.borderColor="#F0F0F0";}}>
                  {/* Thumbnail — aspect-ratio 16:9, never crops unexpectedly */}
                  <div style={{position:"relative",aspectRatio:"16/9",overflow:"hidden",flexShrink:0}}>
                    {a.cover_image
                      ? <img src={a.cover_image} alt={a.title} loading="lazy" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",transition:"transform .3s"}}
                          onMouseOver={(e)=>{(e.currentTarget as HTMLImageElement).style.transform="scale(1.04)";}}
                          onMouseOut={(e)=>{(e.currentTarget as HTMLImageElement).style.transform="";}} />
                      : <div style={{position:"absolute",inset:0,background:"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <i className="ri-image-line" style={{fontSize:32,color:"#D1D5DB"}} />
                        </div>
                    }
                  </div>
                  <div style={{padding:"16px 18px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                    {/* Tags — single row, scroll not wrap */}
                    {a.tags?.length > 0 && (
                      <div style={{display:"flex",gap:4,overflowX:"auto",marginBottom:10,paddingBottom:2,scrollbarWidth:"none",flexWrap:"nowrap"}}>
                        {a.tags.slice(0,3).map((t: string, i: number) => (
                          <span key={i} style={{flexShrink:0,background:"#F3F4F6",color:"#6B7280",padding:"2px 7px",borderRadius:3,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".3px",whiteSpace:"nowrap"}}>{t}</span>
                        ))}
                      </div>
                    )}
                    <h3 style={{fontSize:15,fontWeight:700,lineHeight:1.4,color:"#111827",marginBottom:8,margin:"0 0 8px",flex:1}}>{a.title}</h3>
                    {a.excerpt && <p style={{fontSize:12.5,color:"#6B7280",lineHeight:1.6,marginBottom:12,margin:"0 0 12px"}}>{a.excerpt.substring(0,100)}{a.excerpt.length > 100 ? "..." : ""}</p>}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"auto"}}>
                      <span style={{fontSize:11,color:"#9CA3AF"}}>{new Date(a.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                      <span style={{fontSize:11,color:"#1DBF73",fontWeight:600}}>Read →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Order Guide (collapsible) ────────────────────────────
function OrderGuide() {
  const [open, setOpen] = useState(false);

  const steps = [
    {
      num: "01",
      icon: "ri-palette-line",
      title: "Pilih Layanan",
      desc: "Di halaman utama, kamu akan melihat 2 layanan utama: Clothing Design (desain kaos, hoodie, jersey, streetwear) dan Logo Brand Design (logo, identitas visual brand). Klik layanan yang kamu butuhkan, lalu scroll ke bawah dan klik tombol hijau \"Start Your Order\" untuk mulai proses pemesanan.",
      color: "#1DBF73",
    },
    {
      num: "02",
      icon: "ri-box-3-line",
      title: "Pilih Paket & Jumlah Konsep",
      desc: "Choose from 3 packages: Basic (simple design, limited revisions), Standard (detailed design + mockup, more revisions), or Premium (full package, unlimited revisions, priority). Also select how many concepts you want — 2 concepts means you get 2 different design variations to choose from. Price is calculated automatically as package × concepts.",
      color: "#3B82F6",
    },
    {
      num: "03",
      icon: "ri-edit-line",
      title: "Isi Brief Desain",
      desc: "This is the most important step! Describe your design in detail: brand name, concept/theme (e.g. Japanese streetwear, vintage, minimal), colors you want, any text or copy that must appear, and reference images. You can upload reference images directly from your phone or laptop. The more detail you provide, the more accurate the result — fewer revisions needed.",
      color: "#F59E0B",
    },
    {
      num: "04",
      icon: "ri-user-line",
      title: "Isi Data Kontak",
      desc: "Enter: (1) Active email — this is your Order Tracker login and where your confirmation will be sent. (2) WhatsApp number — for quick communication if your designer needs clarification. (3) Instagram (optional) — helps your designer understand your brand style. Make sure your email is correct.",
      color: "#8B5CF6",
    },
    {
      num: "05",
      icon: "ri-bank-card-line",
      title: "Secure Payment via PayPal",
      desc: "Click the PayPal button to pay. You can pay with: (1) Your PayPal account, or (2) Visa/Mastercard debit or credit card — no PayPal account needed. Price shown is the final amount in USD. No hidden fees. Payment is processed securely through PayPal — your card details never touch our servers.",
      color: "#EC4899",
    },
    {
      num: "06",
      icon: "ri-mail-send-line",
      title: "Receive Confirmation Email",
      desc: "After payment, you'll immediately receive a confirmation email from Dean Designers with your order summary. Use your email to log in to the Order Tracker to check progress, chat with your designer, and download your files. If the email doesn't arrive within 5 minutes, check your spam folder.",
      color: "#14B8A6",
    },
    {
      num: "07",
      icon: "ri-chat-3-line",
      title: "Track Progress & Chat with Your Designer",
      desc: "Open the Order Tracker → enter your email → you're in. From your dashboard you can: (1) Track order status in real time (New → In Progress → Review → Revision → Completed → Delivered), (2) Chat directly with your designer — text, images, voice notes, (3) Request revisions by describing the changes you want. You'll get notified every time your designer sends an update.",
      color: "#F97316",
    },
    {
      num: "08",
      icon: "ri-download-line",
      title: "Terima & Download File Final",
      desc: "Once your design is approved and all revisions are complete, your designer will deliver the final files in production-ready formats: vector files (AI/EPS/SVG), print-ready PDF, transparent PNG, and a mockup preview. Order status changes to \"Delivered\". Download all files directly from your Order Tracker — stored permanently, accessible anytime with your email.",
      color: "#1DBF73",
    },
  ];

  return (
    <section style={{maxWidth:1120,margin:"0 auto",padding:"0 20px 40px"}}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          background:"linear-gradient(135deg,#0F1115,#1a2420)",
          border:"1px solid rgba(29,191,115,0.2)",
          borderRadius:open ? "16px 16px 0 0" : 16,
          padding:"20px 24px",
          cursor:"pointer",
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          transition:"all .2s",
        }}
        onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(29,191,115,0.5)"; }}
        onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(29,191,115,0.2)"; }}
      >
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:"rgba(29,191,115,0.15)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <i className="ri-book-open-line" style={{fontSize:18,color:"#1DBF73"}} />
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"#fff",letterSpacing:"-0.2px"}}>Panduan Cara Order</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:2}}>Step-by-step dari pemesanan hingga file diterima</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,fontWeight:600,color:"#1DBF73",textTransform:"uppercase",letterSpacing:1}}>{open ? "Tutup" : "Lihat"}</span>
          <i className={open ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} style={{fontSize:20,color:"#1DBF73",transition:"transform .2s"}} />
        </div>
      </div>

      {open && (
        <div style={{
          background:"#fff",
          border:"1px solid #E5E7EB",
          borderTop:"none",
          borderRadius:"0 0 16px 16px",
          padding:"28px 24px 32px",
          animation:"fadeUp .3s",
        }}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
            {steps.map((s, i) => (
              <div key={i} style={{
                background:"#FAFAFA",
                border:"1px solid #F0F0F0",
                borderRadius:12,
                padding:"20px 18px",
                position:"relative",
                overflow:"hidden",
                transition:"all .2s",
              }}
                onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.borderColor = s.color; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#F0F0F0"; (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
              >
                <div style={{position:"absolute",top:12,right:14,fontSize:32,fontWeight:800,color:s.color,opacity:0.08}}>{s.num}</div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:32,height:32,background:s.color + "18",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <i className={s.icon} style={{fontSize:16,color:s.color}} />
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:s.color,letterSpacing:".5px"}}>STEP {s.num}</div>
                </div>
                <div style={{fontSize:14,fontWeight:700,color:"#111827",marginBottom:6,lineHeight:1.3}}>{s.title}</div>
                <div style={{fontSize:12.5,color:"#6B7280",lineHeight:1.65}}>{s.desc}</div>
              </div>
            ))}
          </div>

          <div style={{marginTop:24,padding:"18px 20px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,display:"flex",alignItems:"flex-start",gap:10}}>
            <i className="ri-lightbulb-line" style={{fontSize:18,color:"#16A34A",flexShrink:0,marginTop:1}} />
            <div style={{fontSize:12.5,color:"#15803D",lineHeight:1.65}}>
              <strong>Tips:</strong> Save your confirmation email. You'll need your email address to access the Order Tracker, chat with your designer, and download your final files. Questions? Contact us on WhatsApp: <strong>+62 831-3153-3097</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── FAQ Section ───────────────────────────────────────────
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  
  const faqs = [
    {
      q: "How does the design process work?",
      a: "After you place your order, we receive your brief instantly. Within 24 hours, your dedicated designer reviews everything and starts working. You'll receive draft concepts within your package's delivery window, then we refine based on your feedback until you're 100% happy. Final files are delivered via email and your order tracker page.",
    },
    {
      q: "What if I don't like the designs?",
      a: "We have a 100% money-back guarantee. If you're not satisfied with the work after revisions, you can request a full refund — no questions asked. Most clients love their first draft, but we'll keep refining until it's exactly what you envisioned.",
    },
    {
      q: "How many revisions do I get?",
      a: "Each package includes a different number of revisions: Basic includes 2 revisions, Standard includes 8 revisions (clothing) or 3 revisions (logo), and Premium includes unlimited revisions. Revisions are how we make sure the design is exactly right for your brand.",
    },
    {
      q: "When will I receive my designs?",
      a: "Delivery times depend on your package: Basic is 3 days, Standard is 5 days, and Premium is 7 days. Your designer starts within 24 hours of payment, and you can track progress in real-time on your order dashboard. Rush orders are available — message us for details.",
    },
    {
      q: "What file formats will I get?",
      a: "All final designs come with complete production-ready files: AI source files (Adobe Illustrator), high-resolution PNG (transparent background), JPG for web, PDF for print, and SVG for digital use. You'll have everything you need to print, post, or upload anywhere.",
    },
    {
      q: "Can I use the designs commercially?",
      a: "Absolutely. You own 100% commercial rights to all final designs once delivered. Use them on apparel, merchandise, websites, social media, business cards, or any commercial purpose. No royalties, no restrictions.",
    },
    {
      q: "Is my payment secure?",
      a: "Yes — we use PayPal for all transactions, which means bank-level encryption, buyer protection, and zero risk to you. You can pay with credit/debit card, PayPal balance, or your bank account. Your card details never touch our servers.",
    },
    {
      q: "What if I need changes after delivery?",
      a: "Within your revision window, all changes are free. After final delivery, minor tweaks (color adjustments, text changes) are often included as a courtesy. Major redesigns are quoted separately, but most clients don't need them.",
    },
    {
      q: "How do I communicate with my designer?",
      a: "You'll have direct access via our built-in chat on the order tracker page. You can also reach out via WhatsApp or email. Your designer responds within 24 hours (usually much faster) and keeps you updated at every stage.",
    },
    {
      q: "Do you sign an NDA?",
      a: "Yes, on request for Premium clients. All projects are kept strictly confidential by default — your brand, designs, and brief are never shared, displayed, or used in our portfolio without your written permission.",
    },
    {
      q: "What's your refund policy?",
      a: "Full refund within 7 days if you're not satisfied after revisions. Partial refunds available if work has been delivered but you want to cancel. Refunds processed via PayPal within 3-5 business days. Read our full terms on the order tracker.",
    },
    {
      q: "Can I order multiple designs?",
      a: "Yes! You can return to the landing page anytime from your order tracker dashboard and place additional orders. Each order gets its own dedicated tracking and designer. Volume discounts apply for 2+ concepts.",
    },
  ];

  return (
    <section className="faq-section">
      <div className="faq-inner">
        <div className="faq-header">
          <span className="faq-tag">FAQ</span>
          <h2 className="faq-title">Everything you need to know</h2>
          <p className="faq-sub">Common questions answered honestly. If you don't find what you're looking for, feel free to reach out.</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`faq-item ${openIdx === idx ? "open" : ""}`}>
              <button className="faq-q" onClick={() => setOpenIdx(openIdx === idx ? null : idx)}>
                <span>{faq.q}</span>
                <span className="faq-toggle">
                  <i className="ri-arrow-down-s-line" style={{fontSize:20}} />
                </span>
              </button>
              <div className="faq-a">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="faq-cta">
          <div className="faq-cta-icon">
            <i className="ri-shield-check-line" style={{fontSize:22}} />
          </div>
          <div>
            <strong>Ready to bring your brand to life?</strong>
            <p>100% money-back guarantee. Production-ready files. Trusted by 7,000+ brands. 136,000+ designs completed.</p>
          </div>
          <a className="faq-cta-btn" href="#wizard">
            Start Your Order
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Main App ──────────────────────────────────────────────
export default function App() {

  // ── Dynamic packages from DB (fallback to hardcoded) ────
  const { clothingPkgs, logoPkgs } = useDbPackages();
  const { gigs } = useGigs();

  // Handle gig order — pre-select service and scroll to wizard
  const handleGigOrder = (gig: Gig) => {
    // Switch to homepage, set service, and enter wizard at step 2 (brand info)
    setWizardState(p => ({ ...p, service: gig.service_type as "clothing" | "logo" }));
    setCurrentPage("home");
    goTo(2, "forward");
    setTimeout(() => {
      const el = document.getElementById("wizard");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  // ── Social Proof Toast ───────────────────────────────────
  const [toastVisible, setToastVisible] = useState(false);
  const [toastData, setToastData] = useState({ name: "", country: "", service: "", time: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<"home"|"articles"|"gigs"|"orders">(() => {
    // Read initial page from URL so refresh stays on the same page
    if (typeof window !== "undefined") {
      const path = window.location.pathname.replace(/\/$/, "");
      if (path === "/articles" || window.location.hash === "#articles") return "articles";
      if (path === "/gigs" || window.location.hash === "#gigs") return "gigs";
      if (path === "/my-orders") return "orders";
    }
    return "home";
  });

  // Keep the URL in sync with the current page (without full reload)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const targetPath = currentPage === "articles" ? "/articles" : currentPage === "gigs" ? "/gigs" : currentPage === "orders" ? "/my-orders" : "/";
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: currentPage }, "", targetPath);
    }
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.replace(/\/$/, "");
      setCurrentPage(path === "/articles" ? "articles" : path === "/gigs" ? "gigs" : path === "/my-orders" ? "orders" : "home");
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

  // ── Dynamic page title for SEO ──
  useEffect(() => {
    const titles: Record<string, string> = {
      home: "Create Clothing Design | Streetwear & Logo — Dean Designers",
      gigs: "Our Gigs — Streetwear & Logo Design Services | Dean Designers",
      articles: "Articles & Insights — Dean Designers",
      orders: "My Orders — Dean Designers",
    };
    document.title = titles[currentPage] || titles.home;
    // Dynamic meta description
    const descs: Record<string, string> = {
      home: "Create clothing design with Dean Designers — professional custom streetwear & logo design studio. 136,000+ designs, 7,000+ brands served since 2018.",
      gigs: "Browse our design gigs — custom streetwear clothing design and professional logo & brand identity packages. Starting from $50.",
      articles: "Design tips, streetwear trends, and branding insights from Dean Designers.",
      orders: "Track your order status and chat with your designer at Dean Designers.",
    };
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", descs[currentPage] || descs.home);
    // Dynamic canonical
    const canonicals: Record<string, string> = {
      home: "https://www.createclothingdesign.com/",
      gigs: "https://www.createclothingdesign.com/gigs",
      articles: "https://www.createclothingdesign.com/articles",
      orders: "https://www.createclothingdesign.com/my-orders",
    };
    const link = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute("href", canonicals[currentPage] || canonicals.home);
  }, [currentPage]);

  // Hide SEO fallback content after React renders (Google already read it on initial crawl)
  useEffect(() => {
    const el = document.getElementById("seo-fallback");
    if (el) el.style.display = "none";
  }, []);

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
            <i className="ri-menu-line" style={{fontSize:20}} />
          </button>
          <a className="nav-logo" href="#home" onClick={(e) => { e.preventDefault(); setCurrentPage("home"); window.scrollTo(0,0); }}>
            DEAN DESIGNERS
          </a>
          <a href="/order-tracker.html" className="nav-profile" title="My Orders">
            <i className="ri-user-line" style={{fontSize:18}} />
          </a>
        </div>
      </nav>

      {/* ── Drawer Overlay ── */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div className="drawer-logo">
                <i className="ri-flashlight-fill" style={{fontSize:16,color:"#fff"}} />
              </div>
              <span className="drawer-brand">Dean <span style={{color:"#1DBF73"}}>Designers</span></span>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            <div className="drawer-items">
              <a className="drawer-item" href="#home" onClick={() => { setCurrentPage("home"); setDrawerOpen(false); window.scrollTo(0,0); }}>
                <i className="ri-home-4-line" style={{fontSize:18}} />Home
              </a>
              <a className="drawer-item" href="#wizard" onClick={() => setDrawerOpen(false)}>
                <i className="ri-box-3-line" style={{fontSize:18}} />Services
              </a>
              <a className="drawer-item" href="#about" onClick={() => setDrawerOpen(false)}>
                <i className="ri-user-line" style={{fontSize:18}} />Portfolio
              </a>
              <a className="drawer-item" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("gigs"); setDrawerOpen(false); window.scrollTo(0,0); }}>
                <i className="ri-store-2-line" style={{fontSize:18}} />Gigs
              </a>
              <a className="drawer-item" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("articles"); setDrawerOpen(false); window.scrollTo(0,0); }}>
                <i className="ri-article-line" style={{fontSize:18}} />Articles
              </a>
              <div className="drawer-divider" />
              <a className="drawer-item" href="/order-tracker.html" onClick={() => setDrawerOpen(false)}>
                <i className="ri-inbox-line" style={{fontSize:18}} />My Orders
              </a>
              <a className="drawer-item" href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer">
                <i className="ri-whatsapp-fill" style={{fontSize:18}} />Contact Us
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ══ FULL ARTICLES PAGE ══ */}
      {currentPage === "articles" && (
        <ArticlesFullPage onBack={() => { setCurrentPage("home"); window.scrollTo(0,0); }} />
      )}

      {/* ══ MY ORDERS PAGE — customer order tracker ══ */}
      {currentPage === "orders" && (
        <MyOrdersPage onBack={() => { setCurrentPage("home"); window.scrollTo(0,0); }} />
      )}

      {/* ══ GIGS PAGE — Fiverr-style service listings ══ */}
      {currentPage === "gigs" && (
        <section className="gigs-page">
          <div className="gigs-page-header">
            <button className="gigs-back-btn" onClick={() => { setCurrentPage("home"); window.scrollTo(0,0); }}>
              ← Back
            </button>
            <h1 className="gigs-page-title">Our Gigs</h1>
            <p className="gigs-page-subtitle">Professional design services — choose a gig to create clothing design, logo, or brand identity</p>
          </div>
          {gigs.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 20px",color:"#6b7280"}}>
              <i className="ri-store-2-line" style={{fontSize:48,opacity:0.3,display:"block",marginBottom:12}} />
              <p>No gigs available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="gigs-grid">
              {gigs.map(gig => (
                <GigCard key={gig.id} gig={gig} onOrder={handleGigOrder} />
              ))}
            </div>
          )}
        </section>
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
              <h1 className="hero-h1">Create Clothing Design — Professional Streetwear & Logo Design Studio</h1>
              <p className="hero-sub">Custom streetwear graphics, brand identity & logo design. 136,000+ designs · 7,000+ brands · Since 2018.</p>
              <button className="hero-cta" onClick={(e) => { e.preventDefault(); e.stopPropagation(); const el = document.getElementById("wizard"); if(el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 20; window.scrollTo({ top: y, behavior: "smooth" }); } }}>
                Start Your Order
                <span className="hero-cta-arrow">→</span>
              </button>
            </div>

            {/* Scroll hint */}
            <div className="hero-scroll-hint">
              <i className="ri-arrow-down-s-line scroll-arrow" style={{fontSize:24,color:"rgba(255,255,255,0.6)"}} />
              <i className="ri-arrow-down-s-line scroll-arrow scroll-arrow-2" style={{fontSize:24,color:"rgba(255,255,255,0.3)"}} />
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
                  <i className="ri-checkbox-circle-line" style={{fontSize:18}} />
                </div>
                <div className="tb-text">
                  <strong>136K+</strong>
                  <span>Designs Delivered</span>
                </div>
              </div>
              <div className="tb-divider" />
              <div className="tb-item">
                <div className="tb-icon">
                  <i className="ri-shield-check-line" style={{fontSize:18}} />
                </div>
                <div className="tb-text">
                  <strong>100%</strong>
                  <span>Money-Back Guarantee</span>
                </div>
              </div>
              <div className="tb-divider" />
              <div className="tb-item">
                <div className="tb-icon">
                  <i className="ri-time-line" style={{fontSize:18}} />
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
                Professional studio to create clothing design and brand identity. Founded by Dean, a renowned designer in the United States. 136,000+ designs completed for 7,000+ brands since 2018.
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
                  <i className="ri-shield-check-line" style={{fontSize:22}} />
                </div>
                <strong>100% Money-Back Guarantee</strong>
                <p>Not satisfied? Get a full refund — no questions asked. Your investment is protected.</p>
              </div>
              <div className="g-card">
                <div className="g-icon">
                  <i className="ri-lock-line" style={{fontSize:22}} />
                </div>
                <strong>Secure PayPal Payment</strong>
                <p>Encrypted checkout via PayPal. Pay with card, PayPal balance, or bank — buyer protection included.</p>
              </div>
              <div className="g-card">
                <div className="g-icon">
                  <i className="ri-checkbox-circle-line" style={{fontSize:22}} />
                </div>
                <strong>Production-Ready Files</strong>
                <p>Every design comes with source files, high-res exports, and commercial license. Print-shop ready.</p>
              </div>
              <div className="g-card">
                <div className="g-icon">
                  <i className="ri-time-line" style={{fontSize:22}} />
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

      {/* ── SEO Footer with crawlable links ── */}
      {step === 1 && (
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-col">
              <h3 className="footer-heading">Create Clothing Design</h3>
              <p className="footer-text">Dean Designers is a professional studio where you can create clothing design, streetwear graphics, and logo brand identity. Trusted by 1,000+ brands from 25+ countries since 2018.</p>
            </div>
            <div className="footer-col">
              <h3 className="footer-heading">Services</h3>
              <nav>
                <a href="https://www.createclothingdesign.com" className="footer-link">Custom Clothing Design</a>
                <a href="https://www.createclothingdesign.com" className="footer-link">Streetwear Graphics</a>
                <a href="https://www.createclothingdesign.com" className="footer-link">Logo & Brand Identity</a>
                <a href="https://www.createclothingdesign.com/articles" className="footer-link">Articles & Insights</a>
              </nav>
            </div>
            <div className="footer-col">
              <h3 className="footer-heading">Connect</h3>
              <nav>
                <a href="https://www.createclothingdesign.com/gigs" className="footer-link">Our Services</a>
                <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="footer-link">WhatsApp</a>
                <a href="mailto:muhamadfaizin205@gmail.com" className="footer-link">Email Us</a>
              </nav>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Dean Designers — createclothingdesign.com · Professional Streetwear & Logo Design Studio</p>
          </div>
        </footer>
      )}
      </>
      )}
    </div>
  );
}

