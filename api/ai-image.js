export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, size } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const apiKey = process.env.OPENAI_API_KEY || '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';

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
