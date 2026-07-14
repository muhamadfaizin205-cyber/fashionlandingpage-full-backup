# Dean Designers — Project Handoff

> Everything a new developer (or a new chat session) needs to understand and work on **createclothingdesign.com**. Read this top to bottom before touching code.

---

## 1. What this project is

A single-designer clothing/logo design studio site for **Dean Designers**. Visitors order custom design work through a guided 6-step wizard, pay with PayPal, then track their order and chat with the designer. There is also a full admin panel, an auto-publishing article system, and visitor analytics.

- **Live site:** https://www.createclothingdesign.com
- **Founder identity used in copy:** "Dean, a renowned graphic designer based in the United States." 136,000+ designs completed for 7,000+ brands since 2018. (These are marketing figures used consistently across the whole site.)

---

## 2. Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Plain CSS (single `styles.css`). **No Tailwind, no CSS-in-JS.** |
| Backend | Vercel serverless functions (`/api/*.js`, ES modules) |
| Database | Supabase (Postgres + Storage + Realtime) |
| Hosting | Vercel (auto-deploys from GitHub `main`) |
| Payments | PayPal (`@paypal/react-paypal-js`) |
| Fonts | Inter (primary), Bodoni Moda (logo), DM Mono/DM Sans (accents) |
| Icons | Remix Icon (`<i className="ri-*" />`) via CDN |

---

## 3. How deploy works

1. Work happens in `/home/claude/repo-push/` (or wherever the repo is cloned).
2. `git push origin main` → **Vercel auto-builds and deploys.** No manual deploy step.
3. Vercel runs `vite build` (from `package.json` scripts) and serves `dist/` + the `/api` functions.

**GitHub repo:** `muhamadfaizin205-cyber/fashionlandingpage-full-backup`, branch `main`.

> ⚠️ **Secret scanning:** GitHub blocks any push that contains an API key in the code. All keys must live in **Vercel Environment Variables**, never hardcoded. If a push is rejected, a key leaked into a committed file — remove it and read from `process.env` instead.

**Standard workflow for any change:**
```bash
# edit files
npx vite build          # confirm it builds with no errors
git add -A
git commit -m "..."
git push origin main    # Vercel deploys automatically
```

---

## 4. Environment variables (set in Vercel dashboard → Settings → Environment Variables)

| Variable | Used by | Notes |
|---|---|---|
| `AIVENE_API_KEY` | AI brief generator, article writer, auto-article | Aivene, OpenAI-compatible endpoint `https://api.aivene.com/v1/chat/completions`, model `gpt-4o-mini` |
| `SUPABASE_*` | serverless functions | service-role key stays server-side only |
| PayPal client/secret | PayPal functions | for order create + capture |

The **Supabase anon (public) key** is embedded in client files. The **correct anon key ends in `...vRPaxLCPNPbNnHpsAClr_gr_pCpcbvBbDdAcEGhCT_E`** — it must match across `App.tsx`, `analytics.ts`, `public/admin-orders.html`, and `public/order-tracker.html`. A past bug where the order tracker had a different (wrong) key silently broke all customer chat — watch for this.

Supabase project URL: `https://zqawpdspxdcmofnmrbku.supabase.co`

---

## 5. File map

### Frontend (root)
| File | What it is |
|---|---|
| `App.tsx` | **The whole SPA.** Homepage, the 6-step order wizard, gigs page, articles, order tracker view, reviews, toasts, all the `fv-*` Fiverr-style homepage sections. This is the biggest file — most homepage work happens here. |
| `ChatWidget.tsx` | Floating customer chat widget |
| `analytics.ts` | Visitor funnel tracking. Writes events to Supabase. Exposes `track(event, step, meta)` and `initAnalytics()`. |
| `main.tsx` | React entry point |
| `styles.css` | **All styling.** Single file. Search by class prefix. |
| `index.html` | HTML shell + all SEO meta + JSON-LD structured data + Google Fonts links |

