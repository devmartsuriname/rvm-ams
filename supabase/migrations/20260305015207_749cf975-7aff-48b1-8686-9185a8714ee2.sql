
-- Migration: Phase 16 — RETURN NULL Pattern Unification
-- Converts 4 remaining RAISE EXCEPTION triggers to RETURN NULL + log_illegal_attempt

-- 1. enforce_meeting_status_transition
CREATE OR REPLACE FUNCTION public.enforce_meeting_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT public.validate_status_transition('meeting', OLD.status::TEXT, NEW.status::TEXT) THEN
      PERFORM public.log_illegal_attempt(
        'rvm_meeting', OLD.id, 'UPDATE', 'MEETING_INVALID_TRANSITION',
        format('Invalid meeting transition: %s -> %s', OLD.status, NEW.status),
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
      RETURN NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. enforce_task_status_transition
CREATE OR REPLACE FUNCTION public.enforce_task_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT public.validate_status_transition('task', OLD.status::TEXT, NEW.status::TEXT) THEN
      PERFORM public.log_illegal_attempt(
        'rvm_task', OLD.id, 'UPDATE', 'TASK_INVALID_TRANSITION',
        format('Invalid task transition: %s -> %s', OLD.status, NEW.status),
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
      RETURN NULL;
    END IF;
    IF NEW.status = 'in_progress' THEN
      NEW.started_at := COALESCE(NEW.started_at, now());
    ELSIF NEW.status = 'done' THEN
      NEW.completed_at := COALESCE(NEW.completed_at, now());
    END IF;
  END IF;
  IF NEW.status = 'in_progress' AND NEW.assigned_user_id IS NULL THEN
    PERFORM public.log_illegal_attempt(
      'rvm_task', OLD.id, 'UPDATE', 'TASK_NO_ASSIGNEE',
      'Task cannot be in_progress without assigned_user_id',
      jsonb_build_object('status', NEW.status, 'assigned_user_id', NEW.assigned_user_id)
    );
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3. enforce_agenda_item_status_transition
CREATE OR REPLACE FUNCTION public.enforce_agenda_item_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_meeting_status public.meeting_status;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT status INTO v_meeting_status FROM public.rvm_meeting WHERE id = NEW.meeting_id;
    IF v_meeting_status = 'closed' THEN
      PERFORM public.log_illegal_attempt(
        'rvm_agenda_item', OLD.id, 'UPDATE', 'AGENDA_CLOSED_MEETING',
        'Cannot modify agenda item in closed meeting',
        jsonb_build_object('meeting_id', NEW.meeting_id, 'meeting_status', v_meeting_status)
      );
      RETURN NULL;
    END IF;
    IF NOT public.validate_status_transition('agenda_item', OLD.status::TEXT, NEW.status::TEXT) THEN
      PERFORM public.log_illegal_attempt(
        'rvm_agenda_item', OLD.id, 'UPDATE', 'AGENDA_INVALID_TRANSITION',
        format('Invalid agenda item transition: %s -> %s', OLD.status, NEW.status),
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
      RETURN NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. enforce_dossier_immutability
CREATE OR REPLACE FUNCTION public.enforce_dossier_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status public.dossier_status;
BEGIN
  SELECT status INTO v_status FROM public.rvm_dossier WHERE id = NEW.dossier_id;
  IF v_status IN ('decided', 'archived', 'cancelled') THEN
    PERFORM public.log_illegal_attempt(
      TG_TABLE_NAME, NEW.id, 'UPDATE', 'DOSSIER_IMMUTABILITY',
      format('Cannot modify entities in locked dossier (status: %s)', v_status),
      jsonb_build_object('dossier_id', NEW.dossier_id, 'dossier_status', v_status)
    );
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$function$;
