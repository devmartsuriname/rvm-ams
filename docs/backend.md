# AMS-RVM Backend Status

**Last Updated:** 2026-03-05 (Phase 16)

---

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation Layer (Auth/Identity) | CLOSED |
| 2 | Core Domain (Schema/RLS) | CLOSED |
| 3 | Workflow Engine (Triggers/Transitions) | CLOSED |
| 4 | Agenda Management (Data Layer) | CLOSED |
| 5 | Decision Management (Data Layer) | CLOSED |
| 6 | DMS-Light (Schema Only) | CLOSED |
| 7 | Reporting & Dashboards | CLOSED |
| 8 | Audit Finalization | CLOSED |
| 9 | UI Stability & Consistency Hardening | CLOSED |
| 9B | Modal XL Standardization | CLOSED |
| 9C | UI Micro Polish (Darkone Alignment) | CLOSED |
| 10A | Decision Status Hardening (Backend) | CLOSED |
| 10B | Navigation Structure Correction | CLOSED |
| 10C | Decision Finalization Hard Lock Verification | CLOSED |
| 10D | Chair Gate Formalization Layer (UI Visibility) | CLOSED |
| 11 | Illegal Attempt Logging Hardening | CLOSED |
| 12 | DMS-Light UI — Document storage + versioning + confidentiality UI | CLOSED |
| 13 | Agenda Item Management UI — Meeting tabs, agenda CRUD, decision linking | CLOSED |
| 16 | RETURN NULL Pattern Unification + UX Exception Handling | CLOSED |

## Database Architecture

### Domain Tables
- `rvm_dossier` — Dossier lifecycle management
- `rvm_item` — Linked missive/proposal items
- `rvm_meeting` — Meeting scheduling and status
- `rvm_agenda_item` — Meeting agenda entries
- `rvm_decision` — Decision records with Chair RVM gate
- `rvm_task` — Task assignment and tracking
- `rvm_document` / `rvm_document_version` — Document metadata and versioning

### System Tables
- `app_user` — User identity (linked to auth.users)
- `app_role` / `user_role` — RBAC role assignment
- `audit_event` — Immutable audit trail
- `status_transitions` — Valid state machine transitions
- `missive_keyword` — Reference data
- `super_admin_bootstrap` — Bootstrap admin access

### Enforcement Layer
- 20 database triggers across 8 domain tables
- `validate_status_transition()` — State machine enforcement
- `log_audit_event()` — Automatic audit trail (INSERT/UPDATE/DELETE)
- `is_dossier_editable()` / `is_meeting_editable()` — Immutability guards
- Chair RVM approval gate on decision finalization
- DELETE blocked by triggers for all domain tables
- RLS policies enforce role-based access on all tables

## Phase 8 Closure Notes

- All CRUD write flows operational (Create, Read, Update)
- DELETE explicitly out-of-scope per PRD
- Audit engine captures all mutations automatically
- Status transitions enforced at database level
- Immutability gates prevent edits on finalized entities

## Phase 11 — Illegal Attempt Logging (CLOSED)

- Table `rvm_illegal_attempt_log` created for forensic logging of blocked mutations
- Function `log_illegal_attempt()` (SECURITY DEFINER) integrated into 5 enforcement triggers
- **Architecture:** RETURN NULL pattern — triggers insert log then return NULL (blocks mutation without exception, log persists)
- dblink removed (not functional on managed Supabase); replaced with direct INSERT + RETURN NULL
- Service layer updated with `handleGuardedUpdate()` to detect silent rejections and fetch violation reasons
- `get_latest_violation()` RPC provides violation reason lookup
- Enforcement is 100% intact, logging is FULLY WORKING
- **Verified:** 2 blocked mutations produced 2 persistent log entries with full payload

### Accepted Limitation (Phase 11)

- **Silent rejection semantics:** Enforcement uses RETURN NULL instead of RAISE EXCEPTION. Clients observe "0 rows affected" on blocked mutations rather than an exception.
- This is an **intentional governance trade-off** to ensure persistent forensic logging on managed Supabase (where autonomous transactions via dblink are not available).
- Enforcement remains at the database level; logging persists reliably in all cases.
- The application service layer uses `handleGuardedUpdate()` + `get_latest_violation()` RPC to surface violation reasons to users.
- **Future enhancement (optional, deferred):** Unify user-facing error semantics via standardized service-layer wrappers for all guarded entities.

## Phase 12 — DMS-Light UI (CLOSED)

### Document Storage Architecture

- **Storage Bucket:** `rvm-documents` (private, created via migration)
- **Tables used:** `rvm_document` (metadata) + `rvm_document_version` (version records) — both pre-existing from Phase 6
- **No schema changes** — Phase 12 is UI + service layer only

### Versioning Model

- Each document has multiple versions in `rvm_document_version`
- `version_number` is incremented by fetching `MAX(version_number) + 1`
- `rvm_document.current_version_id` points to the latest version (updated on each upload)
- Version history is preserved — prior versions remain queryable and downloadable

### Upload Flow

1. Insert document metadata into `rvm_document` (title, doc_type, confidentiality_level, dossier_id)
2. Upload file to `rvm-documents` storage bucket (path: `{dossierId}/{documentId}/{timestamp}_{filename}`)
3. Insert version record into `rvm_document_version` (file_name, file_size, mime_type, storage_path, version_number=1)
4. Update `rvm_document.current_version_id` to point to new version record

### New Version Upload Flow

1. Fetch max version_number for the document
2. Upload file to storage bucket
3. Insert new version record with incremented version_number
4. Update `current_version_id` on `rvm_document`

### Role Permissions (Storage)

| Action | Allowed Roles |
|--------|--------------|
| INSERT (upload) | secretary_rvm, admin_dossier, admin_reporting |
| SELECT (download) | chair_rvm, secretary_rvm, deputy_secretary, admin_intake, admin_dossier, admin_agenda, admin_reporting, audit_readonly |
| UPDATE | Not allowed |
| DELETE | Not allowed |

### Governance Constraints

- No schema changes to `rvm_document` or `rvm_document_version` tables
- No changes to existing RLS policies on document tables
- No trigger modifications
- Storage bucket RLS policies align with document table SELECT/INSERT roles
- UI role-gating (`canUploadDocument`) mirrors storage INSERT permissions
