# Restore Point: RP-P11-illegal-attempts-post

**Created:** 2026-02-26
**Phase:** 11 — Illegal Attempt Logging Hardening
**Type:** Post-implementation

## Changes Applied

### Database Objects Created
- Table: `rvm_illegal_attempt_log` — Forensic log for blocked mutation attempts
- Extension: `dblink` (in `extensions` schema)
- Function: `log_illegal_attempt()` — SECURITY DEFINER, uses dblink for autonomous transactions

### Trigger Functions Updated (logging added before RAISE EXCEPTION)
- `enforce_decision_status_transition()` — logs `DECISION_FINAL_LOCK`, `DECISION_INVALID_TRANSITION`
- `enforce_chair_only_decision_status()` — logs `CHAIR_ONLY_STATUS`
- `enforce_chair_approval_gate()` — logs `CHAIR_GATE_MISSING`
- `enforce_document_lock_on_decision()` — logs `DOCUMENT_FINAL_LOCK`
- `enforce_dossier_status_transition()` — logs `DOSSIER_INVALID_TRANSITION`

### RLS on rvm_illegal_attempt_log
- INSERT: blocked for all authenticated users (only via SECURITY DEFINER function)
- SELECT: `chair_rvm`, `audit_readonly`, `admin_reporting`, super_admin
- UPDATE: blocked
- DELETE: blocked

## Governance Declaration

**PARTIALLY IMPLEMENTED**

- Enforcement: 100% intact — all 5 triggers block illegal mutations as before
- Logging: Best-effort — dblink autonomous transactions cannot connect on this managed Supabase instance (localhost connections restricted)
- Rule D satisfied: logging failure does not weaken enforcement

### Known Gap
dblink cannot establish localhost connections on Supabase managed instances. The `log_illegal_attempt()` function silently swallows the connection failure. Log entries are NOT persisted when mutations are blocked.

### Recommended Resolution (Future Phase)
1. Store DB connection string in Supabase Vault and use it in `log_illegal_attempt()`
2. OR implement app-layer error interception in service functions to log blocked attempts
3. OR migrate to self-hosted Supabase/PostgreSQL where dblink localhost connections are permitted

## Zero Changes
- Zero UI changes
- Zero workflow changes
- Zero changes to existing allowed mutation flows
- All enforcement logic unchanged
