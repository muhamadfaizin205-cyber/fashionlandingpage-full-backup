-- ═══════════════════════════════════════════════════════════
-- DEMO ORDERS  (36) - FOR ADMIN UI TESTING ONLY
-- Run in Supabase SQL Editor. These are OBVIOUSLY fake:
--   * brand_name starts with 'DEMO - '
--   * email is @sample.test (nobody can log in as these, so they can
--     NEVER appear on the public site - orders are fetched by the
--     customer's own email or the admin hash)
--
-- ⚠️ DELETE THEM ALL when done, with the one line at the bottom.
-- ═══════════════════════════════════════════════════════════

INSERT INTO orders
  (brand_name, service, package_name, price, qty, status, email, brief, whatsapp, created_at)
VALUES
  ('DEMO - Kinara','Clothing Design','Standard',75,1,'new','demo01@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000001', now() - interval '51 days'),
  ('DEMO - Nordic Wave','Clothing Design','Standard',75,1,'new','demo02@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000002', now() - interval '32 days'),
  ('DEMO - Ember & Oak','Flyer Design','Standard',75,1,'working','demo03@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000003', now() - interval '17 days'),
  ('DEMO - ACME Clothing','Flyer Design','Standard',150,1,'review','demo04@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000004', now() - interval '35 days'),
  ('DEMO - Studio Vante','Clothing Design','Standard',250,1,'new','demo05@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000005', now() - interval '36 days'),
  ('DEMO - Loomis','Clothing Design','Standard',200,1,'revision','demo06@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000006', now() - interval '22 days'),
  ('DEMO - Halcyon','Clothing Design','Standard',120,1,'revision','demo07@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000007', now() - interval '10 days'),
  ('DEMO - Brightside','Logo Design','Standard',180,1,'working','demo08@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000008', now() - interval '33 days'),
  ('DEMO - Ravel','Clothing Design','Standard',120,1,'completed','demo09@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000009', now() - interval '45 days'),
  ('DEMO - Monsoon','Flyer Design','Standard',90,1,'done','demo10@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000010', now() - interval '10 days'),
  ('DEMO - Cedar Lane','Logo Design','Standard',180,1,'completed','demo11@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000011', now() - interval '8 days'),
  ('DEMO - Union Six','Logo Design','Standard',180,1,'review','demo12@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000012', now() - interval '51 days'),
  ('DEMO - Palette','Logo Design','Standard',180,1,'working','demo13@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000013', now() - interval '39 days'),
  ('DEMO - Northwind','Logo Design','Standard',75,1,'done','demo14@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000014', now() - interval '29 days'),
  ('DEMO - Vireo','Flyer Design','Standard',90,1,'completed','demo15@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000015', now() - interval '46 days'),
  ('DEMO - Basalt','Logo Design','Standard',75,1,'working','demo16@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000016', now() - interval '13 days'),
  ('DEMO - Marlowe','Flyer Design','Standard',75,1,'new','demo17@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000017', now() - interval '4 days'),
  ('DEMO - Dune & Co','Flyer Design','Standard',75,1,'review','demo18@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000018', now() - interval '27 days'),
  ('DEMO - Fernweh','Flyer Design','Standard',60,1,'revision','demo19@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000019', now() - interval '22 days'),
  ('DEMO - Cobalt Room','Clothing Design','Standard',120,1,'done','demo20@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000020', now() - interval '36 days'),
  ('DEMO - Astra','Flyer Design','Standard',90,1,'new','demo21@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000021', now() - interval '6 days'),
  ('DEMO - Meridian','Flyer Design','Standard',150,1,'working','demo22@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000022', now() - interval '14 days'),
  ('DEMO - Wilder','Flyer Design','Standard',90,1,'new','demo23@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000023', now() - interval '49 days'),
  ('DEMO - Onyx Field','Logo Design','Standard',75,1,'done','demo24@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000024', now() - interval '40 days'),
  ('DEMO - Petrichor','Logo Design','Standard',180,1,'working','demo25@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000025', now() - interval '56 days'),
  ('DEMO - Solace','Clothing Design','Standard',150,1,'new','demo26@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000026', now() - interval '34 days'),
  ('DEMO - Tindra','Clothing Design','Standard',250,1,'new','demo27@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000027', now() - interval '19 days'),
  ('DEMO - Verano','Logo Design','Standard',180,1,'new','demo28@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000028', now() - interval '24 days'),
  ('DEMO - Bracken','Flyer Design','Standard',60,1,'working','demo29@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000029', now() - interval '26 days'),
  ('DEMO - Halo Nine','Clothing Design','Standard',120,1,'working','demo30@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000030', now() - interval '20 days'),
  ('DEMO - Cinder','Logo Design','Standard',75,1,'working','demo31@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000031', now() - interval '28 days'),
  ('DEMO - Nova Haus','Clothing Design','Standard',75,1,'new','demo32@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000032', now() - interval '58 days'),
  ('DEMO - Quill','Logo Design','Standard',75,1,'completed','demo33@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000033', now() - interval '43 days'),
  ('DEMO - Riverbend','Clothing Design','Standard',150,1,'done','demo34@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+10000000034', now() - interval '28 days'),
  ('DEMO - Sable','Logo Design','Standard',75,1,'revision','demo35@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+10000000035', now() - interval '5 days'),
  ('DEMO - Tallow','Flyer Design','Standard',60,1,'review','demo36@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+10000000036', now() - interval '15 days');

-- ── To remove every demo order later, run ONLY this line: ──
-- DELETE FROM orders WHERE email LIKE '%@sample.test';
