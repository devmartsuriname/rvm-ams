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
├── app/(admin)/rvm/       # Domain pages (dossiers, meetings, tasks, audit)
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

All 9 phases CLOSED as of 2026-02-26. See `docs/Phase-9-UI-Stability-Report.md` for Phase 9 details.

## Implemented Modules

| Module | Create | Edit | Status Transitions | Role Gated |
|--------|--------|------|--------------------|------------|
| Dossiers | ✅ | ✅ | ✅ | ✅ |
| Meetings | ✅ | ✅ | ✅ | ✅ |
| Tasks | ✅ | ✅ | ✅ | ✅ |
| Audit Log | N/A | N/A | N/A | ✅ (read-only) |
| Dashboard | N/A | N/A | N/A | ✅ |
| Decisions | — | — | — | Deferred |
| Agenda Items | — | — | — | Deferred |
| Documents | — | — | — | Deferred |
