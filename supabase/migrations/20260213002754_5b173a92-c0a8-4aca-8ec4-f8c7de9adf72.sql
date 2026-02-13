
-- Phase 7C Hardening Round 2

-- 1. app_user: self-read OR admin roles only (no broad auth gate)
DROP POLICY IF EXISTS app_user_select ON public.app_user;
CREATE POLICY app_user_select ON public.app_user
  FOR SELECT
  USING (
    auth_id = auth.uid()
    OR has_any_role(ARRAY['secretary_rvm', 'deputy_secretary', 'rvm_sys_admin'])
    OR is_super_admin()
  );

-- 2. super_admin_bootstrap: super_admin ONLY (remove rvm_sys_admin)
DROP POLICY IF EXISTS super_admin_select ON public.super_admin_bootstrap;
CREATE POLICY super_admin_select ON public.super_admin_bootstrap
  FOR SELECT
  USING (is_super_admin());

-- 3. audit_event: tighten SELECT to audit_readonly + super_admin only
DROP POLICY IF EXISTS audit_event_select ON public.audit_event;
CREATE POLICY audit_event_select ON public.audit_event
  FOR SELECT
  USING (
    has_role('audit_readonly')
    OR is_super_admin()
  );

-- 4. audit_event: system-only INSERT via service_role (no user INSERT)
-- Ensure no INSERT policy exists (anon/authenticated cannot insert)
DROP POLICY IF EXISTS audit_event_insert ON public.audit_event;
-- No INSERT policy created = only service_role can insert

-- 5. audit_event: confirm no UPDATE/DELETE policies exist
DROP POLICY IF EXISTS audit_event_update ON public.audit_event;
DROP POLICY IF EXISTS audit_event_delete ON public.audit_event;
-- No UPDATE/DELETE policies = immutable audit trail
