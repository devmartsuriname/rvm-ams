# ERD (Entity–Relationship Design)
## AMS – RVM Core (v1)

---

## 1. Purpose
This document defines the **logical data model (ERD)** for **AMS – RVM Core (v1)**.

It is designed to support:
- RVM-only workflows (Council Proposals + Missives)
- Decision capture per agenda item
- DMS-light (documents + versions)
- Task assignment and SLA tracking
- Auditability and immutable decision history
- Security-first (RLS-ready)

---

## 2. Core Concepts (Domain Summary)

- **Dossier** = the primary case file for an RVM matter.
- **Item** = the typed RVM content inside a dossier (Proposal or Missive).
- **Agenda** = a meeting instance; **Agenda Item** binds dossiers to that meeting.
- **Decision** = recorded outcome per agenda item (requires Chair RVM action).
- **Document** = files attached to dossiers/items/decisions (DMS-light).
- **Task** = assigned work unit tied to workflow steps.
- **Audit Event** = immutable logging of state changes and actions.

---

## 3. Entity List (Tables)

### 3.1 Identity & Access

#### `app_user`
- `id` (PK, UUID)
- `email` (unique)
- `full_name`
- `is_active` (bool)
- `created_at`
- `updated_at`

#### `app_role`
> Custom RVM roles only.
- `code` (PK, text) — e.g. `chair_rvm`, `secretary_rvm`, `deputy_secretary`, `admin_intake`, `admin_dossier`, `admin_agenda`, `admin_reporting`, `audit_readonly`, `rvm_sys_admin`
- `name`
- `description`

#### `user_role`
- `user_id` (FK → `app_user.id`)
- `role_code` (FK → `app_role.code`)
- `assigned_at`
- (PK: `user_id`, `role_code`)

---

### 3.2 Dossier & RVM Items

#### `rvm_dossier`
- `id` (PK, UUID)
- `dossier_number` (unique, text)
- `title` (text)
- `summary` (text)
- `service_type` (enum) — `proposal`, `missive`
- `proposal_subtype` (nullable enum) — `OPA`, `ORAG`
- `missive_keyword_id` (nullable FK → `missive_keyword.id`)
- `sender_ministry` (text)
- `urgency` (enum) — `regular`, `urgent`, `special`
- `status` (enum) — `draft`, `registered`, `in_preparation`, `scheduled`, `decided`, `archived`, `cancelled`
- `confidentiality_level` (enum) — `standard_confidential`, `restricted`, `highly_restricted`
- `created_by` (FK → `app_user.id`)
- `created_at`
- `updated_at`

#### `rvm_item`
> Normalizes item-specific fields while keeping one dossier as the anchor.
- `id` (PK, UUID)
- `dossier_id` (FK → `rvm_dossier.id`, unique)
- `item_type` (enum) — `proposal`, `missive`
- `reference_code` (text) — internal reference if applicable
- `description` (text)
- `received_date` (date)
- `attachments_expected` (bool)
- `created_at`

---

### 3.3 Agenda & Meeting

#### `rvm_meeting`
- `id` (PK, UUID)
- `meeting_date` (date)
- `meeting_type` (enum) — `regular`, `urgent`, `special`
- `location` (text, nullable)
- `status` (enum) — `draft`, `published`, `closed`
- `created_by` (FK → `app_user.id`)
- `created_at`

#### `rvm_agenda_item`
- `id` (PK, UUID)
- `meeting_id` (FK → `rvm_meeting.id`)
- `dossier_id` (FK → `rvm_dossier.id`)
- `agenda_number` (int) — order in agenda
- `title_override` (text, nullable)
- `status` (enum) — `scheduled`, `presented`, `withdrawn`, `moved`
- `notes` (text, nullable)
- `created_at`

Constraint:
- Unique (`meeting_id`, `agenda_number`)
- A dossier may appear in multiple meetings over time, but decision records are per agenda item.

---

### 3.4 Decisions

#### `rvm_decision`
> Decision is bound to a **single agenda item**.
- `id` (PK, UUID)
- `agenda_item_id` (FK → `rvm_agenda_item.id`, unique)
- `decision_status` (enum) — `approved`, `deferred`, `rejected`, `pending`
- `decision_text` (text)
- `chair_approved_at` (timestamp, nullable)
- `chair_approved_by` (FK → `app_user.id`, nullable) — must be Chair RVM
- `is_final` (bool) — when true, becomes immutable
- `created_at`
- `updated_at`

Hard rule support:
- No dossier can transition to “decided/archived” without a decision with `chair_approved_at`.

---

### 3.5 DMS-Light (Documents)

