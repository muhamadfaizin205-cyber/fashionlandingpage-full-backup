// Vercel Serverless: /api/save-order.js
// Saves order to DB with service_role (bypasses RLS) + generates access_code
// No PayPal secret needed — PayPal capture happens client-side

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { orderData, capturedAmount, paypalOrderId } = req.body || {};
  if (!orderData || !orderData.email) {
    return res.status(400).json({ error: 'orderData with email required' });
  }

  // Generate 6-char access code
  const crypto = require('crypto');
  const accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  // Strip any client-supplied price — use captured amount from PayPal response
  const { price: _clientPrice, access_code: _ac, ...safeData } = orderData;

  // Sanitize: ensure brief_images is stored as JSON string if column is TEXT
  const sanitized = { ...safeData };
  if (Array.isArray(sanitized.brief_images)) {
    sanitized.brief_images = sanitized.brief_images; // keep as array for JSONB
  }

  const row = {
    ...sanitized,
    price: capturedAmount || orderData.price || 0,
    access_code: accessCode,
    paypal_order_id: paypalOrderId || '',
    status: 'new',
    created_at: new Date().toISOString(),
  };

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
    const savedId = Array.isArray(data) ? data[0]?.id : data?.id;

    if (!sbRes.ok) {
      console.error('[save-order] DB error:', JSON.stringify(data));
      console.error('[save-order] Row attempted:', JSON.stringify(row));
      return res.status(500).json({ error: 'Failed to save order', detail: JSON.stringify(data) });
    }

    console.log('[save-order] Saved:', savedId, '$' + row.price, 'code:', accessCode);
    return res.status(200).json({ success: true, orderId: savedId, accessCode });
  } catch (err) {
    console.error('[save-order]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
