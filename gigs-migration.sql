-- ═══════════════════════════════════════════════════════════
-- GIGS TABLE — Fiverr-style service listings
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gigs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_desc TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'clothing-design',
  cover_url TEXT DEFAULT '',
  gallery_urls TEXT[] DEFAULT '{}',

  -- Pricing tiers (Basic / Standard / Premium)
  basic_title TEXT DEFAULT 'Basic',
  basic_desc TEXT DEFAULT '',
  basic_price NUMERIC(10,2) NOT NULL DEFAULT 50,
  basic_delivery INT DEFAULT 3,
  basic_revisions TEXT DEFAULT '2 Revisions',
  basic_features JSONB DEFAULT '[]',

  standard_title TEXT DEFAULT 'Standard',
  standard_desc TEXT DEFAULT '',
  standard_price NUMERIC(10,2) DEFAULT 75,
  standard_delivery INT DEFAULT 3,
  standard_revisions TEXT DEFAULT '8 Revisions',
  standard_features JSONB DEFAULT '[]',

  premium_title TEXT DEFAULT 'Premium',
  premium_desc TEXT DEFAULT '',
  premium_price NUMERIC(10,2) DEFAULT 120,
  premium_delivery INT DEFAULT 5,
  premium_revisions TEXT DEFAULT 'Unlimited',
  premium_features JSONB DEFAULT '[]',

  -- Stats
  rating NUMERIC(2,1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  orders_count INT DEFAULT 0,

  -- Meta
  service_type TEXT DEFAULT 'clothing',  -- 'clothing' | 'logo'
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,

  -- SEO
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;

-- Public read (anyone can view active gigs)
CREATE POLICY "gigs_public_read" ON gigs
  FOR SELECT USING (is_active = true);

-- Service role full access (for admin operations)
CREATE POLICY "gigs_service_all" ON gigs
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_gigs_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gigs_updated_at
  BEFORE UPDATE ON gigs
  FOR EACH ROW EXECUTE FUNCTION update_gigs_timestamp();

-- ═══ SEED DATA — 2 default gigs matching existing services ═══

INSERT INTO gigs (title, slug, short_desc, description, category, cover_url, service_type, sort_order,
  basic_price, basic_delivery, basic_revisions, basic_features, basic_desc,
  standard_price, standard_delivery, standard_revisions, standard_features, standard_desc,
  premium_price, premium_delivery, premium_revisions, premium_features, premium_desc,
  rating, review_count, orders_count, seo_title, seo_description
) VALUES
(
  'I will create custom streetwear clothing design and apparel graphics',
  'custom-streetwear-clothing-design',
  'Professional streetwear, t-shirt, hoodie, and merch graphic design. Production-ready files included.',
  'Get a professional, eye-catching custom streetwear clothing design for your brand. Whether you need a t-shirt graphic, hoodie design, or full merch collection — I deliver production-ready, print-ready artwork that makes your brand stand out.\n\nWhat you get:\n• Original custom design based on your brief\n• High-resolution print-ready files (PNG, AI, PSD)\n• Commercial use rights\n• Fast turnaround\n• Direct communication via WhatsApp\n\nPerfect for streetwear brands, merch drops, music artists, and clothing startups.',
  'clothing-design',
  '',
  'clothing',
  1,
  50, 3, '2 Revisions',
  '["Source file included", "Print-ready resolution", "Front design only"]',
  'Simple single-side apparel graphic. Best for testing one design before a bigger drop.',
  75, 3, '8 Revisions',
  '["Source file included", "Print-ready resolution", "Front & back design", "Realistic mockup", "Enhanced detailing", "Commercial use"]',
  'Front & back design with mockup. Most popular for brand drops and artist merch.',
  120, 5, 'Unlimited',
  '["Source file included", "Print-ready resolution", "Front & back design", "Realistic mockup", "Enhanced detailing", "Commercial use", "Techpack included"]',
  'Complete apparel system with techpack. Full brand-ready package.',
  4.9, 1247, 3200,
  'Custom Streetwear Clothing Design | Dean Designers',
  'Professional custom streetwear and apparel graphic design service. T-shirt, hoodie, merch designs with print-ready files.'
),
(
  'I will design a professional logo and brand identity for your clothing line',
  'professional-logo-brand-identity',
  'Unique logo design with brand identity package. Vector files, mockups, and social media kit included.',
  'Get a unique, professional logo and complete brand identity designed specifically for your clothing brand or business. I create logos that are timeless, versatile, and ready for any application.\n\nWhat you get:\n• Custom logo design (main + alternative versions)\n• Vector files (AI, EPS, SVG)\n• Print-ready files (PNG, PDF)\n• Brand color palette\n• Direct communication via WhatsApp\n\nPerfect for new clothing brands, streetwear labels, fashion startups, and rebrand projects.',
  'logo-design',
  '',
  'logo',
  2,
  80, 5, '2 Revisions',
  '["Logo transparency", "Vector file", "Printable file"]',
  'Clean, readable logo concept. Safe for testing your brand direction.',
  150, 7, '3 Revisions',
  '["Logo transparency", "Vector file", "Printable file", "3D mockup", "Source file"]',
  'Refined logo with mockup and source files. Ready for real branding use.',
  200, 7, '3 Revisions',
  '["Logo transparency", "Vector file", "Printable file", "3D mockup", "Source file", "Social media kit"]',
  'Complete brand identity with social media kit. Full long-term branding package.',
  5.0, 986, 8100,
  'Professional Logo & Brand Identity Design | Dean Designers',
  'Custom logo and brand identity design for clothing brands. Vector files, mockups, social media kit included.'
);

-- ═══ DONE ═══
-- After running this, your gigs will appear on the homepage automatically.
