// Vercel Serverless: /api/create-paypal-order.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const clientId = process.env.VITE_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET_KEY;

  if (!clientId || !secret) {
    return res.status(500).json({ error: "PayPal credentials not configured. Check VITE_PAYPAL_CLIENT_ID and PAYPAL_SECRET_KEY in Vercel env vars." });
  }

  const { amount, description = "Dean Designers Order" } = req.body ?? {};
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    // 1. Get access token
    const authRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${clientId}:${secret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const authData = await authRes.json();
    
    if (!authData.access_token) {
      console.error("[PayPal] Auth failed:", JSON.stringify(authData));
      throw new Error("Failed to authenticate with PayPal");
    }

    // 2. Create order — NO payment_source so PayPal/Card both work
    const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: String(Number(amount).toFixed(2)),
          },
          description,
        }],
        application_context: {
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
      }),
    });

    const orderData = await orderRes.json();
    
    if (orderData.id) {
      console.log("[PayPal] Order created:", orderData.id);
      res.status(200).json({ id: orderData.id });
    } else {
      console.error("[PayPal] Order error:", JSON.stringify(orderData));
      res.status(500).json({ error: orderData.details?.[0]?.description || orderData.message || "Failed to create order" });
    }
  } catch (err) {
    console.error("[PayPal] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
