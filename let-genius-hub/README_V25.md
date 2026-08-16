# LET Genius Hub V26

- Study Now question navigator now uses explicit unanswered/current/correct/wrong states.
- Correct answers turn green after advancing; wrong answers turn red.
- Current questions retain a blue outline while preserving the result color.
- PDF upload is hardened using PDF.js legacy build with the worker disabled for Vercel/Vite reliability.
- PDF upload accepts `.pdf` and `application/pdf`; readable text PDFs are extracted in-browser.
- Clear error messaging is shown for password-protected or scanned/image-only PDFs.
