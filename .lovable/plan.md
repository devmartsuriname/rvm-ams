# PHASE 10 — DECISION UI & CHAIR GATE IMPLEMENTATION PLAN

**Authority:** Devmart Guardian Rules
**Classification:** Governance Workflow Expansion
**Date:** 2026-02-26
**Mode:** Planning Only — No Implementation

---

## EXECUTIVE SUMMARY

Phase 10 implements the Decision UI and Chair RVM approval gate — the core governance workflow that ensures "No RVM item exits without Chair approval" (PRD Section 11). The backend schema, RLS policies, triggers, and service/hook layers already exist from Phases 2-5. This phase focuses on building the UI layer and wiring the existing backend infrastructure into user-facing workflows.

---

## SECTION A — DECISION DOMAIN ANALYSIS

### A.1 Current Decision Schema

```text
rvm_decision
  id              UUID (PK)
  agenda_item_id  UUID (FK -> rvm_agenda_item.id, UNIQUE)
  decision_status decision_status ENUM ('approved','deferred','rejected','pending')
  decision_text   TEXT NOT NULL
  chair_approved_at   TIMESTAMPTZ (nullable)
  chair_approved_by   UUID (FK -> app_user.id, nullable)
  is_final        BOOLEAN (default: false)
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
```

**Source:** ERD Section 3.4, Backend Design Section 4.6

### A.2 Current RLS Permissions


| Operation | Roles                                                                                    | Conditions                            |
| --------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| SELECT    | chair_rvm, secretary_rvm, deputy_secretary, admin_reporting, audit_readonly, super_admin | None                                  |
| INSERT    | secretary_rvm, admin_reporting, super_admin                                              | None                                  |
| UPDATE    | secretary_rvm (when is_final=false), chair_rvm, super_admin                              | secretary_rvm gated by is_final=false |
| DELETE    | Blocked                                                                                  | N/A                                   |


**Source:** Live RLS policies on rvm_decision table (verified against database)

### A.3 Current Status Model

- Enum `decision_status`: `approved`, `deferred`, `rejected`, `pending`
- No status transitions exist in the `status_transitions` table for decisions (verified: only dossier, meeting, task, agenda_item have entries)
- Status changes are NOT validated by `validate_status_transition()` — there is no `enforce_decision_status_transition` trigger
- Immutability is enforced by `enforce_chair_approval_gate()` trigger (prevents finalization without chair_approved_at/chair_approved_by)

### A.4 Current Audit Triggers

- `log_audit_event()` fires on INSERT/UPDATE/DELETE for `rvm_decision` (via the universal audit trigger pattern applied to all domain tables)
- Event types captured: `created`, `updated`, `status_changed` (when decision_status changes)

### A.5 Delete Allowed?

**NO.** DELETE is blocked at RLS level (no DELETE policy exists). Consistent with all domain tables.

### A.6 Relationship Answers


| Question                      | Answer                                                                                                                                        | Source                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Decision : Agenda Item        | 1:1 (UNIQUE constraint on agenda_item_id)                                                                                                     | ERD Section 3.4, Backend Design line 313                          |
| Decision : Meeting            | 1:N (via agenda items — one meeting has many agenda items, each may have 0 or 1 decision)                                                     | ERD Section 4 Cardinality Map                                     |
| Decision : Dossier            | N:1 indirectly (dossier -> many agenda items -> each 0..1 decision). A dossier may appear on multiple meeting agendas.                        | ERD Section 3.3 note: "A dossier may appear in multiple meetings" |
| Immutable after finalization? | YES. `enforce_chair_approval_gate()` trigger + `is_final` flag. Backend Design Section 4.6 defines `prevent_decision_modification()` trigger. | Backend Design lines 323-337                                      |
| Contains approval fields?     | YES. `chair_approved_at` (timestamp) and `chair_approved_by` (FK to app_user.id)                                                              | ERD Section 3.4, live schema                                      |


---

## SECTION B — CHAIR GATE ANALYSIS

### B.1 Chair Role

