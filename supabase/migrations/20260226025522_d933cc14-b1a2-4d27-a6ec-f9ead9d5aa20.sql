
-- Move dblink extension to extensions schema (Supabase best practice)
DROP EXTENSION IF EXISTS dblink;
CREATE EXTENSION IF NOT EXISTS dblink SCHEMA extensions;

-- Update log_illegal_attempt to use extensions.dblink_connect etc.
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
    v_db_url := format(
      'dbname=%s host=localhost port=5432 user=supabase_admin',
      current_database()
    );

    BEGIN
      PERFORM extensions.dblink_connect(v_conn_name, v_db_url);
    EXCEPTION WHEN OTHERS THEN
      BEGIN
        PERFORM extensions.dblink_disconnect(v_conn_name);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
      PERFORM extensions.dblink_connect(v_conn_name, v_db_url);
    END;

    PERFORM extensions.dblink_exec(
      v_conn_name,
      format(
        'INSERT INTO public.rvm_illegal_attempt_log 
         (actor_auth_id, actor_role, entity_type, entity_id, action, rule, reason, payload)
         VALUES (%L::uuid, %L, %L, %L::uuid, %L, %L, %L, %L::jsonb)',
        v_auth_id, v_role, p_entity_type, p_entity_id,
        p_action, p_rule, p_reason, p_payload::text
      )
    );

    BEGIN
      PERFORM extensions.dblink_disconnect(v_conn_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

  EXCEPTION WHEN OTHERS THEN
    BEGIN
      PERFORM extensions.dblink_disconnect(v_conn_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    NULL;
  END;
END;
$$;
