const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';
// TODO: Set AIVENE_API_KEY in Vercel env vars and remove hardcoded fallback
const AIVENE_KEY = process.env.AIVENE_API_KEY || 'isk-GNByYriUHJP1S5uFeNJJI3rW9zBVqvZbiHyRFtIN';
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
  const prompt = `You are Xavian — a senior content strategist and fashion industry writer with 15 years of experience. You have written for major fashion and business publications covering streetwear, brand identity, and clothing design. You are personally responsible for ensuring every article you write ranks on Google Page 1 within 90 days.

Your mission: Write a world-class, Google-indexable SEO article for Dean Designers (createclothingdesign.com) — the leading professional streetwear and logo design studio with 7+ years, 1000+ projects, 5.0 stars on Fiverr, serving 25+ countries.

TOPIC: ${topic}

SEO TECHNICAL REQUIREMENTS (mandatory for Google indexing):
- Primary keyword: extract from topic, use naturally in title, first paragraph, 2-3 subheadings, and conclusion
- Secondary keywords: 3-5 related LSI (Latent Semantic Indexing) keywords woven naturally throughout
- Title: 50-60 characters, includes primary keyword, compelling and click-worthy
- Meta description (excerpt): 150-160 characters, includes keyword, strong value proposition
- URL slug: short, keyword-rich, hyphenated, no stop words
- Article length: minimum 1200 words (longer content ranks better on Google)
- Reading level: professional yet accessible (Flesch-Kincaid grade 8-10)
- Internal linking opportunity: mention "visit createclothingdesign.com" naturally at least 2 times
- E-E-A-T signals: include specific data, statistics, expert opinions, or real examples

CONTENT STRUCTURE (proven Google-ranking structure):
1. Hook opening paragraph — state the problem/opportunity, hook reader in first 2 sentences
2. H2: Main topic introduction with keyword
3. H2: Core section 1 with actionable insights
4. H3: Supporting subsection with specific details
5. H2: Core section 2 with data or examples  
6. H3: Supporting subsection
7. H2: Core section 3
8. H2: How Dean Designers / createclothingdesign.com solves this (natural CTA integration)
9. H2: Conclusion with clear takeaway and CTA

WRITING STANDARDS (PhD-level quality):
- Zero asterisks, zero markdown symbols, zero bullet characters (•)
- Flowing academic-journalistic prose — authoritative, specific, never vague
- Every paragraph adds unique value — no filler sentences
- Include at least 2 specific statistics, numbers, or data points
- Reference real industry concepts, movements, or trends
- Write as if this article will be published in Forbes tomorrow
- Natural keyword density: 1-2% (not stuffed)

HTML FORMAT ONLY:
- Use <h2> for main sections, <h3> for subsections
- Use <p> for paragraphs
- Use <strong> for emphasis on key terms (not overuse)
- Use <ul><li> only when genuinely listing 3+ comparable items
- Also provide image_search_term: 2-4 simple, visual, photographable English words describing what a stock photo for this article should show. Think like a photographer, not an SEO writer. Good examples: "streetwear clothing rack", "fashion designer sketching", "hoodie flat lay photography", "tailor sewing fabric", "graphic designer laptop workspace". Bad examples (too abstract): "brand identity", "ROI", "digital marketing strategy".

RESPOND ONLY IN VALID JSON (no backticks, no markdown before or after):
{
  "title": "SEO-optimized title 50-60 chars with primary keyword",
  "excerpt": "Meta description 150-160 chars with keyword and value prop",
  "content": "<h2>Section Title with Keyword</h2><p>Opening hook...</p>...",
  "tags": ["primary-keyword", "secondary-keyword-1", "secondary-keyword-2", "lsi-keyword-1", "lsi-keyword-2"],
  "slug": "short-keyword-rich-slug",
  "image_search_term": "simple visual photo keywords"
}`;

  const aiRes = await fetch('https://api.aivene.com/v1/chat/completions', {
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
  // Check content type before parsing
  const contentType = aiRes.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const rawText = await aiRes.text();
    throw new Error('Aivene API returned non-JSON: ' + rawText.substring(0, 200));
  }
  const data = await aiRes.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('Empty response from AI');
  try {
    return JSON.parse(text.replace(/```json|```/g,'').trim());
  } catch(e) {
    throw new Error('AI response is not valid JSON: ' + text.substring(0,200));
  }
}

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '3z1g8HJ4g4nQJ8vEwAIRFMJEhX1CqMtp1Refz8iiJ8myGMJSolzq7AVn';

