# Security Scan Report — Phase 7C Closeout

**Date:** 2026-02-13
**Phase:** 7C Closeout Gate
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Finding Disposition Summary

| # | Finding | Level | Disposition | Owner | Target Phase |
|---|---------|-------|------------|-------|-------------|
| 1 | `app_user` personal data exposed | ERROR | **MITIGATED** | Lovable | 7C (this phase) |
| 2 | `super_admin_bootstrap` minimal access control | WARN | **BY DESIGN** | Project Owner | N/A |
| 3 | `audit_event` immutability | INFO | **CONFIRMED** | Lovable | N/A |
| 4 | Leaked Password Protection | INFO | **CLOSED** | Project Owner | N/A |

---

## Finding 1: `app_user` Personal Data Exposed

**Internal ID:** `app_user_table_public_exposure`
**Level:** ERROR
**Disposition:** MITIGATED

### Problem
The `app_user` table SELECT policy allowed any user with roles `secretary_rvm`, `deputy_secretary`, or `rvm_sys_admin` to read ALL user records, including emails and full names.

### Mitigation Applied
1. **Tightened `app_user_select` policy** to self-only:
   ```sql
   USING (auth_id = auth.uid() OR is_super_admin())
   ```
2. **Created `get_user_directory()` function** (SECURITY DEFINER):
   - Returns `id`, `full_name`, `email` for active users
   - Access restricted to roles: `secretary_rvm`, `deputy_secretary`, `rvm_sys_admin`, or `is_super_admin()`
   - Used for Phase 8 task assignment UI (not yet implemented)

### Compensating Controls
- Auth context self-lookup (`auth_id = auth.uid()`) continues to work
- No UI currently lists or browses all users
- Directory function provides least-privilege access for admin lookups

### Verification
- Auth sign-in flow: self-lookup unaffected
- Non-privileged roles: cannot SELECT other users from `app_user`
- Admin roles: use `get_user_directory()` for lookups

---

## Finding 2: `super_admin_bootstrap` Minimal Access Control

**Internal ID:** `super_admin_bootstrap_limited_protection`
**Level:** WARN
**Disposition:** BY DESIGN

### Rationale
- RLS is enabled on `super_admin_bootstrap`
- SELECT restricted to `is_super_admin()` only
- No INSERT, UPDATE, or DELETE policies exist → **implicitly blocked** for all non-`service_role` callers
- This table is managed exclusively via direct database access (service_role)
- No frontend component queries this table

### Compensating Controls
- `is_super_admin()` function checks `auth_id`, `is_active`, and `expires_at`
- Super admin entries have optional expiration dates
- All modifications require `service_role` key (not exposed to frontend)

---

## Finding 3: `audit_event` Immutability

**Level:** INFO
**Disposition:** CONFIRMED

### Evidence
| Operation | Policy | Access |
|-----------|--------|--------|
| SELECT | `audit_event_select` | `has_role('audit_readonly') OR is_super_admin()` |
| INSERT | (none) | `service_role` only |
| UPDATE | (none) | `service_role` only |
| DELETE | (none) | `service_role` only |

### Conclusion
Audit events are immutable from the application layer. Only `service_role` (server-side) can insert records. No user can modify or delete audit entries.

---

## Finding 4: Leaked Password Protection

**Level:** INFO
**Disposition:** CLOSED

Confirmed enabled in Supabase Dashboard > Authentication > Settings by project owner on 2026-02-13.

---

## Governance Compliance

| Rule | Status |
|------|--------|
| No UI changes | ✅ Compliant |
| No new features | ✅ Security hardening only |
| No schema changes (columns/tables) | ✅ RLS policies + function only |
| Restore points created | ✅ Pre + Post |
| Formal disposition for all findings | ✅ This document |
