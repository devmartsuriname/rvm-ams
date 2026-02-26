
-- Phase 11: Illegal Attempt Logging Hardening
-- Enable dblink extension for autonomous transactions
CREATE EXTENSION IF NOT EXISTS dblink;

-- Task 1: Create rvm_illegal_attempt_log table
CREATE TABLE public.rvm_illegal_attempt_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_auth_id uuid,
  actor_role text,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  rule text NOT NULL,
  reason text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  request_id text
);

ALTER TABLE public.rvm_illegal_attempt_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY illegal_log_no_insert ON public.rvm_illegal_attempt_log
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY illegal_log_select ON public.rvm_illegal_attempt_log
  FOR SELECT TO authenticated
  USING (
    has_any_role(ARRAY['chair_rvm', 'audit_readonly', 'admin_reporting'])
    OR is_super_admin()
  );

CREATE POLICY illegal_log_no_update ON public.rvm_illegal_attempt_log
  FOR UPDATE TO authenticated USING (false);

CREATE POLICY illegal_log_no_delete ON public.rvm_illegal_attempt_log
  FOR DELETE TO authenticated USING (false);

-- Task 2: Create log_illegal_attempt() SECURITY DEFINER function using dblink
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
  v_conn_name text := 'illegal_log_conn';
  v_db_url text;
BEGIN
  -- Derive actor from auth context
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

  -- Autonomous insert via dblink
  BEGIN
    -- Use the internal connection string
    v_db_url := format(
      'dbname=%s host=localhost port=5432 user=supabase_admin',
      current_database()
    );

    -- Try to establish connection (reuse if exists)
    BEGIN
      PERFORM dblink_connect(v_conn_name, v_db_url);
    EXCEPTION WHEN OTHERS THEN
      -- Connection might already exist, try disconnecting first
      BEGIN
        PERFORM dblink_disconnect(v_conn_name);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
      PERFORM dblink_connect(v_conn_name, v_db_url);
    END;

    PERFORM dblink_exec(
      v_conn_name,
      format(
        'INSERT INTO public.rvm_illegal_attempt_log 
         (actor_auth_id, actor_role, entity_type, entity_id, action, rule, reason, payload)
         VALUES (%L::uuid, %L, %L, %L::uuid, %L, %L, %L, %L::jsonb)',
        v_auth_id, v_role, p_entity_type, p_entity_id,
        p_action, p_rule, p_reason, p_payload::text
      )
    );

    -- Disconnect
    BEGIN
      PERFORM dblink_disconnect(v_conn_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

  EXCEPTION WHEN OTHERS THEN
    -- Rule D: if logging fails, swallow silently
    BEGIN
      PERFORM dblink_disconnect(v_conn_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    NULL;
  END;
END;
$$;

-- Task 3a: Update enforce_decision_status_transition()
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
      'Attempted update on finalized decision',
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
    RAISE EXCEPTION 'Cannot modify finalized decision (is_final = true)';
  END IF;

  -- Validate status transition
  IF OLD.decision_status IS DISTINCT FROM NEW.decision_status THEN
    IF NOT public.validate_status_transition('decision', OLD.decision_status::TEXT, NEW.decision_status::TEXT) THEN
      PERFORM public.log_illegal_attempt(
        'rvm_decision', OLD.id, 'UPDATE', 'DECISION_INVALID_TRANSITION',
        format('Invalid transition: %s -> %s', OLD.decision_status, NEW.decision_status),
        jsonb_build_object('old_status', OLD.decision_status, 'new_status', NEW.decision_status)
      );
      RAISE EXCEPTION 'Invalid decision transition: % -> %', OLD.decision_status, NEW.decision_status;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Task 3b: Update enforce_chair_only_decision_status()
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
        'Non-chair user attempted decision_status change',
        jsonb_build_object('old_status', OLD.decision_status, 'new_status', NEW.decision_status, 'actor_roles', to_jsonb(v_roles))
      );
      RAISE EXCEPTION 'Only chair_rvm may change decision_status';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Task 3c: Update enforce_chair_approval_gate()
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
        'Finalization attempted without chair approval',
        jsonb_build_object('chair_approved_by', NEW.chair_approved_by, 'chair_approved_at', NEW.chair_approved_at)
      );
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
$function$;

-- Task 3d: Update enforce_document_lock_on_decision()
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
        'Document version insert blocked by finalized decision',
        jsonb_build_object('document_id', NEW.document_id, 'decision_id', v_decision_id)
      );
      RAISE EXCEPTION 'Cannot add versions to document linked to finalized decision';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Task 3e: Update enforce_dossier_status_transition()
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
      RAISE EXCEPTION 'Invalid dossier transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
