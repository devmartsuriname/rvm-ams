
-- ============================================================
-- Phase 8A: Workflow Enforcement + Audit Readiness
-- Context: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- ============================================================

-- ============ PART 1: Status Transition Table ============

CREATE TABLE public.status_transitions (
  entity_type TEXT NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  PRIMARY KEY (entity_type, from_status, to_status)
);

-- Dossier transitions
INSERT INTO public.status_transitions VALUES
  ('dossier','draft','registered'),
  ('dossier','registered','in_preparation'),
  ('dossier','registered','cancelled'),
  ('dossier','in_preparation','scheduled'),
  ('dossier','in_preparation','cancelled'),
  ('dossier','scheduled','decided'),
  ('dossier','scheduled','cancelled'),
  ('dossier','decided','archived');

-- Meeting transitions
INSERT INTO public.status_transitions VALUES
  ('meeting','draft','published'),
  ('meeting','published','closed');

-- Task transitions
INSERT INTO public.status_transitions VALUES
  ('task','todo','in_progress'),
  ('task','todo','blocked'),
  ('task','todo','cancelled'),
  ('task','in_progress','done'),
  ('task','in_progress','blocked'),
  ('task','in_progress','cancelled'),
  ('task','blocked','in_progress'),
  ('task','blocked','cancelled');

-- Agenda item transitions
INSERT INTO public.status_transitions VALUES
  ('agenda_item','scheduled','presented'),
  ('agenda_item','scheduled','withdrawn'),
  ('agenda_item','scheduled','moved'),
  ('agenda_item','presented','withdrawn');

-- RLS: read-only for authenticated, deny all writes
ALTER TABLE public.status_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY status_transitions_select ON public.status_transitions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Explicit write-deny policies (belt-and-suspenders for audit proof)
CREATE POLICY status_transitions_no_insert ON public.status_transitions
  FOR INSERT WITH CHECK (false);
CREATE POLICY status_transitions_no_update ON public.status_transitions
  FOR UPDATE USING (false);
CREATE POLICY status_transitions_no_delete ON public.status_transitions
  FOR DELETE USING (false);

-- ============ PART 2: Transition Validation Function ============

CREATE OR REPLACE FUNCTION public.validate_status_transition(
  p_entity_type TEXT, p_old_status TEXT, p_new_status TEXT
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.status_transitions
    WHERE entity_type = p_entity_type
      AND from_status = p_old_status
      AND to_status = p_new_status
  );
$$;

-- ============ PART 3: Workflow Enforcement Triggers ============

-- 3a. Dossier status transition
CREATE OR REPLACE FUNCTION public.enforce_dossier_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT public.validate_status_transition('dossier', OLD.status::TEXT, NEW.status::TEXT) THEN
      RAISE EXCEPTION 'Invalid dossier transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE TRIGGER enforce_dossier_status_transition
  BEFORE UPDATE ON public.rvm_dossier
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_dossier_status_transition();

-- 3b. Meeting status transition
CREATE OR REPLACE FUNCTION public.enforce_meeting_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT public.validate_status_transition('meeting', OLD.status::TEXT, NEW.status::TEXT) THEN
      RAISE EXCEPTION 'Invalid meeting transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE TRIGGER enforce_meeting_status_transition
  BEFORE UPDATE ON public.rvm_meeting
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_meeting_status_transition();

-- 3c. Task status transition + assignment enforcement
CREATE OR REPLACE FUNCTION public.enforce_task_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT public.validate_status_transition('task', OLD.status::TEXT, NEW.status::TEXT) THEN
      RAISE EXCEPTION 'Invalid task transition: % -> %', OLD.status, NEW.status;
    END IF;
    IF NEW.status = 'in_progress' THEN
      NEW.started_at := COALESCE(NEW.started_at, now());
    ELSIF NEW.status = 'done' THEN
      NEW.completed_at := COALESCE(NEW.completed_at, now());
    END IF;
  END IF;
  IF NEW.status = 'in_progress' AND NEW.assigned_user_id IS NULL THEN
    RAISE EXCEPTION 'Task cannot be in_progress without assigned_user_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE TRIGGER enforce_task_status_transition
  BEFORE UPDATE ON public.rvm_task
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_task_status_transition();

-- 3d. Agenda item status transition + closed meeting guard
CREATE OR REPLACE FUNCTION public.enforce_agenda_item_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  v_meeting_status public.meeting_status;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT status INTO v_meeting_status FROM public.rvm_meeting WHERE id = NEW.meeting_id;
    IF v_meeting_status = 'closed' THEN
      RAISE EXCEPTION 'Cannot modify agenda item in closed meeting';
    END IF;
    IF NOT public.validate_status_transition('agenda_item', OLD.status::TEXT, NEW.status::TEXT) THEN
      RAISE EXCEPTION 'Invalid agenda item transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE TRIGGER enforce_agenda_item_status_transition
  BEFORE UPDATE ON public.rvm_agenda_item
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_agenda_item_status_transition();

