
-- Phase 11 Correction: Replace dblink with RETURN NULL pattern
-- Log persists because RETURN NULL does not trigger rollback

-- Drop dblink (no longer needed)
DROP EXTENSION IF EXISTS dblink;

-- Rewrite log_illegal_attempt() — direct INSERT, no dblink
CREATE OR REPLACE FUNCTION public.log_illegal_attempt(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_rule text,
  p_reason text,
  p_payload jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_auth_id uuid;
  v_role text;
BEGIN
  -- Derive actor from auth context (cannot be spoofed)
  BEGIN
    v_auth_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_auth_id := NULL;
  END;

  -- Get first role
  BEGIN
    SELECT ur.role_code INTO v_role
    FROM public.user_role ur
    JOIN public.app_user au ON au.id = ur.user_id
    WHERE au.auth_id = v_auth_id
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_role := NULL;
  END;

  -- Direct INSERT (no dblink needed — RETURN NULL pattern means no rollback)
  BEGIN
    INSERT INTO public.rvm_illegal_attempt_log
      (actor_auth_id, actor_role, entity_type, entity_id, action, rule, reason, payload)
    VALUES
      (v_auth_id, v_role, p_entity_type, p_entity_id, p_action, p_rule, p_reason, p_payload);
  EXCEPTION WHEN OTHERS THEN
    -- Rule D: if logging fails, swallow — enforcement still happens
    NULL;
  END;
END;
$$;

-- Create RPC to retrieve latest violation reason (for service layer error messages)
CREATE OR REPLACE FUNCTION public.get_latest_violation(
  p_entity_type text,
  p_entity_id uuid
) RETURNS TABLE(rule text, reason text, created_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT rule, reason, created_at
  FROM public.rvm_illegal_attempt_log
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Rewrite enforce_decision_status_transition() — RETURN NULL instead of RAISE EXCEPTION
CREATE OR REPLACE FUNCTION public.enforce_decision_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Immutability: block ALL updates when is_final = true
  IF OLD.is_final = true THEN
    PERFORM public.log_illegal_attempt(
      'rvm_decision', OLD.id, 'UPDATE', 'DECISION_FINAL_LOCK',
      'Cannot modify finalized decision (is_final = true)',
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
    RETURN NULL; -- silently reject, log persists
  END IF;

  -- Validate status transition
  IF OLD.decision_status IS DISTINCT FROM NEW.decision_status THEN
    IF NOT public.validate_status_transition('decision', OLD.decision_status::TEXT, NEW.decision_status::TEXT) THEN
      PERFORM public.log_illegal_attempt(
        'rvm_decision', OLD.id, 'UPDATE', 'DECISION_INVALID_TRANSITION',
        format('Invalid decision transition: %s -> %s', OLD.decision_status, NEW.decision_status),
        jsonb_build_object('old_status', OLD.decision_status, 'new_status', NEW.decision_status)
      );
      RETURN NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Rewrite enforce_chair_only_decision_status() — RETURN NULL
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
      PERFORM public.log_illegal_attempt(
        'rvm_decision', OLD.id, 'UPDATE', 'CHAIR_ONLY_STATUS',
        'Only chair_rvm may change decision_status',
        jsonb_build_object('old_status', OLD.decision_status, 'new_status', NEW.decision_status, 'actor_roles', to_jsonb(v_roles))
      );
      RETURN NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Rewrite enforce_chair_approval_gate() — RETURN NULL
CREATE OR REPLACE FUNCTION public.enforce_chair_approval_gate()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_dossier_id uuid;
BEGIN
  IF NEW.is_final = true AND OLD.is_final = false THEN
    IF NEW.chair_approved_at IS NULL OR NEW.chair_approved_by IS NULL THEN
      PERFORM public.log_illegal_attempt(
        'rvm_decision', NEW.id, 'UPDATE', 'CHAIR_GATE_MISSING',
        'Decision cannot be finalized without chair approval',
        jsonb_build_object('chair_approved_by', NEW.chair_approved_by, 'chair_approved_at', NEW.chair_approved_at)
      );
      RETURN NULL;
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
$function$;

-- Rewrite enforce_document_lock_on_decision() — RETURN NULL
CREATE OR REPLACE FUNCTION public.enforce_document_lock_on_decision()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
      PERFORM public.log_illegal_attempt(
        'rvm_document_version', NEW.id, 'INSERT', 'DOCUMENT_FINAL_LOCK',
        'Cannot add versions to document linked to finalized decision',
        jsonb_build_object('document_id', NEW.document_id, 'decision_id', v_decision_id)
      );
      RETURN NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Rewrite enforce_dossier_status_transition() — RETURN NULL
CREATE OR REPLACE FUNCTION public.enforce_dossier_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT public.validate_status_transition('dossier', OLD.status::TEXT, NEW.status::TEXT) THEN
      PERFORM public.log_illegal_attempt(
        'rvm_dossier', OLD.id, 'UPDATE', 'DOSSIER_INVALID_TRANSITION',
        format('Invalid dossier transition: %s -> %s', OLD.status, NEW.status),
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
      RETURN NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
