# Phase 10D — Chair Gate Formalization Layer

**Authority:** Devmart Guardian Rules
**Mode:** Workflow Visibility Tightening
**Scope:** Decision Finalization Visibility + Chair Gate Clarity

---

## Pre-Condition

- Phase 10C: CLOSED (verified in `docs/backend.md`)
- No immutability gaps exist (confirmed in Phase 10C)
- Create `Project Restore Points/RP-P10D-chair-gate-pre.md`

---

## Current State Assessment

### What exists today:

1. **Decision badges**: `DecisionStatusBadge` shows `pending/approved/deferred/rejected`. A separate `Badge bg="dark"` shows "Final" when `is_final = true`. These are used in:
  - Meeting Detail page (agenda table Decision column)
  - Meeting Detail Decisions Summary sidebar
  - Decisions List page
  - Decision Management Modal
2. **Chair approval info**: Only shown in `DecisionManagementModal` as a small text line (`chair_approved_at`) — and only when `chair_approved_by` is already set. No "Awaiting Chair Approval" state shown.
3. **Role-based actions**: `ChairApprovalActions` and `DecisionStatusActions` correctly check `canFinalizeDecision` and `canApproveDecision`. But super_admin sees all buttons (mirroring RLS override).
4. **Dossier progression**: `DossierStatusActions` correctly maps `decided -> archived` only. No regression possible in UI.

### Gaps identified:

- No unified "decision lifecycle badge" showing Draft vs Awaiting Chair Approval vs Final
- Chair Gate section in modal is minimal (just a timestamp line, no visual separator)
- No "Awaiting Chair Approval" indicator when decision is approved but not yet finalized
- Audit viewer has no special filtering for finalization events

---

## Task 1 — Decision State Visibility Standardization

### Change: Create `DecisionLifecycleBadge` component

A single component that renders the correct lifecycle state badge based on decision data:


| Condition                                             | Badge                 | Color       |
| ----------------------------------------------------- | --------------------- | ----------- |
| `is_final = true`                                     | "Finalized"           | `success`   |
| `decision_status = 'approved'` AND `is_final = false` | "Awaiting Chair Gate" | `warning`   |
| `decision_status = 'pending'`                         | "Pending"             | `secondary` |
| `decision_status = 'deferred'`                        | "Deferred"            | `info`      |
| `decision_status = 'rejected'`                        | "Rejected"            | `danger`    |


This replaces the current two-badge pattern (DecisionStatusBadge + separate "Final" badge) with one consistent component.

### Files modified:

- `src/components/rvm/StatusBadges.tsx` — Add `DecisionLifecycleBadge` component
- `src/app/(admin)/rvm/meetings/[id]/page.tsx` — Use new badge in agenda table and sidebar
- `src/app/(admin)/rvm/decisions/page.tsx` — Use new badge in list table
- `src/components/rvm/DecisionManagementModal.tsx` — Use new badge in modal header

---

## Task 2 — Chair Gate Visual Segment

### Change: Add "Chair Approval Gate" section in `DecisionManagementModal`

Add a visually distinct section with a horizontal rule and header:

```text
--- Chair Approval Gate ---
Status: Awaiting Chair Approval / Approved by [name] at [timestamp]
Finalized at: [timestamp] (if is_final)
```

When not approved: Show "Awaiting Chair Approval" in muted text.
When approved but not final: Show chair approval details + finalization button.
When final: Show complete gate info as read-only.

### Files modified:

- `src/components/rvm/DecisionManagementModal.tsx` — Add Chair Gate visual section

---

## Task 3 — Role-Based Action Hardening

### Current state (already correct):

- `canFinalizeDecision`: `isSuperAdmin || hasRole('chair_rvm')` 
- `canApproveDecision`: `isSuperAdmin || hasRole('chair_rvm')`
- `canEditDecision`: `isSuperAdmin || hasRole('secretary_rvm')`

Super admin seeing all buttons is correct — it mirrors the RLS `is_super_admin()` override. The UI matches backend enforcement. No changes needed.

