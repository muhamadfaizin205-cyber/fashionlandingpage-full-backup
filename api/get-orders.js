// Vercel Serverless: /api/get-orders.js
// D1 FIX: Server-side order lookup — replaces direct anon Supabase queries
// Supports: customer (by email) and admin (by password hash)

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';

// Same admin hash as admin-orders.html
const ADMIN_HASH = '2d72f552e5a25f4f0643facba66e69718da62369b01ce5782128f867f77e60a0';

async function sbFetch(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-hash');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const adminHash = req.headers['x-admin-hash'];

    // ── ADMIN MODE: return all orders ──
    if (adminHash === ADMIN_HASH) {
      const data = await sbFetch('orders?select=*&order=created_at.desc');
      return res.status(200).json({ success: true, orders: data });
    }

    // ── CUSTOMER MODE: return orders by email only ──
    const email = req.query.email || req.body?.email;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    const safeEmail = email.trim().toLowerCase();

    // Check if email exists (for login validation)
    if (req.query.check === '1') {
      const check = await sbFetch(`orders?email=ilike.${encodeURIComponent(safeEmail)}&select=id&limit=1`);
      return res.status(200).json({ exists: check && check.length > 0 });
    }

    // Return all orders for this email
    const orders = await sbFetch(`orders?email=ilike.${encodeURIComponent(safeEmail)}&select=*&order=created_at.desc`);
    return res.status(200).json({ success: true, orders: orders || [] });

  } catch (err) {
    console.error('[get-orders] Error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}

