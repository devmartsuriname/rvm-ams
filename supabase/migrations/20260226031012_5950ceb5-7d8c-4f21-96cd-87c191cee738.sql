
-- Clean up test functions
DROP FUNCTION IF EXISTS public._test_illegal_log_insert();
DROP FUNCTION IF EXISTS public._test_read_illegal_logs();

-- Clean up test data from verification run
DELETE FROM public.rvm_illegal_attempt_log WHERE entity_type = '_test';
