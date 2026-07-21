// /api/save-order.js - saves order using service_role (bypasses RLS)
const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // ── Geo enrichment (marketing analytics) ──
  // Reads Vercel's edge geo headers + caller IP, which the browser can
  // never see itself, and writes them onto the visitor's session. Only
  // called by the client AFTER the visitor accepts analytics consent.
  if (req.body && req.body.kind === 'geo_enrich') {
    const sid = req.body.session_id;
    if (!sid) return res.status(400).json({ error: 'no session' });
    const h = req.headers;
    // GDPR: truncate the IP (drop the last IPv4 octet / IPv6 suffix) so
    // it locates a city, not a person.
    const rawIp = (h['x-forwarded-for'] || h['x-real-ip'] || '').toString().split(',')[0].trim();
    let ip = '';
    if (rawIp.includes('.')) { const p = rawIp.split('.'); p[3] = '0'; ip = p.join('.'); }
    else if (rawIp.includes(':')) { ip = rawIp.split(':').slice(0, 3).join(':') + '::'; }
    const country = (h['x-vercel-ip-country'] || '').toString();
    const region  = (h['x-vercel-ip-country-region'] || '').toString();
    let city = '';
    try { city = decodeURIComponent((h['x-vercel-ip-city'] || '').toString()); } catch { city = ''; }

    const patch = {
      session_id: sid,
      ip, country, region, city,
      browser: req.body.browser || '',
      os: req.body.os || '',
      device_model: req.body.device_model || '',
      consent: true,
    };
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/visitor_sessions?on_conflict=session_id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(patch),
      });
      return res.status(200).json({ ok: true, country, region, city });
    } catch (e) {
      return res.status(200).json({ ok: false });
    }
  }

  const { orderData, capturedAmount } = req.body || {};
  if (!orderData || !orderData.email) {
    return res.status(400).json({ error: 'Missing orderData.email' });
  }

  // Only include fields that definitely exist in the orders table schema
  const row = {
    service:       orderData.service || '',
    brand_name:    orderData.brand_name || '',
    email:         orderData.email,
    whatsapp:      orderData.whatsapp || '',
    instagram:     orderData.instagram || '',
    qty:           orderData.qty || 1,
    brief:         orderData.brief || '',
    brief_images:  orderData.brief_images || [],
    package_id:    orderData.package_id || '',
    package_name:  orderData.package_name || '',
    package_badge: orderData.package_badge || '',
    delivery:      orderData.delivery || '',
    revisions:     orderData.revisions || '',
    price:         capturedAmount || orderData.price || 0,
    status:        'new',
    paid_via:      'paypal',
    priority:      'normal',
    created_at:    new Date().toISOString(),
  };

  console.log('[save-order] Saving order for:', row.email, '$' + row.price);

  try {
    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(row),
    });

    const data = await sbRes.json();

    if (!sbRes.ok) {
      console.error('[save-order] Insert failed:', JSON.stringify(data));
      return res.status(500).json({ error: 'DB insert failed', detail: JSON.stringify(data) });
    }

    const savedId = Array.isArray(data) ? data[0]?.id : data?.id;
    console.log('[save-order] SUCCESS:', savedId);
    return res.status(200).json({ success: true, orderId: savedId });

  } catch (err) {
    console.error('[save-order] Exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

