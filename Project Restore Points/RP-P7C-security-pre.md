# Restore Point: RP-P7C-security-pre

## Phase Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 7C (Security and Access Hardening)
- **Type:** Pre-Phase Checkpoint
- **Created:** 2026-02-13

---

## RLS Policy State (Before Changes)

| Table | Policy | USING Expression |
|-------|--------|-----------------|
| `app_user` | `app_user_select` | `(auth_id = auth.uid()) OR has_any_role(ARRAY['secretary_rvm','deputy_secretary','rvm_sys_admin']) OR is_super_admin()` |
| `super_admin_bootstrap` | `super_admin_select` | `(auth_id = auth.uid()) OR has_role('rvm_sys_admin')` |
| `app_role` | `app_role_select` | `true` |

## Security Findings (Active)
- app_user: No `auth.uid() IS NOT NULL` gate — unauthenticated access possible
- super_admin_bootstrap: Self-lookup leaks admin identity
- app_role: Public SELECT exposes role definitions to anonymous users
- Leaked Password Protection: Not enabled

---

## Rollback SQL

```sql
DROP POLICY IF EXISTS app_user_select ON public.app_user;
CREATE POLICY app_user_select ON public.app_user
  FOR SELECT USING (
    (auth_id = auth.uid())
    OR has_any_role(ARRAY['secretary_rvm','deputy_secretary','rvm_sys_admin'])
    OR is_super_admin()
  );

DROP POLICY IF EXISTS super_admin_select ON public.super_admin_bootstrap;
CREATE POLICY super_admin_select ON public.super_admin_bootstrap
  FOR SELECT USING (
    (auth_id = auth.uid()) OR has_role('rvm_sys_admin')
  );

DROP POLICY IF EXISTS app_role_select ON public.app_role;
CREATE POLICY app_role_select ON public.app_role
  FOR SELECT USING (true);
```