- Role code: `chair_rvm`
- Description: "Final approval authority for RVM decisions"
- **Source:** app_role seed data, RLS Matrix Section 3

### B.2 Who Can Approve Decisions

- Only `chair_rvm` can set `chair_approved_at` / `chair_approved_by` fields
- Per RLS: `chair_rvm` has UPDATE access on rvm_decision (unrestricted by is_final)
- Per RLS: `secretary_rvm` has UPDATE access only when `is_final = false`
- **Source:** Live RLS policy `rvm_decision_update`

### B.3 Who Can Transition Decision Status

- `secretary_rvm`: can update `decision_status` field (when is_final=false)
- `chair_rvm`: can update `decision_status` field (no is_final restriction in RLS)
- Note: There are NO status_transitions rows for decisions, so transitions are unconstrained at the trigger level. Transitions are controlled only by RLS.
- **AMBIGUITY FLAG:** The `decision_status` enum has 4 values (approved, deferred, rejected, pending) but the workflow doc (Section 6) implies a sequential flow: draft -> submitted -> approved/rejected/deferred -> final. The current enum does NOT include `draft` or `submitted` or `finalized` — it uses `is_final` boolean for finalization.

### B.4 Chair Approval Mechanism

**(a) Field-level flag** — Approval is recorded via two fields:

- `chair_approved_by` (UUID of the approving user)
- `chair_approved_at` (timestamp of approval)

The `enforce_chair_approval_gate()` trigger enforces:

- `is_final` cannot be set to `true` unless both `chair_approved_at` and `chair_approved_by` are populated
- When finalized, the parent dossier status cascades to `decided`

**This is NOT a status transition and NOT a separate record.** It is a field-level flag pattern with trigger enforcement.

---

## SECTION C — WORKFLOW MODEL PROPOSAL

### C.1 Decision Status Lifecycle (Using Existing Enum)

Since the enum is already deployed as `('approved', 'deferred', 'rejected', 'pending')`, and schema changes carry governance risk, the proposed workflow uses the existing enum plus the `is_final` boolean:

```text
pending ──────> approved ──────> [is_final=true] (immutable)
   │               ^
   │               │ (Chair re-approves after deferral)
   ├──> deferred ──┘
   │
   └──> rejected ──────> [terminal, not finalizable]
```

- `pending`: Initial state. Secretary drafts decision text.
- `approved`: Chair RVM approves. Secretary or Chair sets status.
- `deferred`: Chair defers. Returns to preparation cycle.
- `rejected`: Chair rejects. Terminal state (dossier may be cancelled separately).
- `is_final=true`: Finalization. Requires chair_approved_at + chair_approved_by. Triggers dossier cascade to `decided`.

### C.2 Allowed Transitions Per Role


| From     | To       | Role                                       |
| -------- | -------- | ------------------------------------------ |
| pending  | approved | chair_rvm                                  |
| pending  | deferred | chair_rvm                                  |
| pending  | rejected | chair_rvm                                  |
| deferred | pending  | secretary_rvm (re-submit for next meeting) |
| deferred | approved | chair_rvm                                  |


### C.3 Blocked Transitions

- Any transition when `is_final = true` (enforced by trigger)
- `rejected` -> any (terminal)
- `approved` -> pending/deferred/rejected (once approved, can only be finalized)

### C.4 Immutability Rules

- When `is_final = true`: ALL updates blocked (trigger: `prevent_decision_modification`)
- Chair approval gate: `is_final` cannot become true without `chair_approved_by` + `chair_approved_at`
- Cascade: finalization sets parent dossier to `decided`

### C.5 Audit Events (Already Captured Automatically)


| Action                    | Event Type       | Captured By                                           |
| ------------------------- | ---------------- | ----------------------------------------------------- |
| Create decision           | `created`        | log_audit_event trigger                               |
| Update text               | `updated`        | log_audit_event trigger                               |
| Change status             | `status_changed` | log_audit_event trigger (detects status field change) |
| Chair approval fields set | `updated`        | log_audit_event trigger                               |
| Finalize (is_final=true)  | `updated`        | log_audit_event trigger                               |


