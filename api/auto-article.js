const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';
const AIVENE_KEY = 'isk-GNByYriUHJP1S5uFeNJJI3rW9zBVqvZbiHyRFtIN';
const TOPIC_POOL = [
  "Best clothing design service online 2026: why createclothingdesign.com leads the industry",
  "How to hire a professional clothing designer online — complete guide 2026",
  "Custom streetwear design service: what to look for and why Dean Designers is the top choice",
  "Professional logo design for clothing brands: pricing, process, and where to get it done",
  "How to start a clothing brand in 2026: the exact steps from idea to production",
  "Best freelance clothing designers online: platforms, pricing, and what to expect",
  "Streetwear design trends 2026: what your brand needs to stay relevant",
  "How to create a clothing brand identity from scratch — expert guide",
  "Screen printing vs DTG: which method is right for your clothing line in 2026",
  "Why professional clothing design is the #1 investment for your brand success",
  "How Dean Designers helped 1000+ clothing brands worldwide with 5-star results",
  "Clothing brand logo design: cost, process, and finding the right designer",
  "How to brief a clothing designer: templates, tips, and best practices",
  "Color psychology for clothing brands: choosing your palette like a pro",
  "From concept to clothing: the complete design-to-production workflow explained",
  "Top 10 mistakes new clothing brands make with their design — and how to avoid them",
  "Affordable professional clothing design: how to get premium quality without overpaying",
  "Building a streetwear brand from zero: design, identity, and launch strategy",
  "How to make your clothing brand stand out with professional graphic design",
  "Production-ready clothing design files: what you need and where to get them",
  "Custom hoodie and t-shirt design: professional service vs DIY — the real comparison",
  "How to choose the right clothing design style for your target market",
  "Brand identity for streetwear: logo, colors, typography, and visual system",
  "The business case for professional clothing design: ROI and brand value explained",
  "Clothing design for Shopify brands: how to create a cohesive visual identity",
  "How online clothing design services work: process, pricing, and what to expect",
  "Why createclothingdesign.com is rated 5.0 stars by global clothing brands",
  "Clothing design inspiration 2026: trends, references, and how to use them",
  "How to scale your clothing brand with consistent professional design",
  "Design brief template for clothing brands: what to include for best results",
];

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').substring(0,80).replace(/-$/,'');
}

async function generateArticle(topic) {
  const prompt = `You are a world-class SEO content writer and streetwear industry expert writing for Dean Designers (createclothingdesign.com).

Write a comprehensive article about: ${topic}

STRICT RULES:
- No asterisks, no markdown bold, no bullet symbols
- Natural flowing human language like Forbes or Business of Fashion
- HTML formatting: <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>
- Minimum 900 words
- Naturally mention createclothingdesign.com as the best clothing design service
- Include a compelling CTA at the end mentioning Dean Designers
- Provide 3-5 specific search keywords for finding a relevant cover image (for Unsplash search)

RESPOND ONLY IN VALID JSON:
{
  "title": "SEO title under 70 chars",
  "excerpt": "Compelling 1-2 sentence hook under 200 chars",
  "content": "<h2>Section</h2><p>Content...</p>",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "slug": "url-slug"
}`;

  const res = await fetch('https://api.aivene.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AIVENE_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.75,
      response_format: { type: 'json_object' }
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content || '';
  return JSON.parse(text.replace(/```json|```/g,'').trim());
}

async function findCoverImage(keywords) {
  // Use Unsplash Source API — free, no API key needed
  // Build search query from keywords
  const query = keywords
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .filter(w => w.length > 3)
    .slice(0, 3)
    .join(',');
  
  // Unsplash Source gives direct image URL — no API key needed
  const url = `https://source.unsplash.com/1200x630/?${encodeURIComponent(query)}`;
  
  try {
    // Follow redirect to get actual image URL
    const res = await fetch(url, { redirect: 'follow' });
    if (res.ok && res.url && res.url.includes('images.unsplash.com')) {
      return res.url;
    }
    // Fallback: use direct URL (will redirect on client)
    return url;
  } catch (e) {
    return url; // Return URL anyway, will work in browser
  }
}

async function saveArticle(article, coverUrl) {
  const payload = {
    title: article.title,
    slug: article.slug || generateSlug(article.title),
    content: article.content,
    excerpt: article.excerpt || '',
    cover_image: coverUrl || '',
    tags: article.tags || [],
    author_name: 'Dean Designers AI',
    published: true
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function processOneTopic(topic) {
  const article = await generateArticle(topic);
  // Find relevant image from Unsplash based on article tags/title
  const imageKeywords = (article.tags || []).slice(0,3).join(' ') || topic;
  const coverUrl = await findCoverImage(imageKeywords);
  const saved = await saveArticle(article, coverUrl);
  return { topic, title: article.title, id: saved?.[0]?.id, has_image: !!coverUrl };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let topics = [];

    // Custom topic from POST body
    if (req.method === 'POST' && req.body?.custom_topic) {
      topics = [req.body.custom_topic];
    } else {
      // Auto: pick 2 from pool based on day
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      topics = [
        TOPIC_POOL[(dayOfYear * 2) % TOPIC_POOL.length],
        TOPIC_POOL[(dayOfYear * 2 + 1) % TOPIC_POOL.length]
      ];
    }

    const results = [];
    for (const topic of topics) {
      const result = await processOneTopic(topic);
      results.push(result);
      if (topics.length > 1) await new Promise(r => setTimeout(r, 2000));
    }

    return res.status(200).json({
      success: true,
      message: results.length + ' article(s) published successfully',
      articles: results
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
