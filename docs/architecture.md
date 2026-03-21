# AMS-RVM System Architecture

**Last Updated:** 2026-03-21 (Phase 23 Complete — Final QA & Production Readiness)

---

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Phase 15:** Role-specific dashboards (Chair/Secretary/Analyst) with role-based rendering via `useUserRoles()` hook. No new routes — existing `/dashboards` conditionally renders the appropriate dashboard variant.
- **Phase 17:** Global search & advanced filtering. Topbar search wired to `searchGovernanceEntities()` with dropdown results. Dedicated `/search` page with filter panel. All queries RLS-governed, parallel execution, max 10 results per entity. **Remediation:** Decision date range filter (`created_at` server-side) and Agenda meeting reference filter (`meeting_id`) added.
- **UI Framework:** Bootstrap 5 + React-Bootstrap (DarkOne Admin theme)
- **State:** TanStack React Query (server state) + React Context (auth/layout)
- **Backend:** Supabase (Lovable Cloud) — PostgreSQL + RLS + Edge Functions
- **Auth:** Supabase Auth with RBAC via `user_role` junction table

## Architecture Layers

### Frontend
```
src/
├── app/(admin)/rvm/       # Domain pages (dossiers, meetings, decisions, tasks, audit)
├── app/(admin)/dashboards/ # KPI dashboard
├── components/rvm/         # Domain components (modals, forms, status actions)
├── hooks/                  # Data hooks (useDossiers, useMeetings, etc.)
├── services/               # Supabase service layer (CRUD operations)
├── context/                # Auth, Layout, Notification contexts
├── layouts/                # AdminLayout, AuthLayout
└── routes/                 # Route definitions + auth guard
```

### Backend (Supabase)
```
Database:
├── Domain Tables (7)      # rvm_dossier, rvm_meeting, rvm_task, etc.
├── System Tables (5)      # app_user, app_role, audit_event, etc.
├── Triggers (20)          # Status validation, audit logging, immutability
├── Functions (11)         # Role checks, status validation, user directory
└── RLS Policies           # Role-based access on all tables
```

## Security Model

- Row Level Security on all tables
- All INSERT/UPDATE policies are PERMISSIVE (Phase 23B fix: converted from RESTRICTIVE — PostgreSQL requires at least one PERMISSIVE policy to grant access)
- SELECT policies are PERMISSIVE with role-based conditions
- Role-based permission checks (`has_role()`, `has_any_role()`)
- Immutability enforcement at database level
- Audit trail is append-only (no UPDATE/DELETE on audit_event)
- DELETE blocked on all domain tables

## Phase Completion Status

All 9 phases + Phase 9B + Phase 9C CLOSED as of 2026-02-26. Phase 10A–10D CLOSED. Phase 11 (Illegal Attempt Logging Hardening) CLOSED. Phase 12 (DMS-Light UI) CLOSED. Phase 13 (Agenda Item Management UI) CLOSED. Phase 16 (RETURN NULL Pattern Unification + UX Exception Handling) CLOSED. Phase 14 (Decision List & Report Generation) CLOSED. Phase 15 (Role-Specific Dashboards) CLOSED. Phase 17 (Advanced Search & Filtering) CLOSED including 17R remediation. Phase 18 (Final System Completion QA) CLOSED — validation-only phase, no functional code changes. Phase 19 (Code Health) CLOSED — 19C: Auth logout UX fix + duplicate component removal; 19A: 18 orphan files deleted; 19B: dead exports removed from 5 files. **Phase 20 (Test Data Seeder) CLOSED** — Supabase Edge Function `seed-rvm-workflow-data` deployed. Creates 5 auth users, 6 dossiers, 5 meetings, 23 agenda items, 12 decisions, 10 tasks. Idempotent with `?force=true` re-seed support. See `docs/Phase-20-Seeder-Guide.md` (execution guide) and `docs/Phase-20-Seed-Data-Report.md` (data inventory).

## Implemented Modules

| Module | Create | Edit | Status Transitions | Role Gated |
|--------|--------|------|--------------------|------------|
| Dossiers | ✅ | ✅ | ✅ | ✅ |
| Meetings | ✅ | ✅ | ✅ | ✅ |
| Tasks | ✅ | ✅ | ✅ | ✅ |
| Audit Log | N/A | N/A | N/A | ✅ (read-only) |
| Dashboard | N/A | N/A | N/A | ✅ |
| Decisions | ✅ | ✅ | ✅ | ✅ |
| Agenda Items | ✅ | ✅ | N/A | ✅ |
| Documents | ✅ | ✅ | N/A | ✅ |

