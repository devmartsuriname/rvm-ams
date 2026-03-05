# Phase 14 — Decision List & Report Generation: Implementation Plan

## Current State Analysis

### What exists:

- **Global Decision List** (`/rvm/decisions`): Basic table with status filter, columns: Decision Text, Dossier, Meeting link, Lifecycle badge, Created date
- **Meeting Decisions Tab** (`/rvm/meetings/:id` → Decisions tab): Shows decisions per meeting with agenda number, text, status, chair approval, manage actions
- **Service layer**: `fetchAllDecisions()` and `fetchDecisionsByMeeting()` already exist with proper joins
- **Print CSS**: `_print.scss` already hides sidebar/topbar/footer for `@media print`

### What's missing (per Phase 14 scope):

1. Enhanced columns on global list (Decision Number, Responsible Unit, Meeting reference)
2. Sorting capability
3. Report generation (printable HTML layout with header, meeting info, decision table, signature placeholders)
4. Print/export action buttons

---

## Plan

### Part 1 — Enhance Global Decision Register (`/rvm/decisions`)

**File:** `src/app/(admin)/rvm/decisions/page.tsx`

Add columns:

- `#` (agenda_number from joined agenda item)
- Agenda Item (agenda_number reference)
- Title/Summary (decision_text, expanded)
- Decision Status (existing lifecycle badge)
- Decision Date (created_at)
- Meeting (link to meeting detail with date label)
- Dossier (existing link)
- Final status (is_final badge)

Add sorting: client-side sort by column header (date, status, agenda number). Use `useState` for sort field + direction.

Add meeting filter: `Form.Select` dropdown populated from distinct meeting_ids in the decision data.

**Service change:** Update `fetchAllDecisions()` in `decisionService.ts` to also select `chair_approved_at`, `chair_approved_by`, `updated_at` — needed for report detail. Also join `rvm_meeting` through the agenda item to get `meeting_date`.

Updated query:

```sql
select: id, decision_text, decision_status, is_final, created_at, updated_at,
  chair_approved_at, chair_approved_by,
  rvm_agenda_item!inner(
    id, agenda_number, meeting_id,
    rvm_dossier:dossier_id(id, dossier_number, title, sender_ministry),
    rvm_meeting:meeting_id(id, meeting_date, meeting_type, status)
  )
```

### Part 2 — Decision Report Component

**New file:** `src/components/rvm/DecisionReport.tsx`

A printable HTML report component that renders:

1. **Header**: System title "RVM-AMS Decision Report", generation timestamp
2. **Meeting info** (if meeting-scoped): date, type, location, status
3. **Decision table**: all decisions with agenda number, dossier reference, decision text (full), status, chair approval date
4. **Signature placeholders**: "Chair RVM: ___________" and "Secretary RVM: ___________" with date line

The component uses a `ref` and `window.print()` for printing. Print CSS already handles hiding navigation.

Add a `@media print` section in `_print.scss` for `.decision-report` class to ensure clean page breaks and proper margins.

### Part 3 — Report Generation Actions

**Meeting Detail page** (`src/app/(admin)/rvm/meetings/[id]/page.tsx`):

- Add "Print Decision Report" button in the Decisions tab header
- Opens a print-optimized view using the `DecisionReport` component in a modal or inline print target

**Global Decision page** (`src/app/(admin)/rvm/decisions/page.tsx`):

- Add "Print Register" button in the card header
- Prints current filtered view using `DecisionReport` component

### Part 4 — Navigation

**No sidebar changes required.** The "Decisions" entry already exists under "RVM CORE" at `/rvm/decisions`. The Phase 14 spec mentions adding under "Governance" section — however, moving the existing entry would break the established navigation structure. The existing placement is correct and consistent.

**No new routes required.** `/rvm/decisions` already exists. Meeting decisions are accessed via the existing `/rvm/meetings/:id` Decisions tab. No separate `/meetings/:id/decisions` route is needed — it would duplicate the tab functionality.

---

## Files to Create

1. `src/components/rvm/DecisionReport.tsx` — Printable report component
2. `Project Restore Points/RP-P14-decision-reports-pre.md`
3. `Project Restore Points/RP-P14-decision-reports-post.md`

## Files to Modify

1. `src/app/(admin)/rvm/decisions/page.tsx` — Enhanced columns, sorting, meeting filter, print button
2. `src/app/(admin)/rvm/meetings/[id]/page.tsx` — Print button in Decisions tab
3. `src/services/decisionService.ts` — Expand `fetchAllDecisions()` select to include meeting data
4. `src/assets/scss/components/_print.scss` — Report-specific print styles
5. `docs/backend.md` — Phase 14 entry
6. `docs/architecture.md` — Phase 14 entry

## Governance Note (Devmart):

Decision reports must reflect the exact decision ordering

as presented in the meeting agenda.

Sorting priority for reports must be:

1) meeting_date

2) agenda_number

The report component must not reorder decisions

based on creation timestamp.

Agenda order is the authoritative ordering for governance records.  
Governance

- Zero schema changes
- Zero RLS changes
- Zero new routes (uses existing)
- Zero sidebar changes (uses existing)
- Zero new dependencies
- Print uses native `window.print()` + existing `@media print` CSS