No new audit mechanisms required — the universal audit trigger already captures all mutations on rvm_decision.

---

## SECTION D — UI ARCHITECTURE PROPOSAL

### Recommendation: Option A — Decision UI Inside Meeting Detail

**Justification:**

1. **Data model alignment:** Decisions are bound to agenda items, which belong to meetings. The natural navigation path is Meeting -> Agenda Item -> Decision.
2. **Existing pattern:** The Meeting Detail page (`/rvm/meetings/:id`) already displays agenda items and a "Decisions Summary" sidebar card. The infrastructure is in place.
3. **Permission model:** Decision creation/editing is contextual to a meeting in session. A standalone `/rvm/decisions` page would need to reconstruct the meeting context.
4. **Audit visibility:** Decisions appear in the global audit log already. A dedicated decisions route adds no audit value.
5. **Darkone consistency:** Expanding the existing Meeting Detail page with inline decision management follows the master-detail pattern used for Dossier Detail.

### D.1 UI Components (Proposed)


| Component                | Purpose                                                              | Location                               |
| ------------------------ | -------------------------------------------------------------------- | -------------------------------------- |
| `CreateDecisionModal`    | Create decision for an agenda item                                   | New component in `src/components/rvm/` |
| `EditDecisionForm`       | Edit decision text (inline, same as EditMeetingForm pattern)         | New component in `src/components/rvm/` |
| `ChairApprovalActions`   | Chair-specific approve/defer/reject buttons                          | New component in `src/components/rvm/` |
| `DecisionStatusActions`  | Status transition buttons (role-gated)                               | New component in `src/components/rvm/` |
| `FinalizeDecisionButton` | Finalize button (sets is_final=true, requires chair approval fields) | Part of ChairApprovalActions           |


### D.2 Meeting Detail Page Expansion

The existing Meeting Detail page will be expanded:

- Agenda items table gains a clickable row or action button to open decision management
- Each agenda item row shows: decision status badge (already exists), plus action button for authorized roles
- Clicking opens an expanded view or modal for decision create/edit/approve
- Secretary sees: Create Decision (if none exists), Edit Decision (if pending/deferred)
- Chair sees: Approve, Defer, Reject buttons + Finalize button (after approval)
- Read-only roles see: Decision text and status only

### D.3 Read-Only States

- `audit_readonly`, `deputy_secretary`: Can view decision text and status. No action buttons.
- After `is_final = true`: All roles see read-only view. No edit or action buttons rendered.
- Meeting status `closed`: Decisions displayed as read-only regardless of role.

### D.4 Permission Helpers (useUserRoles additions)

```text
canCreateDecision:  secretary_rvm, admin_reporting
canEditDecision:    secretary_rvm (when not final)
canApproveDecision: chair_rvm
canFinalizeDecision: chair_rvm (after approval fields set)
```

---

## SECTION E — PERMISSION MATRIX


| Action                | chair_rvm            | secretary_rvm   | deputy_secretary | admin_reporting | audit_readonly |
| --------------------- | -------------------- | --------------- | ---------------- | --------------- | -------------- |
| View decision         | Yes                  | Yes             | Yes              | Yes             | Yes            |
| Create decision       | No                   | Yes             | No               | Yes             | No             |
| Edit decision text    | No                   | Yes (not final) | No               | No              | No             |
| Change status         | Approve/Defer/Reject | No (see note)   | No               | No              | No             |
| Record chair approval | Yes                  | No              | No               | No              | No             |
| Finalize decision     | Yes (after approval) | No              | No               | No              | No             |


**Note:** The current RLS allows secretary_rvm to update decision_status when is_final=false. However, per the PRD and workflow documents, status transitions (approved/deferred/rejected) are Chair authority. The UI will restrict status changes to Chair only, while RLS provides the safety net.

---

## SECTION F — RISK & CONSTRAINT ANALYSIS

