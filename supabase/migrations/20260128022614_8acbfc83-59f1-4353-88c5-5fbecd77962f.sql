-- ============================================
-- PHASE 3: ROLE-BASED RLS + WORKFLOW HELPERS
-- AMS-RVM Core v1
-- Date: 2026-01-28
-- ============================================

-- ============================================
-- PART 1: RVM_DOSSIER RLS POLICIES
-- ============================================

-- Drop baseline policies
DROP POLICY IF EXISTS rvm_dossier_baseline_select ON public.rvm_dossier;
DROP POLICY IF EXISTS rvm_dossier_baseline_insert ON public.rvm_dossier;
DROP POLICY IF EXISTS rvm_dossier_baseline_update ON public.rvm_dossier;

-- Role-based SELECT: All RVM roles can read dossiers
CREATE POLICY rvm_dossier_select ON public.rvm_dossier
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(ARRAY['chair_rvm', 'secretary_rvm', 'deputy_secretary',
      'admin_intake', 'admin_dossier', 'admin_agenda', 'admin_reporting', 'audit_readonly'])
    OR public.is_super_admin()
  );

-- Role-based INSERT: admin_intake only
CREATE POLICY rvm_dossier_insert ON public.rvm_dossier
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role('admin_intake') OR public.is_super_admin());

-- Role-based UPDATE: secretary_rvm, admin_dossier (not after decided/archived/cancelled)
CREATE POLICY rvm_dossier_update ON public.rvm_dossier
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    (public.has_any_role(ARRAY['secretary_rvm', 'admin_dossier']) 
      AND status NOT IN ('decided', 'archived', 'cancelled'))
    OR public.is_super_admin()
  );

-- ============================================
-- PART 2: RVM_ITEM RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS rvm_item_baseline_select ON public.rvm_item;
DROP POLICY IF EXISTS rvm_item_baseline_insert ON public.rvm_item;
DROP POLICY IF EXISTS rvm_item_baseline_update ON public.rvm_item;

CREATE POLICY rvm_item_select ON public.rvm_item
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(ARRAY['chair_rvm', 'secretary_rvm', 'deputy_secretary',
      'admin_intake', 'admin_dossier', 'audit_readonly'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_item_insert ON public.rvm_item
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role('admin_intake') OR public.is_super_admin());

CREATE POLICY rvm_item_update ON public.rvm_item
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    public.has_any_role(ARRAY['secretary_rvm', 'admin_dossier'])
    OR public.is_super_admin()
  );

-- ============================================
-- PART 3: RVM_MEETING RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS rvm_meeting_baseline_select ON public.rvm_meeting;
DROP POLICY IF EXISTS rvm_meeting_baseline_insert ON public.rvm_meeting;
DROP POLICY IF EXISTS rvm_meeting_baseline_update ON public.rvm_meeting;

