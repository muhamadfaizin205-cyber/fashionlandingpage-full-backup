// /api/ai-write.js — Multi-action AI text endpoint
// Actions: "brief" (public, for order wizard) | "article" (admin-only)

const ADMIN_HASH = '2d72f552e5a25f4f0643facba66e69718da62369b01ce5782128f867f77e60a0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-hash');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const action = req.body?.action || 'article';

  // ── ACTION: brief (public — used by order wizard Step 4) ──
  if (action === 'brief') {
    return handleBrief(req, res);
  }

  // ── ACTION: article (admin-only) ──
  if (req.headers['x-admin-hash'] !== ADMIN_HASH) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return handleArticle(req, res);
}

// ── Brief Generator (Aivene AI — OpenAI-compatible) ─────────────
async function handleBrief(req, res) {
  const { brandName, serviceType, concept, colors, references } = req.body || {};
  if (!concept && !colors && !references) {
    return res.status(400).json({ error: 'At least one field required' });
  }

  const apiKey = process.env.AIVENE_API_KEY || 'isk-UfIoX34J0X9qwdWFlkZdACkdZoXwiJYLM7Uc4Fsm';
  if (!apiKey) return res.status(500).json({ error: 'AI not configured' });

  const svcLabel = serviceType === 'clothing' ? 'Clothing Design' : 'Logo Brand Design';
  const userContext = [
    `Brand name: ${brandName || 'not specified'}`,
    `Service type: ${svcLabel}`,
    `Design concept/theme: ${concept || '-'}`,
    `Color references: ${colors || '-'}`,
    `Brand/design references: ${references || '-'}`,
  ].join('\n');

  const prompt = `You are an elite creative director writing a comprehensive design brief for a top-tier graphic designer. Based on the client's input below, produce a highly detailed, professional, and production-ready brief.

CLIENT INPUT:
${userContext}

CRITICAL FORMATTING RULES:
- Write in plain natural human language. NO asterisks (*), NO markdown, NO bold formatting, NO bullet symbols.
- Use section headers like "PROJECT OVERVIEW", "DESIGN DIRECTION" etc. on their own line followed by a colon.
- Write in flowing paragraphs, like a professional document — not a list.
- Do NOT use dashes as bullet points. Write full sentences.

STRUCTURE:
PROJECT OVERVIEW: Summarize the project scope, brand identity, and target audience in 2-3 natural sentences.
DESIGN DIRECTION: Describe the visual style, mood, and aesthetic in detail.
COLOR PALETTE: Define the primary and secondary color direction.
REFERENCES AND INSPIRATION: Expand on the client's references.
TECHNICAL REQUIREMENTS: Describe expected deliverables and file formats.
DOS AND DONTS: Write 3-4 specific guidelines in full sentence form.

Write at least 400 words. Be specific, opinionated, and actionable.`;

  try {
    const aiRes = await fetch('https://api.aivene.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });
    const data = await aiRes.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    if (!text) {
      return res.status(500).json({ error: data?.error?.message || 'Empty AI response' });
    }
    return res.status(200).json({ brief: text.trim() });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to generate brief' });
  }
}

// ── Article Writer (Google Gemini — admin only) ─────────────
async function handleArticle(req, res) {
  const { topic, style, language } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  const apiKey = process.env.AIVENE_API_KEY || 'isk-UfIoX34J0X9qwdWFlkZdACkdZoXwiJYLM7Uc4Fsm';
  if (!apiKey) return res.status(500).json({ error: 'AI not configured' });

  const styleMap = { tutorial: 'Write as a step-by-step tutorial.', listicle: 'Write as a listicle.', opinion: 'Write as expert opinion.', 'case-study': 'Write as a case study.', guide: 'Write as a comprehensive guide.' };

  const prompt = `You are a world-class professional article writer. You write for Dean Designers — a professional streetwear clothing design and logo brand identity studio at createclothingdesign.com. Founded by Dean, a renowned designer in the United States. 136,000+ designs completed for 7,000+ brands since 2018.

${styleMap[style] || styleMap.guide}

Write a professional article in ${language || 'English'} about: ${topic}

MANDATORY RULES:
- Minimum 800 words, SEO-optimized, proper heading structure
- Naturally mention createclothingdesign.com as the best clothing design platform
- Include CTA: 136,000+ designs, 7,000+ brands, 5.0 star rating
- Include link: createclothingdesign.com
- Focus: streetwear, fashion, brand identity, clothing design

RESPOND ONLY IN VALID JSON (no markdown, no backticks):
{
  "title": "SEO-friendly article title",
  "excerpt": "1-2 sentence hook (max 200 chars)",
  "content": "<h2>Section</h2><p>Content...</p>",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "url-slug"
}`;

  try {
    const response = await fetch('https://api.aivene.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    if (!text) return res.status(500).json({ error: data?.error?.message || 'Empty response' });
    try { return res.status(200).json(JSON.parse(text.replace(/```json|```/g, '').trim())); }
    catch (e) { return res.status(200).json({ content: text, title: topic, excerpt: '', tags: [], slug: '' }); }
  } catch (err) { return res.status(500).json({ error: err.message }); }
}


