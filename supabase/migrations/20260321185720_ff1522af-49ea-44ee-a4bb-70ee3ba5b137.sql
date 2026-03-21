-- Phase 23B: Convert all RESTRICTIVE INSERT/UPDATE policies to PERMISSIVE
-- Root cause: RESTRICTIVE-only policies block all writes (no PERMISSIVE base exists)

-- 1. missive_keyword
DROP POLICY "missive_keyword_insert" ON public.missive_keyword;
CREATE POLICY "missive_keyword_insert" ON public.missive_keyword
  FOR INSERT TO authenticated
  WITH CHECK (has_role('rvm_sys_admin'::text) OR is_super_admin());

DROP POLICY "missive_keyword_update" ON public.missive_keyword;
CREATE POLICY "missive_keyword_update" ON public.missive_keyword
  FOR UPDATE TO authenticated
  USING (has_role('rvm_sys_admin'::text) OR is_super_admin());

-- 2. rvm_agenda_item
DROP POLICY "rvm_agenda_item_insert" ON public.rvm_agenda_item;
CREATE POLICY "rvm_agenda_item_insert" ON public.rvm_agenda_item
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(ARRAY['secretary_rvm'::text, 'admin_agenda'::text]) OR is_super_admin());

DROP POLICY "rvm_agenda_item_update" ON public.rvm_agenda_item;
CREATE POLICY "rvm_agenda_item_update" ON public.rvm_agenda_item
  FOR UPDATE TO authenticated
  USING (has_any_role(ARRAY['secretary_rvm'::text, 'admin_agenda'::text]) OR is_super_admin());

-- 3. rvm_decision
DROP POLICY "rvm_decision_insert" ON public.rvm_decision;
CREATE POLICY "rvm_decision_insert" ON public.rvm_decision
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(ARRAY['secretary_rvm'::text, 'admin_reporting'::text]) OR is_super_admin());

DROP POLICY "rvm_decision_update" ON public.rvm_decision;
CREATE POLICY "rvm_decision_update" ON public.rvm_decision
  FOR UPDATE TO authenticated
  USING ((has_role('secretary_rvm'::text) AND (is_final = false)) OR has_role('chair_rvm'::text) OR is_super_admin());

-- 4. rvm_document
DROP POLICY "rvm_document_insert" ON public.rvm_document;
CREATE POLICY "rvm_document_insert" ON public.rvm_document
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(ARRAY['secretary_rvm'::text, 'admin_dossier'::text, 'admin_reporting'::text]) OR is_super_admin());

DROP POLICY "rvm_document_update" ON public.rvm_document;
CREATE POLICY "rvm_document_update" ON public.rvm_document
  FOR UPDATE TO authenticated
  USING (has_any_role(ARRAY['secretary_rvm'::text, 'admin_dossier'::text]) OR is_super_admin());

-- 5. rvm_document_version
DROP POLICY "rvm_document_version_insert" ON public.rvm_document_version;
CREATE POLICY "rvm_document_version_insert" ON public.rvm_document_version
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(ARRAY['secretary_rvm'::text, 'admin_dossier'::text, 'admin_reporting'::text]) OR is_super_admin());

-- 6. rvm_dossier
DROP POLICY "rvm_dossier_insert" ON public.rvm_dossier;
CREATE POLICY "rvm_dossier_insert" ON public.rvm_dossier
  FOR INSERT TO authenticated
  WITH CHECK (has_role('admin_intake'::text) OR is_super_admin());

DROP POLICY "rvm_dossier_update" ON public.rvm_dossier;
CREATE POLICY "rvm_dossier_update" ON public.rvm_dossier
  FOR UPDATE TO authenticated
  USING ((has_any_role(ARRAY['secretary_rvm'::text, 'admin_dossier'::text]) AND (status <> ALL (ARRAY['decided'::dossier_status, 'archived'::dossier_status, 'cancelled'::dossier_status]))) OR is_super_admin());

-- 7. rvm_item
DROP POLICY "rvm_item_insert" ON public.rvm_item;
CREATE POLICY "rvm_item_insert" ON public.rvm_item
  FOR INSERT TO authenticated
  WITH CHECK (has_role('admin_intake'::text) OR is_super_admin());

DROP POLICY "rvm_item_update" ON public.rvm_item;
CREATE POLICY "rvm_item_update" ON public.rvm_item
  FOR UPDATE TO authenticated
  USING (has_any_role(ARRAY['secretary_rvm'::text, 'admin_dossier'::text]) OR is_super_admin());

-- 8. rvm_meeting
DROP POLICY "rvm_meeting_insert" ON public.rvm_meeting;
CREATE POLICY "rvm_meeting_insert" ON public.rvm_meeting
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(ARRAY['secretary_rvm'::text, 'admin_agenda'::text]) OR is_super_admin());

DROP POLICY "rvm_meeting_update" ON public.rvm_meeting;
CREATE POLICY "rvm_meeting_update" ON public.rvm_meeting
  FOR UPDATE TO authenticated
  USING ((has_any_role(ARRAY['secretary_rvm'::text, 'admin_agenda'::text]) AND (status <> 'closed'::meeting_status)) OR is_super_admin());

-- 9. rvm_task
DROP POLICY "rvm_task_insert" ON public.rvm_task;
CREATE POLICY "rvm_task_insert" ON public.rvm_task
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(ARRAY['secretary_rvm'::text, 'deputy_secretary'::text]) OR is_super_admin());

DROP POLICY "rvm_task_update" ON public.rvm_task;
CREATE POLICY "rvm_task_update" ON public.rvm_task
  FOR UPDATE TO authenticated
  USING ((assigned_user_id = get_current_user_id()) OR has_any_role(ARRAY['secretary_rvm'::text, 'deputy_secretary'::text]) OR is_super_admin());