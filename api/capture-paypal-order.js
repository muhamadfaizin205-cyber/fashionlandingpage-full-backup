// Vercel Serverless: /api/capture-paypal-order.js
// Captures an approved PayPal order

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const clientId = process.env.VITE_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET_KEY;

  if (!clientId || !secret) {
    return res.status(500).json({ error: "PayPal credentials not configured" });
  }

  const { orderID } = req.body ?? {};
  if (!orderID) return res.status(400).json({ error: "Missing orderID" });

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
    if (!authData.access_token) throw new Error("Failed to get PayPal access token");

    // 2. Capture the order
    const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureRes.json();
    
    if (captureData.status === "COMPLETED") {
      res.status(200).json({ status: "COMPLETED", id: captureData.id });
    } else {
      console.error("[PayPal] Capture status:", captureData.status, JSON.stringify(captureData));
      res.status(200).json({ status: captureData.status || "UNKNOWN", details: captureData });
    }
  } catch (err) {
    console.error("[PayPal] Capture error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
