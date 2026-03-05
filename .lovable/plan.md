# Phase 18D — STOP: File Count Exceeds X=25 Limit

## Finding

After inventorying all files in the 7 target directories, the total file count is **59 files to delete** plus **1 file to edit** (route comment) plus **2 restore points to create** = **62 total file operations**.

This exceeds the X=25 hard limit. Per governance rules: **STOP and provide a revised plan + file list.**

## Complete File Inventory (59 demo files)

### `src/app/(admin)/base-ui/` — 29 files


| #   | File                                        |
| --- | ------------------------------------------- |
| 1   | accordion/page.tsx                          |
| 2   | alerts/page.tsx                             |
| 3   | avatar/page.tsx                             |
| 4   | badge/page.tsx                              |
| 5   | breadcrumb/page.tsx                         |
| 6   | buttons/page.tsx                            |
| 7   | cards/page.tsx                              |
| 8   | carousel/page.tsx                           |
| 9   | collapse/page.tsx                           |
| 10  | collapse/components/AllCollapse.tsx         |
| 11  | dropdown/page.tsx                           |
| 12  | list-group/page.tsx                         |
| 13  | modals/page.tsx                             |
| 14  | modals/components/AllModals.tsx             |
| 15  | offcanvas/page.tsx                          |
| 16  | offcanvas/components/AllOffcanvas.tsx       |
| 17  | offcanvas/data.ts                           |
| 18  | pagination/page.tsx                         |
| 19  | pagination/components/AllPagination.tsx     |
| 20  | placeholders/page.tsx                       |
| 21  | placeholders/components/AllPlaceholders.tsx |
| 22  | popovers/page.tsx                           |
| 23  | popovers/components/AllPopovers.tsx         |
| 24  | progress/page.tsx                           |
| 25  | spinners/page.tsx                           |
| 26  | tabs/page.tsx                               |
| 27  | tabs/components/AllNavTabs.tsx              |
| 28  | tabs/data.ts                                |
| 29  | toasts/page.tsx                             |
| —   | toasts/components/AllToasts.tsx             |
| —   | tooltips/page.tsx                           |


(Correction: 31 files in base-ui)

### `src/app/(admin)/forms/` — 8 files

basic/page.tsx, basic/components/BasicExamples.tsx, editors/page.tsx, editors/components/AllEditors.tsx, file-uploads/page.tsx, flat-picker/page.tsx, validation/page.tsx, validation/components/AllFormValidation.tsx

### `src/app/(admin)/apex-chart/` — 2 files

page.tsx, component/AllApexChart.tsx

### `src/app/(admin)/maps/` — 4 files

google/page.tsx, google/component/AllGoogleMaps.tsx, vector/page.tsx, vector/component/AllVectorMaps.tsx

### `src/app/(admin)/tables/` — 4 files

basic/page.tsx, basic/data.ts, gridjs/page.tsx, gridjs/components/AllDataTables.tsx

### `src/app/(admin)/icons/` — 2 files

boxicons/page.tsx, solaricons/page.tsx

### `src/app/(admin)/(layouts)/` — 10 files

dark-mode/page.tsx, dark-mode/components/DarkMode.tsx, dark-sidenav/page.tsx, dark-sidenav/components/DarkSideNav.tsx, dark-topnav/page.tsx, dark-topnav/components/DarkTopNav.tsx, hidden-sidenav/page.tsx, hidden-sidenav/components/HiddenSideNav.tsx, small-sidenav/page.tsx, small-sidenav/components/SmallSideNav.tsx

## Reference Check Results

- **Routes (`src/routes/index.tsx`):** Zero demo routes registered. Only a comment on lines 95-97 mentions them. No edit required (comment is harmless).
- **Menu (`src/assets/data/menu-items.ts`):** Zero demo menu entries. RVM-only items.
- **Cross-imports:** Zero imports from any demo directory into any RVM source file.

