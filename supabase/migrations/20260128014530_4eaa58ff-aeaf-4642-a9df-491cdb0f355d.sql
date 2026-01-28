-- ============================================
-- PHASE 2: IDENTITY & ACCESS SCHEMA
-- AMS-RVM Core (v1)
-- Migration: 20260128_identity_foundation
-- ============================================

-- ============================================
-- SECTION 1: IDENTITY TABLES
-- ============================================

-- 1.1 Users Table
CREATE TABLE public.app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.2 Roles Table (9 RVM Roles)
CREATE TABLE public.app_role (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- 1.3 User-Role Mapping
CREATE TABLE public.user_role (
  user_id UUID REFERENCES public.app_user(id) ON DELETE CASCADE,
  role_code TEXT REFERENCES public.app_role(code) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_code)
);

-- 1.4 Super Admin Bootstrap (Test/Bootstrap ONLY)
CREATE TABLE public.super_admin_bootstrap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  purpose TEXT DEFAULT 'testing/bootstrap',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- ============================================
-- SECTION 2: RLS HELPER FUNCTIONS
-- All SECURITY DEFINER to prevent RLS recursion
-- ============================================

-- 2.1 Get current user's app_user id
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM public.app_user WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 2.2 Get current user's roles as array
CREATE OR REPLACE FUNCTION public.get_user_roles()
RETURNS TEXT[] AS $$
  SELECT COALESCE(ARRAY_AGG(role_code), ARRAY[]::TEXT[])
  FROM public.user_role
  WHERE user_id = (
    SELECT id FROM public.app_user WHERE auth_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 2.3 Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT required_role = ANY(public.get_user_roles());
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 2.4 Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT public.get_user_roles() && required_roles;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 2.5 Super Admin check (Test environment ONLY)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admin_bootstrap
    WHERE auth_id = auth.uid()
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ============================================
-- SECTION 3: SEED ROLE REFERENCE DATA
-- 9 Independent Roles (No Hierarchy)
-- ============================================

INSERT INTO public.app_role (code, name, description) VALUES
  ('chair_rvm', 'Chair of the Council of Ministers', 
   'Final approval authority for RVM decisions'),
  ('secretary_rvm', 'Secretary RVM', 
   'Procedural and reporting authority'),
  ('deputy_secretary', 'Deputy Secretary / Coordinator', 
   'Operational coordination'),
  ('admin_intake', 'Administration – Intake', 
   'Registration of incoming items'),
  ('admin_dossier', 'Administration – Dossier Management', 
   'Dossier preparation & tracking'),
  ('admin_agenda', 'Administration – Agenda & Convocation', 
   'Agenda preparation'),
  ('admin_reporting', 'Administration – Decision Lists & Reports', 
   'Decision lists and reporting'),
  ('audit_readonly', 'Audit', 
   'Read-only access for control bodies'),
  ('rvm_sys_admin', 'System Administrator', 
   'Technical administration (no decision authority)');

-- ============================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_bootstrap ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 5: RLS POLICIES
-- ============================================

-- 5.1 app_user policies
CREATE POLICY app_user_select ON public.app_user
  FOR SELECT TO authenticated
  USING (
    auth_id = auth.uid() 
    OR public.has_any_role(ARRAY['secretary_rvm', 'deputy_secretary', 'rvm_sys_admin'])
    OR public.is_super_admin()
  );

-- 5.2 app_role policies (roles are public reference data)
CREATE POLICY app_role_select ON public.app_role
  FOR SELECT TO authenticated
  USING (true);

-- 5.3 user_role policies
CREATE POLICY user_role_select ON public.user_role
  FOR SELECT TO authenticated
  USING (
    user_id = public.get_current_user_id()
    OR public.has_any_role(ARRAY['secretary_rvm', 'rvm_sys_admin'])
    OR public.is_super_admin()
  );

-- 5.4 super_admin_bootstrap policies (sys_admin only)
CREATE POLICY super_admin_select ON public.super_admin_bootstrap
  FOR SELECT TO authenticated
  USING (
    auth_id = auth.uid() 
    OR public.has_role('rvm_sys_admin')
  );

-- ============================================
-- SECTION 6: INDEXES
-- ============================================

CREATE INDEX idx_app_user_auth_id ON public.app_user(auth_id);
CREATE INDEX idx_app_user_email ON public.app_user(email);
CREATE INDEX idx_app_user_active ON public.app_user(is_active) WHERE is_active = true;
CREATE INDEX idx_user_role_user ON public.user_role(user_id);
CREATE INDEX idx_user_role_code ON public.user_role(role_code);
CREATE INDEX idx_super_admin_auth ON public.super_admin_bootstrap(auth_id);

-- ============================================
-- SECTION 7: UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_app_user_updated_at
  BEFORE UPDATE ON public.app_user
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();