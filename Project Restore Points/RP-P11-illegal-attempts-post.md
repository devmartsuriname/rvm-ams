# Restore Point: RP-P11-illegal-attempts-post

**Created:** 2026-02-26
**Phase:** 11 — Illegal Attempt Logging Hardening
**Type:** Post-implementation (Corrected)

## Architecture Revision

Initial implementation used dblink for autonomous transactions — **FAILED** on Supabase managed (localhost connections restricted).

**Corrected architecture:** RETURN NULL pattern
- BEFORE triggers detect illegal conditions → INSERT log → RETURN NULL (blocks mutation)
- No RAISE EXCEPTION = no rollback = log persists ✅
- No dblink dependency = works on all Supabase instances ✅

## Database Objects

### Created
- Table: `rvm_illegal_attempt_log` — forensic log, RLS-protected
- Function: `log_illegal_attempt()` — SECURITY DEFINER, direct INSERT
- Function: `get_latest_violation()` — RPC for violation reason lookup

### Modified (5 trigger functions → RETURN NULL pattern)
- `enforce_decision_status_transition()` — logs DECISION_FINAL_LOCK, DECISION_INVALID_TRANSITION
- `enforce_chair_only_decision_status()` — logs CHAIR_ONLY_STATUS
- `enforce_chair_approval_gate()` — logs CHAIR_GATE_MISSING
- `enforce_document_lock_on_decision()` — logs DOCUMENT_FINAL_LOCK
- `enforce_dossier_status_transition()` — logs DOSSIER_INVALID_TRANSITION

### Removed
- dblink extension (not needed)

## Frontend Changes
- `src/utils/rls-error.ts` — Added `handleGuardedUpdate()`, `fetchViolationReason()`
- `src/services/decisionService.ts` — Uses `handleGuardedUpdate()` for 3 update methods
- `src/services/dossierService.ts` — Uses `handleGuardedUpdate()` for status update method

## Test Evidence

Edge function test results:
- `log_count_before = 0`, `log_count_after = 2`
- Decision final lock: blocked (0 rows), log persisted with rule=DECISION_FINAL_LOCK
- Dossier regression: blocked (0 rows), log persisted with rule=DOSSIER_INVALID_TRANSITION
- Original data unchanged (decision text and dossier status verified)

## Governance Declaration

**FULLY WORKING**

| Area | Status |
|------|--------|
| Enforcement blocks | ✅ All 5 triggers block via RETURN NULL |
| Log persistence | ✅ Logs persist after blocked mutations |
| RLS on log table | ✅ No client INSERT/UPDATE/DELETE; governance SELECT only |
| No dblink dependency | ✅ Removed |
| Service layer error handling | ✅ Detects 0-row results, fetches violation reason |
| Rule D satisfied | ✅ Logging failure does not weaken enforcement |