### F.1 Weak Assumptions

1. **No decision status transitions in database:** The `status_transitions` table has no entries for `decision` entity_type. This means ANY status-to-status change is allowed at the database level. The UI must enforce valid transitions. **Risk: Medium.** Mitigation: Add decision transitions to `status_transitions` table and create enforcement trigger (requires schema migration).
2. **Secretary can update decision_status via RLS:** The RLS update policy for secretary_rvm only checks `is_final=false`, not which fields are being changed. A secretary could theoretically change `decision_status` directly. **Risk: Low.** The UI will not expose this capability, and RLS is defense-in-depth.

### F.2 Missing Constraints

1. **No `enforce_decision_status_transition` trigger exists.** Unlike dossiers, meetings, and tasks, decision status changes are not validated against the `status_transitions` table. This is a gap.
2. **No validation that `chair_approved_by` is actually a Chair RVM user.** The trigger only checks the fields are non-null, not that the UUID belongs to a user with the `chair_rvm` role. **Risk: Low** — RLS prevents non-Chair users from setting these fields in practice.

### F.3 Governance Risks

- If decision status transitions are not added to `status_transitions`, an invalid transition (e.g., `rejected` -> `approved`) could be performed via direct API call bypassing the UI. The UI-only enforcement is acceptable for v1 but should be hardened.

### F.4 RLS Conflicts

- None identified. Current RLS policies are consistent with the proposed workflow.

### F.5 Audit Inconsistencies

- None. The universal `log_audit_event()` trigger already captures all decision mutations.

### F.6 Cascade Risks

- `enforce_chair_approval_gate()` cascades dossier status to `decided` when `is_final` becomes true. This is intentional and documented. Risk: if a dossier has multiple agenda items across meetings, the first finalized decision will cascade the dossier to `decided`. **This is correct behavior per PRD.**

---

## SECTION G — SCOPE BOUNDARY

### Phase 10 WILL Include

- Decision Create modal (CreateDecisionModal)
- Decision Edit form (EditDecisionForm)
- Chair approval action buttons (ChairApprovalActions)
- Decision status action buttons (DecisionStatusActions)
- Finalize decision flow
- `useUserRoles` additions for decision permissions
- Meeting Detail page expansion (decision management per agenda item)
- StatusBadges additions (already partially exists: DecisionStatusBadge)

### Phase 10 WILL NOT Include

- Standalone `/rvm/decisions` route
- Decision list report generation (Phase 5.5 per workflow doc)
- Document attachment to decisions (DMS-Light scope)
- Agenda item CRUD UI (deferred)
- Automated decision list PDF generation
- Email/notification on decision events
- Batch decision operations

### Schema Change Required?

**RECOMMENDED but not mandatory.** Adding decision transitions to `status_transitions` table would harden the workflow. This requires:

- INSERT into `status_transitions` (data-only, no DDL)
- Optional: `enforce_decision_status_transition` trigger (DDL)

### RLS Change Required?

**NO.** Current RLS policies are sufficient.

### Migration Scripts Required?

**YES (data-only migration recommended):**

- Insert valid decision transitions into `status_transitions`
- Optional: Create `enforce_decision_status_transition` trigger function and trigger

### New Audit Events Required?

**NO.** The universal audit trigger already captures all decision mutations.

---

## SECTION H — IMPLEMENTATION PHASING

### Phase 10A — Decision Status Hardening (Backend)

- Insert decision status transitions into `status_transitions` table
- Create `enforce_decision_status_transition()` trigger (optional but recommended)
- Add decision permission helpers to `useUserRoles`
- Create restore point: RP-P10A-pre, RP-P10A-post

### Phase 10B — Decision UI (Frontend)

- Create `CreateDecisionModal` component
- Create `EditDecisionForm` component
- Create `DecisionStatusActions` component
- Create `ChairApprovalActions` component
- Expand Meeting Detail page with decision management per agenda item
- Update `StatusBadges` if needed
- Create restore point: RP-P10B-pre, RP-P10B-post