### Serverless API (`/api`, all ES modules — use `import`, not `require`)
| File | Purpose |
|---|---|
| `save-order.js` | Writes a new order to Supabase |
| `get-orders.js` | Reads orders (admin + customer) |
| `messages.js` | Chat messages read/write (admin ↔ customer) |
| `create-paypal-order.js` / `capture-paypal-order.js` | PayPal payment flow |
| `ai-write.js` | Two actions: AI **brief** generator (order wizard step 4) + AI **article** writer (admin). Both use Aivene. |
| `auto-article.js` | Cron job: writes one SEO article every 2 days. Uses Aivene. |
| `article-ssr.js` | Serves article pages. **Bots get server-rendered HTML** (SEO); humans get the SPA. |
| `gigs-ssr.js` | Same bot-detection pattern for `/gigs`: bots get the static SEO page with Product schema, humans get the interactive SPA. |
| `sitemap.js` | Generates `/sitemap.xml` |
| `ai-image.js` | Admin-only image generation (OpenAI). Requires `x-admin-hash` header. |

### Admin & customer HTML (`/public`, standalone — not part of the React app)
| File | Purpose |
|---|---|
| `admin-orders.html` | **Full admin panel.** Orders, chat, packages, articles, gigs CRUD, **visitor funnel analytics** (Funnel tab), invites. Dark minimalist theme. Installable as a PWA (`admin-manifest.json` + `admin-sw.js`). |
| `order-tracker.html` | **Customer portal.** Email-only login, read-only orders, realtime chat with voice notes + file upload + typing indicator + online status. Zero admin code. |
| `card-payment.html` | Standalone card-payment page |

### SEO
| File | Purpose |
|---|---|
| `public/lp/*.html` | 6 static SEO landing pages (streetwear, logo, tshirt, hoodie, clothing-brand, merch) + `gigs.html`. Each is 800+ words, has Service/Product schema, internal links. Routed via `vercel.json` rewrites. |
| `public/llms.txt` | Guidance for AI assistants (ChatGPT/Claude/Perplexity) so they recommend the site. Contains explicit comparisons vs Fiverr/Upwork/print-on-demand. |
| `public/keywords.txt` | 201,000 keywords. **Blocked from Google in robots.txt** (would be keyword-stuffing). Reference/AI-bot material only. |
| `public/robots.txt` | Crawl rules |
| `index.html` | Per-page title/description/canonical is set dynamically in `App.tsx`; base tags + all JSON-LD live here |

### Portfolio images (`/public`)
`clothing-1.jpg`, `clothing-2.png`, `clothing-3.png`, `logo-1.png`, `logo-2.png` — **real design work**, used on the homepage service cards and gig pages. Prefer real portfolio over AI images for a design studio.

### SQL migrations (root) — run these in Supabase SQL Editor
| File | Creates |
|---|---|
| `analytics-migration.sql` | `visitor_events` + `visitor_sessions` tables, RLS policies, adds them to the `supabase_realtime` publication |
| `chat-migration.sql` | Chat/messages tables |
| `gigs-migration.sql` | Gigs tables (so gig cards come from DB, editable in admin) |
| `profile-migration.sql` | Admin profile |
| `invite-migration.sql` | Invite system |

---

## 6. Supabase setup

- **Tables:** orders, messages, gigs, visitor_events, visitor_sessions, user_presence, admin profile, invites.
- **Storage bucket:** `uploads` (chat images, voice notes at `voice/`, gig gallery at `gigs/`).
- **Realtime:** enabled for messages and analytics tables (required for live chat + live funnel). If realtime "doesn't work", the table probably isn't in the `supabase_realtime` publication — the migration SQL adds it.
- **RLS gotcha:** the anon key is often blocked from *reading* rows inserted by the service key. That's why **chat uses 3-second polling** as a guaranteed-delivery fallback, not pure realtime. Keep that pattern.

---

## 7. The order wizard (most important flow)

6 steps, lives in `App.tsx`:
1. **Choose service** — Clothing Design (from $50) or Logo Brand Design (from $80)
2. **Brand name**
3. **Quantity** (concepts)
4. **Brief** — free text, or **AI-Assisted Brief** (calls `ai-write.js` → Aivene, shows an interactive loading state `AiBriefProgress`)
5. **Package** — Basic / Standard / Premium (3 pricing tiers)
6. **Payment** — PayPal, then auto-login to the order tracker

