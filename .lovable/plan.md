# Phase 15 — Role-Specific Dashboards: Implementation Plan

## Current State

- **Route**: `/dashboards` renders a generic `DashboardPage` with 6 StatCards (totals/counts) and 2 donut charts (dossier + task status).
- **Role detection**: `useUserRoles()` hook provides `hasRole()`, `hasAnyRole()`, `isSuperAdmin`, and all permission flags.
- **Existing components**: `StatCard`, `DossierStatusChart`, `TaskStatusChart` — reusable.
- **Service**: `dashboardService.fetchStats()` returns aggregate counts via parallel Supabase queries.

## Architecture

The existing `/dashboards` route and page remain. The `DashboardPage` component will detect the user's primary role and render the appropriate dashboard variant. No new routes needed.

```text
DashboardPage
  ├── role = chair_rvm      → <ChairDashboard />
  ├── role = secretary_rvm   → <SecretaryDashboard />
  └── else                   → <AnalystDashboard />
```

Super admins see the Chair dashboard (highest privilege view).

## Part 1 — Dashboard Service Extensions

**File:** `src/services/dashboardService.ts`

Add 3 new fetch methods (all use existing tables, no schema changes):

`**fetchChairStats()**` — parallel queries:

- Decisions with `decision_status = 'pending'` and `is_final = false` (awaiting approval) — return full rows with agenda item + meeting join
- Meetings with `status IN ('published')` and `meeting_date >= today` (pending meetings)
- Decisions with `is_final = true` ordered by `updated_at` desc, limit 5 (recently finalized)
- Count of meetings with `status = 'published'` (governance alert: meetings awaiting closure)

`**fetchSecretaryStats()**` — parallel queries:

- Meetings with `meeting_date >= today` ordered by date asc (upcoming)
- Agenda items with `status = 'scheduled'` (needing preparation) — join meeting + dossier
- Decisions with `decision_status = 'approved'` and `is_final = false` (awaiting documentation/finalization)
- Documents count (total documents for context)

`**fetchAnalystStats()**` — parallel queries:

- Dossiers with `status IN ('registered', 'in_preparation')` (in analysis)
- Agenda items with `status = 'scheduled'` (agenda drafts) — limit 10
- Tasks with `status IN ('todo', 'in_progress')` (assigned tasks)
- Decisions with `is_final = true`, limit 5 (recent decision follow-ups)

## Part 2 — React Query Hooks

**File:** `src/hooks/useDashboardStats.ts`

Add 3 hooks alongside the existing one:

- `useChairDashboard()` — queryKey `['dashboard-chair']`, calls `fetchChairStats()`
- `useSecretaryDashboard()` — queryKey `['dashboard-secretary']`, calls `fetchSecretaryStats()`
- `useAnalystDashboard()` — queryKey `['dashboard-analyst']`, calls `fetchAnalystStats()`

All with 5-minute staleTime.

## Part 3 — Dashboard Components

### 3a. ChairDashboard

**New file:** `src/app/(admin)/dashboards/components/ChairDashboard.tsx`

Widgets (using `Card`, `Table`, `Badge` from react-bootstrap):

1. **Decisions Awaiting Approval** — Table: agenda #, decision text (truncated), meeting date, status badge. Links to meeting detail.
2. **Upcoming Meetings** — List: date, type, location, status badge. Links to meeting detail.
3. **Recently Finalized Decisions** — Table: decision text, meeting, finalized date.
4. **Governance Alerts** — StatCard showing count of meetings pending closure + decisions pending approval.

### 3b. SecretaryDashboard

**New file:** `src/app/(admin)/dashboards/components/SecretaryDashboard.tsx`

Widgets:

1. **Upcoming Meetings** — Table: date, type, location, agenda item count.
2. **Agenda Items Needing Preparation** — Table: agenda #, dossier title, meeting date.
3. **Decisions Awaiting Documentation** — Table: decision text, status, meeting ref.
4. **KPI Row** — StatCards: upcoming meetings count, pending agenda items, pending decisions.

### 3c. AnalystDashboard

**New file:** `src/app/(admin)/dashboards/components/AnalystDashboard.tsx`

Widgets:

1. **Dossiers In Analysis** — Table: dossier number, title, status, ministry.
2. **Assigned Tasks** — Table: title, priority, status, due date.
3. **Agenda Drafts** — Table: agenda #, dossier, meeting date.
4. **KPI Row** — StatCards: active dossiers, pending tasks, scheduled agenda items.

## Part 4 — Role-Based Rendering

**File:** `src/app/(admin)/dashboards/page.tsx`

Replace the current static layout with role detection:

```
const { hasRole, isSuperAdmin } = useUserRoles()

if (isSuperAdmin || hasRole('chair_rvm'))
  → <ChairDashboard />
else if (hasRole('secretary_rvm'))
  → <SecretaryDashboard />
else
  → <AnalystDashboard />
```

Each sub-dashboard handles its own loading/error states internally.

## Files to Create

1. `src/app/(admin)/dashboards/components/ChairDashboard.tsx`
2. `src/app/(admin)/dashboards/components/SecretaryDashboard.tsx`
3. `src/app/(admin)/dashboards/components/AnalystDashboard.tsx`
4. `Project Restore Points/RP-P15-role-dashboards-pre.md`
5. `Project Restore Points/RP-P15-role-dashboards-post.md`

## Files to Modify

1. `src/app/(admin)/dashboards/page.tsx` — Role-based rendering
2. `src/services/dashboardService.ts` — 3 new fetch methods
3. `src/hooks/useDashboardStats.ts` — 3 new hooks
4. `docs/backend.md` — Phase 15 entry
5. `docs/architecture.md` — Phase 15 entry

## Governance Note (Devmart):

Dashboard queries must enforce a result limit

for all table-based widgets.

Maximum rows per widget:

ChairDashboard tables: 10

SecretaryDashboard tables: 10

AnalystDashboard tables: 10

This prevents heavy dashboard queries

and maintains UI performance.

Full datasets must remain accessible

through the dedicated modules

(meetings, dossiers, tasks, decisions).  
  
**Governance**

- Zero schema changes
- Zero RLS changes
- Zero new routes (uses existing `/dashboards`)
- Zero sidebar changes
- Zero new dependencies
- All data queries respect existing RLS policies (RLS filters results per role automatically)