-- ═══════════════════════════════════════════════════════════
-- PRESENTATION DEMO ORDERS (36) - ADMIN UI ONLY
-- Run in Supabase SQL Editor.
--
-- Brand names, customer names and emails all look real for presenting.
-- The ONLY thing marking these as demo is the email domain @cloth.test
-- - a reserved .test domain (RFC 6761) that can NEVER belong to a real
-- person. That is deliberate:
--   * it can never collide with a real customer's email (no privacy risk),
--   * these orders can never surface on the public site (orders are
--     fetched by the customer's own email or the admin hash),
--   * you can delete every one in a single line (see bottom).
--
-- '@cloth.test' barely registers when presenting, so the list looks
-- genuine. Still fake data - delete it when the presentation is done.
-- ═══════════════════════════════════════════════════════════

INSERT INTO orders
  (brand_name, service, package_name, price, qty, status, email, brief, whatsapp, created_at)
VALUES
  ('Kinara Apparel','Logo Design','Standard',75,1,'working','aria.chen@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628124767159', now() - interval '3 days'),
  ('Nordic Wave','Flyer Design','Standard',60,1,'new','ben.walker@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628129808708', now() - interval '3 days'),
  ('Ember & Oak','Logo Design','Standard',75,1,'working','cara.alvarez@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628128245334', now() - interval '55 days'),
  ('Vante Studio','Logo Design','Standard',180,1,'new','dylan.novak@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628123641731', now() - interval '7 days'),
  ('Loomis Co','Clothing Design','Standard',120,1,'working','eli.reyes@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628124631449', now() - interval '30 days'),
  ('Halcyon Wear','Clothing Design','Standard',75,1,'new','farah.haddad@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628129818328', now() - interval '37 days'),
  ('Brightside Collective','Flyer Design','Standard',60,1,'revision','gio.rossi@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628121960833', now() - interval '8 days'),
  ('Ravel Clothing','Flyer Design','Standard',90,1,'new','hana.kim@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628124836424', now() - interval '56 days'),
  ('Monsoon Threads','Flyer Design','Standard',60,1,'done','ivan.petrov@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628127817240', now() - interval '36 days'),
  ('Cedar Lane','Flyer Design','Standard',90,1,'new','jade.okafor@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628122374683', now() - interval '16 days'),
  ('Union Six','Clothing Design','Standard',200,1,'new','kai.nguyen@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628126363719', now() - interval '6 days'),
  ('Palette House','Clothing Design','Standard',250,1,'new','lena.silva@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628124318583', now() - interval '24 days'),
  ('Northwind Supply','Clothing Design','Standard',75,1,'review','milo.brooks@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628124220391', now() - interval '56 days'),
  ('Vireo Studio','Flyer Design','Standard',150,1,'done','nadia.patel@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628124557898', now() - interval '26 days'),
  ('Basalt Goods','Clothing Design','Standard',120,1,'new','owen.larsen@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628124858761', now() - interval '36 days'),
  ('Marlowe & Sons','Logo Design','Standard',180,1,'working','priya.costa@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628120985293', now() - interval '36 days'),
  ('Dune & Co','Logo Design','Standard',180,1,'working','quinn.meyer@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628123588769', now() - interval '41 days'),
  ('Fernweh Apparel','Flyer Design','Standard',90,1,'new','rafi.tan@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628123151970', now() - interval '54 days'),
  ('Cobalt Room','Flyer Design','Standard',75,1,'done','sara.ford@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628120478174', now() - interval '39 days'),
  ('Astra Label','Logo Design','Standard',180,1,'done','theo.ito@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628128815583', now() - interval '59 days'),
  ('Meridian Wear','Clothing Design','Standard',120,1,'working','uma.diaz@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628122720053', now() - interval '49 days'),
  ('Wilder Brand','Logo Design','Standard',75,1,'working','vince.bauer@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628128409104', now() - interval '56 days'),
  ('Onyx Field','Flyer Design','Standard',60,1,'new','wren.hughes@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628126541118', now() - interval '16 days'),
  ('Petrichor Studio','Clothing Design','Standard',120,1,'new','yara.sato@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628126354779', now() - interval '12 days'),
  ('Solace Threads','Flyer Design','Standard',75,1,'revision','zane.wolfe@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628122004547', now() - interval '7 days'),
  ('Tindra Co','Clothing Design','Standard',150,1,'new','noah.adams@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628125135629', now() - interval '11 days'),
  ('Verano Wear','Clothing Design','Standard',150,1,'completed','mila.marsh@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628129013340', now() - interval '15 days'),
  ('Bracken Supply','Clothing Design','Standard',120,1,'revision','leo.yates@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628121749530', now() - interval '43 days'),
  ('Halo Nine','Flyer Design','Standard',60,1,'new','ivy.khan@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628123111844', now() - interval '14 days'),
  ('Nova Haus','Clothing Design','Standard',250,1,'revision','finn.frost@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628127549605', now() - interval '13 days'),
  ('Quill & Ink','Logo Design','Standard',120,1,'done','rhea.vega@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628127837647', now() - interval '20 days'),
  ('Riverbend Goods','Flyer Design','Standard',60,1,'new','cole.boyd@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628121163879', now() - interval '34 days'),
  ('Sable Studio','Flyer Design','Standard',150,1,'working','nina.cruz@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628124015759', now() - interval '31 days'),
  ('Tallow & Co','Flyer Design','Standard',90,1,'new','omar.riaz@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628123184206', now() - interval '37 days'),
  ('Cinder Label','Logo Design','Standard',120,1,'revision','tess.lowe@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628124561549', now() - interval '59 days'),
  ('Lumen Apparel','Flyer Design','Standard',150,1,'working','dara.shah@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628120822189', now() - interval '4 days');

-- ── Remove ALL demo orders later, run ONLY this line: ──
-- DELETE FROM orders WHERE email LIKE '%@cloth.test';
