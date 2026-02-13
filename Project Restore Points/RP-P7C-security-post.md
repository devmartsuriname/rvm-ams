# Restore Point: RP-P7C-security-post

## Phase Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 7C (Security and Access Hardening)
- **Type:** Post-Phase Checkpoint
- **Created:** 2026-02-13

---

## RLS Policy State (After Changes)

| Table | Policy | USING Expression |
|-------|--------|-----------------|
| `app_user` | `app_user_select` | `auth.uid() IS NOT NULL AND (auth_id = auth.uid() OR has_any_role(...) OR is_super_admin())` |
| `super_admin_bootstrap` | `super_admin_select` | `has_role('rvm_sys_admin') OR is_super_admin()` |
| `app_role` | `app_role_select` | `auth.uid() IS NOT NULL` |

## Changes Applied
1. **app_user**: Added `auth.uid() IS NOT NULL` authentication gate
2. **super_admin_bootstrap**: Removed self-lookup, restricted to `rvm_sys_admin` + `is_super_admin()`
3. **app_role**: Replaced `true` with `auth.uid() IS NOT NULL`

## Manual Actions Required
- [ ] Enable Leaked Password Protection in Supabase Dashboard > Authentication > Settings

## Deferred
- `audit_event` entity-level row filtering → Phase 8

---

## No Code Changes
This phase modified RLS policies only. No frontend or backend code was changed.
