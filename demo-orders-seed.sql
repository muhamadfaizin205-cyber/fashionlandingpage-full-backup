-- ═══════════════════════════════════════════════════════════
-- PRESENTATION PRESENTATION SAMPLE ORDERS (36) - ADMIN UI ONLY
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
-- genuine. Still fake data - delete it when the presentation is done (sample data).
-- ═══════════════════════════════════════════════════════════

INSERT INTO orders
  (brand_name, service, package_name, price, qty, status, email, brief, whatsapp, created_at)
VALUES
  ('Kinara Apparel','Logo Design','Standard',75,1,'working','aria.chen@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628124767159', now() - interval '3 days'),
  ('Nordic Wave','Flyer Design','Standard',60,1,'working','ben.walker@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628129808708', now() - interval '3 days'),
  ('Ember & Oak','Logo Design','Standard',75,1,'working','cara.alvarez@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628128245334', now() - interval '55 days'),
  ('Vante Studio','Logo Design','Standard',180,1,'working','dylan.novak@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628123641731', now() - interval '7 days'),
  ('Loomis Co','Clothing Design','Standard',120,1,'working','eli.reyes@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628124631449', now() - interval '30 days'),
  ('Halcyon Wear','Clothing Design','Standard',75,1,'working','farah.haddad@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628129818328', now() - interval '37 days'),
  ('Brightside Collective','Flyer Design','Standard',60,1,'working','gio.rossi@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628121960833', now() - interval '8 days'),
  ('Ravel Clothing','Flyer Design','Standard',90,1,'working','hana.kim@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628124836424', now() - interval '56 days'),
  ('Monsoon Threads','Flyer Design','Standard',60,1,'working','ivan.petrov@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628127817240', now() - interval '36 days'),
  ('Cedar Lane','Flyer Design','Standard',90,1,'working','jade.okafor@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628122374683', now() - interval '16 days'),
  ('Union Six','Clothing Design','Standard',200,1,'working','kai.nguyen@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628126363719', now() - interval '6 days'),
  ('Palette House','Clothing Design','Standard',250,1,'working','lena.silva@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628124318583', now() - interval '24 days'),
  ('Northwind Supply','Clothing Design','Standard',75,1,'working','milo.brooks@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628124220391', now() - interval '56 days'),
  ('Vireo Studio','Flyer Design','Standard',150,1,'working','nadia.patel@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628124557898', now() - interval '26 days'),
  ('Basalt Goods','Clothing Design','Standard',120,1,'working','owen.larsen@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628124858761', now() - interval '36 days'),
  ('Marlowe & Sons','Logo Design','Standard',180,1,'working','priya.costa@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628120985293', now() - interval '36 days'),
  ('Dune & Co','Logo Design','Standard',180,1,'working','quinn.meyer@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628123588769', now() - interval '41 days'),
  ('Fernweh Apparel','Flyer Design','Standard',90,1,'working','rafi.tan@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628123151970', now() - interval '54 days'),
  ('Cobalt Room','Flyer Design','Standard',75,1,'working','sara.ford@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628120478174', now() - interval '39 days'),
  ('Astra Label','Logo Design','Standard',180,1,'working','theo.ito@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628128815583', now() - interval '59 days'),
  ('Meridian Wear','Clothing Design','Standard',120,1,'working','uma.diaz@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628122720053', now() - interval '49 days'),
  ('Wilder Brand','Logo Design','Standard',75,1,'working','vince.bauer@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628128409104', now() - interval '56 days'),
  ('Onyx Field','Flyer Design','Standard',60,1,'working','wren.hughes@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628126541118', now() - interval '16 days'),
  ('Petrichor Studio','Clothing Design','Standard',120,1,'working','yara.sato@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628126354779', now() - interval '12 days'),
  ('Solace Threads','Flyer Design','Standard',75,1,'working','zane.wolfe@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628122004547', now() - interval '7 days'),
  ('Tindra Co','Clothing Design','Standard',150,1,'working','noah.adams@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628125135629', now() - interval '11 days'),
  ('Verano Wear','Clothing Design','Standard',150,1,'working','mila.marsh@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628129013340', now() - interval '15 days'),
  ('Bracken Supply','Clothing Design','Standard',120,1,'working','leo.yates@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628121749530', now() - interval '43 days'),
  ('Halo Nine','Flyer Design','Standard',60,1,'working','ivy.khan@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628123111844', now() - interval '14 days'),
  ('Nova Haus','Clothing Design','Standard',250,1,'working','finn.frost@cloth.test','Streetwear graphic for a small drop - bold, original, print-ready front and back.','+628127549605', now() - interval '13 days'),
  ('Quill & Ink','Logo Design','Standard',120,1,'working','rhea.vega@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628127837647', now() - interval '20 days'),
  ('Riverbend Goods','Flyer Design','Standard',60,1,'working','cole.boyd@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628121163879', now() - interval '34 days'),
  ('Sable Studio','Flyer Design','Standard',150,1,'working','nina.cruz@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628124015759', now() - interval '31 days'),
  ('Tallow & Co','Flyer Design','Standard',90,1,'working','omar.riaz@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628123184206', now() - interval '37 days'),
  ('Cinder Label','Logo Design','Standard',120,1,'working','tess.lowe@cloth.test','Modern, versatile logo mark plus wordmark. Clean, memorable, works in one colour.','+628124561549', now() - interval '59 days'),
  ('Lumen Apparel','Flyer Design','Standard',150,1,'working','dara.shah@cloth.test','A4 promo flyer for an upcoming launch - punchy hierarchy, print + digital export.','+628120822189', now() - interval '4 days');

