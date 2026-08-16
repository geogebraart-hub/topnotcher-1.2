# LET Genius Hub V4 — Deploy

V4 adds a real timed mock-board exam engine to the existing V3 reviewer.

## GitHub replacement
Replace `src/App.jsx` and `src/styles.css` with the V4 files. Keep your existing `index.html`, `package.json`, Vite config, and environment files unless you intentionally need to change them.

Commit and push to the same branch connected to Vercel. Vercel will redeploy automatically.

## V4 mock exam features
- GenEd, ProfEd, Majorship, and Full Board pools
- 25 / 50 / 75 / 100 / 150 item selection
- Uses only questions currently available in the selected pool
- Randomized order option
- Countdown timer
- Previous / Next navigation
- Direct question-number navigation
- Answered/unanswered indicators
- Submit confirmation
- Automatic score calculation
- 75% passing threshold
- Pass/fail result
- Time used and answer counts
- Question-by-question review
- Optional explanations in results
- Mock score history
- Mock activity written to the progress statistics
- Question performance updated after mock exams
