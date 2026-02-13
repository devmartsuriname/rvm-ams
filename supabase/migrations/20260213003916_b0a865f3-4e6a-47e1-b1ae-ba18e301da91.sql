-- Fix: Restrict get_user_directory() EXECUTE to authenticated only
REVOKE ALL ON FUNCTION public.get_user_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_directory() TO authenticated;