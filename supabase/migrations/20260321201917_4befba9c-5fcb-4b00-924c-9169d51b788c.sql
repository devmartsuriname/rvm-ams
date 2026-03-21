-- Phase 25 Step 7: Deactivate super admin bootstrap (MANDATORY pre-production)
-- Rollback: UPDATE public.super_admin_bootstrap SET is_active = true, expires_at = NULL WHERE email = 'info@devmart.sr';

UPDATE public.super_admin_bootstrap
SET is_active = false, expires_at = now()
WHERE is_active = true;