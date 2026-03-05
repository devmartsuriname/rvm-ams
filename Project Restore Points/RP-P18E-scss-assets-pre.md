# Restore Point: RP-P18E-scss-assets-pre

**Created:** 2026-03-05
**Phase:** 18E — SCSS & Demo Asset Cleanup (Batch 1)
**Type:** Pre-implementation
**Baseline:** Phase 18D complete; 61 demo files deleted, RVM-only codebase

## Scope Statement

Delete demo images and unused SCSS files with zero references in RVM code.

### Deletions (20 files)
- `src/assets/images/small/img-1.jpg` through `img-10.jpg` (10 files)
- `src/assets/images/brands/bitbucket.svg`, `dribbble.svg`, `dropbox.svg`, `github.svg`, `slack.svg` (5 files)
- `src/assets/scss/pages/_icon-demo.scss` (1 file)
- `src/assets/scss/plugins/_editors.scss` (1 file)
- `src/assets/scss/plugins/_google-map.scss` (1 file)
- `src/assets/scss/plugins/_flatpicker.scss` (1 file)
- `src/assets/scss/plugins/_vector-map.scss` (1 file)

### Edits (1 file)
- `src/assets/scss/style.scss` — remove 7 dead `@import` lines + `gridjs/dist/theme/mermaid.css`

### Protected Assets (confirmed safe)
- All logos, favicons, bg-patterns, avatar-1.jpg
- All config/structure/component SCSS (Darkone baseline)
- `_apexcharts.scss`, `_simplebar.scss`, `_authentication.scss`

**Total: 20 deletes + 1 edit + 2 restore points = 23 ops (under 25 limit)**
