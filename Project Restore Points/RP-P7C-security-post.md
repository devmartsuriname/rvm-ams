# Restore Point: RP-P7C-security-post (Round 2)

## Phase Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 7C (Security and Access Hardening) — Round 2
- **Type:** Post-Phase Checkpoint
- **Created:** 2026-02-13

---

## RLS Policy State (After Round 2)

| Table | Policy | USING Expression |
|-------|--------|-----------------|
| `app_user` | `app_user_select` | `auth_id = auth.uid() OR has_any_role(['secretary_rvm','deputy_secretary','rvm_sys_admin']) OR is_super_admin()` |
| `super_admin_bootstrap` | `super_admin_select` | `is_super_admin()` |
| `app_role` | `app_role_select` | `auth.uid() IS NOT NULL` |
| `audit_event` | `audit_event_select` | `has_role('audit_readonly') OR is_super_admin()` |
| `audit_event` | INSERT | No policy = service_role only |
| `audit_event` | UPDATE | No policy = blocked |
| `audit_event` | DELETE | No policy = blocked |

## Changes Applied (Round 2)
1. **app_user**: Removed broad `auth.uid() IS NOT NULL` gate; users SELECT own record only, admins SELECT all
2. **super_admin_bootstrap**: Removed `rvm_sys_admin` access; `is_super_admin()` only
3. **audit_event SELECT**: Narrowed from 3 roles to `audit_readonly` + `is_super_admin()` only
4. **audit_event INSERT/UPDATE/DELETE**: All user-facing policies dropped; INSERT only via service_role (system)

## Manual Actions Confirmed
- [x] Leaked Password Protection enabled in Supabase Dashboard

## No Code Changes
This phase modified RLS policies only. No frontend or backend code was changed.
