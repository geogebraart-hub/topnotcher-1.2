# LET Genius Hub V10 — AI Question Generator

V10 adds an AI question generator to each Study Deck. It uses a Vercel serverless endpoint (`/api/generate-questions`) so the Gemini API key is never placed in browser JavaScript.

## Vercel setup

Add this Environment Variable in the Vercel project:

- `GEMINI_API_KEY` = your Gemini API key
- Optional: `GEMINI_MODEL` = `gemini-2.5-flash` (default)

Redeploy after adding/changing environment variables.

## How it works

Study Deck → Open Deck → AI Generate → paste material or upload TXT/MD/CSV → choose count/difficulty/topic → Generate Questions → review question, choices, correct answer and rationale → Save to Deck.

The generated question object stores `explanation` from the AI rationale, so it is shown later in study sessions and mock-exam review.

V10's browser uploader intentionally supports text materials first. PDF/DOCX/image extraction can be added as the next ingestion layer without changing the question schema or Gemini endpoint.
