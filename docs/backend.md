# AMS-RVM Backend Status

**Last Updated:** 2026-02-26

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
