// Vercel Cron Job — Auto Article Generator
// Runs daily at 9:00 AM UTC
// Add to vercel.json: { "crons": [{ "path": "/api/auto-article", "schedule": "0 9 * * *" }] }

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';
const AIVENE_KEY = 'isk-GNByYriUHJP1S5uFeNJJI3rW9zBVqvZbiHyRFtIN';

// Topics pool — rotates automatically
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
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/-$/, '');
}

async function getTodayTopic() {
  // Pick topic based on day of year — rotates through pool
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return TOPIC_POOL[dayOfYear % TOPIC_POOL.length];
}

async function checkAlreadyPublishedToday() {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/articles?created_at=gte.${today}T00:00:00&select=id&limit=1`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await res.json();
  return data && data.length > 0;
}

async function generateArticle(topic) {
  const prompt = `You are a world-class SEO content writer and streetwear industry expert writing for Dean Designers (createclothingdesign.com) — a professional streetwear and logo design studio with 7+ years experience, 1000+ projects completed, 5.0 star rating on Fiverr, serving 25+ countries.

Write a comprehensive, authoritative article about: ${topic}

STRICT RULES:
- No asterisks (*), no markdown bold (**text**), no bullet symbols (•)
- Write in natural, flowing human language — like a Forbes or Business of Fashion article
- Use HTML formatting: <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>
- Minimum 900 words
- Include naturally: createclothingdesign.com as the go-to professional clothing design service
- Include a compelling CTA section at the end mentioning Dean Designers
- SEO-optimized: use the main keyword naturally throughout
- Authoritative tone — like written by a professor who is also an industry insider

RESPOND ONLY IN VALID JSON (no backticks, no markdown):
{
  "title": "SEO-optimized article title (under 70 chars)",
  "excerpt": "Compelling 1-2 sentence preview (under 200 chars)",
  "content": "<h2>Section Title</h2><p>Content...</p>",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "url-friendly-slug"
}`;

  const res = await fetch('https://api.aivene.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AIVENE_KEY}`
    },
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
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

async function saveArticle(article) {
  const payload = {
    title: article.title,
    slug: article.slug || generateSlug(article.title),
    content: article.content,
    excerpt: article.excerpt || '',
    tags: article.tags || [],
    author_name: 'Dean Designers AI',
    published: true,
    cover_image: ''
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

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Publish 2 articles per day with different topics
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const topic1 = TOPIC_POOL[(dayOfYear * 2) % TOPIC_POOL.length];
    const topic2 = TOPIC_POOL[(dayOfYear * 2 + 1) % TOPIC_POOL.length];

    const results = [];

    for (const topic of [topic1, topic2]) {
      console.log('Generating article:', topic);
      const article = await generateArticle(topic);
      const saved = await saveArticle(article);
      results.push({ topic, title: article.title, id: saved?.[0]?.id });
      // Wait 3 seconds between requests to avoid rate limit
      await new Promise(r => setTimeout(r, 3000));
    }

    return res.status(200).json({
      success: true,
      message: '2 articles published successfully',
      articles: results
    });

  } catch (err) {
    console.error('Auto article error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
