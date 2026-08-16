# LET Genius Hub V24

## Changes
- AI Question Generator accepts PDF materials (browser-side text extraction via pdfjs-dist), plus TXT/MD/CSV.
- Progress Dashboard remains the landing page (`page` initializes to `progress`).
- Added calibrated desktop/tablet UI density so browser zoom at 100% visually resembles a compact 75–85% reference view without requiring users to change browser zoom. Mobile remains 100% scale.

## Deploy
Replace the project contents in GitHub and let Vercel redeploy. Keep the existing `GEMINI_API_KEY` environment variable unchanged.

Note: a local npm install/build could not be completed in this environment because dependency installation timed out; Vercel should perform a fresh install from package.json.
