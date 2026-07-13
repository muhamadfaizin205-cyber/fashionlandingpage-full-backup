// Vercel Serverless: /api/gigs-ssr.js
// Serves SEO-optimized static HTML to search engine bots.
// Regular users get the interactive SPA.

import fs from 'fs';
import path from 'path';

const BOT_UA = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot|slurp|duckduckbot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|perplexitybot|applebot|google-extended|oai-searchbot|chatgpt-user/i;

export default async function handler(req, res) {
  const ua = req.headers['user-agent'] || '';

  try {
    if (BOT_UA.test(ua)) {
      // Bot → serve the static SEO page with Product schema
      const p = path.join(process.cwd(), 'dist', 'lp', 'gigs.html');
      const fallback = path.join(process.cwd(), 'public', 'lp', 'gigs.html');
      const html = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : fs.readFileSync(fallback, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).send(html);
    }

    // Human → serve the SPA
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    const indexFallback = path.join(process.cwd(), 'index.html');
    const spa = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : fs.readFileSync(indexFallback, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(spa);
  } catch (err) {
    return res.status(500).send('Error loading page');
  }
}
