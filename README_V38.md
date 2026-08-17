# V38 — Dashboard Workspace / No Right Gap

This update keeps the V37 TOPNOTCHER! branding and working functionality while replacing the dashboard workspace geometry.

## Layout
- Desktop floating sidebar: 275px, 14px from top/bottom/left.
- Dashboard workspace begins 16px after the sidebar.
- Dashboard workspace ends 16px before the viewport right edge.
- No fixed max-width on dashboard page roots.
- No `100vw` dashboard width arithmetic.
- No CSS `zoom` for the dashboard.
- Main dashboard visual density remains approximately 80% at 100% browser zoom by using a 125% layout box with `transform: scale(.8)`.
- Tablet uses the equivalent 86% density.
- Mobile uses normal 100% sizing.

## Deployment
Replace the project files in GitHub and allow Vercel to redeploy. No environment-variable changes are required.