## Agenda Item Management UI (Phase 13)

### Entity Relationships

- **Meeting → Agenda Items:** one-to-many — each agenda item belongs to exactly one meeting (`meeting_id` NOT NULL)
- **Agenda Item → Dossier:** mandatory (`dossier_id` NOT NULL) — each agenda item references a dossier
- **Agenda Item → Decision:** one-to-one optional — a decision may be linked via `agenda_item_id`

### Status Lifecycle

- Four states: `scheduled`, `presented`, `withdrawn`, `moved`
- Status transitions governed by backend triggers (not editable via UI form)

### Role-Based Editing Permissions

- **Edit roles:** `secretary_rvm`, `admin_agenda`
- **Read-only roles:** `chair_rvm`, `audit_readonly`, `admin_reporting`
- Controls hidden when meeting status is `closed`

### UI Integration

- Meeting detail page uses tab navigation: Overview | Agenda Items | Decisions
- Agenda items tab is the operational workspace for meeting preparation
- Agenda items sorted by `agenda_number` ascending
- All queries scoped by `meeting_id` — no broad fetches

---

## DMS-Light Document Management (Phase 12)

### Entity Relationships

- **Document → Dossier:** mandatory (`dossier_id` NOT NULL) — every document belongs to exactly one dossier
- **Document → Decision:** optional (`decision_id`) — links document to a decision record
- **Document → Agenda Item:** optional (`agenda_item_id`) — links document to an agenda item
- **Document → Versions:** one-to-many — `rvm_document_version` records linked by `document_id`
- **Document → Current Version:** `current_version_id` FK to latest `rvm_document_version`

### Versioning Model

- Append-only: new versions are inserted, never overwritten
- Version numbering: sequential integers starting at 1
- `current_version_id` on `rvm_document` always points to the latest version
- All prior versions remain accessible for download and audit

### Confidentiality Handling

- Three levels: `standard_confidential`, `restricted`, `highly_restricted`
- Displayed as colored badges in document list and version modal
- **No client-side filtering** — RLS is the sole enforcement mechanism for access control

### Storage Architecture

- **Bucket:** `rvm-documents` (private)
- **Path pattern:** `{dossierId}/{documentId}/{timestamp}_{filename}`
- **Access:** Signed URLs generated server-side for downloads (60-second expiry)
- **No public access** — all reads go through Supabase storage RLS

### Meeting Lifecycle Clarification (Phase 22)

The meeting status model is: `draft → published → closed`. The `in_session` state is **not part of the current data model**. The RVM workflow treats meeting progression as an administrative status change, not a real-time session tracker.

### Phase 22 — Workflow Simulation

Full governance lifecycle validated via database state analysis and code-level verification. All 5 scenarios passed:
- Scenario 1 (Happy Path): Secretary → Meeting → Agenda → Decision → Chair Approve → Finalize → Dossier cascade ✅
- Scenario 2 (Invalid Transitions): Finalized decision lock, closed meeting immutability, decided dossier RLS block ✅
- Scenario 3 (Role Violations): Observer read-only, admin_agenda no decision approval, admin_dossier no meeting creation ✅
- Scenario 4 (Task Flow): Creation, assignment, status transitions (todo→in_progress→done) ✅
- Scenario 5 (Document Flow): Code-verified upload, versioning, signed URL download, decision lock ✅

See [Phase 22 Workflow Simulation Report](Phase-22-Workflow-Simulation-Report.md) for full details.

### Phase 23 — Final QA & Production Readiness Audit

Full system QA completed: 7 routes verified (no console/network errors), data integrity validated (0 orphans, 0 duplicates), document storage architecture code-verified, RLS/RBAC confirmed across all domain tables, UX stability verified (isPending guards, loading/error states). Documents module confirmed as dossier-scoped by design (no standalone route). Production readiness: GREEN for core workflows, YELLOW for bundle health (~18 unused deps).

See [Phase 23 Final QA Report](Phase-23-Final-QA-Report.md) for full details.
