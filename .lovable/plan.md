

# PHASE 9A — UI STABILITY & CONSISTENCY HARDENING

**Authority:** Devmart Guardian Rules
**Classification:** Zero-Scope-Expansion
**Date:** 2026-02-26

---

## TASK 1: Fix React Fragment Key Warnings

Two files use bare `<>` fragments wrapping sibling `<tr>` elements inside `.map()`, which causes React key warnings.

### Files Modified

**`src/app/(admin)/rvm/tasks/page.tsx`** (line 198)
- Replace `<>` with `<React.Fragment key={task.id}>` (and closing tag)
- Remove redundant `key={task.id}` from the inner `<tr>` on line 199 (key moves to Fragment)

**`src/app/(admin)/rvm/audit/page.tsx`** (line 93)
- Replace `<>` with `<React.Fragment key={evt.id}>` (and closing tag)
- Remove redundant `key={evt.id}` from the inner `<tr>` on line 95

Both are 2-line changes per file. No logic changes.

---

## TASK 2: Modal Standardization Audit (Report Only)

### Inventory

| Modal/Form | Type | Size Prop | Layout | Notes |
|---|---|---|---|---|
| `CreateDossierModal` | `<Modal>` | `size="lg"` | 2-column grid, `centered` | Most fields, widest content |
| `CreateMeetingModal` | `<Modal>` | (default/medium) | 2-column grid, `centered` | Only 3 fields; smaller is appropriate |
| `CreateTaskModal` | `<Modal>` | `size="lg"` | 2-column grid, `centered` | Many fields, consistent with Dossier |
| `EditDossierForm` | Inline form (not modal) | N/A | 2-column grid | Toggle on detail page |
| `EditMeetingForm` | Inline form (not modal) | N/A | 2-column grid | Toggle on detail page |
| `EditTaskForm` | Inline form (not modal) | N/A | 2-column grid, `bg-light` wrapper | Inline on list page |

### Findings

- **Sizing inconsistency:** `CreateMeetingModal` uses default (medium) size while the other two create modals use `size="lg"`. This is functionally acceptable given Meeting has far fewer fields, but is inconsistent.
- **Edit forms are NOT modals** -- they are inline toggle forms. No modal standardization applies to them.
- **All modals use `centered` prop** -- consistent.
- **All modals use the same Footer pattern** (Cancel + Submit with Spinner) -- consistent.

### Recommendation (Deferred)
- Standardize `CreateMeetingModal` to `size="lg"` in a future UI Polish phase for visual consistency across all create modals.
- No changes in Phase 9A per scope constraints.

---

## TASK 3: Spinner & Loading Consistency Audit

### Architecture Review

- **Single `<ToastContainer>`**: Confirmed at `AppProvidersWrapper.tsx` line 29. No duplicates anywhere.
- **Route-level loading gate**: `router.tsx` lines 20-26 renders single `<LoadingFallback />` during auth init for protected routes. Auth routes bypass the gate.
- **AdminLayout**: `TopNavigationBar` uses `fallback={null}`, `VerticalNavigationBar` uses `fallback={<div />}`, page content uses `fallback={<LoadingFallback />}`. This is the correct single-spinner pattern.
- **No duplicate spinners**: Each page uses its own `isLoading` state from React Query hooks, rendering `<LoadingState />` component. No overlapping spinners.

### Verdict: No duplicate spinners detected. No fix needed.

---

## TASK 4: Route & Navigation Integrity

### Routes Registered (from `src/routes/index.tsx`)

| Route | Component | Auth Protected |
|---|---|---|
| `/` | Redirect to `/dashboards` | Yes |
| `/dashboards` | Dashboards | Yes |
| `/rvm/dossiers` | DossierList | Yes |
| `/rvm/dossiers/:id` | DossierDetail | Yes |
| `/rvm/meetings` | MeetingList | Yes |
| `/rvm/meetings/:id` | MeetingDetail | Yes |
| `/rvm/tasks` | TaskList | Yes |
| `/rvm/audit` | AuditLog | Yes |
| `/auth/sign-in` | AuthSignIn | No (public) |
| `*` (catch-all) | Redirect | Conditional |

### Menu Items (from `src/assets/data/menu-items.ts`)

5 entries: Dashboard, Dossiers, Meetings, Tasks, Audit Log. All resolve to registered routes.

### Verdict
- 0 orphan routes
- 0 broken menu entries
- 0 Darkone demo routes in router
- All protected routes gated by `isAuthenticated` check
- Catch-all properly redirects

---

## TASK 5: Governance Integrity Declaration

Phase 9A modifies exactly **2 files**:
1. `src/app/(admin)/rvm/tasks/page.tsx` -- Fragment key fix only
2. `src/app/(admin)/rvm/audit/page.tsx` -- Fragment key fix only

Confirmation:
- No schema changed
- No RLS changed
- No new routes added
- No new modules added
- Zero scope expansion

---

## FILES TO CREATE/MODIFY

### Modified (code changes)
- `src/app/(admin)/rvm/tasks/page.tsx` -- Replace `<>` with `<React.Fragment key={task.id}>`
- `src/app/(admin)/rvm/audit/page.tsx` -- Replace `<>` with `<React.Fragment key={evt.id}>`

### Created (documentation only)
- `Project Restore Points/RP-P9A-pre-stability-hardening.md`
- `Project Restore Points/RP-P9A-post-stability-hardening.md`
- `docs/Phase-9-UI-Stability-Report.md` -- Contains Tasks 2-4 audit findings
- `docs/backend.md` -- Append Phase 9 status line
- `docs/architecture.md` -- Append Phase 9 status line

### Build Order
1. Create `RP-P9A-pre-stability-hardening.md`
2. Fix Fragment keys in `tasks/page.tsx` and `audit/page.tsx`
3. Create `docs/Phase-9-UI-Stability-Report.md` with modal audit, spinner audit, and route verification
4. Update `docs/backend.md` and `docs/architecture.md`
5. Create `RP-P9A-post-stability-hardening.md`

