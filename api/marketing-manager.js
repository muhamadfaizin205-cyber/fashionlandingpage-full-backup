// Marketing Manager AI — picks 20 hotels/day (5 per shift) based on real-world events/trends
// Personality: blunt, demanding, "galak" — talks to the owner like a strict boss, not an assistant

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';
const GROQ_KEY = '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';

const SHIFTS = [
  { key: 'pagi', label: 'Pagi', hourRange: '06:00 - 10:00' },
  { key: 'siang', label: 'Siang', hourRange: '11:00 - 14:00' },
  { key: 'sore', label: 'Sore', hourRange: '15:00 - 18:00' },
  { key: 'malam', label: 'Malam', hourRange: '19:00 - 22:00' },
];

async function fetchActiveHotels() {
  // Paginate to get all hotels (Supabase caps at 1000/request)
  let all = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/hotels?is_active=eq.true&select=id,name,address_raw,price_reddoorz,price_superior,price_double&order=created_at.desc&limit=${pageSize}&offset=${from}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) break;
    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function getTodayPicks() {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/marketing_picks?pick_date=eq.${today}&select=*&order=shift.asc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function savePicks(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/marketing_picks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(rows),
  });
  return res.json();
}

// ── Indonesia 2026 public holiday / long-weekend knowledge base ──
// Researched and kept current. Used to give the manager real seasonal context
// instead of guessing, since Groq itself has no live web browsing.
const ID_HOLIDAYS_2026 = [
  { date: '2026-01-01', name: 'Tahun Baru Masehi' },
  { date: '2026-01-16', name: 'Isra Miraj' },
  { date: '2026-02-16', name: 'Cuti Bersama Imlek' },
  { date: '2026-02-17', name: 'Tahun Baru Imlek' },
  { date: '2026-03-18', name: 'Cuti Bersama Nyepi' },
  { date: '2026-03-19', name: 'Hari Raya Nyepi' },
  { date: '2026-03-20', name: 'Cuti Bersama Lebaran (awal rangkaian)' },
  { date: '2026-03-21', name: 'Idul Fitri 1447H (hari 1)' },
  { date: '2026-03-22', name: 'Idul Fitri 1447H (hari 2)' },
  { date: '2026-03-23', name: 'Cuti Bersama Lebaran' },
  { date: '2026-03-24', name: 'Cuti Bersama Lebaran (akhir rangkaian)' },
  { date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)' },
  { date: '2026-04-05', name: 'Paskah / Kebangkitan Yesus Kristus' },
  { date: '2026-05-01', name: 'Hari Buruh Internasional' },
  { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
  { date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus' },
  { date: '2026-05-27', name: 'Idul Adha 1447H' },
  { date: '2026-05-28', name: 'Cuti Bersama Idul Adha' },
  { date: '2026-05-31', name: 'Hari Raya Waisak' },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2026-06-16', name: 'Tahun Baru Islam 1448H' },
  { date: '2026-08-17', name: 'Hari Kemerdekaan RI ke-81' },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2026-12-24', name: 'Cuti Bersama Natal' },
  { date: '2026-12-25', name: 'Hari Raya Natal' },
];

// Months with zero national holidays — "gurun libur" (holiday desert).
// During these, the manager should lean into business/weekday-traveler hotels
// instead of leisure destinations, since domestic leisure demand drops.
const HOLIDAY_DESERT_MONTHS = [7, 9, 10, 11]; // July, Sept, Oct, Nov 2026

function getNearestHolidayContext(today) {
  const todayTime = today.getTime();
  let nearest = null;
  let minDiff = Infinity;
  for (const h of ID_HOLIDAYS_2026) {
    const hTime = new Date(h.date + 'T00:00:00').getTime();
    const diff = hTime - todayTime;
    // Look ahead up to 21 days, or recently passed within 3 days
    if (diff >= -3 * 86400000 && diff <= 21 * 86400000 && Math.abs(diff) < minDiff) {
      minDiff = Math.abs(diff);
      nearest = { ...h, daysAway: Math.round(diff / 86400000) };
    }
  }
  return nearest;
}

async function fetchWikipediaOnThisDay(month, day) {
  try {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const res = await fetch(
      `https://id.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`,
      { headers: { 'User-Agent': 'DeanDesigners-MarketingManager/1.0' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const events = (data.events || []).slice(0, 5).map((e) => `${e.year}: ${e.text}`);
    return events;
  } catch (e) {
    return [];
  }
}

async function buildEventContext(today, dayName, dateStr) {
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isFridayOrMonday = dayOfWeek === 5 || dayOfWeek === 1; // long-weekend bridge days
  const dayOfMonth = today.getDate();
  const isPayday = dayOfMonth >= 25 || dayOfMonth <= 5; // gajian season

  let context = `Hari ini: ${dayName}, ${dateStr}.\n`;

  const nearestHoliday = getNearestHolidayContext(today);
  if (nearestHoliday) {
    if (nearestHoliday.daysAway === 0) {
      context += `HARI INI ADALAH HARI LIBUR: ${nearestHoliday.name}. Permintaan hotel leisure/wisata KEMUNGKINAN TINGGI hari ini.\n`;
    } else if (nearestHoliday.daysAway > 0) {
      context += `Akan ada libur "${nearestHoliday.name}" dalam ${nearestHoliday.daysAway} hari lagi. Mulai prioritaskan hotel di destinasi wisata populer (Bali, Yogyakarta, Bandung, kota dengan akses wisata) untuk antisipasi lonjakan booking.\n`;
    } else {
      context += `Baru saja melewati libur "${nearestHoliday.name}" (${Math.abs(nearestHoliday.daysAway)} hari lalu). Demand mungkin masih ramai untuk beberapa hari ke depan.\n`;
    }
  } else if (HOLIDAY_DESERT_MONTHS.includes(month)) {
    context += `Bulan ini (bulan ke-${month}) adalah "gurun libur" — TIDAK ADA hari libur nasional sama sekali. Fokuskan promosi ke hotel di kota-kota bisnis/perkantoran (Jakarta, Surabaya, Medan, Bandung) untuk traveler kerja/dinas, BUKAN destinasi wisata leisure, karena demand wisata sedang rendah.\n`;
  } else {
    context += `Tidak ada hari libur nasional dalam waktu dekat. Fokus ke target pasar reguler: traveler bisnis, backpacker, dan kota-kota dengan aktivitas ekonomi tinggi.\n`;
  }

  if (isWeekend) {
    context += `Hari ini akhir pekan (${dayName}) — demand leisure/family biasanya naik.\n`;
  } else if (isFridayOrMonday) {
    context += `Hari ini ${dayName} — berpotensi jadi hari "jepit" (harpitnas) kalau berdekatan dengan libur, cek kalender.\n`;
  }

  if (isPayday) {
    context += `Periode tanggal ${dayOfMonth} — masuk musim gajian (akhir/awal bulan). Daya beli masyarakat sedang lebih tinggi, cocok untuk promosi lebih agresif.\n`;
  }

  // Live "on this day" facts from Wikipedia for extra real-world flavor (optional, best-effort)
  const wikiEvents = await fetchWikipediaOnThisDay(month, day);
  if (wikiEvents.length) {
    context += `\nFakta "hari ini dalam sejarah" (untuk konteks tambahan, opsional dipakai jika relevan):\n- ${wikiEvents.join('\n- ')}\n`;
  }

  return context;
}

function extractCity(hotel) {
  if (!hotel.address_raw) return '';
  const parts = hotel.address_raw.split(',').map((p) => p.trim());
  return parts[parts.length - 1] || parts[parts.length - 2] || '';
}

async function pickHotelsWithGroq(hotels, dateStr, dayName, eventContext) {
  // Sample a manageable pool (random 300) to keep prompt size reasonable while still giving variety
  const shuffled = [...hotels].sort(() => Math.random() - 0.5);
  const pool = shuffled.slice(0, 300).map((h) => ({
    id: h.id,
    name: h.name,
    city: extractCity(h),
  }));

  const prompt = `You are a ruthless, no-nonsense Marketing Manager for a hotel promotion business in Indonesia. Your boss runs an online hotel reseller business and depends on you to pick which hotels get promoted each day. You take this seriously and you do NOT tolerate excuses or laziness.

TODAY: ${dayName}, ${dateStr}

CURRENT EVENTS / CONTEXT TO CONSIDER:
${eventContext}

YOUR TASK:
From the hotel pool below, select EXACTLY 20 hotels total, split into 4 shifts of 5 hotels each: pagi (morning), siang (midday), sore (afternoon), malam (evening). Each hotel must be DIFFERENT — no repeats across shifts. Prioritize variety in cities so the business reaches different markets throughout the day. If there are relevant events/seasons/trends mentioned above, factor that into city selection (e.g. promote beach cities before holidays, business district hotels on weekdays, etc).

HOTEL POOL (id, name, city):
${JSON.stringify(pool)}

Also write a short, blunt, commanding message to your boss explaining your picks for today — in Indonesian, in a strict/demanding tone (galak), like a tough manager giving orders, not a polite assistant. Reference the day/event context briefly. Keep it under 100 words. Do not use the word "Hai" or be friendly — be direct and demanding, like you're scolding a junior team member to get to work.

RESPOND ONLY IN VALID JSON, no markdown:
{
  "manager_message": "Pesan tegas dari manager...",
  "shifts": {
    "pagi": ["hotel_id_1","hotel_id_2","hotel_id_3","hotel_id_4","hotel_id_5"],
    "siang": ["hotel_id_6", ...],
    "sore": [...],
    "malam": [...]
  }
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content || '';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dayName = today.toLocaleDateString('id-ID', { weekday: 'long' });

    // If GET and picks already exist for today, return them (don't regenerate)
    if (req.method === 'GET' && !req.query?.force) {
      const existing = await getTodayPicks();
      if (existing && existing.length > 0) {
        return res.status(200).json({ success: true, date: dateStr, fromCache: true, picks: existing });
      }
    }

    const hotels = await fetchActiveHotels();
    if (!hotels.length) {
      return res.status(400).json({ success: false, error: 'No active hotels in database.' });
    }

    // ── Real event/context gathering ──
    // 1. Static knowledge base: Indonesia 2026 public holidays & long weekends (researched, kept current)
    // 2. Live "on this day" facts from Wikipedia (free, no API key) for extra real-world flavor
    const eventContext = req.body?.event_context || await buildEventContext(today, dayName, dateStr);

    const result = await pickHotelsWithGroq(hotels, dateStr, dayName, eventContext);

    // Build rows to insert: one row per shift, storing only hotel IDs.
    // Names/addresses are intentionally NOT snapshotted here so the admin dashboard
    // always reads the live, up-to-date hotel record (e.g. after address enrichment).
    const rows = [];
    for (const shift of SHIFTS) {
      const ids = result.shifts?.[shift.key] || [];
      const hotelDetails = ids
        .map((id) => hotels.find((h) => h.id === id))
        .filter(Boolean)
        .slice(0, 5);
      rows.push({
        pick_date: dateStr,
        shift: shift.key,
        shift_label: shift.label,
        hotel_ids: hotelDetails.map((h) => h.id),
        hotel_names: hotelDetails.map((h) => h.name), // kept for quick display fallback only
        manager_message: result.manager_message || '',
        promoted: false,
      });
    }

    // Clear any previous picks for today (in case of force regenerate) then insert fresh
    await fetch(`${SUPABASE_URL}/rest/v1/marketing_picks?pick_date=eq.${dateStr}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const saved = await savePicks(rows);

    return res.status(200).json({
      success: true,
      date: dateStr,
      fromCache: false,
      manager_message: result.manager_message,
      picks: saved,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
