-- ============================================
-- PHASE 2B: CORE DOMAIN DATA MODEL
-- AMS-RVM Core (v1)
-- Scope: Enums, Tables, Constraints, Baseline RLS, Indexes
-- NO governance triggers, NO role-based RLS matrices
-- ============================================

-- ============================================
-- PART 1: ENUM TYPES (12 enums)
-- ============================================

CREATE TYPE public.service_type AS ENUM ('proposal', 'missive');
CREATE TYPE public.proposal_subtype AS ENUM ('OPA', 'ORAG');
CREATE TYPE public.urgency_level AS ENUM ('regular', 'urgent', 'special');
CREATE TYPE public.dossier_status AS ENUM ('draft', 'registered', 'in_preparation', 'scheduled', 'decided', 'archived', 'cancelled');
CREATE TYPE public.meeting_type AS ENUM ('regular', 'urgent', 'special');
CREATE TYPE public.meeting_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE public.agenda_item_status AS ENUM ('scheduled', 'presented', 'withdrawn', 'moved');
CREATE TYPE public.decision_status AS ENUM ('approved', 'deferred', 'rejected', 'pending');
CREATE TYPE public.document_type AS ENUM ('proposal', 'missive', 'attachment', 'decision_list', 'minutes', 'other');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done', 'cancelled');
CREATE TYPE public.task_priority AS ENUM ('normal', 'high', 'urgent');
CREATE TYPE public.task_type AS ENUM ('intake', 'dossier_management', 'agenda_prep', 'reporting', 'review', 'distribution', 'other');
CREATE TYPE public.confidentiality_level AS ENUM ('standard_confidential', 'restricted', 'highly_restricted');

-- ============================================
-- PART 2: TAXONOMY TABLE
-- ============================================

