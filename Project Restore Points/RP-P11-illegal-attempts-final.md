# Restore Point: RP-P11-illegal-attempts-final

**Created:** 2026-02-26
**Phase:** 11 — Illegal Attempt Logging Hardening
**Type:** Final Closure
**Status:** CLOSED — FULLY WORKING

---

## Option A Rationale

Phase 11 uses PostgreSQL-native RETURN NULL enforcement instead of RAISE EXCEPTION + dblink autonomous transactions. This decision was made because:

1. `dblink` cannot establish localhost/TCP connections on managed Supabase
2. RAISE EXCEPTION rolls back the entire transaction, preventing log persistence
3. RETURN NULL blocks the mutation (INSERT/UPDATE returns 0 rows) while keeping the transaction open, so the log INSERT persists

This is Option A from the Governance Correction Directive. Option B (NOTIFY + edge function listener) was explicitly rejected for stability reasons.

## Risk Acceptance Statement

**Accepted risk:** Silent rejection semantics. Clients observe "0 rows affected" instead of a PostgreSQL exception. The application service layer must use `handleGuardedUpdate()` and `get_latest_violation()` RPC to detect and surface violation reasons.

**Mitigations in place:**
- `handleGuardedUpdate()` in `src/utils/rls-error.ts` detects 0-row results and fetches violation reason
- `decisionService.ts` and `dossierService.ts` use this handler for all guarded mutations
- All 5 enforcement triggers log before returning NULL

## Modified Triggers

| Trigger | Table | Rule Labels |
|---------|-------|-------------|
| `trg_enforce_decision_status_transition` | `rvm_decision` | `DECISION_FINAL_LOCK`, `DECISION_INVALID_TRANSITION` |
| `trg_enforce_chair_only_decision_status` | `rvm_decision` | `CHAIR_ONLY_STATUS` |
| `enforce_chair_approval_gate` | `rvm_decision` | `CHAIR_GATE_MISSING` |
| `enforce_document_lock_on_decision` | `rvm_document_version` | `DOCUMENT_FINAL_LOCK` |
| `enforce_dossier_status_transition` | `rvm_dossier` | `DOSSIER_INVALID_TRANSITION` |

## Evidence Bundle

### dblink Status
- Extension `dblink` has been removed (confirmed: 0 rows in `pg_extension` for dblink)

### No Triggers on Log Table
- Confirmed: 0 triggers on `rvm_illegal_attempt_log` — no recursion risk

### No RLS Weakening
- `rvm_illegal_attempt_log` RLS: INSERT=false, UPDATE=false, DELETE=false, SELECT restricted to `chair_rvm`, `audit_readonly`, `admin_reporting`, `is_super_admin()`
- All existing domain table RLS policies unchanged

### Persistent Log Entries (Evidence)

**Entry 1 — DECISION_FINAL_LOCK:**
- `id`: 43a356f9-8213-45b6-ac2a-f9d846e1ba2b
- `created_at`: 2026-02-26T03:09:04.369408+00
- `entity_type`: rvm_decision
- `entity_id`: 518ff6c0-c487-4010-89a8-739ab4ff8db5
- `action`: UPDATE
- `rule`: DECISION_FINAL_LOCK
- `reason`: Cannot modify finalized decision (is_final = true)
- `payload`: Contains full OLD/NEW row diff

**Entry 2 — DOSSIER_INVALID_TRANSITION:**
- `id`: 8c7de34c-6cdd-4bf0-b596-a5b28cc57f40
- `created_at`: 2026-02-26T03:09:04.591235+00
- `entity_type`: rvm_dossier
- `entity_id`: 2b77a338-207f-4d67-bd9a-f3aedb99dde0
- `action`: UPDATE
- `rule`: DOSSIER_INVALID_TRANSITION
- `reason`: Invalid dossier transition: decided -> draft
- `payload`: `{"new_status": "draft", "old_status": "decided"}`

Both entries persisted after the mutation was blocked (0 rows affected). Logging survives the rejection.

## Governance Declaration

- **Fully Implemented:** Phase 11 illegal-attempt logging (Option A — RETURN NULL + direct INSERT)
- **Partially Implemented:** None
- **Deferred:** Optional improvement for exception-style user-facing messages (future phase only)
- **Out-of-Scope:** Option B redesign (explicitly rejected for stability)
- **Known Risks:** Silent reject semantics require client handling (accepted)

## Files Modified in Phase 11

| File | Change |
|------|--------|
| 3 migration files | Table, function, trigger rewrites |
| `src/utils/rls-error.ts` | Added `handleGuardedUpdate()` |
| `src/services/decisionService.ts` | Uses `handleGuardedUpdate()` |
| `src/services/dossierService.ts` | Uses `handleGuardedUpdate()` |
| `docs/backend.md` | Phase 11 status + accepted limitation |
| `docs/architecture.md` | Phase 11 closure note |
| `Project Restore Points/RP-P11-*` | Pre/post/final restore points |
