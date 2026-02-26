# Phase 10C — Decision Finalization Hard Lock Verification

**Authority:** Devmart Guardian Rules
**Mode:** Backend Enforcement Verification
**Scope:** Immutability + Workflow Lock Discipline

---

## Pre-Condition

Create `Project Restore Points/RP-P10C-final-lock-pre.md` before any changes.

---

## Current Backend Enforcement Assessment

Analysis of existing triggers, RLS policies, and status transitions reveals that **all five enforcement vectors are already implemented at the database level**. No new triggers or RLS changes are required.

### Enforcement Vector 1 — Decision Update Block (is_final = true)

**Status: ENFORCED**

Trigger: `trg_enforce_decision_status_transition` calls `enforce_decision_status_transition()`:

```text
IF OLD.is_final = true THEN
  RAISE EXCEPTION 'Cannot modify finalized decision (is_final = true)';
END IF;
```

This blocks ALL updates (text, status, any field) when `is_final = true`. This is a BEFORE UPDATE trigger, meaning no mutation can proceed.

Additionally, RLS on `rvm_decision` UPDATE restricts secretary access:

```text
(has_role('secretary_rvm') AND is_final = false) OR has_role('chair_rvm') OR is_super_admin()
```

Secretary is blocked at RLS level. Chair/super_admin pass RLS but are blocked by the trigger. Double enforcement.

### Enforcement Vector 2 — Dossier Status Regression Block

**Status: ENFORCED**

The `status_transitions` table for entity_type `dossier` contains:

```text
decided -> archived  (ONLY valid transition from 'decided')
```

No backward path exists (no `decided -> in_preparation`, no `decided -> scheduled`, no `decided -> draft`). The `enforce_dossier_status_transition()` trigger validates against this table, blocking any regression attempt.

Additionally, the RLS UPDATE policy on `rvm_dossier` blocks updates when status is `decided`, `archived`, or `cancelled`:

```text
status <> ALL (ARRAY['decided', 'archived', 'cancelled'])
```

Double enforcement: RLS blocks the update, and the trigger blocks invalid transitions.

### Enforcement Vector 3 — Document Version Lock

**Status: ENFORCED**

Trigger: `enforce_document_lock_on_decision` on `rvm_document_version` BEFORE INSERT:

```text
IF v_is_final = true THEN
  RAISE EXCEPTION 'Cannot add versions to document linked to finalized decision';
END IF;
```

This prevents new document versions when the linked decision is finalized. Document deletion is already blocked by RLS (no DELETE policy exists on `rvm_document_version`).

### Enforcement Vector 4 — Chair Approval Gate

**Status: ENFORCED**

Trigger: `enforce_chair_approval_gate` on `rvm_decision` BEFORE UPDATE:

```text
IF NEW.is_final = true AND OLD.is_final = false THEN
  IF NEW.chair_approved_at IS NULL OR NEW.chair_approved_by IS NULL THEN
    RAISE EXCEPTION 'Decision cannot be finalized without chair approval';
  END IF;
END IF;
```

Finalization is impossible without chair approval fields being populated.

### Enforcement Vector 5 — Chair-Only Status Changes

**Status: ENFORCED**

Trigger: `trg_enforce_chair_only_decision_status` calls `enforce_chair_only_decision_status()`:

```text
IF OLD.decision_status IS DISTINCT FROM NEW.decision_status THEN
  -- Only chair_rvm or super_admin can change status
END IF;
```

---

## Task 1 — No Backend Changes Required

All enforcement is already at the database level via triggers and RLS. No UI-only protection gaps exist.

---

## Task 2 — Negative Test Execution

Execute the following SQL-based negative tests to confirm enforcement:

1. **Attempt update decision_text after finalization** -- expects exception
2. **Attempt change decision_status after finalization** -- expects exception
3. **Attempt add document version to finalized decision** -- expects exception
4. **Attempt change dossier status from decided to in_preparation** -- expects exception (no valid transition)

These tests will be run against the live database using test data (if available) or documented as enforcement confirmation based on trigger/RLS analysis.

---

## Task 3 — Audit Confirmation

The `audit_rvm_decision` trigger (AFTER INSERT OR UPDATE) logs all mutation attempts via `log_audit_event()`. Failed mutations (blocked by BEFORE UPDATE triggers) do not reach the AFTER trigger, meaning they are blocked before audit logging. This is correct behavior: illegal mutations are rejected, not silently logged.

---

## Files Created


| File                                                | Purpose                         |
| --------------------------------------------------- | ------------------------------- |
| `Project Restore Points/RP-P10C-final-lock-pre.md`  | Pre-verification restore point  |
| `Project Restore Points/RP-P10C-final-lock-post.md` | Post-verification restore point |


## Files Modified


| File                   | Change                                  |
| ---------------------- | --------------------------------------- |
| `docs/backend.md`      | Phase 10C status line                   |
| `docs/architecture.md` | Phase 10C enforcement verification note |


## Scope Boundary

- Zero new triggers
- Zero RLS modifications
- Zero schema changes
- Zero new entities
- Zero UI changes
- Zero route changes
- Verification and documentation only

---

**GOVERNANCE NOTE – ILLEGAL MUTATION ATTEMPT LOGGING OBSERVATION**

Authority: Devmart Guardian Rules

Scope: Phase 10C – Decision Immutability Enforcement

Mode: Governance Hardening Observation (Non-Blocking)

Observation:

Current implementation correctly blocks illegal mutations using BEFORE UPDATE / BEFORE INSERT triggers. 

However:

Failed mutation attempts (blocked by BEFORE triggers) do NOT reach the AFTER INSERT/UPDATE audit trigger. As a result, rejected mutation attempts are not logged in the audit_event table.

Governance Assessment:

- This is NOT a functional defect.

- This is NOT a security vulnerability.

- Enforcement remains legally and technically valid.

- Immutability is correctly enforced at database level.

However, from a governance-hardening perspective:

Logging failed mutation attempts could improve:

- Security monitoring

- Forensic traceability

- Abuse detection

- Administrative oversight transparency

Recommendation (Future Phase – Optional Hardening):

Consider introducing one of the following in a future hardening phase:

1) Dedicated exception logging function inside BEFORE trigger

2) SECURITY DEFINER logging function before RAISE EXCEPTION

3) Centralized illegal-attempt audit table

Scope Clarification:

This observation does NOT require rollback.

This does NOT block Phase 10C approval.

This does NOT require immediate implementation.

Status: Informational Governance Hardening Note.  
  
**Governance Declaration**

Based on analysis of all 5 existing BEFORE UPDATE/INSERT triggers and RLS policies:

**Status: FULLY ENFORCED**

All immutability constraints are enforced at the database level. No UI-only protection gaps exist. The system prevents:

1. Any field update on finalized decisions (trigger)
2. Dossier regression from `decided` (status_transitions + RLS)
3. New document versions on finalized decisions (trigger)
4. Finalization without chair approval (trigger)
5. Non-chair status changes (trigger + RLS)