-- ============ PART 4: Chair Approval Gate ============

CREATE OR REPLACE FUNCTION public.enforce_chair_approval_gate()
RETURNS TRIGGER AS $$
DECLARE
  v_dossier_id uuid;
BEGIN
  IF NEW.is_final = true AND OLD.is_final = false THEN
    IF NEW.chair_approved_at IS NULL OR NEW.chair_approved_by IS NULL THEN
      RAISE EXCEPTION 'Decision cannot be finalized without chair approval';
    END IF;
    -- Cascade: set parent dossier to decided
    SELECT dossier_id INTO v_dossier_id
    FROM public.rvm_agenda_item WHERE id = NEW.agenda_item_id;
    IF v_dossier_id IS NOT NULL THEN
      UPDATE public.rvm_dossier SET status = 'decided', updated_at = now()
      WHERE id = v_dossier_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE TRIGGER enforce_chair_approval_gate
  BEFORE UPDATE ON public.rvm_decision
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_chair_approval_gate();

-- ============ PART 5: Dossier Immutability Guard ============

CREATE OR REPLACE FUNCTION public.enforce_dossier_immutability()
RETURNS TRIGGER AS $$
DECLARE
  v_status public.dossier_status;
BEGIN
  SELECT status INTO v_status FROM public.rvm_dossier WHERE id = NEW.dossier_id;
  IF v_status IN ('decided', 'archived', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot modify entities in locked dossier (status: %)', v_status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE TRIGGER enforce_dossier_immutability_item
  BEFORE INSERT OR UPDATE ON public.rvm_item
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_dossier_immutability();

CREATE TRIGGER enforce_dossier_immutability_document
  BEFORE INSERT OR UPDATE ON public.rvm_document
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_dossier_immutability();

-- ============ PART 6: Document Version Lock ============

CREATE OR REPLACE FUNCTION public.enforce_document_lock_on_decision()
RETURNS TRIGGER AS $$
DECLARE
  v_decision_id uuid;
  v_is_final boolean;
BEGIN
  SELECT decision_id INTO v_decision_id
  FROM public.rvm_document WHERE id = NEW.document_id;

  IF v_decision_id IS NOT NULL THEN
    SELECT is_final INTO v_is_final
    FROM public.rvm_decision WHERE id = v_decision_id;
    IF v_is_final = true THEN
      RAISE EXCEPTION 'Cannot add versions to document linked to finalized decision';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE TRIGGER enforce_document_lock_on_decision
  BEFORE INSERT ON public.rvm_document_version
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_document_lock_on_decision();

-- ============ PART 7: Generic Audit Logging (Schema-Safe) ============

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_payload JSONB;
  v_user_id uuid;
  v_role_code TEXT;
  v_old_json JSONB;
  v_new_json JSONB;
BEGIN
  -- Get current user (NULL-safe for service_role / system context)
  v_user_id := public.get_current_user_id();

  -- Get first role code from canonical user_role table
  IF v_user_id IS NOT NULL THEN
    SELECT ur.role_code INTO v_role_code
    FROM public.user_role ur
    WHERE ur.user_id = v_user_id
    LIMIT 1;
  ELSE
    v_role_code := 'system';
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_event_type := 'created';
    v_payload := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);
    -- Detect status change via JSONB key (safe for all tables)
    IF (v_old_json ? 'status') AND (v_new_json ? 'status')
       AND (v_old_json->>'status') IS DISTINCT FROM (v_new_json->>'status') THEN
      v_event_type := 'status_changed';
    ELSE
      v_event_type := 'updated';
    END IF;
    v_payload := jsonb_build_object('old', v_old_json, 'new', v_new_json);
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'deleted';
    v_payload := to_jsonb(OLD);
  END IF;

  INSERT INTO public.audit_event (
    entity_type, entity_id, event_type, event_payload,
    actor_user_id, actor_role_code, occurred_at
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_event_type,
    v_payload,
    v_user_id,
    v_role_code,
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- ============ PART 8: Attach Audit Triggers ============

CREATE TRIGGER audit_rvm_dossier
  AFTER INSERT OR UPDATE ON public.rvm_dossier
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_rvm_item
  AFTER INSERT OR UPDATE ON public.rvm_item
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_rvm_task
  AFTER INSERT OR UPDATE ON public.rvm_task
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_rvm_meeting
  AFTER INSERT OR UPDATE ON public.rvm_meeting
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_rvm_agenda_item
  AFTER INSERT OR UPDATE ON public.rvm_agenda_item
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_rvm_decision
  AFTER INSERT OR UPDATE ON public.rvm_decision
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_rvm_document
  AFTER INSERT OR UPDATE ON public.rvm_document
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_rvm_document_version
  AFTER INSERT ON public.rvm_document_version
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- ============ PART 9: Privilege Hardening ============

REVOKE ALL ON FUNCTION public.log_audit_event() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_audit_event() FROM anon;
