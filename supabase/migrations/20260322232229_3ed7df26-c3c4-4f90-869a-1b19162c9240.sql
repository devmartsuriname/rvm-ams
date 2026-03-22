-- Add admin_intake role to member1@rvm.local for dossier creation
-- member1 already has admin_dossier (edit), now also gets admin_intake (create)
INSERT INTO public.user_role (user_id, role_code)
VALUES ('745978e1-60c0-4812-b6f5-1247a55fe9c4', 'admin_intake')
ON CONFLICT (user_id, role_code) DO NOTHING;