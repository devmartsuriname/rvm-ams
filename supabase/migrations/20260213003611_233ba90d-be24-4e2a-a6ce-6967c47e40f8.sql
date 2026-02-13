-- Phase 7C Closeout: Tighten app_user SELECT + create directory function

-- Step 1: Create get_user_directory() SECURITY DEFINER function
-- This provides admin-only directory access without exposing app_user broadly
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

-- Step 2: Tighten app_user SELECT to self-only (admins use directory function)
DROP POLICY IF EXISTS app_user_select ON public.app_user;
CREATE POLICY app_user_select ON public.app_user
  FOR SELECT
  USING (auth_id = auth.uid() OR is_super_admin());