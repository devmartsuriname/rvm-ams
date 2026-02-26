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

All 9 phases + Phase 9B + Phase 9C CLOSED as of 2026-02-26. Phase 10A (Decision Status Hardening — Backend) CLOSED. Phase 10B (Decision UI Implementation) CLOSED. Phase 10B Navigation Structure Correction CLOSED — standalone Decisions sidebar entry and list page added. See `docs/Phase-10-Planning-Decision-Chair-Gate.md`.

## Implemented Modules

| Module | Create | Edit | Status Transitions | Role Gated |
|--------|--------|------|--------------------|------------|
| Dossiers | ✅ | ✅ | ✅ | ✅ |
| Meetings | ✅ | ✅ | ✅ | ✅ |
| Tasks | ✅ | ✅ | ✅ | ✅ |
| Audit Log | N/A | N/A | N/A | ✅ (read-only) |
| Dashboard | N/A | N/A | N/A | ✅ |
| Decisions | ✅ | ✅ | ✅ | ✅ |
| Agenda Items | — | — | — | Deferred |
| Documents | — | — | — | Deferred |
