-- Phase 8A Runtime Fix: log_audit_event() must use NULL (not 'system') as fallback
-- because 'system' is not in app_role and audit_event.actor_role_code has FK to app_role.
CREATE OR REPLACE FUNCTION public.log_audit_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- NULL fallback (not 'system') to satisfy FK on audit_event.actor_role_code -> app_role.code
    v_role_code := NULL;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_event_type := 'created';
    v_payload := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);
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
$function$;

-- Re-apply privilege hardening
REVOKE ALL ON FUNCTION public.log_audit_event() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_audit_event() FROM anon;