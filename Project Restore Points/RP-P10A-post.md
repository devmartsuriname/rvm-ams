# Restore Point: RP-P10A-post

**Created:** 2026-02-26
**Phase:** 10A — Decision Status Hardening (Backend)
**Type:** Post-implementation
**Authority:** Devmart Guardian Rules

## Changes Applied

### Database (via Migration)

| Type | Description |
|------|-------------|
| DATA INSERT | 5 rows into `status_transitions` for `decision` entity |
| DDL | `enforce_decision_status_transition()` function + `trg_enforce_decision_status_transition` trigger |
| DDL | `enforce_chair_only_decision_status()` function + `trg_enforce_chair_only_decision_status` trigger |

### Decision Status Transitions Inserted

```
decision | pending  → approved
decision | pending  → deferred
decision | pending  → rejected
decision | deferred → pending
decision | deferred → approved
```

### Trigger Definitions

**`enforce_decision_status_transition()`** — BEFORE UPDATE on `rvm_decision`:
- Blocks ALL updates when `is_final = true` (immutability)
- Validates `decision_status` changes against `status_transitions` table via `validate_status_transition()`
- Non-SECURITY DEFINER (runs in caller context)

**`enforce_chair_only_decision_status()`** — BEFORE UPDATE on `rvm_decision`:
- When `decision_status` changes: retrieves caller roles via `get_user_roles()`
- Blocks unless caller has `chair_rvm` role OR is super_admin
- SECURITY DEFINER (required to call `get_user_roles()` and `is_super_admin()`)

### Frontend

| File | Change |
|------|--------|
| `src/hooks/useUserRoles.ts` | Added `canCreateDecision`, `canEditDecision`, `canApproveDecision`, `canFinalizeDecision` |

## Trigger Inventory on `rvm_decision`

| Trigger Name | Function | Purpose |
|---|---|---|
| `trg_enforce_decision_status_transition` | `enforce_decision_status_transition()` | Status transition validation + immutability |
| `trg_enforce_chair_only_decision_status` | `enforce_chair_only_decision_status()` | Chair-only status mutation enforcement |
| `enforce_chair_approval_gate` | `enforce_chair_approval_gate()` | Finalization gate (pre-existing) |
| `audit_rvm_decision` | `log_audit_event()` | Universal audit logging (pre-existing) |
| `update_rvm_decision_updated_at` | `update_updated_at_column()` | Timestamp maintenance (pre-existing) |

## Super Admin Bootstrap Safety

The `is_super_admin()` function checks `super_admin_bootstrap` table for:
- `auth_id` matching current user
- `is_active = true`
- `expires_at IS NULL OR expires_at > now()`

**Production safety mechanism:** The `super_admin_bootstrap` table rows must have `is_active = false` in production. The table has RLS blocking all INSERT/UPDATE/DELETE — only super_admins can even SELECT. No code path can create or activate super_admin entries without direct database access.

## Trigger Interaction Analysis

Both BEFORE UPDATE triggers fire independently on `rvm_decision`:

1. **`trg_enforce_decision_status_transition`** fires first (alphabetical ordering: `trg_e...ce_d` < `trg_e...ce_c`):
   - If `is_final = true`: raises exception → UPDATE blocked (no other trigger fires)
   - If status changes: validates against `status_transitions` table
   
2. **`trg_enforce_chair_only_decision_status`** fires second:
   - If status changes: checks caller has `chair_rvm` role

**No conflicts:** Both triggers check independent conditions. If either raises, the UPDATE is blocked. Secretary text edits (no status change) pass both triggers cleanly.

## Verification Evidence

### Data Verification
- 5 decision transitions confirmed in `status_transitions` table
- 5 triggers confirmed on `rvm_decision` (2 new + 3 pre-existing)

### Trigger Verification (Structural)
- `enforce_decision_status_transition`: immutability check (is_final) + transition validation
- `enforce_chair_only_decision_status`: role check via get_user_roles()
- `enforce_chair_approval_gate`: finalization gate (pre-existing, unchanged)

### Note on Runtime Testing
Runtime testing of trigger enforcement (valid/invalid transitions, role-based blocking) requires authenticated database sessions with specific user roles. The triggers are structurally verified via function definitions and trigger registration. Full runtime verification should be performed during Phase 10C integration testing with test users.

## Governance Declaration

- **Fully Implemented:** Tasks 1-3, 5 (status transitions, both triggers, useUserRoles helpers)
- **Verified (no changes):** Task 4 (finalization gate — pre-existing, confirmed via trigger inventory)
- **Scope respected:** Zero RLS changes, zero enum changes, zero new tables, zero UI changes, zero new routes

## Documentation Updated

- `docs/architecture.md` — Phase 10A status line
- `docs/backend.md` — Phase 10A status line added
