# Phase 18D Verification + Phase 18E Plan

## Section A: Phase 18D Post-Implementation Verification

### 0) Preconditions -- PASS

- Restore points exist: RP-P18D-1 pre/post, RP-P18D-2a pre/post, RP-P18D-2b pre/post
- Build passes (pre-existing apexcharts TS1540 only)
- `src/app/(admin)/` contains only: `dashboards/`, `rvm/`, `search/`, `pages-404-alt/`

### 1) Repo/Import Integrity -- PASS

- Grep for all deleted paths (`base-ui`, `forms`, `apex-chart`, `maps`, `tables`, `icons`, `(layouts)`) returns 0 import references
- One harmless route comment on line 96 of `src/routes/index.tsx` mentions them as documentation
- Zero TypeScript missing module errors

### 2) Routing/Navigation -- PASS (verified via browser in prior session)

- All 7 RVM routes resolve; sidebar shows only RVM modules

### 3) Runtime Smoke Test -- PASS (verified via browser in prior session)

- All 7 pages loaded without console errors

### 4) Governance Declaration

- **Fully Implemented:** Phase 18D -- Demo/library directory removal (61 files across 3 batches)
- **Partially Implemented:** NONE
- **Deferred:** NONE
- **Known issue:** apexcharts TS1540 warning (pre-existing, acceptable)

---

## Section B: Phase 18E -- SCSS & Demo Asset Cleanup Plan

### Candidate Inventory with Evidence

#### DELETABLE Demo Images (0 references in any `.ts`, `.tsx`, `.scss`, `.html`)


| #     | File                                                                                               | Proof                      |
| ----- | -------------------------------------------------------------------------------------------------- | -------------------------- |
| 1-10  | `src/assets/images/small/img-1.jpg` through `img-10.jpg`                                           | grep `small/img-` = 0 hits |
| 11-15 | `src/assets/images/brands/bitbucket.svg`, `dribbble.svg`, `dropbox.svg`, `github.svg`, `slack.svg` | grep `brands/` = 0 hits    |


**Total: 15 image files -- confirmed zero references**

#### DELETABLE Demo SCSS (no CSS classes used by RVM code)


| #   | File                                       | Proof                                                                                                       |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 16  | `src/assets/scss/pages/_icon-demo.scss`    | `.icon-box` class has 0 usage outside this file; demo icons pages deleted                                   |
| 17  | `src/assets/scss/plugins/_editors.scss`    | Empty file (comment only); demo editors page deleted                                                        |
| 18  | `src/assets/scss/plugins/_google-map.scss` | Empty file (comment only); demo maps page deleted                                                           |
| 19  | `src/assets/scss/plugins/_vector-map.scss` | Styles for jsvectormap; demo maps pages deleted; no RVM page uses vector maps                               |
| 20  | `src/assets/scss/plugins/_flatpicker.scss` | Styles for flatpickr; `CustomFlatpickr.tsx` exists but is never imported by any RVM component (0 consumers) |


#### DELETABLE Demo Data/Component Files (0 consumers)


| #   | File                                        | Proof                                                                                                                |
| --- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 21  | `src/assets/data/other.ts`                  | Zero imports from any file. All exports (`pricingData`, `projectsData`, `dataTableRecords`, etc.) are demo-only data |
| 22  | `src/components/from/DropzoneFormInput.tsx` | Zero imports. RVM uses `useDropzone` hook directly, not this wrapper component                                       |
| 23  | `src/components/CustomFlatpickr.tsx`        | Zero imports from any RVM component                                                                                  |


#### REQUIRES EDIT (import removal from `style.scss`)


| #   | File                         | Change                                                                                                                                                                                                                     |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 24  | `src/assets/scss/style.scss` | Remove 5 `@import` lines: `plugins/dropzone`, `plugins/editors`, `plugins/gridjs`, `plugins/google-map`, `plugins/vector-map`, `plugins/flatpicker`, `pages/icon-demo`. Also remove `gridjs/dist/theme/mermaid.css` import |


Wait -- `_dropzone.scss` needs careful review. RVM uses `react-dropzone` but the `.dropzone` CSS class from `_dropzone.scss` is NOT used by RVM upload components (confirmed grep). Safe to remove the SCSS import.

However, `_gridjs.scss` has substantial styling. Let me check if gridjs is used anywhere in RVM...

Actually from my earlier search, `gridjs` and `gridjs-react` have zero imports in any RVM component. The gridjs pages were deleted. Safe to remove.

#### PROTECTED (DO NOT DELETE)


