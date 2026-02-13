
-- Phase 7C: Security and Access Hardening
-- Task 1: Harden app_user SELECT — require auth.uid() IS NOT NULL
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

-- Task 2: Harden super_admin_bootstrap SELECT — admin-only, no self-lookup
DROP POLICY IF EXISTS super_admin_select ON public.super_admin_bootstrap;
CREATE POLICY super_admin_select ON public.super_admin_bootstrap
  FOR SELECT
  USING (
    has_role('rvm_sys_admin')
    OR is_super_admin()
  );

-- Task 3: Harden app_role SELECT — require authentication
DROP POLICY IF EXISTS app_role_select ON public.app_role;
CREATE POLICY app_role_select ON public.app_role
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
