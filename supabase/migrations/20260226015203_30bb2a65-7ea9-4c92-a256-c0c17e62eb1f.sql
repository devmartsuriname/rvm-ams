
-- Phase 10A: Decision Status Hardening
-- Authority: Devmart Guardian Rules

-- ============================================
-- Task 1: Insert valid decision status transitions
-- ============================================
INSERT INTO public.status_transitions (entity_type, from_status, to_status) VALUES
  ('decision', 'pending',  'approved'),
  ('decision', 'pending',  'deferred'),
  ('decision', 'pending',  'rejected'),
  ('decision', 'deferred', 'pending'),
  ('decision', 'deferred', 'approved');

-- ============================================
-- Task 2: enforce_decision_status_transition()
-- Fires BEFORE UPDATE on rvm_decision
-- Validates status transitions + immutability
-- ============================================
CREATE OR REPLACE FUNCTION public.enforce_decision_status_transition()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
BEGIN
  -- Immutability: block ALL updates when is_final = true
  IF OLD.is_final = true THEN
    RAISE EXCEPTION 'Cannot modify finalized decision (is_final = true)';
  END IF;

  -- Validate status transition
  IF OLD.decision_status IS DISTINCT FROM NEW.decision_status THEN
    IF NOT public.validate_status_transition('decision', OLD.decision_status::TEXT, NEW.decision_status::TEXT) THEN
      RAISE EXCEPTION 'Invalid decision transition: % -> %', OLD.decision_status, NEW.decision_status;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_enforce_decision_status_transition
  BEFORE UPDATE ON public.rvm_decision
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_decision_status_transition();

-- ============================================
-- Task 3: enforce_chair_only_decision_status()
-- Fires BEFORE UPDATE on rvm_decision
-- Only chair_rvm or super_admin may change decision_status
-- ============================================
CREATE OR REPLACE FUNCTION public.enforce_chair_only_decision_status()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_roles TEXT[];
BEGIN
  IF OLD.decision_status IS DISTINCT FROM NEW.decision_status THEN
    v_roles := public.get_user_roles();
    IF NOT ('chair_rvm' = ANY(v_roles)) AND NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Only chair_rvm may change decision_status';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_enforce_chair_only_decision_status
  BEFORE UPDATE ON public.rvm_decision
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_chair_only_decision_status();
