// /api/generate-brief.js — server-side AI brief generation
// C1 FIX: Groq API key moved here from client-side App.tsx

const BRIEF_GROQ_KEY = process.env.GROQ_BRIEF_KEY || process.env.GROQ_API_KEY || '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';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { brandName, serviceType, concept, colors, references } = req.body || {};

  if (!concept && !colors && !references) {
    return res.status(400).json({ error: 'At least one field (concept, colors, references) is required' });
  }

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

PROJECT OVERVIEW:
Summarize the project scope, brand identity, and target audience in 2-3 natural sentences.

DESIGN DIRECTION:
Describe the visual style, mood, and aesthetic in detail. Reference specific design movements, visual metaphors, or cultural influences. Be specific about typography feel, layout approach, and overall visual weight.

COLOR PALETTE:
Define the primary and secondary color direction. Expand on complementary tones, contrast strategy, and how colors should evoke the brand mood.

REFERENCES AND INSPIRATION:
Expand on the client's references. Describe what elements to draw from each reference. If no references given, suggest relevant visual references from the streetwear and brand design world.

TECHNICAL REQUIREMENTS:
Describe expected deliverables, file formats, resolution requirements, and any print-specific or digital-specific notes in full sentences.

DOS AND DONTS:
Write 3-4 specific guidelines to direct the designer, in full sentence form. No bullet points.

Write at least 400 words. Be specific, opinionated, and actionable. Every sentence should give the designer clear direction. Do not use placeholder language.`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BRIEF_GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const data = await groqRes.json();
    const text = data?.choices?.[0]?.message?.content ?? '';

    if (!text) {
      const errMsg = data?.error?.message ?? 'Empty response from AI';
      return res.status(500).json({ error: errMsg });
    }

    return res.status(200).json({ brief: text.trim() });
  } catch (err) {
    console.error('[generate-brief] Error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to generate brief' });
  }
}
