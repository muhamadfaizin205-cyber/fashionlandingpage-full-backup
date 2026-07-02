// Vercel Serverless: /api/messages.js
// D2 FIX: Server-side messages API — replaces direct anon Supabase queries
// Supports: GET (read), POST (send), PATCH (update/mark-read), DELETE

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';
const ADMIN_HASH = '2d72f552e5a25f4f0643facba66e69718da62369b01ce5782128f867f77e60a0';

async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: opts.prefer || 'return=representation',
      ...(opts.headers || {}),
    },
  });
  return res.json();
}

function isAdmin(req) {
  return req.headers['x-admin-hash'] === ADMIN_HASH;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-hash, x-user-email');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userEmail = (req.headers['x-user-email'] || '').trim().toLowerCase();
  const admin = isAdmin(req);

  try {
    // ── GET: Read messages ──
    if (req.method === 'GET') {
      const email = req.query.email;
      if (!email) return res.status(400).json({ error: 'email required' });

      // Admin can read any email's messages; client can only read their own
      if (!admin && userEmail !== email.toLowerCase()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Admin: get ALL messages (for conversations list)
      if (admin && req.query.all === '1') {
        const data = await sbFetch('messages?select=*&order=created_at.desc');
        return res.status(200).json({ success: true, messages: data });
      }

      const data = await sbFetch(`messages?order_email=eq.${encodeURIComponent(email)}&select=*&order=created_at.asc`);
      return res.status(200).json({ success: true, messages: data || [] });
    }

    // ── POST: Send message ──
    if (req.method === 'POST') {
      const body = req.body;
      if (!body || !body.order_email) return res.status(400).json({ error: 'order_email required' });

      // Client can only send messages from their own email
      if (!admin && userEmail !== body.order_email.toLowerCase()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const payload = {
        order_email: body.order_email,
        order_id: body.order_id || null,
        sender_email: admin ? 'admin@deandesigners.com' : body.sender_email,
        sender_type: admin ? 'admin' : 'client',
        message: body.message || '',
        voice_url: body.voice_url || null,
        read: false,
        delivered: false,
        reply_to: body.reply_to || null,
      };

      const data = await sbFetch('messages', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.status(200).json({ success: true, message: Array.isArray(data) ? data[0] : data });
    }

    // ── PATCH: Update message (edit, mark read) ──
    if (req.method === 'PATCH') {
      const { id, ids, updates } = req.body || {};

      // Bulk mark-read
      if (ids && Array.isArray(ids) && ids.length > 0) {
        for (const msgId of ids) {
          await sbFetch(`messages?id=eq.${msgId}`, {
            method: 'PATCH',
            body: JSON.stringify({ read: true, delivered: true }),
          });
        }
        return res.status(200).json({ success: true, updated: ids.length });
      }

      // Single update (edit message)
      if (id && updates) {
        const allowed = {};
        if (updates.message !== undefined) allowed.message = updates.message;
        if (updates.edited_at !== undefined) allowed.edited_at = updates.edited_at;
        if (updates.read !== undefined) allowed.read = updates.read;
        if (updates.delivered !== undefined) allowed.delivered = updates.delivered;

        const data = await sbFetch(`messages?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify(allowed),
        });
        return res.status(200).json({ success: true, message: data });
      }

      return res.status(400).json({ error: 'id or ids required' });
    }

    // ── DELETE ──
    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sbFetch(`messages?id=eq.${id}`, { method: 'DELETE' });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[messages API]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
