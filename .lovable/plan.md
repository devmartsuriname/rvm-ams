# Phase 10B — Decision UI Implementation Plan

**Authority:** Devmart Guardian Rules
**Mode:** Frontend Only
**Pre-condition:** Phase 10A CLOSED (RP-P10A-post verified)

---

## Restore Point

Create `Project Restore Points/RP-P10B-pre.md` before any file changes.

---

## Task 1 — New UI Components

All in `src/components/rvm/`, following existing patterns (Bootstrap 5 + React-Bootstrap, Darkone parity).

### 1.1 CreateDecisionModal

- Pattern: mirrors `CreateMeetingModal` (Modal, size="lg", centered)
- Props: `show`, `onHide`, `agendaItemId` (string)
- Fields: `decision_text` (textarea, required), validated with zod
- Uses `useCreateDecision` hook (already exists)
- Status defaults to `pending` (hardcoded, no user selection)
- Button disabled during mutation (`isPending`)
- Toast on success/error
- React Query invalidation handled by existing hook

### 1.2 EditDecisionForm

- Pattern: mirrors `EditMeetingForm` (inline toggle form within card)
- Props: `decision` (existing decision data), `onSave`, `onCancel`, `isLoading`
- Fields: `decision_text` (textarea, required)
- Secretary can only edit text, NOT status (no status field in form)
- Zod validation for text length
- Save/Cancel buttons, disabled during mutation

### 1.3 DecisionStatusActions

- Pattern: mirrors `DossierStatusActions` / `MeetingStatusActions`
- Props: `decisionId`, `currentStatus`, `isFinal`
- Uses `useUserRoles().canApproveDecision` for visibility gate
- Transition map (Chair-only):

```text
pending  -> [Approve, Defer, Reject]
deferred -> [Approve, Re-submit to Pending]
approved -> [] (no further status changes, only finalize)
rejected -> [] (terminal)
```

- Uses `useUpdateDecisionStatus` hook
- Spinner during mutation, toast on success/error
- Hidden when `isFinal === true`

### 1.4 ChairApprovalActions

- Pattern: custom component, simple button group
- Props: `decisionId`, `decision` (full decision object)
- Uses `useUserRoles().canFinalizeDecision` for visibility gate
- Shows "Finalize Decision" button ONLY when:
  - `decision_status === 'approved'`
  - `chair_approved_by` is populated (or will be set atomically)
  - `is_final === false`
- Finalize flow:
  1. Records chair approval (`useRecordChairApproval`)
  2. Then sets `is_final = true` via `useUpdateDecision`
  3. Both in sequence (not optimistic)
- Confirm dialog before finalization (using state toggle pattern from DossierStatusActions)
- Hidden when `is_final === true`

---

## Task 2 — Meeting Detail Page Expansion

Modify: `src/app/(admin)/rvm/meetings/[id]/page.tsx`

### 2.1 Expand meetingService fetch

The existing `fetchMeetingById` already selects `rvm_decision(id, decision_status, is_final)` on agenda items. This is sufficient for status badges. For the decision management modal, we need full decision data. Approach:

- Use `useDecision(agendaItemId)` (already exists) inside the management modal to fetch full decision including `decision_text`, `chair_approved_by`, `chair_approved_at`
- No changes to meetingService needed

### 2.2 Agenda Items Table Enhancement

Add a 7th column "Actions" to the agenda items table:

- Secretary (canCreateDecision): "Create Decision" button if no decision exists for that agenda item
- Secretary (canEditDecision): "Edit" button if decision exists and not final
- Chair (canApproveDecision): "Manage" button to open decision management
- audit_readonly / deputy_secretary: No action buttons
- When `is_final === true`: No action buttons, badge shows "Final" indicator

### 2.3 Decision Management Modal

New inline approach: clicking an action button opens a management modal for the specific agenda item's decision. The modal contains:

- Decision text (read-only or editable based on role)
- Current status badge
- EditDecisionForm (for secretary, when not final)
- DecisionStatusActions (for chair)
- ChairApprovalActions (for chair, when status is approved)
- Finalization indicator (when is_final === true, full read-only)

This will be a new component `DecisionManagementModal` that composes the above sub-components based on role and state.

### 2.4 Decisions Summary Card Enhancement

The existing sidebar "Decisions Summary" card already shows decision badges. Add:

- "Final" indicator (small icon or badge variant) for finalized decisions
- No other changes needed

---

## Task 3 — Role Permission Usage

All gating uses existing `useUserRoles` helpers added in Phase 10A:


| Helper                | Usage                                       |
| --------------------- | ------------------------------------------- |
| `canCreateDecision`   | Show "Create Decision" button               |
| `canEditDecision`     | Show EditDecisionForm                       |
| `canApproveDecision`  | Show DecisionStatusActions                  |
| `canFinalizeDecision` | Show ChairApprovalActions / Finalize button |


No new permission helpers needed.

---

## Task 4 — Edge Case Controls

- **Duplicate prevention**: "Create Decision" button only shown when `item.rvm_decision` is empty. Backend enforces UNIQUE on `agenda_item_id`.
- **Button states**: All mutation buttons disabled during `isPending`
- **No optimistic UI**: Status changes wait for server response, then invalidate queries
- **React Query invalidation**: Existing hooks already invalidate `decisions`, `agenda-items`, and `meetings` query keys

---

## Files Created


| File                                             | Purpose                                 |
| ------------------------------------------------ | --------------------------------------- |
| `src/components/rvm/CreateDecisionModal.tsx`     | Create decision for an agenda item      |
| `src/components/rvm/EditDecisionForm.tsx`        | Edit decision text (inline form)        |
| `src/components/rvm/DecisionStatusActions.tsx`   | Chair-only status transition buttons    |
| `src/components/rvm/ChairApprovalActions.tsx`    | Chair finalization flow                 |
| `src/components/rvm/DecisionManagementModal.tsx` | Composite modal for decision management |
| `Project Restore Points/RP-P10B-pre.md`          | Pre-implementation restore point        |


## Files Modified


| File                                         | Change                                        |
| -------------------------------------------- | --------------------------------------------- |
| `src/app/(admin)/rvm/meetings/[id]/page.tsx` | Add Actions column, integrate decision modals |
| `docs/architecture.md`                       | Phase 10B status line                         |


## Files NOT Modified (Scope Boundary)

- No services created or modified
- No hooks created or modified
- No routes added
- No schema changes
- No RLS changes
- No trigger modifications

---

**GOVERNANCE NOTE — MODAL SIZE STANDARDIZATION (MANDATORY)**

Authority: Devmart Guardian Rules

Reference: Phase 9B — Modal XL Standardization (CLOSED)

Correction Required:

All create/edit/management modals must use:

Modal size="xl"

The current Phase 10B plan references:

Modal size="lg"

This is not compliant with the existing system standard.

Reason:

- All other modules (Dossiers, Meetings, Tasks) are standardized on XL.

- LG modals are deprecated.

- No regression in modal sizing is allowed.

- UI consistency across modules is mandatory.

Required Change:

Update:

CreateDecisionModal

DecisionManagementModal

From:

size="lg"

To:

size="xl"

No other modal sizes are permitted in RVM-AMS.

This change must be reflected in:

- Component implementation

- Plan documentation

- Screenshot verification

Execution of Phase 10B must use XL only.

No LG allowed.  
  
**Technical Notes**

- All components use Bootstrap 5 + React-Bootstrap exclusively
- No Tailwind, no inline style hacks, no custom CSS
- Modal follows `size="lg" centered` standardization
- Table headers use `table-light` class
- Status badge rendering reuses existing `DecisionStatusBadge` from `StatusBadges.tsx`
- The `rvm_decision` array on agenda items is accessed as `item.rvm_decision?.[0]` (1:1 via UNIQUE, but Supabase returns arrays for relations)