

# Phase 7C Closeout Gate — Security Scan Disposition + Minimal Mitigation

## Current Security Scan State (2 findings)

| Finding | Level | Current Policy |
|---------|-------|---------------|
| `app_user` personal data exposed | ERROR | `auth_id = auth.uid() OR has_any_role([secretary_rvm, deputy_secretary, rvm_sys_admin]) OR is_super_admin()` |
| `super_admin_bootstrap` minimal access control | WARN | `is_super_admin()` SELECT only; no INSERT/UPDATE/DELETE policies (implicitly blocked) |

## Codebase Analysis

Only ONE place queries `app_user`: the auth context (`src/context/useAuthContext.tsx`), which does a self-lookup by `auth_id`. No UI currently lists or browses all users. Task assignment UI does not exist yet (Phase 8 scope).

---

## Step 0: Pre-Change Restore Point
Create `Project Restore Points/RP-P2D-phase7c-closeout-pre.md` documenting current RLS state and scan findings.

## Step 1: Create `app_user_directory` View (Option A)

**Database migration** to create a restricted directory view:

```sql
CREATE VIEW public.app_user_directory AS
SELECT id, full_name, email
FROM public.app_user
WHERE is_active = true;

-- RLS on views not supported in Postgres; instead, 
-- use a SECURITY DEFINER function for directory lookups
CREATE OR REPLACE FUNCTION public.get_user_directory()
RETURNS TABLE(id uuid, full_name text, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT au.id, au.full_name, au.email
  FROM public.app_user au
  WHERE au.is_active = true
  AND (
    EXISTS (
      SELECT 1 FROM public.user_role ur
      WHERE ur.user_id = (SELECT aui.id FROM public.app_user aui WHERE aui.auth_id = auth.uid())
      AND ur.role_code IN ('secretary_rvm', 'deputy_secretary', 'rvm_sys_admin')
    )
    OR public.is_super_admin()
  );
$$;
```

Then tighten `app_user` SELECT to self-only for non-admin roles:

```sql
DROP POLICY IF EXISTS app_user_select ON public.app_user;
CREATE POLICY app_user_select ON public.app_user
  FOR SELECT
  USING (auth_id = auth.uid() OR is_super_admin());
```

This means:
- Regular users: can only read their own `app_user` record (auth context self-lookup works)
- Admin roles needing directory: call `get_user_directory()` function (Phase 8 task assignment UI will use this)
- Super admins: full access via both paths

## Step 2: Disposition for `super_admin_bootstrap` (WARN)

The warning is about implicit denial (no INSERT/UPDATE/DELETE policies). Since RLS is enabled and no policies exist, these operations are already blocked for all non-service_role callers. This is **by design** -- the table is managed exclusively via direct DB access.

No code change needed. Document as "By Design" with compensating controls.

## Step 3: Verify `audit_event` Immutability

Already confirmed in Round 2:
- SELECT: `audit_readonly` + `is_super_admin()` only
- INSERT/UPDATE/DELETE: No policies = service_role only

Document in security scan report with evidence.

## Step 4: Create Security Scan Report

Create `docs/security-scan-phase7c.md` with formal disposition for all findings:

| Finding | Level | Disposition | Rationale |
|---------|-------|------------|-----------|
| `app_user` personal data | ERROR | MITIGATED | Tightened to self-only; directory function for admin lookups |
| `super_admin_bootstrap` access control | WARN | BY DESIGN | Implicit denial via RLS; managed by service_role only |
| `audit_event` immutability | INFO | CONFIRMED | No user-facing write policies; service_role only |
| Leaked Password Protection | INFO | CLOSED | Enabled in Supabase Dashboard |

## Step 5: Post-Change Restore Point

Create `Project Restore Points/RP-P2D-phase7c-closeout-post.md`.

## Step 6: Re-run Security Scan + Update Findings

Re-run scan, update/dismiss resolved findings, and report final state.

---

## Files Changed Summary

| File/Resource | Action | Change |
|---|---|---|
| Database migration | CREATE | `get_user_directory()` function + tightened `app_user_select` policy |
| `docs/security-scan-phase7c.md` | CREATE | Formal disposition report |
| `RP-P2D-phase7c-closeout-pre.md` | CREATE | Pre-change restore point |
| `RP-P2D-phase7c-closeout-post.md` | CREATE | Post-change restore point |

No frontend code changes required -- the only `app_user` query is a self-lookup which remains functional under the tightened policy.

---

## Post-Change Verification

1. Auth sign-in deep link still works (self-lookup unaffected)
2. Dashboard loads correctly
3. Non-privileged role cannot SELECT other users from `app_user`
4. `get_user_directory()` returns user list only for secretary/deputy/sys_admin roles

## Phase 8 Gate

Phase 8 begins only after this closeout passes. First Phase 8 deliverable will be the Definition of Done + workflow state diagram + role/write matrix.

