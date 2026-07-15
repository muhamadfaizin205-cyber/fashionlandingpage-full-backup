// Vercel Serverless: /api/create-paypal-order.js
// SERVER-SIDE price calculation - client CANNOT manipulate the amount

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';

// Hardcoded fallback packages (must match App.tsx EXACTLY)
const FALLBACK_PACKAGES = {
  clothing: [
    { id: 'basic', basePrice: 50 },
    { id: 'standard', basePrice: 75 },
    { id: 'premium', basePrice: 120 },
  ],
  logo: [
    { id: 'basic', basePrice: 80 },
    { id: 'standard', basePrice: 150 },
    { id: 'premium', basePrice: 200 },
  ],
};

// Same discount logic as App.tsx calcPrice() - single source of truth
function calcPrice(basePrice, qty, service) {
  const raw = basePrice * qty;
  if (service !== 'logo') return { raw, final: raw, discount: 0 };
  const flatOff = 10 * qty;
  const volumeOff = qty >= 2 ? Math.round(raw * 0.05) : 0;
  const totalDiscount = flatOff + volumeOff;
  const canDiscount = totalDiscount < raw;
  const discount = canDiscount ? totalDiscount : 0;
  return { raw, final: raw - discount, discount };
}

async function getPackagePrice(packageId, service) {
  // Try database first
  try {
    const url = `${SUPABASE_URL}/rest/v1/packages?id=eq.${packageId}&service=eq.${service}&active=eq.true&select=base_price`;
    const resp = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const data = await resp.json();
    if (data && data.length > 0) {
      return Number(data[0].base_price);
    }
  } catch (e) {
    console.error('[PayPal] DB lookup failed:', e.message);
  }

  // Fallback to hardcoded (DB might use UUID ids, try matching by badge/name)
  const pool = FALLBACK_PACKAGES[service] || [];
  const match = pool.find(p => p.id === packageId);
  if (match) return match.basePrice;

  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientId = process.env.VITE_PAYPAL_CLIENT_ID || 'AfcPNwHZ0YCT-hTcym1lb_QtzX9NWgrOjX8wT2B6JYm0ssv4gpvtiDe5gOtaLlxMTxXNfPob1Le4Jena';
  const secret = process.env.PAYPAL_SECRET_KEY;

  if (!secret) {
    return res.status(500).json({ error: 'PayPal secret not configured. Add PAYPAL_SECRET_KEY in Vercel env vars.' });
  }

  const { packageId, service, qty, description = 'Dean Designers Order' } = req.body ?? {};

  // Validate inputs
  if (!packageId || !service || !qty) {
    return res.status(400).json({ error: 'Missing required fields: packageId, service, qty' });
  }
  const quantity = Math.max(1, Math.min(20, parseInt(qty) || 1));
  if (!['clothing', 'logo'].includes(service)) {
    return res.status(400).json({ error: 'Invalid service type' });
  }

  // SERVER-SIDE price lookup - client cannot influence this
  const basePrice = await getPackagePrice(packageId, service);
  if (!basePrice || basePrice <= 0) {
    return res.status(400).json({ error: 'Package not found or inactive' });
  }

  const { final: finalPrice } = calcPrice(basePrice, quantity, service);
  if (finalPrice <= 0) {
    return res.status(400).json({ error: 'Calculated price is invalid' });
  }

  console.log(`[PayPal] Creating order: pkg=${packageId} svc=${service} qty=${quantity} base=$${basePrice} final=$${finalPrice}`);

  try {
    // 1. Get PayPal access token
    const authRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const authData = await authRes.json();
    if (!authData.access_token) {
      console.error('[PayPal] Auth failed:', JSON.stringify(authData));
      throw new Error('Failed to authenticate with PayPal');
    }

    // 2. Create PayPal order with SERVER-CALCULATED price
    const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: String(Number(finalPrice).toFixed(2)),
          },
          description: `${description} (${quantity} concept(s))`,
          custom_id: JSON.stringify({ packageId, service, qty: quantity, basePrice, finalPrice }),
        }],
        application_context: {
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
    });

    const orderData = await orderRes.json();

    if (orderData.id) {
      console.log('[PayPal] Order created:', orderData.id, `$${finalPrice}`);
      res.status(200).json({
        id: orderData.id,
        serverPrice: finalPrice,
        basePrice,
        qty: quantity,
      });
    } else {
      console.error('[PayPal] Order error:', JSON.stringify(orderData));
      res.status(500).json({ error: orderData.details?.[0]?.description || 'Failed to create order' });
    }
  } catch (err) {
    console.error('[PayPal] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
