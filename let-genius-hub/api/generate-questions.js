export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to Vercel Environment Variables, then redeploy.' });
  }

  const { material, category='gened', topic='', count=5, difficulty='mixed', sourceName='' } = req.body || {};
  if (!material || material.trim().length < 80) {
    return res.status(400).json({ error: 'Please provide at least a short section of study material.' });
  }

  const safeCount = Math.min(20, Math.max(1, Number(count) || 5));
  const categoryName = { gened:'General Education', profed:'Professional Education', majorship:'Majorship' }[category] || category;

  const prompt = `You are an expert LET (Licensure Examination for Teachers) reviewer and assessment writer. Generate ${safeCount} high-quality multiple-choice questions for ${categoryName}. Difficulty: ${difficulty}. Topic: ${topic || 'Use the most important concepts in the material'}.

SOURCE MATERIAL:
${material.slice(0, 90000)}

Rules:
- Base the questions, answers, and rationales primarily on the source material. Do not invent facts that contradict it.
- Use realistic LET-style stems of moderate length.
- Four choices exactly (A-D).
- Exactly one best answer.
- Distractors must be plausible but clearly less correct.
- Include a concise but substantive rationale explaining WHY the correct answer is correct, using the concept from the source material.
- Do not write circular explanations such as "B is correct because B is correct."
- Briefly explain the key distinction when a distractor is tempting.
- Return ONLY the requested structured JSON output; do not add markdown or commentary.`;

  const schema = {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: {
              type: 'array',
              items: { type: 'string' }
            },
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
    // Gemini's current Interactions API is the recommended API for new integrations.
    // gemini-3.6-flash is currently listed by Google as a supported model.
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const url = 'https://generativelanguage.googleapis.com/v1beta/interactions';

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        model,
        input: prompt,
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema
        },
        generation_config: {
          thinking_level: 'low',
          max_output_tokens: 12000
        },
        store: false
      })
    });

    const data = await r.json();
    if (!r.ok) {
      const message = data?.error?.message || data?.errors?.[0]?.message || 'Gemini request failed.';
      return res.status(r.status).json({ error: message });
    }

    if (data?.status === 'failed') {
      return res.status(502).json({ error: data?.errors?.[0]?.message || 'Gemini interaction failed.' });
    }

    const text = data?.output_text || data?.steps
      ?.filter(step => step?.type === 'model_output')
      ?.flatMap(step => step?.content || [])
      ?.filter(block => block?.type === 'text')
      ?.map(block => block.text || '')
      ?.join('') || '';

    if (!text) return res.status(502).json({ error: 'Gemini returned no text output.' });

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      try { parsed = JSON.parse(cleaned); }
      catch { return res.status(502).json({ error: 'Gemini returned invalid structured output.' }); }
    }

    const questions = (parsed.questions || [])
      .filter(q => q?.question && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(Number(q.correctAnswer)) && Number(q.correctAnswer) >= 0 && Number(q.correctAnswer) <= 3 && q?.rationale)
      .slice(0, safeCount);

    return res.status(200).json({ questions, sourceName, model });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unexpected generation error.' });
  }
}
