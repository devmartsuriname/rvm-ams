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

| Operation | Roles | Conditions |
|-----------|-------|------------|
| SELECT | chair_rvm, secretary_rvm, deputy_secretary, admin_reporting, audit_readonly, super_admin | None |
| INSERT | secretary_rvm, admin_reporting, super_admin | None |
| UPDATE | secretary_rvm (when is_final=false), chair_rvm, super_admin | secretary_rvm gated by is_final=false |
| DELETE | Blocked | N/A |

**Source:** Live RLS policies on rvm_decision table (verified against database)

### A.3 Current Status Model

- Enum `decision_status`: `approved`, `deferred`, `rejected`, `pending`
- No status transitions exist in the `status_transitions` table for decisions
- Status changes are NOT validated by `validate_status_transition()`
- Immutability is enforced by `enforce_chair_approval_gate()` trigger

### A.4 Current Audit Triggers

- `log_audit_event()` fires on INSERT/UPDATE/DELETE for `rvm_decision`
- Event types captured: `created`, `updated`, `status_changed`

### A.5 Delete Allowed?

**NO.** DELETE is blocked at RLS level.

### A.6 Relationship Answers

| Question | Answer | Source |
|----------|--------|--------|
| Decision : Agenda Item | 1:1 (UNIQUE constraint on agenda_item_id) | ERD Section 3.4 |
| Decision : Meeting | 1:N (via agenda items) | ERD Section 4 |
| Decision : Dossier | N:1 indirectly (dossier -> agenda items -> decisions) | ERD Section 3.3 |
| Immutable after finalization? | YES | Backend Design Section 4.6 |
| Contains approval fields? | YES (`chair_approved_at`, `chair_approved_by`) | ERD Section 3.4 |

---

## SECTION B — CHAIR GATE ANALYSIS

### B.1 Chair Role

- Role code: `chair_rvm`
- Description: "Final approval authority for RVM decisions"

### B.2 Who Can Approve Decisions

- Only `chair_rvm` can set `chair_approved_at` / `chair_approved_by` fields
- Per RLS: `chair_rvm` has UPDATE access on rvm_decision (unrestricted by is_final)
- Per RLS: `secretary_rvm` has UPDATE access only when `is_final = false`

### B.3 Who Can Transition Decision Status

- `secretary_rvm`: can update `decision_status` (when is_final=false)
- `chair_rvm`: can update `decision_status` (no is_final restriction)
- **AMBIGUITY FLAG:** Enum lacks `draft`/`submitted`/`finalized` — uses `is_final` boolean instead

### B.4 Chair Approval Mechanism

**(a) Field-level flag** — via `chair_approved_by` and `chair_approved_at` fields.
The `enforce_chair_approval_gate()` trigger prevents `is_final=true` without both fields populated.
When finalized, parent dossier cascades to `decided`.

---

## SECTION C — WORKFLOW MODEL PROPOSAL

### C.1 Decision Status Lifecycle

```text
pending ──────> approved ──────> [is_final=true] (immutable)
   │               ^
   │               │ (Chair re-approves after deferral)
   ├──> deferred ──┘
   │
   └──> rejected ──────> [terminal, not finalizable]
```

### C.2 Allowed Transitions Per Role

| From | To | Role |
|------|----|------|
| pending | approved | chair_rvm |
| pending | deferred | chair_rvm |
| pending | rejected | chair_rvm |
| deferred | pending | secretary_rvm |
| deferred | approved | chair_rvm |

### C.3 Blocked Transitions

- Any transition when `is_final = true`
- `rejected` -> any (terminal)
- `approved` -> pending/deferred/rejected (can only be finalized)

### C.4 Immutability Rules

- `is_final = true`: ALL updates blocked
- Chair approval gate: `is_final` requires `chair_approved_by` + `chair_approved_at`
- Cascade: finalization sets parent dossier to `decided`

### C.5 Audit Events

All captured automatically by universal `log_audit_event()` trigger. No new mechanisms required.

---

## SECTION D — UI ARCHITECTURE PROPOSAL

### Recommendation: Option A — Decision UI Inside Meeting Detail

**Justification:** Data model alignment, existing infrastructure, permission model, audit visibility, Darkone consistency.

### D.1 UI Components

