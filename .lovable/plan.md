# Phase 16 — RETURN NULL Pattern Unification + UX Exception Handling

## Baseline Inventory

### Enforcement Triggers — Current State


| Trigger/Function                        | Entity                  | Current Pattern     | Has Logging                 |
| --------------------------------------- | ----------------------- | ------------------- | --------------------------- |
| `enforce_decision_status_transition`    | rvm_decision            | **RETURN NULL**     | Yes (`log_illegal_attempt`) |
| `enforce_chair_only_decision_status`    | rvm_decision            | **RETURN NULL**     | Yes                         |
| `enforce_chair_approval_gate`           | rvm_decision            | **RETURN NULL**     | Yes                         |
| `enforce_document_lock_on_decision`     | rvm_document_version    | **RETURN NULL**     | Yes                         |
| `enforce_dossier_status_transition`     | rvm_dossier             | **RETURN NULL**     | Yes                         |
| `enforce_meeting_status_transition`     | rvm_meeting             | **RAISE EXCEPTION** | No                          |
| `enforce_task_status_transition`        | rvm_task                | **RAISE EXCEPTION** | No                          |
| `enforce_agenda_item_status_transition` | rvm_agenda_item         | **RAISE EXCEPTION** | No                          |
| `enforce_dossier_immutability`          | rvm_meeting/task/agenda | **RAISE EXCEPTION** | No                          |


**4 triggers already unified, 4 still use RAISE EXCEPTION.**

### Service Layer — Current State


| Service Method                         | Uses `handleGuardedUpdate` | Pattern            |
| -------------------------------------- | -------------------------- | ------------------ |
| `dossierService.updateDossierStatus`   | Yes                        | Detects 0-row      |
| `decisionService.updateDecision`       | Yes                        | Detects 0-row      |
| `decisionService.updateDecisionStatus` | Yes                        | Detects 0-row      |
| `decisionService.recordChairApproval`  | Yes                        | Detects 0-row      |
| `meetingService.updateMeetingStatus`   | No                         | `.single()` throws |
| `meetingService.updateMeeting`         | No                         | `.single()` throws |
| `taskService.updateTask`               | No                         | `.single()` throws |
| `taskService.updateTaskStatus`         | No                         | `.single()` throws |
| `agendaItemService.updateAgendaItem`   | No                         | `.single()` throws |
| `agendaItemService.withdrawAgendaItem` | No                         | `.single()` throws |


### UX Error Handling — Current State

All UI mutation handlers already use `toast.error(getErrorMessage(err))`. The `getErrorMessage` function in `rls-error.ts` already maps both RAISE EXCEPTION messages and RETURN NULL violation reasons. This is well-unified at the UX layer.

---

## Plan

### Pre-condition

Create `Project Restore Points/RP-P16-return-null-ux-pre.md`

### Part A — Backend: Convert 4 Remaining Triggers to RETURN NULL

**Migration 1:** Replace `enforce_meeting_status_transition` — change `RAISE EXCEPTION` to `log_illegal_attempt` + `RETURN NULL`

**Migration 2:** Replace `enforce_task_status_transition` — change both `RAISE EXCEPTION` calls to `log_illegal_attempt` + `RETURN NULL`. Preserve the `started_at`/`completed_at` timestamp logic.

**Migration 3:** Replace `enforce_agenda_item_status_transition` — change both `RAISE EXCEPTION` calls to `log_illegal_attempt` + `RETURN NULL`

**Migration 4:** Replace `enforce_dossier_immutability` — change `RAISE EXCEPTION` to `log_illegal_attempt` + `RETURN NULL`

Each converted trigger will:

- Call `log_illegal_attempt(entity_type, entity_id, 'UPDATE', rule_code, reason, payload)`
- Return NULL instead of raising
- Preserve all existing validation logic (no behavioral change beyond error delivery)

### Part B — Frontend: Unify Service Layer to handleGuardedUpdate

**6 service methods** to convert from `.single()` to `.select()` + `handleGuardedUpdate`:

1. `meetingService.updateMeeting` → `handleGuardedUpdate(result, 'rvm_meeting', id)`
2. `meetingService.updateMeetingStatus` → same
3. `taskService.updateTask` → same
4. `taskService.updateTaskStatus` → same
5. `agendaItemService.updateAgendaItem` → same
6. `agendaItemService.withdrawAgendaItem` → same

No UX component changes needed — all mutation callers already use `toast.error(getErrorMessage(err))`.

### Part C — Negative Tests

Document expected behavior for each enforcement vector after unification. No automated test infrastructure exists; verification is manual via the existing UI.

### Part D — Documentation

Update `docs/backend.md` and `docs/architecture.md` with Phase 16 enforcement standard definition and vector inventory.

### Post-condition

Create `Project Restore Points/RP-P16-return-null-ux-post.md` with full verification report.

---

## Files to Create

1. `Project Restore Points/RP-P16-return-null-ux-pre.md`
2. `Project Restore Points/RP-P16-return-null-ux-post.md`

## Files to Modify

1. `src/services/meetingService.ts` — 2 methods
2. `src/services/taskService.ts` — 2 methods
3. `src/services/agendaItemService.ts` — 2 methods
4. `docs/backend.md` — Phase 16 section
5. `docs/architecture.md` — Phase 16 section

## Database Migrations (4)

1. `enforce_meeting_status_transition` → RETURN NULL + logging
2. `enforce_task_status_transition` → RETURN NULL + logging
3. `enforce_agenda_item_status_transition` → RETURN NULL + logging
4. `enforce_dossier_immutability` → RETURN NULL + logging

## Governance Note (Devmart):

During trigger conversion, ensure that any existing RAISE EXCEPTION

messages are preserved in the log_illegal_attempt payload so that

audit records retain the original violation context.

The migration must not reduce the diagnostic information available

in governance logs.

Verification report must include:

- Trigger diff evidence

- Sample blocked mutation log entry

- Confirmation that no recursive logging occurs  
Governance

- Zero schema changes (tables/columns/enums)
- Zero RLS changes
- 4 trigger function replacements (same logic, different error delivery)
- Zero new dependencies
- Zero workflow expansion