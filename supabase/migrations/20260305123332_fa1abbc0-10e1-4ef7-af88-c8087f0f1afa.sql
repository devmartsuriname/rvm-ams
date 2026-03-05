-- Fix: All SELECT policies were RESTRICTIVE. PostgreSQL needs at least one PERMISSIVE policy.
-- Recreate all SELECT policies as PERMISSIVE (default).

DROP POLICY IF EXISTS "rvm_dossier_select" ON public.rvm_dossier;
CREATE POLICY "rvm_dossier_select" ON public.rvm_dossier FOR SELECT TO authenticated USING (has_any_role(ARRAY['chair_rvm','secretary_rvm','deputy_secretary','admin_intake','admin_dossier','admin_agenda','admin_reporting','audit_readonly']) OR is_super_admin());

DROP POLICY IF EXISTS "rvm_meeting_select" ON public.rvm_meeting;
CREATE POLICY "rvm_meeting_select" ON public.rvm_meeting FOR SELECT TO authenticated USING (has_any_role(ARRAY['chair_rvm','secretary_rvm','deputy_secretary','admin_intake','admin_dossier','admin_agenda','admin_reporting','audit_readonly']) OR is_super_admin());

DROP POLICY IF EXISTS "rvm_agenda_item_select" ON public.rvm_agenda_item;
CREATE POLICY "rvm_agenda_item_select" ON public.rvm_agenda_item FOR SELECT TO authenticated USING (has_any_role(ARRAY['chair_rvm','secretary_rvm','deputy_secretary','admin_intake','admin_dossier','admin_agenda','admin_reporting','audit_readonly']) OR is_super_admin());

DROP POLICY IF EXISTS "rvm_decision_select" ON public.rvm_decision;
CREATE POLICY "rvm_decision_select" ON public.rvm_decision FOR SELECT TO authenticated USING (has_any_role(ARRAY['chair_rvm','secretary_rvm','deputy_secretary','admin_reporting','audit_readonly']) OR is_super_admin());

DROP POLICY IF EXISTS "rvm_task_select" ON public.rvm_task;
CREATE POLICY "rvm_task_select" ON public.rvm_task FOR SELECT TO authenticated USING (has_role(assigned_role_code) OR has_any_role(ARRAY['secretary_rvm','deputy_secretary']) OR is_super_admin());

DROP POLICY IF EXISTS "rvm_document_select" ON public.rvm_document;
CREATE POLICY "rvm_document_select" ON public.rvm_document FOR SELECT TO authenticated USING (has_any_role(ARRAY['chair_rvm','secretary_rvm','deputy_secretary','admin_intake','admin_dossier','admin_agenda','admin_reporting','audit_readonly']) OR is_super_admin());

DROP POLICY IF EXISTS "rvm_document_version_select" ON public.rvm_document_version;
CREATE POLICY "rvm_document_version_select" ON public.rvm_document_version FOR SELECT TO authenticated USING (has_any_role(ARRAY['chair_rvm','secretary_rvm','deputy_secretary','admin_intake','admin_dossier','admin_agenda','admin_reporting','audit_readonly']) OR is_super_admin());

DROP POLICY IF EXISTS "audit_event_select" ON public.audit_event;
CREATE POLICY "audit_event_select" ON public.audit_event FOR SELECT TO authenticated USING (has_role('audit_readonly') OR is_super_admin());

DROP POLICY IF EXISTS "rvm_item_select" ON public.rvm_item;
CREATE POLICY "rvm_item_select" ON public.rvm_item FOR SELECT TO authenticated USING (has_any_role(ARRAY['chair_rvm','secretary_rvm','deputy_secretary','admin_intake','admin_dossier','audit_readonly']) OR is_super_admin());

DROP POLICY IF EXISTS "illegal_log_select" ON public.rvm_illegal_attempt_log;
CREATE POLICY "illegal_log_select" ON public.rvm_illegal_attempt_log FOR SELECT TO authenticated USING (has_any_role(ARRAY['chair_rvm','audit_readonly','admin_reporting']) OR is_super_admin());

DROP POLICY IF EXISTS "app_role_select" ON public.app_role;
CREATE POLICY "app_role_select" ON public.app_role FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "app_user_select" ON public.app_user;
CREATE POLICY "app_user_select" ON public.app_user FOR SELECT TO authenticated USING ((auth_id = auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS "user_role_select" ON public.user_role;
CREATE POLICY "user_role_select" ON public.user_role FOR SELECT TO authenticated USING ((user_id = get_current_user_id()) OR has_any_role(ARRAY['secretary_rvm','rvm_sys_admin']) OR is_super_admin());

DROP POLICY IF EXISTS "status_transitions_select" ON public.status_transitions;
CREATE POLICY "status_transitions_select" ON public.status_transitions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "super_admin_select" ON public.super_admin_bootstrap;
CREATE POLICY "super_admin_select" ON public.super_admin_bootstrap FOR SELECT TO authenticated USING (is_super_admin());

DROP POLICY IF EXISTS "missive_keyword_baseline_select" ON public.missive_keyword;
CREATE POLICY "missive_keyword_baseline_select" ON public.missive_keyword FOR SELECT TO authenticated USING (true);