-- ── SAMPLE DESIGNERS (names only, for the presentation) ──
-- Inactive accounts, so they can't be used to
-- sign in - they exist purely to show 'assigned to <name>' on the board.
INSERT INTO designers (name, access_code, active) VALUES
  ('renzy','RZY7-K2MQ-P19X', false),
  ('kylaa','KYL4-8QT2-M6RD', false),
  ('adiitt','ADT9-3XPK-72NW', false),
  ('syfaa','SYF5-Q8M2-63KP', false),
  ('bimoo','BMO6-4KRT-91XQ', false),
  ('davaz','DVZ3-7MPQ-K84R', false)
ON CONFLICT (access_code) DO NOTHING;

-- Assign every demo order to a demo designer, spread evenly across them.
WITH d AS (
  SELECT id, row_number() OVER (ORDER BY id) - 1 AS rn,
         count(*) OVER () AS total
  FROM designers WHERE access_code IN ('RZY7-K2MQ-P19X', 'KYL4-8QT2-M6RD', 'ADT9-3XPK-72NW', 'SYF5-Q8M2-63KP', 'BMO6-4KRT-91XQ', 'DVZ3-7MPQ-K84R')
),
o AS (
  SELECT id, row_number() OVER (ORDER BY created_at) - 1 AS rn
  FROM orders WHERE email LIKE '%@cloth.test'
)
UPDATE orders SET assigned_designer_id = d.id
FROM o JOIN d ON (o.rn % d.total) = d.rn
WHERE orders.id = o.id;

-- ── SAMPLE DESIGNER <-> STUDIO CHATS ──
-- Fills each sample order's private room ('designer:<id>') with a short,
-- casual back-and-forth so the presentation shows active conversations.
-- Requires designer-chat-migration.sql to have been run first.
INSERT INTO messages (order_id, room, sender_type, sender_email, message, order_email, read, delivered, created_at)
SELECT s.id, 'designer:'||s.id, t.who,
       CASE WHEN t.who='designer' THEN COALESCE(s.dz,'designer') ELSE 'admin' END,
       t.msg, NULL, true, true,
       now() - ((30 - t.seq*4)::text||' minutes')::interval - ((s.rn)::text||' minutes')::interval
FROM (
  SELECT o.id, d.name AS dz,
         (row_number() OVER (ORDER BY o.created_at) - 1)      AS rn,
         (row_number() OVER (ORDER BY o.created_at) - 1) % 6  AS scr
  FROM orders o LEFT JOIN designers d ON d.id = o.assigned_designer_id
  WHERE o.email LIKE '%@cloth.test'
) s
JOIN (VALUES
  (0,0,'admin','halo, brief udah masuk ya, dicek dulu gpp'),
  (0,1,'designer','sip udah aku baca, gas sketsa dulu'),
  (0,2,'admin','oke kabarin kalo ada yg kurang jelas'),
  (0,3,'designer','noted bang'),
  (1,0,'designer','bang warnanya fix ke yg mana? biru apa item'),
  (1,1,'admin','pake item aja biar clean'),
  (1,2,'designer','okee gaskeun'),
  (1,3,'admin','mantap'),
  (2,0,'designer','ini progress logonya, cek dong'),
  (2,1,'admin','mantul, tinggal spasi hurufnya dirapiin dikit'),
  (2,2,'designer','siyap bentar aku fix'),
  (2,3,'designer','udah aku update ya'),
  (3,0,'admin','tolong revisi bagian belakang bajunya, kegedean'),
  (3,1,'designer','oke aku kecilin 15% cukup?'),
  (3,2,'admin','cukup, gass'),
  (3,3,'designer','otw'),
  (4,0,'admin','estimasi kelar kapan nih?'),
  (4,1,'designer','besok sore kelar sih insyaAllah'),
  (4,2,'admin','oke ditunggu ya'),
  (4,3,'designer','aman bang'),
  (5,0,'designer','bang minta font brandnya ada gak?'),
  (5,1,'admin','ada nanti aku share ya'),
  (5,2,'designer','okee makasih'),
  (5,3,'admin','udah aku kirim cek ya'),
  (5,4,'designer','dapet, thanks!')
) t(scr, seq, who, msg) ON t.scr = s.scr;

-- ── Remove ALL sample orders later, run ONLY this line: ──
-- DELETE FROM messages WHERE order_id IN (SELECT id FROM orders WHERE email LIKE '%@cloth.test');
-- UPDATE orders SET assigned_designer_id = NULL WHERE email LIKE '%@cloth.test';
-- DELETE FROM orders    WHERE email       LIKE '%@cloth.test';
-- DELETE FROM designers WHERE access_code IN ('RZY7-K2MQ-P19X', 'KYL4-8QT2-M6RD', 'ADT9-3XPK-72NW', 'SYF5-Q8M2-63KP', 'BMO6-4KRT-91XQ', 'DVZ3-7MPQ-K84R');