CREATE POLICY rvm_meeting_select ON public.rvm_meeting
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(ARRAY['chair_rvm', 'secretary_rvm', 'deputy_secretary',
      'admin_intake', 'admin_dossier', 'admin_agenda', 'admin_reporting', 'audit_readonly'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_meeting_insert ON public.rvm_meeting
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_any_role(ARRAY['secretary_rvm', 'admin_agenda'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_meeting_update ON public.rvm_meeting
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    (public.has_any_role(ARRAY['secretary_rvm', 'admin_agenda']) AND status != 'closed')
    OR public.is_super_admin()
  );

-- ============================================
-- PART 4: RVM_AGENDA_ITEM RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS rvm_agenda_item_baseline_select ON public.rvm_agenda_item;
DROP POLICY IF EXISTS rvm_agenda_item_baseline_insert ON public.rvm_agenda_item;
DROP POLICY IF EXISTS rvm_agenda_item_baseline_update ON public.rvm_agenda_item;

CREATE POLICY rvm_agenda_item_select ON public.rvm_agenda_item
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(ARRAY['chair_rvm', 'secretary_rvm', 'deputy_secretary',
      'admin_intake', 'admin_dossier', 'admin_agenda', 'admin_reporting', 'audit_readonly'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_agenda_item_insert ON public.rvm_agenda_item
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_any_role(ARRAY['secretary_rvm', 'admin_agenda'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_agenda_item_update ON public.rvm_agenda_item
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    public.has_any_role(ARRAY['secretary_rvm', 'admin_agenda'])
    OR public.is_super_admin()
  );

-- ============================================
-- PART 5: RVM_DECISION RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS rvm_decision_baseline_select ON public.rvm_decision;
DROP POLICY IF EXISTS rvm_decision_baseline_insert ON public.rvm_decision;
DROP POLICY IF EXISTS rvm_decision_baseline_update ON public.rvm_decision;

CREATE POLICY rvm_decision_select ON public.rvm_decision
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(ARRAY['chair_rvm', 'secretary_rvm', 'deputy_secretary', 'admin_reporting', 'audit_readonly'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_decision_insert ON public.rvm_decision
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_any_role(ARRAY['secretary_rvm', 'admin_reporting'])
    OR public.is_super_admin()
  );

-- UPDATE: secretary_rvm can update when not final, chair_rvm for finalization
CREATE POLICY rvm_decision_update ON public.rvm_decision
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    (public.has_role('secretary_rvm') AND is_final = false)
    OR public.has_role('chair_rvm')
    OR public.is_super_admin()
  );

-- ============================================
-- PART 6: RVM_DOCUMENT RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS rvm_document_baseline_select ON public.rvm_document;
DROP POLICY IF EXISTS rvm_document_baseline_insert ON public.rvm_document;
DROP POLICY IF EXISTS rvm_document_baseline_update ON public.rvm_document;

CREATE POLICY rvm_document_select ON public.rvm_document
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(ARRAY['chair_rvm', 'secretary_rvm', 'deputy_secretary',
      'admin_intake', 'admin_dossier', 'admin_agenda', 'admin_reporting', 'audit_readonly'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_document_insert ON public.rvm_document
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_any_role(ARRAY['secretary_rvm', 'admin_dossier', 'admin_reporting'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_document_update ON public.rvm_document
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    public.has_any_role(ARRAY['secretary_rvm', 'admin_dossier'])
    OR public.is_super_admin()
  );

-- ============================================
-- PART 7: RVM_DOCUMENT_VERSION RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS rvm_document_version_baseline_select ON public.rvm_document_version;
DROP POLICY IF EXISTS rvm_document_version_baseline_insert ON public.rvm_document_version;

CREATE POLICY rvm_document_version_select ON public.rvm_document_version
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(ARRAY['chair_rvm', 'secretary_rvm', 'deputy_secretary',
      'admin_intake', 'admin_dossier', 'admin_agenda', 'admin_reporting', 'audit_readonly'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_document_version_insert ON public.rvm_document_version
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_any_role(ARRAY['secretary_rvm', 'admin_dossier', 'admin_reporting'])
    OR public.is_super_admin()
  );

-- Note: Document versions are immutable (no UPDATE policy)

-- ============================================
-- PART 8: RVM_TASK RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS rvm_task_baseline_select ON public.rvm_task;
DROP POLICY IF EXISTS rvm_task_baseline_insert ON public.rvm_task;
DROP POLICY IF EXISTS rvm_task_baseline_update ON public.rvm_task;

-- SELECT: Users see tasks assigned to their role, or secretary/deputy see all
CREATE POLICY rvm_task_select ON public.rvm_task
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.has_role(assigned_role_code)
    OR public.has_any_role(ARRAY['secretary_rvm', 'deputy_secretary'])
    OR public.is_super_admin()
  );

CREATE POLICY rvm_task_insert ON public.rvm_task
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_any_role(ARRAY['secretary_rvm', 'deputy_secretary'])
    OR public.is_super_admin()
  );

-- UPDATE: Own assigned tasks + secretary/deputy can update any
CREATE POLICY rvm_task_update ON public.rvm_task
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    (assigned_user_id = public.get_current_user_id())
    OR public.has_any_role(ARRAY['secretary_rvm', 'deputy_secretary'])
    OR public.is_super_admin()
  );

-- ============================================
-- PART 9: AUDIT_EVENT RLS (SELECT ONLY)
-- ============================================

DROP POLICY IF EXISTS audit_event_baseline_select ON public.audit_event;
DROP POLICY IF EXISTS audit_event_baseline_insert ON public.audit_event;

-- SELECT only for audit readers
CREATE POLICY audit_event_select ON public.audit_event
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (
    public.has_any_role(ARRAY['audit_readonly', 'secretary_rvm', 'rvm_sys_admin'])
    OR public.is_super_admin()
  );

-- NO INSERT POLICY for authenticated users (deferred to Phase 8)
-- Only is_super_admin() can insert via baseline during testing

-- ============================================
-- PART 10: MISSIVE_KEYWORD RLS (Reference Data)
-- ============================================

-- Already has public SELECT; add management policies
DROP POLICY IF EXISTS missive_keyword_baseline_update ON public.missive_keyword;
DROP POLICY IF EXISTS missive_keyword_baseline_insert ON public.missive_keyword;

CREATE POLICY missive_keyword_insert ON public.missive_keyword
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role('rvm_sys_admin')
    OR public.is_super_admin()
  );

CREATE POLICY missive_keyword_update ON public.missive_keyword
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    public.has_role('rvm_sys_admin')
    OR public.is_super_admin()
  );

-- ============================================
-- PART 11: WORKFLOW STATE HELPER FUNCTIONS
-- ============================================

-- Check if dossier is in editable state
CREATE OR REPLACE FUNCTION public.is_dossier_editable(p_dossier_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT status NOT IN ('decided', 'archived', 'cancelled')
     FROM rvm_dossier WHERE id = p_dossier_id),
    false
  );
$$;

-- Check if meeting is in editable state
CREATE OR REPLACE FUNCTION public.is_meeting_editable(p_meeting_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT status != 'closed'
     FROM rvm_meeting WHERE id = p_meeting_id),
    false
  );
$$;

-- Check if decision is in draft state (not finalized)
CREATE OR REPLACE FUNCTION public.is_decision_draft(p_decision_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_final = false
     FROM rvm_decision WHERE id = p_decision_id),
    false
  );
$$;

-- Check if current user is assigned to task
CREATE OR REPLACE FUNCTION public.is_task_assignee(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT assigned_user_id = get_current_user_id()
     FROM rvm_task WHERE id = p_task_id),
    false
  );
$$;

-- ============================================
-- END PHASE 3 MIGRATION
-- ============================================