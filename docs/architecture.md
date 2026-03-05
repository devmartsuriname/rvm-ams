# AMS-RVM System Architecture

**Last Updated:** 2026-02-26

---

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
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
- Role-based permission checks (`has_role()`, `has_any_role()`)
- Immutability enforcement at database level
- Audit trail is append-only (no UPDATE/DELETE on audit_event)
- DELETE blocked on all domain tables

## Phase Completion Status

All 9 phases + Phase 9B + Phase 9C CLOSED as of 2026-02-26. Phase 10A–10D CLOSED. Phase 11 (Illegal Attempt Logging Hardening) CLOSED. Phase 12 (DMS-Light UI) CLOSED. Phase 13 (Agenda Item Management UI) CLOSED — meeting detail tabs, agenda CRUD, decision linking, role-gated editing. **Accepted limitation:** silent rejection semantics (RETURN NULL, not RAISE EXCEPTION) — intentional trade-off for persistent logging on managed Supabase.

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
