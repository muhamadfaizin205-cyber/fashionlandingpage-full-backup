// Vercel Serverless: /api/article-ssr.js
// SEO FIX: Server-side rendered HTML for article pages
// Googlebot gets full article content + meta tags + JSON-LD
// Regular users get redirected to the SPA

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';
const BASE_URL = 'https://www.createclothingdesign.com';

const BOT_UA = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot|slurp|duckduckbot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|perplexitybot|applebot/i;

function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function stripHtml(s) { return (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }

export default async function handler(req, res) {
  const slug = req.query.slug;
  const ua = req.headers['user-agent'] || '';

  // Only serve SSR to bots — regular users get the SPA
  if (!BOT_UA.test(ua)) {
    // Serve the SPA by reading index.html
    const fs = require('fs');
    const path = require('path');
    try {
      const indexPath = path.join(process.cwd(), 'dist', 'index.html');
      const fallbackPath = path.join(process.cwd(), 'index.html');
      const html = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : fs.readFileSync(fallbackPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    } catch {
      return res.redirect(302, '/');
    }
  }

  if (!slug) return res.status(404).send('Not found');

  try {
    const apiRes = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=*&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await apiRes.json();
    if (!data || !data.length) return res.status(404).send('Article not found');

    const a = data[0];
    const title = esc(a.title);
    const excerpt = esc((a.excerpt || stripHtml(a.content).substring(0, 155)));
    const author = esc(a.author_name || 'Xavian');
    const date = a.created_at ? new Date(a.created_at).toISOString() : new Date().toISOString();
    const cover = a.cover_image || `${BASE_URL}/og-image.jpg`;
    const url = `${BASE_URL}/articles/${slug}`;
    const tags = (a.tags || []).map(t => esc(t));
    const readTime = Math.max(1, Math.ceil(stripHtml(a.content).split(/\s+/).length / 200));

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} — Dean Designers</title>
<meta name="description" content="${excerpt}">
<meta name="author" content="${author}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${excerpt}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(cover)}">
<meta property="og:site_name" content="Dean Designers">
<meta property="article:author" content="${author}">
<meta property="article:published_time" content="${date}">
${tags.map(t => `<meta property="article:tag" content="${t}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${excerpt}">
<meta name="twitter:image" content="${esc(cover)}">
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Article",
  "headline":"${title}",
  "description":"${excerpt}",
  "image":"${esc(cover)}",
  "author":{"@type":"Person","name":"${author}"},
  "publisher":{"@type":"Organization","name":"Dean Designers","url":"${BASE_URL}","logo":{"@type":"ImageObject","url":"${BASE_URL}/favicon-512x512.png","width":512,"height":512}},
  "datePublished":"${date}",
  "dateModified":"${a.updated_at || date}",
  "mainEntityOfPage":{"@type":"WebPage","@id":"${url}"},
  "keywords":"${tags.join(', ')}",
  "wordCount":${stripHtml(a.content).split(/\s+/).length},
  "timeRequired":"PT${readTime}M",
  "isPartOf":{"@type":"Blog","name":"Dean Designers Journal","url":"${BASE_URL}/articles"}
}
</script>
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"BreadcrumbList",
  "itemListElement":[
    {"@type":"ListItem","position":1,"name":"Home","item":"${BASE_URL}"},
    {"@type":"ListItem","position":2,"name":"Articles","item":"${BASE_URL}/articles"},
    {"@type":"ListItem","position":3,"name":"${title}","item":"${url}"}
  ]
}
</script>
</head>
<body>
<header>
<h1>${title}</h1>
<p>By ${author} · ${new Date(date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})} · ${readTime} min read</p>
${tags.length ? '<p>Tags: ' + tags.join(', ') + '</p>' : ''}
</header>
<main>
${a.cover_image ? `<img src="${esc(a.cover_image)}" alt="${title}" width="1200" height="630">` : ''}
<article>${a.content}</article>
</main>
<footer>
<p>© Dean Designers — Professional Streetwear & Logo Design Studio</p>
<p><a href="${BASE_URL}">createclothingdesign.com</a> · <a href="${BASE_URL}/articles">More Articles</a></p>
</footer>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.status(200).send(html);
  } catch (err) {
    console.error('[article-ssr]', err.message);
    return res.status(500).send('Server error');
  }
}

