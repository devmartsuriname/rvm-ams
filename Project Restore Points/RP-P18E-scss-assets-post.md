# Restore Point: RP-P18E-scss-assets-post

**Created:** 2026-03-05
**Phase:** 18E — SCSS & Demo Asset Cleanup (Batch 1)
**Type:** Post-implementation

## Files Deleted (20 files)

### Demo Images — `src/assets/images/small/` (10 files)
- img-1.jpg through img-10.jpg

### Demo Brand SVGs — `src/assets/images/brands/` (5 files)
- bitbucket.svg, dribbble.svg, dropbox.svg, github.svg, slack.svg

### Demo SCSS (5 files)
- `src/assets/scss/pages/_icon-demo.scss`
- `src/assets/scss/plugins/_editors.scss`
- `src/assets/scss/plugins/_google-map.scss`
- `src/assets/scss/plugins/_flatpicker.scss`
- `src/assets/scss/plugins/_vector-map.scss`

## Files Edited (1 file)
- `src/assets/scss/style.scss` — removed 8 dead `@import` lines:
  - `gridjs/dist/theme/mermaid.css`
  - `plugins/dropzone`
  - `plugins/editors`
  - `plugins/gridjs`
  - `plugins/google-map`
  - `plugins/vector-map`
  - `plugins/flatpicker`
  - `pages/icon-demo`

## Proof Method
- grep for each file path and CSS class across all `.ts`, `.tsx`, `.scss`, `.html` files
- All returned 0 references in RVM code

## Build Status
Build succeeds. Pre-existing apexcharts TS1540 warning only (unchanged).

## Protected Assets (confirmed intact)
- All logos (logo-dark.png, logo-light.png, logo-sm.png)
- favicon.ico, 404.svg, maintenance.svg, bg-pattern.svg, bg-pattern-1.png
- avatar-1.jpg (used by ProfileDropdown.tsx)
- All config/structure/component SCSS (Darkone baseline)
- _apexcharts.scss, _simplebar.scss, _authentication.scss

## Scope Compliance
- ✅ Zero DB/schema/RLS/trigger changes
- ✅ Zero new dependencies
- ✅ Zero route/menu changes
- ✅ Zero functional changes

## Governance Declaration
- **Fully Implemented:** Phase 18E Batch 1 — 20 demo files deleted, 8 dead imports removed
- **Deferred to 18E-2:** avatars 2-10, other.ts, DropzoneFormInput, CustomFlatpickr, _gridjs.scss, _dropzone.scss, icons.scss, type cleanup
- **Total ops:** 23 (20 deletes + 1 edit + 2 restore points)

## Runtime Verification
- Pending: smoke test on all 7 RVM pages