### Phase 10C — Integration Testing & Documentation

- Manual verification of all decision flows
- Chair gate enforcement verification
- Audit trail verification
- Documentation updates (backend.md, architecture.md)
- Phase 10 closure report
- Create restore point: RP-P10C-post

---

NOTE:

GOVERNANCE ALIGNMENT ADDENDUM — PHASE 10

Authority: Devmart Guardian Rules

Classification: Mandatory Governance Alignment

Status: Approval Blocker Until Addressed

---------------------------------------------------------------------

1. DATA-LAYER ENFORCEMENT REQUIREMENT

---------------------------------------------------------------------

Per RLS & Role Matrix v1, access control must be enforced at the database level and may never rely solely on UI restrictions.

The current Phase 10 plan states that decision status transitions will be restricted to the Chair via UI logic, while RLS functions as a safety net.

This is not sufficient.

Core Security Principle:

Access is enforced at database level (RLS), never solely at application/UI level.

Required Correction (Mandatory Before Approval):

Phase 10A must explicitly include:

1) Database-level enforcement that ONLY role `chair_rvm` may modify the `decision_status` field.

   This must be implemented via:

   - Adjusted RLS policy (preferred), OR

   - Field-level trigger enforcement preventing non-Chair status mutation.

2) UI restriction may remain, but it cannot be the primary governance layer.

Without DB-level enforcement, approval cannot be granted.

---------------------------------------------------------------------

2. DECISION STATUS TRANSITION ENFORCEMENT GAP

---------------------------------------------------------------------

Per Workflow Diagrams v1:

Workflow states must be enforced at backend level.

Current State:

- `decision_status` has no entries in `status_transitions`

- No `enforce_decision_status_transition()` trigger exists

- Status transitions are not backend-validated

Governance Risk:

Without backend validation, a direct API call could execute invalid transitions such as:

- rejected → approved

- approved → pending

- deferred → rejected

etc.

This violates the state-machine enforcement principle already applied to other entities.

Required Correction (One of the Following Must Be Implemented):

Option A — Strict Enforcement (Preferred):

- Insert valid decision transitions into `status_transitions`

- Apply `validate_status_transition()` logic to `rvm_decision`

- Create restore points before and after migration

Option B — Explicit Risk Acceptance:

- Document in Phase 10 plan that decision transitions remain UI-enforced only

- Declare this as controlled v1 limitation

- Provide formal governance justification

If neither is implemented, approval cannot be granted.

---------------------------------------------------------------------

3. RLS MATRIX CONSISTENCY CHECK

---------------------------------------------------------------------

RLS Matrix §5.4 defines:

- Chair RVM: Approve authority

- Secretary RVM: Draft authority

- Final decisions immutable

- No DELETE allowed

Current backend policy allows both:

- `secretary_rvm` (when is_final = false)

- `chair_rvm`

to update `decision_status`.

This creates an interpretive gap between:

- Governance intent (Chair authority over decision outcome)

- Technical implementation (shared status mutation capability)

Alignment Required:

Either:

A) Restrict decision_status updates to Chair at RLS level

OR

B) Formally document why Secretary status mutation is acceptable under governance interpretation

Ambiguity cannot remain undocumented.

---------------------------------------------------------------------

4. APPROVAL CONDITION

---------------------------------------------------------------------

Phase 10 may only be approved if:

- Decision status mutation is enforced at database level for Chair-only authority

  OR formally documented as accepted governance interpretation

AND

- Decision status transitions are backend-validated

  OR formally documented as controlled v1 limitation

AND

- Restore points are declared before any backend modification

Until these conditions are met, Phase 10 remains:

Planning-Ready, Governance-Misaligned.

## RESTORE POINT

**RP-P10-Planning-Pre** — Created with this planning document. No code changes.

## DOCUMENTATION DELIVERABLES

- `docs/Phase-10-Planning-Decision-Chair-Gate.md` — This document
- `docs/architecture.md` — Update planning section (Phase 10 planning status)