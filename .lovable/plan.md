# Phase 10B — Navigation Structure Correction: Standalone Decisions Module

**Authority:** Devmart Guardian Rules
**Mode:** Frontend Only (Navigation + New List Page)
**Scope:** Sidebar item + route + list page for Decisions

---

## Rationale

Decisions are a legally distinct entity (`rvm_decision`) with independent governance (Chair approval gate, finality flag, immutability). They must not be visually conflated with Meetings in navigation. This correction adds a standalone "Decisions" sidebar entry and list page.

---

## Pre-Condition

Create `Project Restore Points/RP-P10B-nav-structure-pre.md` before any changes.

---

## Task 1 — Revert Label Merge

Ensure `src/assets/data/menu-items.ts` line 28 reads `"Meetings"` (not `"Meetings & Decisions"`). Based on current file state, this is already correct -- no change needed.

---

## Task 2 — Add Sidebar Item

Add new entry in `src/assets/data/menu-items.ts` between Meetings and Tasks:

- **key:** `rvm-decisions`
- **label:** `Decisions`
- **icon:** `bx:check-circle` (governance-consistent Boxicons icon, already in Darkone asset map)
- **url:** `/rvm/decisions`

---

## Task 3 — Add Decision Service Method

Add `fetchAllDecisions()` to `src/services/decisionService.ts`:

- Selects all decisions with joined agenda item and dossier info
- Ordered by `created_at` descending
- Same join pattern as existing `fetchDecisionsByMeeting`

---

## Task 4 — Add Hook Query

Add `useAllDecisions()` to `src/hooks/useDecisions.ts`:

- Uses query key `['decisions', 'all']`
- Calls `decisionService.fetchAllDecisions()`

---

## Task 5 — Create Decisions List Page

Create `src/app/(admin)/rvm/decisions/page.tsx`:

- Mirrors the Tasks list page pattern (Card, Table, filters, state components)
- Columns: Decision Text (truncated), Meeting, Dossier, Status, Final, Created
- Status filter dropdown (pending, approved, deferred, rejected)
- Uses `DecisionStatusBadge` from `StatusBadges.tsx`
- Final column: Badge showing "Final" or "Draft"
- Links to parent meeting detail page (where full decision management lives)
- `table-light` thead class per Phase 9C standard
- No create/edit actions on this page (those remain in Meeting Detail)
- Role gating: all authorized roles can view (read-only list)

---

## Task 6 — Register Route

Add to `src/routes/index.tsx`:

- Lazy import: `const DecisionList = lazy(() => import('@/app/(admin)/rvm/decisions/page'))`
- Route: `{ path: '/rvm/decisions', name: 'Decisions', element: <DecisionList /> }`

---

## Task 7 — Documentation & Restore Points

- Create `RP-P10B-nav-structure-pre.md`
- Create `RP-P10B-nav-structure-post.md`
- Update `docs/architecture.md` with navigation correction note

---

## Files Created


| File                                                   | Purpose                        |
| ------------------------------------------------------ | ------------------------------ |
| `src/app/(admin)/rvm/decisions/page.tsx`               | Standalone Decisions list page |
| `Project Restore Points/RP-P10B-nav-structure-pre.md`  | Pre-change restore point       |
| `Project Restore Points/RP-P10B-nav-structure-post.md` | Post-change restore point      |


## Files Modified


| File                              | Change                            |
| --------------------------------- | --------------------------------- |
| `src/assets/data/menu-items.ts`   | Add `rvm-decisions` sidebar entry |
| `src/routes/index.tsx`            | Add `/rvm/decisions` route        |
| `src/services/decisionService.ts` | Add `fetchAllDecisions()` method  |
| `src/hooks/useDecisions.ts`       | Add `useAllDecisions()` hook      |
| `docs/architecture.md`            | Navigation correction note        |


GOVERNANCE NOTE – DATA ACCESS SAFEGUARD (Phase 10B)

Authority: Devmart Guardian Rules  

Scope: Decision Service Implementation  

Mode: Backend Access Discipline (No Schema Changes)

Clarification for Task 3 – fetchAllDecisions()

When implementing fetchAllDecisions(), the following hard governance constraints apply:

1. RLS Integrity

   - The query must fully respect existing Row-Level Security.

   - No RLS bypass patterns.

   - No elevated service role usage.

   - No direct admin-level data access.

2. Select Discipline

   - Avoid unrestricted `.select('*')` patterns.

   - Only select fields required for the Decisions list page.

   - Follow the same join pattern as existing `fetchDecisionsByMeeting`.

3. Join Scope

   - Only join:

     - rvm_agenda_item (minimal fields)

     - rvm_dossier (minimal fields)

   - Do not introduce new entity joins.

   - Do not expose confidential document or audit structures.

4. No Backend Mutation

   - Zero schema changes.

   - Zero RLS modifications.

   - Zero trigger or policy adjustments.

Purpose:

This note ensures that the standalone Decisions list page remains a read-only governance-compliant view, aligned with:

- ERD entity boundaries

- RLS role enforcement

- Decision immutability principles

Status: Mandatory safeguard for implementation.  
  
Scope Boundary

- Zero DB schema changes
- Zero RLS changes
- Zero trigger modifications
- Zero new dependencies
- No workflow changes
- Bootstrap 5 + React-Bootstrap only
- Boxicons icon only (`bx:check-circle`)