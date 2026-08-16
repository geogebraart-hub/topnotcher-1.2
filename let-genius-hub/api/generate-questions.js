export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to Vercel Environment Variables, then redeploy.' });
  const { material, category='gened', topic='', count=5, difficulty='mixed', sourceName='' } = req.body || {};
  if (!material || material.trim().length < 80) return res.status(400).json({ error: 'Please provide at least a short section of study material.' });
  const safeCount = Math.min(20, Math.max(1, Number(count)||5));
  const categoryName = {gened:'General Education',profed:'Professional Education',majorship:'Majorship'}[category] || category;
  const prompt = `You are an expert LET (Licensure Examination for Teachers) reviewer and assessment writer. Generate ${safeCount} high-quality multiple-choice questions for ${categoryName}. Difficulty: ${difficulty}. Topic: ${topic || 'Use the most important concepts in the material'}.\n\nSOURCE MATERIAL:\n${material.slice(0, 90000)}\n\nRules:\n- Base the questions and answers primarily on the source material. Do not invent facts that contradict it.\n- Use realistic LET-style stems of moderate length.\n- Four choices exactly (A-D).\n- Exactly one best answer.\n- Distractors must be plausible but clearly less correct.\n- Include a concise but substantive rationale explaining WHY the correct answer is correct, using the concept from the source material. Do not write circular explanations such as "B is correct because B is correct."\n- Also briefly explain the key distinction when a distractor is tempting.\n- Return ONLY valid JSON in this shape: {"questions":[{"question":"...","options":["...","...","...","..."],"correctAnswer":0,"rationale":"...","topic":"...","difficulty":"moderate"}]}\n- correctAnswer is a zero-based integer 0-3.\n- Do not include markdown fences or extra commentary.`;
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
      contents:[{role:'user',parts:[{text:prompt}]}],
      generationConfig:{temperature:0.45,responseMimeType:'application/json'}
    })});
    const data = await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message||'Gemini request failed.'});
    const text = data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('') || '';
    let parsed;
    try { parsed=JSON.parse(text); } catch { const cleaned=text.replace(/^```json\s*/,'').replace(/\s*```$/,''); parsed=JSON.parse(cleaned); }
    const questions=(parsed.questions||[]).filter(q=>q.question&&Array.isArray(q.options)&&q.options.length===4&&Number.isInteger(Number(q.correctAnswer))&&Number(q.correctAnswer)>=0&&Number(q.correctAnswer)<=3&&q.rationale).slice(0,safeCount);
    return res.status(200).json({questions,sourceName});
  } catch(e) { return res.status(500).json({error:e.message||'Unexpected generation error.'}); }
}
