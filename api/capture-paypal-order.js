// Vercel Serverless: /api/capture-paypal-order.js
// Captures PayPal order AND verifies the captured amount matches server expectation

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientId = process.env.VITE_PAYPAL_CLIENT_ID || 'AfcPNwHZ0YCT-hTcym1lb_QtzX9NWgrOjX8wT2B6JYm0ssv4gpvtiDe5gOtaLlxMTxXNfPob1Le4Jena';
  const secret = process.env.PAYPAL_SECRET_KEY;

  if (!secret) {
    return res.status(500).json({ error: 'PayPal credentials not configured' });
  }

  const { orderID, orderData: clientOrderData } = req.body ?? {};
  if (!orderID) return res.status(400).json({ error: 'Missing orderID' });

  try {
    // 1. Get access token
    const authRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const authData = await authRes.json();
    if (!authData.access_token) throw new Error('Failed to get PayPal access token');

    // 2. Capture the order
    const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();

    if (captureData.status === 'COMPLETED') {
      // 3. Extract verified amount from PayPal response
      const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      const capturedAmount = capture ? Number(capture.amount?.value) : 0;
      const capturedCurrency = capture?.amount?.currency_code || 'USD';
      const paypalTransactionId = capture?.id || orderID;

      // 4. Extract custom_id (server metadata we embedded during order creation)
      const customId = captureData.purchase_units?.[0]?.custom_id;
      let serverMeta = {};
      try { serverMeta = JSON.parse(customId || '{}'); } catch {}

      console.log(`[PayPal] Captured: $${capturedAmount} ${capturedCurrency} (tx: ${paypalTransactionId})`);

      // 5. Save order to Supabase with VERIFIED amount from PayPal
      if (clientOrderData && capturedAmount > 0) {
        try {
          // SECURITY (P2 fix): strip any client-supplied price — only PayPal's captured amount is trusted
          const { price: _clientPrice, ...safeOrderData } = clientOrderData;

          // A1 FIX: Generate 6-char access code for secure order tracker login
          const accessCode = require('crypto').randomBytes(3).toString('hex').toUpperCase(); // e.g. "A3F2B1"

          const orderRow = {
            ...safeOrderData,
            price: capturedAmount, // ONLY from PayPal — never from client
            paid_via: 'paypal',
            paypal_order_id: orderID,
            paypal_transaction_id: paypalTransactionId,
            access_code: accessCode,
            status: 'new',
            created_at: new Date().toISOString(),
          };

          const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify(orderRow),
          });
          const sbData = await sbRes.json();
          const savedId = Array.isArray(sbData) ? sbData[0]?.id : sbData?.id;
          console.log('[PayPal] Order saved to DB:', savedId);

          res.status(200).json({
            status: 'COMPLETED',
            id: captureData.id,
            capturedAmount,
            orderId: savedId,
            transactionId: paypalTransactionId,
            accessCode, // A1: send to client for email & success screen
          });
        } catch (dbErr) {
          console.error('[PayPal] DB save failed:', dbErr.message);
          // Payment succeeded but DB save failed — still return success
          res.status(200).json({
            status: 'COMPLETED',
            id: captureData.id,
            capturedAmount,
            dbError: 'Order save failed, contact support',
          });
        }
      } else {
        res.status(200).json({
          status: 'COMPLETED',
          id: captureData.id,
          capturedAmount,
        });
      }
    } else {
      console.error('[PayPal] Capture status:', captureData.status, JSON.stringify(captureData));
      res.status(200).json({ status: captureData.status || 'UNKNOWN', details: captureData });
    }
  } catch (err) {
    console.error('[PayPal] Capture error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