#### `rvm_document`
- `id` (PK, UUID)
- `dossier_id` (FK → `rvm_dossier.id`)
- `agenda_item_id` (nullable FK → `rvm_agenda_item.id`)
- `decision_id` (nullable FK → `rvm_decision.id`)
- `doc_type` (enum) — `proposal`, `missive`, `attachment`, `decision_list`, `minutes`, `other`
- `title` (text)
- `confidentiality_level` (enum) — same as dossier
- `current_version_id` (nullable FK → `rvm_document_version.id`)
- `created_by` (FK → `app_user.id`)
- `created_at`

#### `rvm_document_version`
- `id` (PK, UUID)
- `document_id` (FK → `rvm_document.id`)
- `version_number` (int)
- `storage_path` (text) — reference to object storage
- `file_name` (text)
- `mime_type` (text)
- `file_size` (bigint)
- `checksum` (text, nullable)
- `uploaded_by` (FK → `app_user.id`)
- `uploaded_at` (timestamp)

Constraint:
- Unique (`document_id`, `version_number`)

---

### 3.6 Tasks & SLA Tracking

#### `rvm_task`
- `id` (PK, UUID)
- `dossier_id` (FK → `rvm_dossier.id`)
- `task_type` (enum) — `intake`, `dossier_management`, `agenda_prep`, `reporting`, `review`, `distribution`, `other`
- `title` (text)
- `description` (text, nullable)
- `assigned_role_code` (FK → `app_role.code`)
- `assigned_user_id` (nullable FK → `app_user.id`)
- `status` (enum) — `todo`, `in_progress`, `blocked`, `done`, `cancelled`
- `priority` (enum) — `normal`, `high`, `urgent`
- `due_at` (timestamp, nullable)
- `started_at` (timestamp, nullable)
- `completed_at` (timestamp, nullable)
- `created_by` (FK → `app_user.id`)
- `created_at`
- `updated_at`

Rule support:
- Mandatory ownership enforcement can be implemented by requiring `assigned_role_code` at creation and/or requiring `assigned_user_id` before moving to `in_progress`.

---

### 3.7 Taxonomy (Missive Keywords)

#### `missive_keyword`
- `id` (PK, UUID)
- `code` (unique, text)
- `label` (text)
- `description` (text, nullable)
- `is_active` (bool)

---

### 3.8 Audit & Event Log

#### `audit_event`
- `id` (PK, UUID)
- `entity_type` (text) — e.g. `rvm_dossier`, `rvm_decision`, `rvm_document`, `rvm_task`
- `entity_id` (UUID)
- `event_type` (text) — e.g. `created`, `updated`, `status_changed`, `assigned`, `approved`
- `event_payload` (jsonb)
- `actor_user_id` (FK → `app_user.id`)
- `actor_role_code` (FK → `app_role.code`, nullable)
- `occurred_at` (timestamp)

Immutability:
- `audit_event` is append-only.

---

## 4. Relationship Map (Cardinality)

- `app_user` (1) — (M) `user_role` (M) — (1) `app_role`
- `rvm_dossier` (1) — (1) `rvm_item`
- `rvm_meeting` (1) — (M) `rvm_agenda_item`
- `rvm_dossier` (1) — (M) `rvm_agenda_item`
- `rvm_agenda_item` (1) — (0..1) `rvm_decision`
- `rvm_dossier` (1) — (M) `rvm_document`
- `rvm_document` (1) — (M) `rvm_document_version`
- `rvm_dossier` (1) — (M) `rvm_task`
- `missive_keyword` (1) — (M) `rvm_dossier` (optional link)
- `app_user` (1) — (M) `audit_event`

---

## 5. Enums (Recommended)

- `service_type`: `proposal`, `missive`
- `proposal_subtype`: `OPA`, `ORAG`
- `urgency`: `regular`, `urgent`, `special`
- `dossier_status`: `draft`, `registered`, `in_preparation`, `scheduled`, `decided`, `archived`, `cancelled`
- `meeting_type`: `regular`, `urgent`, `special`
- `meeting_status`: `draft`, `published`, `closed`
- `agenda_item_status`: `scheduled`, `presented`, `withdrawn`, `moved`
- `decision_status`: `approved`, `deferred`, `rejected`, `pending`
- `document_type`: `proposal`, `missive`, `attachment`, `decision_list`, `minutes`, `other`
- `task_status`: `todo`, `in_progress`, `blocked`, `done`, `cancelled`
- `task_priority`: `normal`, `high`, `urgent`
- `confidentiality_level`: `standard_confidential`, `restricted`, `highly_restricted`

---

## 6. Notes for RLS Design (Preview)

RLS will typically require:
- role-based access;
- dossier-based assignment checks;
- stage-based restrictions (e.g., decision immutability);
- audit read-only role.

RLS is documented in the next document: **RLS & Role Matrix – AMS RVM Core (v1)**.

---

**Status:** ERD v1 – Ready for RLS Matrix Design
**Next Document:** RLS & Role Matrix – AMS RVM Core (v1)

