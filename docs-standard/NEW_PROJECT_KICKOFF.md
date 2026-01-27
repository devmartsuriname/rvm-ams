# New Project Kickoff Checklist

Step-by-step verification checklist when starting a new project from the Darkone Admin Standard baseline.

---

## A) Clone & Bootstrap

- [ ] Clone from tag: `darkone-admin-standard-v1.0` (preferred)
- [ ] Install dependencies: `npm install`
- [ ] Run dev server: `npm run dev`
- [ ] Confirm clean boot with no console errors
- [ ] Verify auth flow works: Login → Dashboard
- [ ] Verify navigation scope: Dashboard + Authentication only
- [ ] Verify other routes show "Coming Soon" (if applicable)

---

## B) Repo Identity

- [ ] Rename `package.json` name field (line 2)
- [ ] Update app title in `index.html` (line 6)
- [ ] Replace branding assets in `src/assets/images/`:
  - `logo-dark.png` — sidebar/topbar dark mode
  - `logo-light.png` — sidebar/topbar light mode
  - `logo-sm.png` — collapsed sidebar icon
  - `favicon.ico` — browser tab icon
- [ ] Confirm branding renders correctly in sidebar and topbar

---

## C) Governance (Non-Negotiable)

### Guardian Rules Reminder

- **No custom UI patterns** — use existing Darkone components
- **No custom Bootstrap extensions** — use Bootstrap as-is
- **No custom icon libraries** — Iconify only (bx, solar, mingcute sets)
- **No new SCSS files** — use existing SCSS structure
- **No layout changes** — topbar, sidebar, footer remain untouched

### Governance Docs Verification

- [ ] Confirm `DARKONE_ASSET_MAP.md` present at project root
- [ ] Confirm `/docs-standard/` docs exist:
  - `CLONE_WORKFLOW.md`
  - `RELEASE_TAG_GUIDE.md`
  - `NEW_PROJECT_KICKOFF.md` (this file)

---

## D) Project Setup

- [ ] Decide auth provider (conceptual only — no implementation until approved)
- [ ] Decide module roadmap (prioritize which "Coming Soon" routes become real first)
- [ ] Create Restore Point doc before any implementation work

---

## E) QA Smoke Test

Pre-implementation verification before first feature work:

- [ ] Forward navigation works across all pages
- [ ] Back button works (no blank screens)
- [ ] No console errors
- [ ] No 404 or route/layout regressions

---

## Quick Reference

| Asset | Location |
|-------|----------|
| Logo (dark) | `src/assets/images/logo-dark.png` |
| Logo (light) | `src/assets/images/logo-light.png` |
| Logo (small) | `src/assets/images/logo-sm.png` |
| Favicon | `public/favicon.ico` |
| Asset Map | `/DARKONE_ASSET_MAP.md` |
| Guardian Rules | `/README.md` |

---

**Note**: Complete all checklist items before beginning any feature implementation.
