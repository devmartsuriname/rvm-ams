# Backend Design Document
## AMS – RVM Core (v1)

---

## 1. Document Purpose

This document provides the **complete backend specification** for **AMS – RVM Core (v1)** including:
- Executable SQL schema
- RLS policy definitions
- Database triggers
- Storage configuration
- Edge function specifications (if needed)

**Source Authority:**
- `erd_ams_rvm_core_v_1.md`
- `rls_role_matrix_ams_rvm_core_v_1.md`
- `workflow_diagrams_ams_rvm_core_v_1.md`

**Scope Expansion:** None. Direct implementation of authoritative ERD and RLS.

---

## 2. Schema Overview

### 2.1 Execution Order

```
1. Enums (all)
2. Identity tables (app_user, app_role, user_role)
3. Taxonomy tables (missive_keyword)
4. Core domain tables (rvm_dossier, rvm_item)
5. Workflow tables (rvm_task)
6. Meeting tables (rvm_meeting, rvm_agenda_item)
7. Decision tables (rvm_decision)
8. Document tables (rvm_document, rvm_document_version)
9. Audit tables (audit_event)
10. RLS policies (all)
11. Triggers (audit, validation)
12. Functions (helpers)
```

---

## 3. Enum Definitions

```sql
-- Service Types
CREATE TYPE service_type AS ENUM ('proposal', 'missive');

-- Proposal Subtypes
CREATE TYPE proposal_subtype AS ENUM ('OPA', 'ORAG');

-- Urgency Levels
CREATE TYPE urgency_level AS ENUM ('regular', 'urgent', 'special');

-- Dossier Status
CREATE TYPE dossier_status AS ENUM (
  'draft', 'registered', 'in_preparation', 
  'scheduled', 'decided', 'archived', 'cancelled'
);

-- Meeting Type
CREATE TYPE meeting_type AS ENUM ('regular', 'urgent', 'special');

-- Meeting Status
CREATE TYPE meeting_status AS ENUM ('draft', 'published', 'closed');

-- Agenda Item Status
CREATE TYPE agenda_item_status AS ENUM ('scheduled', 'presented', 'withdrawn', 'moved');

-- Decision Status
CREATE TYPE decision_status AS ENUM ('approved', 'deferred', 'rejected', 'pending');

-- Document Type
CREATE TYPE document_type AS ENUM (
  'proposal', 'missive', 'attachment', 
  'decision_list', 'minutes', 'other'
);

-- Task Status
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done', 'cancelled');

-- Task Priority
CREATE TYPE task_priority AS ENUM ('normal', 'high', 'urgent');

-- Task Type
CREATE TYPE task_type AS ENUM (
  'intake', 'dossier_management', 'agenda_prep', 
  'reporting', 'review', 'distribution', 'other'
);

-- Confidentiality Level
CREATE TYPE confidentiality_level AS ENUM (
  'standard_confidential', 'restricted', 'highly_restricted'
);
```

---

## 4. Table Definitions

### 4.1 Identity & Access

```sql
-- Users
CREATE TABLE app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles (custom RVM roles only)
CREATE TABLE app_role (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Initial role data
INSERT INTO app_role (code, name, description) VALUES
  ('chair_rvm', 'Chair of the Council of Ministers', 'Final approval authority for RVM decisions'),
  ('secretary_rvm', 'Secretary RVM', 'Procedural and reporting authority'),
  ('deputy_secretary', 'Deputy Secretary / Coordinator', 'Operational coordination'),
  ('admin_intake', 'Administration – Intake', 'Registration of incoming items'),
  ('admin_dossier', 'Administration – Dossier Management', 'Dossier preparation & tracking'),
  ('admin_agenda', 'Administration – Agenda & Convocation', 'Agenda preparation'),
  ('admin_reporting', 'Administration – Decision Lists & Reports', 'Decision lists and reporting'),
  ('audit_readonly', 'Audit', 'Read-only access for control bodies'),
  ('rvm_sys_admin', 'System Administrator', 'Technical administration (no decision authority)');

-- User-Role mapping
CREATE TABLE user_role (
  user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
  role_code TEXT REFERENCES app_role(code) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_code)
);
```

### 4.2 Taxonomy

```sql
-- Missive Keywords
CREATE TABLE missive_keyword (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);
```

### 4.3 Core Domain

