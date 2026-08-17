# LET Genius Hub V36 — Final Dashboard Workspace Geometry

V36 fixes the recurring dashboard right-side gap by anchoring `.main` with a real left margin and right margin instead of viewport-width calculations. The desktop dashboard content uses CSS zoom only on the page content wrapper (80% visual density) while expanding its layout box to 125%, so the visual result fills the available workspace.

Desktop geometry: floating sidebar at 14px from left, 275px wide; 16px gap; dashboard workspace; 16px right breathing space.

No Gemini/API environment changes are required.
