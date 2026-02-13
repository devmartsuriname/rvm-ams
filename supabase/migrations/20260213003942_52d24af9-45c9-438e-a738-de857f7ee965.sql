-- Explicitly revoke get_user_directory from anon role
REVOKE ALL ON FUNCTION public.get_user_directory() FROM anon;