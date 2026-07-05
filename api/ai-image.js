// C5 FIX: Admin-only endpoint — requires x-admin-hash header
const ADMIN_HASH = '2d72f552e5a25f4f0643facba66e69718da62369b01ce5782128f867f77e60a0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-hash');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check — admin only
  if (req.headers['x-admin-hash'] !== ADMIN_HASH) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { prompt, size } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not configured in Vercel env vars' });

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model: 'dall-e-3', prompt: prompt, n: 1, size: size || '1792x1024', quality: 'standard', response_format: 'url' })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) return res.status(500).json({ error: 'No image generated' });
    return res.status(200).json({ url: imageUrl, revised_prompt: data.data[0].revised_prompt || '' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}


