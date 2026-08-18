export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to Vercel Environment Variables, then redeploy.' });
  }

  const { material, category='gened', topic='', count=5, difficulty='mixed', sourceName='', targetPositions=[], excludeQuestions=[] } = req.body || {};
  if (!material || material.trim().length < 80) {
    return res.status(400).json({ error: 'Please provide at least a short section of study material.' });
  }

  const safeCount = Math.min(20, Math.max(1, Number(count) || 5));
  const categoryName = { gened:'General Education', profed:'Professional Education', majorship:'Majorship' }[category] || category;
  const positions = Array.isArray(targetPositions) ? targetPositions.slice(0, safeCount).map(Number) : [];

  const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  const tokens = value => new Set(normalize(value).split(' ').filter(w => w.length > 2));
  const similarity = (a,b) => {
    const A=tokens(a), B=tokens(b);
    if (!A.size || !B.size) return 0;
    let intersection=0; for (const t of A) if (B.has(t)) intersection++;
    return intersection/(A.size+B.size-intersection);
  };
  const excluded = Array.isArray(excludeQuestions) ? excludeQuestions.filter(Boolean).slice(-100) : [];

  const prompt = `You are an expert LET (Licensure Examination for Teachers) reviewer and assessment writer. Generate ${safeCount} high-quality multiple-choice questions for ${categoryName}. Difficulty: ${difficulty}. Topic: ${topic || 'Use the most important concepts in the material'}.

SOURCE MATERIAL:
${material.slice(0, 90000)}

QUESTIONS ALREADY GENERATED OR SAVED — DO NOT REPEAT OR SUBSTANTIALLY RECREATE THESE:
${excluded.map((q,i)=>`${i+1}. ${String(q).slice(0,700)}`).join('\n')}

REQUESTED CORRECT-ANSWER POSITIONS FOR THIS BATCH (0=A, 1=B, 2=C, 3=D):
${positions.length ? positions.join(', ') : 'No fixed sequence; independently diversify positions.'}

Rules:
- Base questions, answers, and rationales primarily on the source material. Do not invent facts that contradict it.
- Use realistic LET-style stems of moderate length.
- Four choices exactly (A-D).
- Exactly one best answer.
- Distractors must be plausible, relevant, and meaningfully different from one another.
- Include a concise but substantive rationale explaining WHY the correct answer is correct and, when useful, the key distinction from the strongest distractor.
- Never output an exact duplicate of an excluded question.
- Never produce a substantially similar question, a simple rewording/paraphrase, or another item that tests essentially the same fact or concept as an excluded question.
- Deliberately vary the tested material: concepts, relationships, applications, examples, dates, names, terminology, principles, comparisons, consequences, and details where the source supports them.
- Across a large set, avoid repeatedly testing the same fact, definition, name, date, or relationship.
- Correct-answer positions must be distributed across A/B/C/D as evenly as practical. B and C must NOT dominate. Do not follow an obvious A-B-C-D or repeating sequence. If requested positions are supplied, place the correct answer in those positions while keeping the question itself natural.
- Do not make the correct option noticeably longer, more qualified, or more specific merely to signal the answer.
- Return ONLY the requested structured JSON output; no markdown or commentary.`;

  const schema = {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswer: { type: 'integer' },
            rationale: { type: 'string' },
            topic: { type: 'string' },
            difficulty: { type: 'string' }
          },
          required: ['question', 'options', 'correctAnswer', 'rationale', 'topic', 'difficulty']
        }
      }
    },
    required: ['questions']
  };

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const url = 'https://generativelanguage.googleapis.com/v1beta/interactions';
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        model,
        input: prompt,
        response_format: { type: 'text', mime_type: 'application/json', schema },
        generation_config: { thinking_level: 'low', max_output_tokens: 12000 },
        store: false
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || data?.errors?.[0]?.message || 'Gemini request failed.' });
    if (data?.status === 'failed') return res.status(502).json({ error: data?.errors?.[0]?.message || 'Gemini interaction failed.' });

    const text = data?.output_text || data?.steps?.filter(step => step?.type === 'model_output')?.flatMap(step => step?.content || [])?.filter(block => block?.type === 'text')?.map(block => block.text || '')?.join('') || '';
    if (!text) return res.status(502).json({ error: 'Gemini returned no text output.' });

    let parsed;
    try { parsed = JSON.parse(text); }
    catch {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      try { parsed = JSON.parse(cleaned); }
      catch { return res.status(502).json({ error: 'Gemini returned invalid structured output.' }); }
    }

    const accepted=[];
    for (const q of (parsed.questions || [])) {
      if (!q?.question || !Array.isArray(q.options) || q.options.length !== 4 || !Number.isInteger(Number(q.correctAnswer)) || Number(q.correctAnswer)<0 || Number(q.correctAnswer)>3 || !q?.rationale) continue;
      if (excluded.some(prev => normalize(prev) === normalize(q.question) || similarity(prev,q.question) >= 0.72)) continue;
      if (accepted.some(prev => normalize(prev.question) === normalize(q.question) || similarity(prev.question,q.question) >= 0.72)) continue;
      accepted.push({...q, correctAnswer:Number(q.correctAnswer), options:q.options.map(String).slice(0,4)});
      if (accepted.length >= safeCount) break;
    }

    return res.status(200).json({ questions: accepted, sourceName, model });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unexpected generation error.' });
  }
}
