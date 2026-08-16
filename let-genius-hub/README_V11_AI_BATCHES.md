# V11 AI Question Generation

AI Question Generator now offers exactly these question-set sizes:

- 50
- 100
- 150
- 200
- 300
- 400

Large sets are generated in batches of up to 20 questions per Gemini request and assembled in the browser. This avoids sending a single oversized generation request. The UI shows generation progress and preserves completed batches if a later batch fails.

Keep `GEMINI_API_KEY` in Vercel Environment Variables. No API key belongs in the frontend or GitHub.