### Verification note:

- Secretary can draft (edit text) but cannot finalize or change status — verified in `useUserRoles.ts`
- Chair can change status and finalize — verified
- Super admin has all permissions — mirrors RLS correctly

No code changes for this task.

---

## Task 4 — Workflow Consistency Check

### Current state (already correct):

- `DossierStatusActions` maps: `decided -> [archived]` only
- No backward transitions exist in the UI
- This matches `status_transitions` table exactly

### Enhancement:

In the Dossier detail page, when status is `decided`, show a small info badge: "Decided — Linked to final decision" (if applicable). This provides visual clarity that the decided status is locked.

### Files modified:

- `src/app/(admin)/rvm/dossiers/[id]/page.tsx` — Add decided-state info text (minor)

---

## Task 5 — Audit Visibility Check

### Enhancement:

Add "finalized" to the `EVENT_TYPES` filter array in the audit page. The audit trigger logs finalization as an `updated` event with payload changes for `is_final`. Adding a filter helps locate these events.

### Files modified:

- `src/app/(admin)/rvm/audit/page.tsx` — Add "finalized" filter option and highlight finalization events in the table

---

## Files Created


| File                                                | Purpose                         |
| --------------------------------------------------- | ------------------------------- |
| `Project Restore Points/RP-P10D-chair-gate-pre.md`  | Pre-verification restore point  |
| `Project Restore Points/RP-P10D-chair-gate-post.md` | Post-verification restore point |


## Files Modified


| File                                             | Change                                                 |
| ------------------------------------------------ | ------------------------------------------------------ |
| `src/components/rvm/StatusBadges.tsx`            | Add `DecisionLifecycleBadge` component                 |
| `src/components/rvm/DecisionManagementModal.tsx` | Chair Gate visual section + lifecycle badge            |
| `src/app/(admin)/rvm/meetings/[id]/page.tsx`     | Use `DecisionLifecycleBadge` in agenda table + sidebar |
| `src/app/(admin)/rvm/decisions/page.tsx`         | Use `DecisionLifecycleBadge` in list                   |
| `src/app/(admin)/rvm/dossiers/[id]/page.tsx`     | Minor decided-state info text                          |
| `src/app/(admin)/rvm/audit/page.tsx`             | Add finalization event filter                          |
| `docs/backend.md`                                | Phase 10D status line                                  |
| `docs/architecture.md`                           | Phase 10D note                                         |


GOVERNANCE NOTE – FINALIZATION EVENT CLASSIFICATION OBSERVATION

Authority: Devmart Guardian Rules

Scope: Phase 10D – Chair Gate Formalization Layer

Mode: Governance Audit Refinement (Non-Blocking)

Observation:

The current audit mechanism logs decision finalization as a generic "updated" event, where the change in `is_final` and related fields is visible only inside the event_payload diff.

There is no dedicated event_type such as:

    event_type = 'finalized'

Governance Assessment:

- This is NOT a functional defect.

- This does NOT weaken immutability enforcement.

- This does NOT create a security gap.

- Backend enforcement (triggers + RLS) remains fully valid.

However:

From a governance transparency perspective, having a distinct audit classification for finalization could improve:

- Faster audit filtering

- Clear legal traceability

- Executive reporting clarity

- Oversight readability during compliance reviews

Recommendation (Future Hardening – Optional):

In a later governance-hardening phase, consider:

1) Introducing explicit `event_type = 'finalized'`

2) Logging finalization as a separate audit entry

3) Maintaining backward compatibility with existing audit structure

Scope Clarification:

This observation does NOT require rollback.

This does NOT block Phase 10D approval.

This does NOT require immediate schema change.

Status: Informational Governance Hardening Note.  
  
Scope Boundary

- Zero new database tables
- Zero new enums
- Zero RLS modifications
- Zero trigger modifications
- Zero navigation changes
- Zero new routes
- UI clarity and workflow visibility only

## Governance Declaration

**Target: FULLY FORMALIZED**

All changes are UI-layer visibility improvements. No backend enforcement changes.