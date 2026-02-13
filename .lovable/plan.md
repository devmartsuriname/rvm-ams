

# Phase 7C: Security and Access Hardening

## Objective
Close all active security scan findings before proceeding to Phase 8 (Audit Finalization).

---

## Task 1: Harden `app_user` SELECT Policy
**Type**: Database migration

Current policy allows unauthenticated access via role-check functions that may return false but don't block the query.

**Fix**: Add explicit authentication gate.

```sql
DROP POLICY IF EXISTS app_user_select ON public.app_user;
CREATE POLICY app_user_select ON public.app_user
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      auth_id = auth.uid()
      OR has_any_role(ARRAY['secretary_rvm', 'deputy_secretary', 'rvm_sys_admin'])
      OR is_super_admin()
    )
  );
```

## Task 2: Harden `super_admin_bootstrap` SELECT Policy
**Type**: Database migration

Current policy lets any authenticated user see their own bootstrap record. This leaks admin identity.

**Fix**: Restrict to `rvm_sys_admin` only (self-lookup unnecessary since the app never queries this table from the frontend).

```sql
DROP POLICY IF EXISTS super_admin_select ON public.super_admin_bootstrap;
CREATE POLICY super_admin_select ON public.super_admin_bootstrap
  FOR SELECT
  USING (
    has_role('rvm_sys_admin')
    OR is_super_admin()
  );
```

## Task 3: Harden `app_role` SELECT Policy
**Type**: Database migration

Current policy is `USING (true)` which exposes role definitions to unauthenticated users.

**Fix**: Require authentication.

```sql
DROP POLICY IF EXISTS app_role_select ON public.app_role;
CREATE POLICY app_role_select ON public.app_role
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

## Task 4: Enable Leaked Password Protection
**Type**: Manual action by project owner

This is a Supabase Dashboard setting, not a code change.

**Steps**:
1. Go to Supabase Dashboard > Authentication > Settings
2. Enable "Leaked Password Protection" (HaveIBeenPwned integration)
3. Save

This task will be marked as MANUAL in the deliverable.

## Task 5: Audit Event Policy — Defer to Phase 8
**Type**: No change now

The current audit_event policy restricts access to 3 privileged roles. Entity-level row filtering is a Phase 8 concern (audit trail implementation). Mark as DEFERRED.

## Task 6: Formalize Documentation Location
**Type**: File creation

Declare `Project Docs/AMS-RVM/` as the official source of truth. Create a small `docs/README.md` that redirects readers there, so future contributors don't create a parallel docs tree.

## Task 7: Create Restore Points
**Type**: File creation

- Pre: `Project Restore Points/RP-P7C-security-pre.md`
- Post: `Project Restore Points/RP-P7C-security-post.md`

---

## Files Changed Summary

| File/Resource | Action | Change |
|---|---|---|
| `app_user` RLS policy | MIGRATION | Add `auth.uid() IS NOT NULL` gate |
| `super_admin_bootstrap` RLS policy | MIGRATION | Remove self-lookup, admin-only |
| `app_role` RLS policy | MIGRATION | Replace `true` with `auth.uid() IS NOT NULL` |
| Leaked Password Protection | MANUAL | Enable in Supabase Dashboard |
| `audit_event` policy | DEFERRED | Phase 8 scope |
| `docs/README.md` | CREATE | Redirect to `Project Docs/AMS-RVM/` |
| Restore points | CREATE | Pre/post snapshots |

---

## Governance Compliance

| Rule | Status |
|---|---|
| No UI changes | Compliant |
| No new features | Compliant - security hardening only |
| No schema changes (columns/tables) | Compliant - RLS policies only |
| Darkone 1:1 parity | Compliant |
| Restore points | Will create pre/post |

---

## Impact Assessment

- **Auth flow**: The `app_user` policy change requires `auth.uid() IS NOT NULL`. Since the auth context already has a valid session before querying `app_user`, this adds zero friction to the login flow.
- **Helper functions**: `get_current_user_id()`, `has_role()`, `has_any_role()` all use `auth.uid()` internally and are `SECURITY DEFINER`. They will continue to work correctly because they are called within an authenticated context.
- **Bootstrap table**: Removing self-lookup has no frontend impact — no component queries `super_admin_bootstrap`.

