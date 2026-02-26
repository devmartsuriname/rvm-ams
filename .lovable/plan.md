# Phase 10A — Decision Status Hardening (Backend)

**Authority:** Devmart Guardian Rules
**Mode:** Backend Hardening Only
**Scope:** Database triggers + `useUserRoles` permission helpers

---

## Pre-Condition

Create restore point `RP-P10A-pre` before any modifications.

---

## Task 1 — Insert Decision Status Transitions

Insert 5 valid transitions into `status_transitions` per the approved lifecycle:

```text
decision | pending  | approved
decision | pending  | deferred
decision | pending  | rejected
decision | deferred | pending
decision | deferred | approved
```

**Method:** SQL INSERT (data-only, no schema change).

---

## Task 2 — Create `enforce_decision_status_transition()` Trigger

New PL/pgSQL function following the exact pattern of `enforce_dossier_status_transition()`:

- Fires BEFORE UPDATE on `rvm_decision`
- When `decision_status` changes (OLD IS DISTINCT FROM NEW), calls `validate_status_transition('decision', OLD, NEW)`
- Raises exception on invalid transition
- Additionally blocks ALL updates when `is_final = true` (immutability enforcement)

**Method:** Migration SQL (DDL -- new function + trigger).

---

## Task 3 — Create Chair-Only `decision_status` Enforcement Trigger

New PL/pgSQL function `enforce_chair_only_decision_status()`:

- Fires BEFORE UPDATE on `rvm_decision`
- If `decision_status` changes (OLD IS DISTINCT FROM NEW):
  - Retrieves current user roles via `get_user_roles()`
  - If user is NOT `chair_rvm` AND NOT super_admin: RAISE EXCEPTION
- Secretary retains ability to edit `decision_text` (and other non-status fields) when `is_final = false` -- this is unchanged, handled by existing RLS

**Method:** Migration SQL (DDL -- new function + trigger).

---

## Task 4 — Validate Existing Finalization Gate

The `enforce_chair_approval_gate()` trigger already:

- Blocks `is_final = true` without `chair_approved_by` and `chair_approved_at`
- Cascades dossier to `decided`

**No changes needed.** Verification only (via SQL test queries).

---

## Task 5 — Add Decision Permission Helpers to `useUserRoles`

Add to `src/hooks/useUserRoles.ts`:

```text
canCreateDecision:    secretary_rvm, admin_reporting
canEditDecision:      secretary_rvm (UI hint only -- RLS enforces is_final gate)
canApproveDecision:   chair_rvm
canFinalizeDecision:  chair_rvm
```

These are UI hints only -- RLS and triggers remain source of truth.

---

## Task 6 — Documentation & Restore Points

- Create `Project Restore Points/RP-P10A-pre.md`
- Create `Project Restore Points/RP-P10A-post.md` (after verification)
- Update `docs/architecture.md` (Phase 10A status)
- Update `docs/backend.md` (Phase 10A status)

---

## Files Modified


| File                        | Change Type                       |
| --------------------------- | --------------------------------- |
| `src/hooks/useUserRoles.ts` | Add 4 decision permission helpers |


## Files Created


| File                                     | Purpose                 |
| ---------------------------------------- | ----------------------- |
| `Project Restore Points/RP-P10A-pre.md`  | Pre-execution snapshot  |
| `Project Restore Points/RP-P10A-post.md` | Post-execution snapshot |


## Files Updated (Docs)


| File                   | Change                |
| ---------------------- | --------------------- |
| `docs/architecture.md` | Phase 10A status line |
| `docs/backend.md`      | Phase 10A status line |


## Database Changes (via Migration)


| Type        | Description                                               |
| ----------- | --------------------------------------------------------- |
| DATA INSERT | 5 rows into `status_transitions`                          |
| DDL         | `enforce_decision_status_transition()` function + trigger |
| DDL         | `enforce_chair_only_decision_status()` function + trigger |


Note: APPROVED — Execute Phase 10A (Decision Status Hardening)

Authority: Devmart Guardian Rules

Approval Basis: Phase 10A plan is scope-correct and governance-aligned.

MANDATORY CONDITIONS (must be proven in the Phase 10A post-report):

1) Super Admin Bootstrap Safety

- If you reference any “super_admin” bypass in triggers, you must explicitly confirm it is TEST-ONLY and DISABLED in production (or not deployed / is_active=false).

- Provide evidence in the report (what mechanism prevents production bypass).

2) Trigger Interaction Proof

- You are adding two BEFORE UPDATE triggers on rvm_decision:

  a) enforce_decision_status_transition()

  b) enforce_chair_only_decision_status()

- In the post-report, include evidence that:

  - Chair valid transitions succeed

  - Invalid transitions are blocked

  - Secretary cannot change decision_status (DB-level block)

  - Secretary can still edit decision_text when is_final=false

  - is_final=true blocks all updates (immutability)

  - No trigger conflicts or unintended lockouts

Governance Execution Rules:

- Create RP-P10A-pre BEFORE any DB change

- Execute only Phase 10A scope (no UI)

- Create RP-P10A-post AFTER verification

- Update docs/[architecture.md](http://architecture.md) and docs/[backend.md](http://backend.md) with Phase 10A status

- Provide SQL diff summary + test evidence + governance declaration

Proceed with implementation now. Stop after Phase 10A and await further instructions.  
  
**Verification Plan**

After implementation, test via SQL:

1. **Valid transition**: UPDATE decision from `pending` to `approved` as chair -- should succeed
2. **Invalid transition**: UPDATE decision from `rejected` to `approved` -- should raise exception
3. **Non-chair status change**: UPDATE `decision_status` as secretary -- should raise exception
4. **Secretary text edit**: UPDATE `decision_text` as secretary (when not final) -- should succeed
5. **Finalization without approval**: SET `is_final = true` without `chair_approved_by` -- should raise exception (existing gate)
6. **Immutability**: UPDATE any field when `is_final = true` -- should raise exception

## Scope Boundary

- Zero RLS changes
- Zero enum changes
- Zero new tables
- Zero UI changes
- Zero new routes
- Zero new services/hooks (only `useUserRoles` additions)