| File                                                          | Reason                                                                                                                                                                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/assets/images/logo-dark.png`                             | Brand logo                                                                                                                                                                                                                |
| `src/assets/images/logo-light.png`                            | Brand logo                                                                                                                                                                                                                |
| `src/assets/images/logo-sm.png`                               | Brand logo                                                                                                                                                                                                                |
| `src/assets/images/favicon.ico`                               | App icon                                                                                                                                                                                                                  |
| `src/assets/images/404.svg`                                   | Error page                                                                                                                                                                                                                |
| `src/assets/images/maintenance.svg`                           | System page                                                                                                                                                                                                               |
| `src/assets/images/bg-pattern.svg`                            | Theme background                                                                                                                                                                                                          |
| `src/assets/images/bg-pattern-1.png`                          | Theme background                                                                                                                                                                                                          |
| `src/assets/images/users/avatar-1.jpg`                        | Used by ProfileDropdown.tsx (topbar)                                                                                                                                                                                      |
| `src/assets/images/users/avatar-2.jpg` through `avatar-7.jpg` | Referenced in `other.ts` -- but `other.ts` itself is unused. However, `avatar-1.jpg` IS used by ProfileDropdown. avatars 2-7 only used by `other.ts` which has zero consumers. **Safe to delete 2-10 but keep avatar-1.** |
| All config/structure/component SCSS                           | Darkone baseline -- protected                                                                                                                                                                                             |
| `_apexcharts.scss`                                            | Used by dashboard charts                                                                                                                                                                                                  |
| `_simplebar.scss`                                             | Used by sidebar/scrollable areas                                                                                                                                                                                          |
| `_authentication.scss`                                        | Used by auth pages                                                                                                                                                                                                        |
| `_dropzone.scss`                                              | CSS class `.dropzone` NOT used by RVM -- **safe to remove import but keep file ambiguous**                                                                                                                                |


Correction on avatars: `avatar-1.jpg` is used by `ProfileDropdown.tsx`. Avatars 2-7 are imported ONLY in `other.ts` which has zero consumers. Avatars 8-10 have zero references anywhere. So avatars 2-10 can be deleted.

Revised file count: Let me also add `_gridjs.scss` file deletion and the `gridjs/dist/theme/mermaid.css` import removal.

### Execution Plan

**Batch 18E-1 (25 ops)**

1. Create `Project Restore Points/RP-P18E-scss-assets-pre.md` (1 op)
2. Delete 15 demo images: `small/img-1` through `img-10`, `brands/bitbucket.svg` through `slack.svg` (15 ops)
3. Delete `src/assets/scss/pages/_icon-demo.scss` (1 op)
4. Delete `src/assets/scss/plugins/_editors.scss` (1 op)
5. Delete `src/assets/scss/plugins/_google-map.scss` (1 op)
6. Delete `src/assets/scss/plugins/_flatpicker.scss` (1 op)
7. Delete `src/assets/scss/plugins/_vector-map.scss` (1 op)
8. Edit `src/assets/scss/style.scss` -- remove 7 dead `@import` lines (1 op)
9. Create `Project Restore Points/RP-P18E-scss-assets-post.md` (1 op -- only if under 25; otherwise defer to batch 2)

**Total: 23 ops** -- under limit. Post-restore point fits.

**If approved, Batch 18E-2 (remaining cleanup, separate authorization)**

1. Delete `src/assets/images/users/avatar-2.jpg` through `avatar-10.jpg` (9 files)
2. Delete `src/assets/data/other.ts` (1 file)
3. Delete `src/components/from/DropzoneFormInput.tsx` (1 file)
4. Delete `src/components/CustomFlatpickr.tsx` (1 file)
5. Delete `src/assets/scss/plugins/_gridjs.scss` (1 file)
6. Delete `src/assets/scss/plugins/_dropzone.scss` (1 file)
7. Delete `src/assets/scss/icons/_boxicons.scss` + `src/assets/scss/icons.scss` (2 files -- legacy, 7000+ lines of dead CSS)
8. Clean up `DropzoneFormInputProps` type from `src/types/component-props.ts` (1 edit)
9. Clean up demo types from `src/types/data.ts` (Employee, PaginationType, SearchType, SortingType, LoadingType, HiddenType, PricingType, ProjectType, etc.) (1 edit)
10. Restore points (2 files)

**Total: ~19 ops** -- under limit.

### Ensure that SCSS removal does not unintentionally remove shared variables or mixins referenced by protected theme files.

During verification run:

- SCSS compile check

- Visual smoke test of sidebar, topbar, forms, and dashboard widgets  
  
**Verification (both batches)**

- Build check (apexcharts warning only)
- Runtime smoke test on all 7 RVM pages
- Grep scan confirms 0 references to deleted files

### Scope Compliance

- Zero DB/schema/RLS/trigger changes
- Zero new dependencies
- Zero route/menu changes
- Zero functional changes