CREATE TABLE public.missive_keyword (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PART 3: DOSSIER & ITEM TABLES
-- ============================================

-- Sequence for dossier numbering
CREATE SEQUENCE public.dossier_number_seq START 1;

CREATE TABLE public.rvm_dossier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  service_type public.service_type NOT NULL,
  proposal_subtype public.proposal_subtype,
  missive_keyword_id UUID REFERENCES public.missive_keyword(id),
  sender_ministry TEXT NOT NULL,
  urgency public.urgency_level DEFAULT 'regular',
  status public.dossier_status DEFAULT 'draft',
  confidentiality_level public.confidentiality_level DEFAULT 'standard_confidential',
  created_by UUID REFERENCES public.app_user(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Data integrity constraints
  CONSTRAINT proposal_requires_subtype CHECK (
    service_type != 'proposal' OR proposal_subtype IS NOT NULL
  ),
  CONSTRAINT missive_requires_keyword CHECK (
    service_type != 'missive' OR missive_keyword_id IS NOT NULL
  )
);

-- Trigger function for auto-generating dossier number
CREATE OR REPLACE FUNCTION public.generate_dossier_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.dossier_number IS NULL OR NEW.dossier_number = '' THEN
    NEW.dossier_number := 'RVM-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('dossier_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_dossier_number
  BEFORE INSERT ON public.rvm_dossier
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_dossier_number();

-- Updated_at trigger for dossier
CREATE TRIGGER update_rvm_dossier_updated_at
  BEFORE UPDATE ON public.rvm_dossier
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.rvm_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID UNIQUE NOT NULL REFERENCES public.rvm_dossier(id) ON DELETE CASCADE,
  item_type public.service_type NOT NULL,
  reference_code TEXT,
  description TEXT,
  received_date DATE,
  attachments_expected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PART 4: MEETING & AGENDA TABLES
-- ============================================

CREATE TABLE public.rvm_meeting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_date DATE NOT NULL,
  meeting_type public.meeting_type DEFAULT 'regular',
  location TEXT,
  status public.meeting_status DEFAULT 'draft',
  created_by UUID REFERENCES public.app_user(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.rvm_agenda_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.rvm_meeting(id) ON DELETE CASCADE,
  dossier_id UUID NOT NULL REFERENCES public.rvm_dossier(id),
  agenda_number INTEGER NOT NULL,
  title_override TEXT,
  status public.agenda_item_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_agenda_number_per_meeting UNIQUE (meeting_id, agenda_number)
);

-- ============================================
-- PART 5: DECISION TABLE
-- ============================================

CREATE TABLE public.rvm_decision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id UUID UNIQUE NOT NULL REFERENCES public.rvm_agenda_item(id) ON DELETE CASCADE,
  decision_status public.decision_status DEFAULT 'pending',
  decision_text TEXT NOT NULL,
  chair_approved_at TIMESTAMPTZ,
  chair_approved_by UUID REFERENCES public.app_user(id),
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Updated_at trigger for decision
CREATE TRIGGER update_rvm_decision_updated_at
  BEFORE UPDATE ON public.rvm_decision
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PART 6: DOCUMENT TABLES (DMS-Light)
-- ============================================

CREATE TABLE public.rvm_document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES public.rvm_dossier(id) ON DELETE CASCADE,
  agenda_item_id UUID REFERENCES public.rvm_agenda_item(id),
  decision_id UUID REFERENCES public.rvm_decision(id),
  doc_type public.document_type NOT NULL,
  title TEXT NOT NULL,
  confidentiality_level public.confidentiality_level DEFAULT 'standard_confidential',
  current_version_id UUID,
  created_by UUID REFERENCES public.app_user(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.rvm_document_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.rvm_document(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  checksum TEXT,
  uploaded_by UUID REFERENCES public.app_user(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_version_per_document UNIQUE (document_id, version_number)
);

-- Add FK for current_version_id after rvm_document_version exists
ALTER TABLE public.rvm_document 
  ADD CONSTRAINT fk_current_version 
  FOREIGN KEY (current_version_id) 
  REFERENCES public.rvm_document_version(id);

-- ============================================
-- PART 7: TASK TABLE
-- ============================================

CREATE TABLE public.rvm_task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES public.rvm_dossier(id) ON DELETE CASCADE,
  task_type public.task_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_role_code TEXT NOT NULL REFERENCES public.app_role(code),
  assigned_user_id UUID REFERENCES public.app_user(id),
  status public.task_status DEFAULT 'todo',
  priority public.task_priority DEFAULT 'normal',
  due_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.app_user(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Tasks in progress must have an assigned user
  CONSTRAINT in_progress_requires_user CHECK (
    status != 'in_progress' OR assigned_user_id IS NOT NULL
  )
);

-- Updated_at trigger for task
CREATE TRIGGER update_rvm_task_updated_at
  BEFORE UPDATE ON public.rvm_task
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PART 8: AUDIT TABLE
-- ============================================

CREATE TABLE public.audit_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_payload JSONB DEFAULT '{}'::jsonb,
  actor_user_id UUID REFERENCES public.app_user(id),
  actor_role_code TEXT REFERENCES public.app_role(code),
  occurred_at TIMESTAMPTZ DEFAULT now()
);

-- NOTE: Immutability triggers (prevent_audit_modification, prevent_audit_deletion)
-- are DEFERRED to Phase 8 (Audit Finalization) per scope correction

-- ============================================
-- PART 9: BASELINE RLS (Super-admin bypass only)
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE public.missive_keyword ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rvm_dossier ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rvm_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rvm_meeting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rvm_agenda_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rvm_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rvm_document ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rvm_document_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rvm_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_event ENABLE ROW LEVEL SECURITY;

-- Baseline RLS: missive_keyword (reference data - SELECT for all authenticated)
CREATE POLICY missive_keyword_baseline_select ON public.missive_keyword
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY missive_keyword_baseline_insert ON public.missive_keyword
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY missive_keyword_baseline_update ON public.missive_keyword
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Baseline RLS: rvm_dossier (super-admin only)
CREATE POLICY rvm_dossier_baseline_select ON public.rvm_dossier
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY rvm_dossier_baseline_insert ON public.rvm_dossier
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY rvm_dossier_baseline_update ON public.rvm_dossier
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Baseline RLS: rvm_item (super-admin only)
CREATE POLICY rvm_item_baseline_select ON public.rvm_item
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY rvm_item_baseline_insert ON public.rvm_item
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY rvm_item_baseline_update ON public.rvm_item
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Baseline RLS: rvm_meeting (super-admin only)
CREATE POLICY rvm_meeting_baseline_select ON public.rvm_meeting
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY rvm_meeting_baseline_insert ON public.rvm_meeting
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY rvm_meeting_baseline_update ON public.rvm_meeting
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Baseline RLS: rvm_agenda_item (super-admin only)
CREATE POLICY rvm_agenda_item_baseline_select ON public.rvm_agenda_item
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY rvm_agenda_item_baseline_insert ON public.rvm_agenda_item
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY rvm_agenda_item_baseline_update ON public.rvm_agenda_item
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Baseline RLS: rvm_decision (super-admin only)
CREATE POLICY rvm_decision_baseline_select ON public.rvm_decision
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY rvm_decision_baseline_insert ON public.rvm_decision
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY rvm_decision_baseline_update ON public.rvm_decision
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Baseline RLS: rvm_document (super-admin only)
CREATE POLICY rvm_document_baseline_select ON public.rvm_document
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY rvm_document_baseline_insert ON public.rvm_document
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY rvm_document_baseline_update ON public.rvm_document
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Baseline RLS: rvm_document_version (super-admin only)
CREATE POLICY rvm_document_version_baseline_select ON public.rvm_document_version
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY rvm_document_version_baseline_insert ON public.rvm_document_version
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

-- No UPDATE policy for versions (immutable by design)

-- Baseline RLS: rvm_task (super-admin only)
CREATE POLICY rvm_task_baseline_select ON public.rvm_task
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY rvm_task_baseline_insert ON public.rvm_task
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY rvm_task_baseline_update ON public.rvm_task
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Baseline RLS: audit_event (super-admin only, no UPDATE)
CREATE POLICY audit_event_baseline_select ON public.audit_event
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY audit_event_baseline_insert ON public.audit_event
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

-- No UPDATE/DELETE policies for audit_event (append-only pattern)

-- ============================================
-- PART 10: PERFORMANCE INDEXES
-- ============================================

-- Dossier indexes
CREATE INDEX idx_dossier_status ON public.rvm_dossier(status);
CREATE INDEX idx_dossier_urgency ON public.rvm_dossier(urgency);
CREATE INDEX idx_dossier_created_at ON public.rvm_dossier(created_at DESC);

-- Task indexes
CREATE INDEX idx_task_dossier ON public.rvm_task(dossier_id);
CREATE INDEX idx_task_status ON public.rvm_task(status);
CREATE INDEX idx_task_due ON public.rvm_task(due_at) WHERE status NOT IN ('done', 'cancelled');

-- Meeting indexes
CREATE INDEX idx_meeting_date ON public.rvm_meeting(meeting_date);
CREATE INDEX idx_agenda_meeting ON public.rvm_agenda_item(meeting_id);

-- Decision indexes
CREATE INDEX idx_decision_final ON public.rvm_decision(is_final);

-- Audit indexes
CREATE INDEX idx_audit_entity ON public.audit_event(entity_type, entity_id);
CREATE INDEX idx_audit_occurred ON public.audit_event(occurred_at DESC);

-- Document indexes
CREATE INDEX idx_document_dossier ON public.rvm_document(dossier_id);
CREATE INDEX idx_docversion_document ON public.rvm_document_version(document_id);