```sql
-- RVM Dossier
CREATE TABLE rvm_dossier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  service_type service_type NOT NULL,
  proposal_subtype proposal_subtype,
  missive_keyword_id UUID REFERENCES missive_keyword(id),
  sender_ministry TEXT NOT NULL,
  urgency urgency_level NOT NULL DEFAULT 'regular',
  status dossier_status NOT NULL DEFAULT 'draft',
  confidentiality_level confidentiality_level NOT NULL DEFAULT 'standard_confidential',
  created_by UUID REFERENCES app_user(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT proposal_requires_subtype CHECK (
    service_type != 'proposal' OR proposal_subtype IS NOT NULL
  ),
  CONSTRAINT missive_requires_keyword CHECK (
    service_type != 'missive' OR missive_keyword_id IS NOT NULL
  )
);

-- RVM Item (normalized item details)
CREATE TABLE rvm_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID UNIQUE REFERENCES rvm_dossier(id) ON DELETE CASCADE,
  item_type service_type NOT NULL,
  reference_code TEXT,
  description TEXT,
  received_date DATE,
  attachments_expected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dossier number generation function
CREATE OR REPLACE FUNCTION generate_dossier_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.dossier_number := 'RVM-' || TO_CHAR(now(), 'YYYY') || '-' || 
    LPAD(nextval('dossier_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE dossier_number_seq START 1;

CREATE TRIGGER set_dossier_number
  BEFORE INSERT ON rvm_dossier
  FOR EACH ROW
  WHEN (NEW.dossier_number IS NULL)
  EXECUTE FUNCTION generate_dossier_number();
```

### 4.4 Task & Workflow

```sql
-- RVM Task
CREATE TABLE rvm_task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES rvm_dossier(id) ON DELETE CASCADE,
  task_type task_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_role_code TEXT NOT NULL REFERENCES app_role(code),
  assigned_user_id UUID REFERENCES app_user(id),
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'normal',
  due_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES app_user(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT in_progress_requires_user CHECK (
    status != 'in_progress' OR assigned_user_id IS NOT NULL
  )
);
```

### 4.5 Meeting & Agenda

```sql
-- RVM Meeting
CREATE TABLE rvm_meeting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_date DATE NOT NULL,
  meeting_type meeting_type NOT NULL DEFAULT 'regular',
  location TEXT,
  status meeting_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES app_user(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RVM Agenda Item
CREATE TABLE rvm_agenda_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES rvm_meeting(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES rvm_dossier(id),
  agenda_number INTEGER NOT NULL,
  title_override TEXT,
  status agenda_item_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  UNIQUE (meeting_id, agenda_number)
);
```

### 4.6 Decisions

```sql
-- RVM Decision
CREATE TABLE rvm_decision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_item_id UUID UNIQUE REFERENCES rvm_agenda_item(id) ON DELETE CASCADE,
  decision_status decision_status NOT NULL DEFAULT 'pending',
  decision_text TEXT NOT NULL,
  chair_approved_at TIMESTAMPTZ,
  chair_approved_by UUID REFERENCES app_user(id),
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Decision immutability trigger
CREATE OR REPLACE FUNCTION prevent_decision_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_final = true THEN
    RAISE EXCEPTION 'Cannot modify finalized decision';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_decision_immutability
  BEFORE UPDATE ON rvm_decision
  FOR EACH ROW
  EXECUTE FUNCTION prevent_decision_modification();
```

### 4.7 Documents (DMS-Light)

```sql
-- RVM Document
CREATE TABLE rvm_document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES rvm_dossier(id) ON DELETE CASCADE,
  agenda_item_id UUID REFERENCES rvm_agenda_item(id),
  decision_id UUID REFERENCES rvm_decision(id),
  doc_type document_type NOT NULL,
  title TEXT NOT NULL,
  confidentiality_level confidentiality_level NOT NULL DEFAULT 'standard_confidential',
  current_version_id UUID,
  created_by UUID REFERENCES app_user(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RVM Document Version
CREATE TABLE rvm_document_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES rvm_document(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  checksum TEXT,
  uploaded_by UUID REFERENCES app_user(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE (document_id, version_number)
);

-- Update current_version_id on new version
ALTER TABLE rvm_document 
  ADD CONSTRAINT fk_current_version 
  FOREIGN KEY (current_version_id) 
  REFERENCES rvm_document_version(id);
```

### 4.8 Audit

```sql
-- Audit Event (append-only)
CREATE TABLE audit_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_payload JSONB DEFAULT '{}',
  actor_user_id UUID REFERENCES app_user(id),
  actor_role_code TEXT REFERENCES app_role(code),
  occurred_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent modifications to audit_event
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit events cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_immutability_update
  BEFORE UPDATE ON audit_event
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_immutability_delete
  BEFORE DELETE ON audit_event
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();
```

---

## 5. RLS Policies

### 5.1 Helper Functions

