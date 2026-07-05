// Auto-Roast: checks promotion progress hourly, generates a savage/funny scolding via Groq
// if the owner is behind schedule for the current shift.

const SUPABASE_URL = 'https://zqawpdspxdcmofnmrbku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXdwZHNweGRjbW9mbm1yYmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY5MTQxNiwiZXhwIjoyMDk3MjY3NDE2fQ.zX6eUF2DNd046VZkW8g4ik5T24a5VWyi0_MI2SKD2gM';
const GROQ_KEY = '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';

// Shift deadlines in WIB (UTC+7). If the shift's end hour has passed and it's
// still not marked promoted, that's when the roast gets triggered.
const SHIFT_DEADLINES = {
  pagi:  { endHourWIB: 10, label: 'Pagi' },
  siang: { endHourWIB: 14, label: 'Siang' },
  sore:  { endHourWIB: 18, label: 'Sore' },
  malam: { endHourWIB: 22, label: 'Malam' },
};

function getWIBHour() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  return (utcHour + 7) % 24;
}

async function getTodayPicks(dateStr) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/marketing_picks?pick_date=eq.${dateStr}&select=*`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function getRecentRoasts(dateStr) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/marketing_roasts?roast_date=eq.${dateStr}&select=shift`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function saveRoast(row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/marketing_roasts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });
  return res.json();
}

async function generateRoast(shiftLabel, hoursLate, totalDone, totalTarget) {
  const prompt = `You are a savage, foul-tempered Marketing Manager roasting your employee (the boss of a hotel reseller business) for being late on their daily promotion tasks. You are NOT polite. You are demanding, brutally honest, occasionally funny/sarcastic, and you do not hold back — but you're not generic, you reference the specific situation.

SITUATION: Shift "${shiftLabel}" deadline has passed by approximately ${hoursLate} hour(s) and the owner has NOT marked it as promoted yet. So far today they've completed ${totalDone} out of ${totalTarget} total hotel promotions.

Write a short, savage roast in Indonesian (informal, "lo/gue" or "kamu" style — casual but harsh), mixing genuine anger/disappointment with dark humor or sarcasm. Reference the specific shift and lateness. Make it feel personal and alive, like a real fed-up boss texting their underperforming employee — NOT corporate, NOT generic motivational quotes. Maximum 60 words. Do not use emojis. Do not soften the blow with encouragement at the end — end on the roast, not on positivity.

Respond with ONLY the roast text, no quotes, no JSON, no preamble.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 1.0,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return (data.choices?.[0]?.message?.content || '').trim();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const wibHour = getWIBHour();

    const picks = await getTodayPicks(dateStr);
    const alreadyRoasted = await getRecentRoasts(dateStr);
    const roastedShifts = new Set((alreadyRoasted || []).map((r) => r.shift));

    const totalTarget = (picks || []).reduce((sum, p) => sum + (p.hotel_ids?.length || 0), 0);
    const totalDone = (picks || []).filter((p) => p.promoted).reduce((sum, p) => sum + (p.hotel_ids?.length || 0), 0);

    const newRoasts = [];

    for (const shiftKey of Object.keys(SHIFT_DEADLINES)) {
      const deadline = SHIFT_DEADLINES[shiftKey];
      const pick = (picks || []).find((p) => p.shift === shiftKey);

      // Only roast if: deadline has passed, shift exists with hotels assigned,
      // it's not yet marked promoted, and we haven't already roasted this shift today
      if (wibHour >= deadline.endHourWIB && pick && pick.hotel_ids?.length && !pick.promoted && !roastedShifts.has(shiftKey)) {
        const hoursLate = wibHour - deadline.endHourWIB;
        const roastText = await generateRoast(deadline.label, hoursLate || 1, totalDone, totalTarget);

        const saved = await saveRoast({
          roast_date: dateStr,
          shift: shiftKey,
          roast_text: roastText,
          hours_late: hoursLate || 1,
        });
        newRoasts.push(saved?.[0]);
      }
    }

    return res.status(200).json({
      success: true,
      wibHour,
      newRoasts: newRoasts.filter(Boolean),
      message: newRoasts.length ? `${newRoasts.length} roast(s) generated.` : 'No roasts needed right now.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

