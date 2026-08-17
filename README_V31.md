# V31 — Definitive Responsive Workspace Fix

Fixes the excessive dashboard gaps caused by legacy max-width and zoom rules.
- Desktop floating sidebar: 275px with 14px viewport inset.
- Main workspace begins after the sidebar and uses all remaining width.
- Removes the old 1500/1700px content caps for the dashboard.
- Removes desktop zoom so viewport calculations remain reliable.
- Keeps modest internal padding for breathing room.
- Tablet and mobile retain responsive behavior.

Deploy by replacing the project files in GitHub and allowing Vercel to rebuild.