| Component | Purpose |
|-----------|---------|
| `CreateDecisionModal` | Create decision for an agenda item |
| `EditDecisionForm` | Edit decision text (inline pattern) |
| `ChairApprovalActions` | Chair approve/defer/reject + finalize buttons |
| `DecisionStatusActions` | Status transition buttons (role-gated) |

### D.2 Meeting Detail Page Expansion

- Agenda items table gains action button for decision management
- Secretary: Create/Edit Decision
- Chair: Approve/Defer/Reject + Finalize
- Read-only roles: View only

### D.3 Permission Helpers

```text
canCreateDecision:  secretary_rvm, admin_reporting
canEditDecision:    secretary_rvm (when not final)
canApproveDecision: chair_rvm
canFinalizeDecision: chair_rvm (after approval fields set)
```

---

## SECTION E — PERMISSION MATRIX

| Action | chair_rvm | secretary_rvm | deputy_secretary | admin_reporting | audit_readonly |
|--------|-----------|---------------|------------------|-----------------|----------------|
| View decision | Yes | Yes | Yes | Yes | Yes |
| Create decision | No | Yes | No | Yes | No |
| Edit decision text | No | Yes (not final) | No | No | No |
| Change status | Approve/Defer/Reject | No | No | No | No |
| Record chair approval | Yes | No | No | No | No |
| Finalize decision | Yes (after approval) | No | No | No | No |

---

## SECTION F — RISK & CONSTRAINT ANALYSIS

### F.1 Weak Assumptions

1. No decision status transitions in `status_transitions` table. **Risk: Medium.**
2. Secretary can update `decision_status` via RLS. **Risk: Low.**

### F.2 Missing Constraints

1. No `enforce_decision_status_transition` trigger.
2. No validation that `chair_approved_by` is a Chair RVM user.

### F.3 Governance Risks

- Without DB-level transition enforcement, invalid transitions possible via direct API call.

### F.4–F.6

- No RLS conflicts, no audit inconsistencies, cascade behavior is correct per PRD.

---

## SECTION G — SCOPE BOUNDARY

### Phase 10 WILL Include

- Decision Create/Edit/Status/Approval UI components
- `useUserRoles` decision permission helpers
- Meeting Detail page expansion
- StatusBadges additions

### Phase 10 WILL NOT Include

- Standalone `/rvm/decisions` route
- Decision list report generation
- Document attachment to decisions
- Agenda item CRUD UI
- Automated PDF generation
- Email/notifications
- Batch operations

### Required Changes

- **Schema:** Data-only INSERT into `status_transitions` + trigger creation (DDL)
- **RLS:** NO changes required
- **Audit:** NO new events required

---

## SECTION H — IMPLEMENTATION PHASING

### Phase 10A — Decision Status Hardening (Backend)

- Insert decision status transitions into `status_transitions`
- Create `enforce_decision_status_transition()` trigger
- Add decision permission helpers to `useUserRoles`
- Restore points: RP-P10A-pre, RP-P10A-post

### Phase 10B — Decision UI (Frontend)

- Create `CreateDecisionModal`, `EditDecisionForm`, `DecisionStatusActions`, `ChairApprovalActions`
- Expand Meeting Detail page
- Update `StatusBadges` if needed
- Restore points: RP-P10B-pre, RP-P10B-post

### Phase 10C — Integration Testing & Documentation

- Manual verification of all decision flows
- Chair gate enforcement verification
- Audit trail verification
- Documentation updates
- Phase 10 closure report
- Restore point: RP-P10C-post

---

## GOVERNANCE ALIGNMENT ADDENDUM

### 1. Data-Layer Enforcement Requirement

Phase 10A must include database-level enforcement that ONLY `chair_rvm` may modify `decision_status`. Implementation via field-level trigger enforcement preventing non-Chair status mutation.

### 2. Decision Status Transition Enforcement

Phase 10A will implement **Option A (Strict Enforcement):**
- Insert valid transitions into `status_transitions`
- Apply `validate_status_transition()` via trigger on `rvm_decision`

### 3. RLS Matrix Consistency

The Secretary's RLS UPDATE access (when is_final=false) is for text editing only. Status mutation will be restricted at trigger level to Chair authority.

### 4. Approval Conditions Met

- ✅ Decision status mutation enforced at DB level (Phase 10A trigger)
- ✅ Decision status transitions backend-validated (Phase 10A)
- ✅ Restore points declared for all sub-phases

---

## RESTORE POINT

**RP-P10-Planning-Pre** — Created with this planning document. No code changes.
