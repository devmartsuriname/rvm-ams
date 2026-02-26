
-- Create a test function to verify log INSERT works
CREATE OR REPLACE FUNCTION public._test_illegal_log_insert() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_id uuid;
  v_count_before int;
  v_count_after int;
BEGIN
  SELECT COUNT(*) INTO v_count_before FROM public.rvm_illegal_attempt_log;
  
  INSERT INTO public.rvm_illegal_attempt_log
    (entity_type, entity_id, action, rule, reason, payload)
  VALUES
    ('_test', gen_random_uuid(), 'TEST', 'DIRECT_INSERT_TEST', 'Verifying table accepts inserts', '{"direct": true}'::jsonb)
  RETURNING id INTO v_id;
  
  SELECT COUNT(*) INTO v_count_after FROM public.rvm_illegal_attempt_log;
  
  RETURN jsonb_build_object(
    'success', true,
    'inserted_id', v_id,
    'count_before', v_count_before,
    'count_after', v_count_after
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Also create a test function to read all log entries (bypasses RLS)
CREATE OR REPLACE FUNCTION public._test_read_illegal_logs() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_result
  FROM (
    SELECT id, created_at, actor_auth_id, actor_role, entity_type, entity_id, action, rule, reason
    FROM public.rvm_illegal_attempt_log
    ORDER BY created_at DESC
    LIMIT 20
  ) t;
  RETURN v_result;
END;
$$;
