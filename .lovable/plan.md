
# PHASE 9C — UI MICRO POLISH (DARKONE ASSET MAP ALIGNMENT)

**Authority:** Devmart Guardian Rules
**Classification:** Visual Consistency Hardening
**Mode:** Zero Business Logic Expansion
**Date:** 2026-02-26

---

## AUDIT FINDINGS

### 1) SPACING CONSISTENCY -- ALREADY ALIGNED

All RVM pages use consistent patterns:
- Cards: Bootstrap default `margin-bottom: $spacer` (1.5rem) from `_card.scss`
- Filter/action cards use explicit `className="mb-3"` for consistent vertical rhythm
- Container width: inherited from `AdminLayout` wrapper -- consistent across all pages
- `Row` with `g-2` for filter rows, `g-3` for form grids -- consistent Darkone token usage
- `PageTitle` uses `page-title-box` with `padding-bottom: $spacer` -- consistent

**No changes needed.**

### 2) BUTTON ALIGNMENT -- ALREADY ALIGNED

All edit forms (EditDossierForm, EditMeetingForm, EditTaskForm):
- Use `d-flex justify-content-end gap-2 mt-3` pattern
- Cancel (secondary, sm) on left, Save (primary, sm) on right
- Spinner inside Submit button during loading
- Consistent button height (all use `size="sm"`)

All modal footers (CreateDossierModal, CreateMeetingModal, CreateTaskModal):
- Bootstrap `Modal.Footer` default flex layout
- Cancel (secondary) left, Submit (primary) right
- Spinner inside Submit button during loading

**No changes needed.**

### 3) TABLE DENSITY -- ONE INCONSISTENCY FOUND

| Page | `<thead>` class | `<Table>` props | `<CardBody>` padding |
|------|-----------------|-----------------|----------------------|
| Dossiers list | `table-light` | `responsive hover mb-0` | `p-0` |
| Meetings list | `table-light` | `responsive hover mb-0` | `p-0` |
| Meeting detail (agenda) | `table-light` | `responsive hover mb-0` | `p-0` |
| Tasks list | `table-light` | `responsive hover mb-0` | `p-0` |
| **Audit log** | **(none)** | `responsive hover mb-0` | `p-0` |

**Finding:** `src/app/(admin)/rvm/audit/page.tsx` line 78 -- `<thead>` is missing the `table-light` class that all other tables use. This causes a visual inconsistency where the audit table header lacks the light gray background.

**Fix:** Add `className="table-light"` to the `<thead>` element on line 78.

### 4) FORM DENSITY AND RHYTHM -- ALREADY ALIGNED

All forms use identical patterns:
- `Row className="g-3"` for vertical/horizontal gutter (Darkone `$spacer` based)
- `Form.Group` wrapping each field
- `Form.Label` with `font-weight: $font-weight-medium` (from `_forms.scss`)
- Bootstrap default `Form.Control` height (39px min-height for special types)
- Section headings use `<h6 className="text-muted">` with `<hr />` separator (CreateDossierModal)
- Edit forms use `<h6 className="mb-3">` for inline edit title

**No changes needed.**

### 5) CARD HEADER STRUCTURE -- ALREADY ALIGNED

All data table cards use identical header pattern:
- `CardHeader className="d-flex justify-content-between align-items-center"`
- `h5 className="card-title mb-0"` for title (font-size: 1rem from `_card.scss`)
- Action buttons/badges positioned top-right via flexbox
- Detail page sidebar cards use `h6 className="card-title mb-0"` for smaller titles

**No changes needed.**

---

## EXECUTION PLAN

### Files Modified (Code) -- 1 file

**`src/app/(admin)/rvm/audit/page.tsx`** (line 78)
- Change: `<thead>` to `<thead className="table-light">`
- This is a single-attribute addition. Zero logic changes.

### Files Created (Documentation) -- 3 files

1. `Project Restore Points/RP-P9C-pre-ui-micro-polish.md`
2. `Project Restore Points/RP-P9C-post-ui-micro-polish.md`
3. `docs/Phase-9C-UI-Micro-Polish.md`

### Files Updated (Documentation) -- 2 files

4. `docs/backend.md` -- Add Phase 9C status line
5. `docs/architecture.md` -- Add Phase 9C status line

### Build Order

1. Create `RP-P9C-pre-ui-micro-polish.md`
2. Fix audit page thead (1 attribute addition)
3. Create `docs/Phase-9C-UI-Micro-Polish.md` with full audit report
4. Update `docs/backend.md` and `docs/architecture.md`
5. Create `RP-P9C-post-ui-micro-polish.md`

---

## GOVERNANCE DECLARATION

- **1 file modified** (`audit/page.tsx`) -- single CSS class addition
- Zero schema changes
- Zero RLS changes
- Zero new routes
- Zero new modules or components
- Zero hook changes
- Zero validation changes
- Zero business logic changes
- Zero scope expansion

All other audit areas (spacing, buttons, forms, card headers) are already Darkone-compliant and require no changes.