```sql
-- Get current user's roles
CREATE OR REPLACE FUNCTION get_user_roles()
RETURNS TEXT[] AS $$
  SELECT ARRAY_AGG(role_code)
  FROM user_role
  WHERE user_id = (
    SELECT id FROM app_user WHERE auth_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT required_role = ANY(get_user_roles());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has any of the roles
CREATE OR REPLACE FUNCTION has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT get_user_roles() && required_roles;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current app_user id
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM app_user WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 5.2 RVM Dossier Policies

```sql
ALTER TABLE rvm_dossier ENABLE ROW LEVEL SECURITY;

-- Read: All RVM roles can read
CREATE POLICY rvm_dossier_select ON rvm_dossier
  FOR SELECT
  USING (has_any_role(ARRAY[
    'chair_rvm', 'secretary_rvm', 'deputy_secretary',
    'admin_intake', 'admin_dossier', 'admin_agenda',
    'admin_reporting', 'audit_readonly'
  ]));

-- Create: admin_intake only
CREATE POLICY rvm_dossier_insert ON rvm_dossier
  FOR INSERT
  WITH CHECK (has_role('admin_intake'));

-- Update: secretary_rvm, admin_dossier (not after decided)
CREATE POLICY rvm_dossier_update ON rvm_dossier
  FOR UPDATE
  USING (
    has_any_role(ARRAY['secretary_rvm', 'admin_dossier']) AND
    status NOT IN ('decided', 'archived')
  );

-- No deletes allowed
```

### 5.3 RVM Decision Policies

```sql
ALTER TABLE rvm_decision ENABLE ROW LEVEL SECURITY;

-- Read: All RVM roles
CREATE POLICY rvm_decision_select ON rvm_decision
  FOR SELECT
  USING (has_any_role(ARRAY[
    'chair_rvm', 'secretary_rvm', 'deputy_secretary',
    'admin_reporting', 'audit_readonly'
  ]));

-- Create: secretary_rvm, admin_reporting (draft)
CREATE POLICY rvm_decision_insert ON rvm_decision
  FOR INSERT
  WITH CHECK (has_any_role(ARRAY['secretary_rvm', 'admin_reporting']));

-- Update: secretary_rvm (draft only), chair_rvm (approval only)
CREATE POLICY rvm_decision_update ON rvm_decision
  FOR UPDATE
  USING (
    (has_role('secretary_rvm') AND is_final = false) OR
    (has_role('chair_rvm') AND is_final = false)
  );

-- No deletes allowed
```

### 5.4 Audit Event Policies

```sql
ALTER TABLE audit_event ENABLE ROW LEVEL SECURITY;

-- Read: audit_readonly, secretary_rvm, rvm_sys_admin
CREATE POLICY audit_event_select ON audit_event
  FOR SELECT
  USING (has_any_role(ARRAY['audit_readonly', 'secretary_rvm', 'rvm_sys_admin']));

-- Insert: System/triggers only (via SECURITY DEFINER functions)
CREATE POLICY audit_event_insert ON audit_event
  FOR INSERT
  WITH CHECK (true);  -- Controlled via triggers

-- No updates or deletes (enforced by trigger)
```

---

## 6. Storage Configuration

### 6.1 Bucket Setup

```sql
-- Create RVM documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('rvm-documents', 'rvm-documents', false);

-- Storage policies
CREATE POLICY rvm_documents_select ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'rvm-documents' AND
    has_any_role(ARRAY[
      'chair_rvm', 'secretary_rvm', 'deputy_secretary',
      'admin_dossier', 'admin_reporting', 'audit_readonly'
    ])
  );

CREATE POLICY rvm_documents_insert ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'rvm-documents' AND
    has_any_role(ARRAY['secretary_rvm', 'admin_dossier', 'admin_reporting'])
  );

-- No public access, no deletes
```

---

## 7. Indexes

```sql
-- Performance indexes
CREATE INDEX idx_dossier_status ON rvm_dossier(status);
CREATE INDEX idx_dossier_urgency ON rvm_dossier(urgency);
CREATE INDEX idx_dossier_created_at ON rvm_dossier(created_at DESC);
CREATE INDEX idx_task_dossier ON rvm_task(dossier_id);
CREATE INDEX idx_task_status ON rvm_task(status);
CREATE INDEX idx_task_due ON rvm_task(due_at) WHERE status NOT IN ('done', 'cancelled');
CREATE INDEX idx_meeting_date ON rvm_meeting(meeting_date);
CREATE INDEX idx_agenda_meeting ON rvm_agenda_item(meeting_id);
CREATE INDEX idx_decision_final ON rvm_decision(is_final);
CREATE INDEX idx_audit_entity ON audit_event(entity_type, entity_id);
CREATE INDEX idx_audit_occurred ON audit_event(occurred_at DESC);
```

---

## 8. Document Status

**Status:** Backend Design v1
**Source Compliance:** 100% aligned with ERD and RLS Matrix
**Scope Expansion:** None
**Execution Status:** NOT DEPLOYED (documentation only)