## Revised Plan Options

**Option A — Raise limit to 62 and proceed in one pass.**
All 59+ files are confirmed demo-only with zero cross-references. Deletion is safe. Only change beyond deletions: update the route comment (1 line edit) and create 2 restore points.

**Option B — Split into 2 sub-phases (Phase 18D-1 and 18D-2), each under 25.**
Phase 18D-1: Delete base-ui (25 files). Phase 18D-2: Delete forms, apex-chart, maps, tables, icons, layouts (remaining ~36 files).

**Option C — Keep files, mark as deprecated.**
No deletions. Add a README noting these are dead code. Zero risk but no cleanup.

## Phase 18D — Demo/Library Dead Code Removal (Governance-Safe Split)

Authority: Devmart Guardian Rules

Hard Limit: X=25 file operations per execution step (NON-NEGOTIABLE)

Goal: Remove ALL demo/library dead code from main branch (no deprecate-only).

Acceptance: (1) Directories removed, (2) import cleanup complete, (3) grep scan on keywords returns 0 refs:

- base-ui, forms, apex-chart, maps, tables, icons, (layouts)

GOVERNANCE STOP (Current plan):

Your report confirms total ops ~62, exceeding X=25. Do NOT execute as-is.

Required Plan Revision:

Proceed using Option B: split into two sub-phases with independent restore points and verification.

PHASE 18D-1 (<=25 ops):

1) Create restore point: Project Restore Points/[RP-P18D-1-demo-clean-pre.md](http://RP-P18D-1-demo-clean-pre.md)

2) Delete ONLY a subset of src/app/(admin)/base-ui/ pages to stay <=25 total ops INCLUDING restore points.

   - Choose the first 23 deletions (or an equivalent subset) and list them explicitly in the plan.

3) Run verification:

   - Typecheck/build

   - Grep: "base-ui" returns 0 refs outside the deleted paths

   - Confirm src/routes/index.tsx and src/assets/data/menu-items.ts unchanged (no demo routes/menu)

4) Create restore point: Project Restore Points/[RP-P18D-1-demo-clean-post.md](http://RP-P18D-1-demo-clean-post.md)

5) Report: Fully Implemented / Partial / Skipped (must be NONE skipped unless stated).

PHASE 18D-2 (remaining deletions, still split further if needed to keep <=25 each pass):

1) Create restore point: Project Restore Points/[RP-P18D-2-demo-clean-pre.md](http://RP-P18D-2-demo-clean-pre.md)

2) Delete remaining demo directories in controlled batches:

   - Remaining base-ui files

   - forms/

   - apex-chart/

   - maps/

   - tables/

   - icons/

   - (layouts) demo layout pages

   If total ops still exceed 25, split again into 18D-2a / 18D-2b. Never exceed X=25.

3) Verification:

   - Typecheck/build

   - Grep scan for keywords: base-ui, forms, apex-chart, maps, tables, icons, (layouts) => 0 refs

4) Create restore point: Project Restore Points/[RP-P18D-2-demo-clean-post.md](http://RP-P18D-2-demo-clean-post.md)

5) Final governance declaration + file list deleted.

Scope Boundaries (MUST HOLD):

- ZERO schema changes

- ZERO RLS changes

- ZERO trigger changes

- ZERO new dependencies

- No refactors beyond import cleanup required by deletions

- No functional feature changes

Housekeeping:

- Update /docs/[backend.md](http://backend.md) and /docs/[architecture.md](http://architecture.md) with Phase 18D split execution notes + final outcome

Await Further Instructions: Do not proceed with additional features unless the user provides explicit instructions on the next priority.  
  
Recommendation

**Option A** is safest and most efficient. All files are self-contained demo pages with zero external references. The 25-file limit was a safety guard against uncontrolled scope — this case is a controlled bulk deletion of isolated dead code.

Awaiting Devmart authorization to proceed with Option A (or alternative).