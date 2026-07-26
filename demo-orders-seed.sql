-- ═══════════════════════════════════════════════════════════
-- PRESENTATION DEMO ORDERS (36) - ADMIN UI ONLY
-- Run in Supabase SQL Editor.
--
-- Brand names look real for presenting, but every row is still tagged
-- by its email @sample.test - the ONLY marker. That tag:
--   * keeps them off the public site (orders are fetched by the
--     customer's own email or the admin hash; nobody owns these),
--   * lets you delete every one in a single line (see bottom).
--
-- The email barely shows when presenting, so the list looks genuine.
-- ⚠️ Still fake data - delete it when the presentation is done.
-- ═══════════════════════════════════════════════════════════

INSERT INTO orders
  (brand_name, name, service, package_name, price, qty, status, email, brief, whatsapp, created_at)
VALUES
  ('Kinara Apparel','Aria','Logo Design','Standard',120,1,'working','demo01@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628121429841', now() - interval '58 days'),
  ('Nordic Wave','Ben','Logo Design','Standard',75,1,'done','demo02@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628123118992', now() - interval '57 days'),
  ('Ember & Oak','Cara','Logo Design','Standard',75,1,'new','demo03@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628121995893', now() - interval '45 days'),
  ('Vante Studio','Dylan','Clothing Design','Standard',200,1,'new','demo04@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628126433126', now() - interval '34 days'),
  ('Loomis Co','Eli','Clothing Design','Standard',150,1,'new','demo05@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628126122271', now() - interval '17 days'),
  ('Halcyon Wear','Farah','Clothing Design','Standard',120,1,'review','demo06@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628127532484', now() - interval '56 days'),
  ('Brightside Collective','Gio','Logo Design','Standard',75,1,'revision','demo07@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628125065439', now() - interval '26 days'),
  ('Ravel Clothing','Hana','Logo Design','Standard',75,1,'done','demo08@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628125714903', now() - interval '0 days'),
  ('Monsoon Threads','Ivan','Clothing Design','Standard',150,1,'new','demo09@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628127856604', now() - interval '60 days'),
  ('Cedar Lane','Jade','Logo Design','Standard',60,1,'revision','demo10@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628121962608', now() - interval '36 days'),
  ('Union Six','Kai','Logo Design','Standard',75,1,'review','demo11@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628125720911', now() - interval '4 days'),
  ('Palette House','Lena','Logo Design','Standard',60,1,'revision','demo12@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628122894640', now() - interval '55 days'),
  ('Northwind Supply','Milo','Logo Design','Standard',180,1,'new','demo13@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628128204347', now() - interval '41 days'),
  ('Vireo Studio','Nadia','Logo Design','Standard',120,1,'new','demo14@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628129585536', now() - interval '47 days'),
  ('Basalt Goods','Owen','Flyer Design','Standard',150,1,'working','demo15@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628124062734', now() - interval '28 days'),
  ('Marlowe & Sons','Priya','Flyer Design','Standard',75,1,'new','demo16@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628120498320', now() - interval '9 days'),
  ('Dune & Co','Quinn','Flyer Design','Standard',150,1,'new','demo17@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628120085479', now() - interval '19 days'),
  ('Fernweh Apparel','Rafi','Flyer Design','Standard',90,1,'new','demo18@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628122893467', now() - interval '36 days'),
  ('Cobalt Room','Sara','Flyer Design','Standard',60,1,'new','demo19@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628128417316', now() - interval '17 days'),
  ('Astra Label','Theo','Clothing Design','Standard',250,1,'new','demo20@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628120303376', now() - interval '18 days'),
  ('Meridian Wear','Uma','Logo Design','Standard',120,1,'working','demo21@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628129742609', now() - interval '8 days'),
  ('Wilder Brand','Vince','Clothing Design','Standard',200,1,'working','demo22@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628126968361', now() - interval '18 days'),
  ('Onyx Field','Wren','Clothing Design','Standard',75,1,'new','demo23@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628129787750', now() - interval '25 days'),
  ('Petrichor Studio','Yara','Logo Design','Standard',120,1,'new','demo24@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628123818958', now() - interval '50 days'),
  ('Solace Threads','Zane','Logo Design','Standard',75,1,'new','demo25@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628126154626', now() - interval '32 days'),
  ('Tindra Co','Noah','Flyer Design','Standard',60,1,'revision','demo26@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628123801447', now() - interval '18 days'),
  ('Verano Wear','Mila','Clothing Design','Standard',75,1,'review','demo27@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628125205205', now() - interval '49 days'),
  ('Bracken Supply','Leo','Flyer Design','Standard',150,1,'done','demo28@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628128812272', now() - interval '57 days'),
  ('Halo Nine','Ivy','Flyer Design','Standard',60,1,'revision','demo29@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628128557697', now() - interval '41 days'),
  ('Nova Haus','Finn','Logo Design','Standard',120,1,'new','demo30@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628124478730', now() - interval '10 days'),
  ('Quill & Ink','Rhea','Clothing Design','Standard',75,1,'new','demo31@sample.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628121076566', now() - interval '3 days'),
  ('Riverbend Goods','Cole','Flyer Design','Standard',75,1,'new','demo32@sample.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628126949032', now() - interval '49 days'),
  ('Sable Studio','Nina','Logo Design','Standard',75,1,'review','demo33@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628125476372', now() - interval '49 days'),
  ('Tallow & Co','Omar','Logo Design','Standard',180,1,'new','demo34@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628127368100', now() - interval '58 days'),
  ('Cinder Label','Tess','Logo Design','Standard',120,1,'working','demo35@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628121045154', now() - interval '57 days'),
  ('Lumen Apparel','Dara','Logo Design','Standard',75,1,'new','demo36@sample.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628126604142', now() - interval '18 days');

-- ── Remove ALL demo orders later, run ONLY this line: ──
-- DELETE FROM orders WHERE email LIKE '%@sample.test';