Every step fires `track()` into analytics so the admin Funnel tab shows exactly where visitors drop off.

---

## 8. Visitor analytics (the Funnel tab)

- `analytics.ts` writes events directly to Supabase.
- **Visitor identity:** `visitor_id` in `localStorage` (permanent, survives tabs) + `session_id` on a 30-minute inactivity window. This is why one person = one visitor even across tabs. (A previous bug counted tabs as separate visitors — fixed by moving off `sessionStorage`.)
- Events: `page_view`, `cta_hero_click`, `step_service`…`step_payment`, `payment_completed`, `exit`, plus card/tag clicks.
- Admin Funnel tab shows: live "on site now" count, live activity feed (realtime), the 9-step conversion funnel with drop-off %, a diagnosis panel that names the worst leak, traffic sources (detects Meta Ads via `fbclid`), device split, and a recent-sessions table.

---

## 9. Design system (current look)

- **Homepage adopts Fiverr's layout patterns**, not their content. Classes prefixed `fv-*`.
  - Left-aligned hero, headline in **Inter 52px weight 400** (light, not bold — this is deliberate and is what makes it read as editorial).
  - Navbar: hamburger + gold Bodoni logo on the left; Services / My Orders / "Order now" dark button on the right. Flat white, hairline border.
  - Service cards: title on top, framed image below, `flex: 0 0 208px` fixed width. **Do not give them min-width without width** — that was the bug that blew them up full-screen.
  - Sections: trusted-by strip, service cards, 2×2 features grid, price-education banner, testimonials, about, FAQ, footer.
- **Logo:** gold Bodoni Moda wordmark, `.nav-logo-3d`, with a metallic gradient + bronze extrusion + animated specular sweep.
- **Reviews:** rotate daily (seeded shuffle by UTC date). Names generated from `NAME_GROUPS` (8,500 combinations, flag always matches name origin).
- **Punctuation:** em-dashes (—) are intentionally replaced with hyphens (-) everywhere.
- **Admin panel:** flat dark minimalist theme (`#0F1117` bg, `#161921` cards), no glass/orbs/glows.

---

## 10. Known constraints & gotchas

- **API function count:** Vercel Hobby caps at 12 serverless functions. Currently ~11. Adding features may require merging endpoints, not adding new files.
- **ES modules only** in `/api`: use `import fs from 'fs'`, never `require()`. A `require()` in `article-ssr.js` once crashed every article page with 500 errors.
- **Never hardcode API keys** — GitHub blocks the push and the provider (e.g. Groq) may auto-disable the leaked key.
- **Keep the anon key identical** across all client files.
- **Chat delivery = polling every 3s**, not pure realtime (RLS blocks realtime reads). Keep it.
- **Copyright/legal:** the site borrows Fiverr's *layout patterns* only — never their logo, copywriting, colors, or imagery.

---

## 11. Manual tasks that live outside the code (owner to-do)

- Run each `*-migration.sql` in Supabase SQL Editor (once).
- Set `AIVENE_API_KEY` (and PayPal/Supabase secrets) in Vercel env vars.
- Request indexing in Google Search Console for the homepage, `/gigs`, and the 6 landing pages.
- Growth is now bottlenecked on **backlinks and trust**, not more code: Behance/Dribbble portfolio, Reddit, Instagram, Google Business Profile. This matters more than any further SEO tweak.

---

## 12. Marketing context (why some choices were made)

- Ads are running on **Meta**. Early result: clicks but low conversion — expected at small sample sizes for a paid service. The funnel analytics exist specifically to find where paid traffic drops.
- The homepage was simplified for cold traffic: price is visible in the hero ("From $50 · No fees · No tax · 3-day delivery"), the order form sits right after the hero, and the price-education banner explains why ordering direct is cheaper than a marketplace **without inventing competitor numbers**.
- Strategic honesty baked into the copy: the site's real edge over Fiverr is **no 20% cut, direct WhatsApp, you own the files.** Fiverr still wins on cold-traffic trust (escrow), so the advice to the owner is to use both.