async function findCoverImage(keywords, articleId) {
  // Ensure keywords is always a string
  const kw = Array.isArray(keywords) ? keywords.join(' ') : String(keywords || '');
  const cleanQuery = kw.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'fashion streetwear design';

  // Try Pexels first — real relevant photos matching the topic
  if (PEXELS_API_KEY) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanQuery)}&per_page=5&orientation=landscape`,
        { headers: { Authorization: PEXELS_API_KEY } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          // Pick a photo based on articleId hash so re-runs are consistent-ish but varied across articles
          const idx = Math.abs(hashCode(articleId || cleanQuery)) % data.photos.length;
          return data.photos[idx].src.large2x || data.photos[idx].src.large;
        }
      }
    } catch (e) {
      console.error('Pexels search failed:', e.message);
    }
  }

  // Fallback: Picsum with seed (not topic-relevant, but always works)
  const seed = (kw + (articleId || Date.now())).replace(/[^a-zA-Z0-9]/g, '').substring(0, 40) || ('article' + Date.now());
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/630`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

async function saveArticle(article, coverUrl) {
  let slug = article.slug || generateSlug(article.title);

  // Check if slug already exists, append suffix if needed
  for (let attempt = 0; attempt < 10; attempt++) {
    const checkSlug = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?slug=eq.${encodeURIComponent(checkSlug)}&select=id&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const existing = await checkRes.json();
    if (!existing || existing.length === 0) {
      slug = checkSlug;
      break;
    }
    if (attempt === 9) {
      // Last resort: append timestamp
      slug = `${slug}-${Date.now().toString(36)}`;
    }
  }

  const payload = {
    title: article.title,
    slug,
    content: article.content,
    excerpt: article.excerpt || '',
    cover_image: coverUrl || '',
    tags: article.tags || [],
    author_name: 'Xavian',
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
  // Use article title as deterministic seed so the same article always gets the same image
  const rawKeywords = article.image_search_term || (Array.isArray(article.tags) ? article.tags.slice(0,2).join(' ') : '') || topic;
  const imageKeywords = Array.isArray(rawKeywords) ? rawKeywords.join(' ') : String(rawKeywords || topic);
  const coverUrl = await findCoverImage(imageKeywords, article.title);
  const saved = await saveArticle(article, coverUrl);
  return { topic, title: article.title, id: saved?.[0]?.id, has_image: !!coverUrl };
}

const GROQ_KEY = process.env.GROQ_API_KEY || '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';

async function getExistingTitles() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=title,slug&order=created_at.desc&limit=50`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();
    return (data || []).map(a => a.title);
  } catch { return []; }
}

async function generateUniqueTopic() {
  const existingTitles = await getExistingTitles();
  const existingList = existingTitles.length > 0
    ? existingTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')
    : '(none yet)';

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const month = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prompt = `You are a senior SEO content strategist for Dean Designers (createclothingdesign.com) — a professional clothing design and logo design service.

Today is ${dateStr}.

EXISTING ARTICLES (DO NOT repeat these topics or angles):
${existingList}

Generate ONE fresh, unique article topic that:
1. Is COMPLETELY DIFFERENT from all existing articles above — different angle, different keyword, different audience segment
2. Targets a high-value SEO keyword related to clothing design, streetwear, logo design, branding, or fashion entrepreneurship
3. Is timely and relevant for ${month}
4. Would rank on Google for long-tail searches
5. Naturally promotes createclothingdesign.com or Dean Designers

Think creatively — consider these angles:
- Seasonal/event-based (holidays, fashion weeks, back-to-school, etc.)
- Industry news and emerging trends
- Case studies and success stories
- Technical guides (fabric, printing, color theory, file formats)
- Business strategy (pricing, marketing, launching, scaling)
- Comparison posts (service A vs B, method X vs Y)
- Listicles and curated guides
- Regional/cultural fashion topics
- Niche markets (anime merch, band merch, sports teams, corporate)
- Platform-specific (Etsy, Shopify, TikTok Shop, Instagram)

Respond with ONLY the article topic as a single line. No quotes, no numbering, no explanation.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 1.1,
      }),
    });
    const data = await res.json();
    const topic = (data.choices?.[0]?.message?.content || '').trim();
    if (topic && topic.length > 10) {
      console.log('[Auto-Article] AI generated unique topic:', topic);
      return topic;
    }
  } catch (e) {
    console.error('[Auto-Article] Groq topic generation failed:', e.message);
  }

  // Fallback: pick random from pool, but skip topics whose slugs already exist
  const usedSlugs = new Set(existingTitles.map(t => generateSlug(t)));
  const available = TOPIC_POOL.filter(t => !usedSlugs.has(generateSlug(t)));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  // Last resort: random pool topic + unique angle
  return TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)] + ' — ' + dateStr + ' edition';
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
      // Smart topic: AI generates fresh unique topic based on what's already published
      topics = [await generateUniqueTopic()];
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
