# Restore Point: RP-P11-illegal-attempts-pre

**Created:** 2026-02-26
**Phase:** 11 — Illegal Attempt Logging Hardening
**Type:** Pre-implementation

## State Summary

Phases 10A–10D are CLOSED. No open regressions. ApexCharts TS warning remains out-of-scope.

## Changes Planned

- New table: `rvm_illegal_attempt_log`
- New function: `log_illegal_attempt()` (SECURITY DEFINER, uses dblink)
- Modified triggers (logging added before RAISE EXCEPTION):
  - `enforce_decision_status_transition()`
  - `enforce_chair_only_decision_status()`
  - `enforce_chair_approval_gate()`
  - `enforce_document_lock_on_decision()`
  - `enforce_dossier_status_transition()`

## Governance Constraints

- No UI changes
- No new workflow states
- No new routes
- No changes to existing allowed mutation flows
- Enforcement logic unchanged — only logging added
