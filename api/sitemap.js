// Dynamic sitemap generator - fetches all published articles from Supabase
// and returns a complete sitemap.xml including article URLs
// Google will crawl this at /api/sitemap and get fresh URLs every time

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTE0MTYsImV4cCI6MjA5NzI2NzQxNn0.vRPaxLCPNPbNnHpsAClr_gr_pCpcbvBbDdAcEGhCT_E';
const BASE_URL = 'https://www.createclothingdesign.com';

async function fetchArticles() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?published=eq.true&select=slug,updated_at&order=created_at.desc&limit=500`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  const TODAY = new Date().toISOString().split('T')[0];
  const articles = await fetchArticles();

  const staticUrls = [
    { loc: `${BASE_URL}/`, changefreq: 'weekly', priority: '1.0', lastmod: TODAY },
    { loc: `${BASE_URL}/gigs`, changefreq: 'weekly', priority: '0.9', lastmod: TODAY },
    { loc: `${BASE_URL}/articles`, changefreq: 'daily', priority: '0.9', lastmod: TODAY },
    { loc: `${BASE_URL}/streetwear-design`, changefreq: 'monthly', priority: '0.9', lastmod: TODAY },
    { loc: `${BASE_URL}/logo-design`, changefreq: 'monthly', priority: '0.9', lastmod: TODAY },
    { loc: `${BASE_URL}/tshirt-design`, changefreq: 'monthly', priority: '0.9', lastmod: TODAY },
    { loc: `${BASE_URL}/hoodie-design`, changefreq: 'monthly', priority: '0.9', lastmod: TODAY },
    { loc: `${BASE_URL}/clothing-brand-design`, changefreq: 'monthly', priority: '0.9', lastmod: TODAY },
    { loc: `${BASE_URL}/merch-design`, changefreq: 'monthly', priority: '0.9', lastmod: TODAY },
  ];

  const articleUrls = articles
    .filter(a => a.slug)
    .map(a => ({
      loc: `${BASE_URL}/articles/${a.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: (a.updated_at || TODAY).split('T')[0],
    }));

  const allUrls = [...staticUrls, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1 jam
  return res.status(200).send(xml);
}


