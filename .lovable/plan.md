
# Phase 7 — Reporting & Dashboards Implementation Plan

## Authorization Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 7 — Reporting & Dashboards
- **Date:** 2026-01-28
- **Mode:** STRICT (Darkone 1:1)
- **Prerequisite:** Phase 6 CLOSED and FROZEN ✅

---

## A) Governance & Scope Verification

| Check | Status | Notes |
|-------|--------|-------|
| Phase 6 formally CLOSED | ✅ | Closure artifact: `RP-P6-CLOSURE-20260128.md` |
| Scope limited to dashboards only | ✅ | No CRUD expansion |
| No new routes outside dashboard | ✅ | `/dashboards` only |
| No UI redesign | ✅ | Darkone 1:1 enforced |
| No new chart libraries | ✅ | ApexCharts only (existing) |

---

## B) Data Sources (Supabase — Source of Truth)

### Tables Used
| Metric Category | Table | Status Enum Reference |
|-----------------|-------|----------------------|
| Dossiers | `rvm_dossier` | `dossier_status`: draft, registered, in_preparation, scheduled, decided, archived, cancelled |
| Meetings | `rvm_meeting` | `meeting_status`: draft, published, closed |
| Tasks | `rvm_task` | `task_status`: todo, in_progress, blocked, done, cancelled |

### Current Database State
- All tables currently have 0 records
- Dashboard MUST render gracefully with zero data (empty state handling)

---

## C) Implementation Architecture

### New Files to Create

```text
src/services/dashboardService.ts          # Dashboard statistics queries
src/hooks/useDashboardStats.ts            # React Query hooks for stats
src/app/(admin)/dashboards/components/    # Dashboard components folder
  ├── StatCard.tsx                        # KPI card component
  ├── DossierStatusChart.tsx              # Dossier donut chart
  ├── TaskStatusChart.tsx                 # Task donut chart
  └── MeetingTimelineCard.tsx             # Upcoming meetings list
```

### File to Modify

```text
src/app/(admin)/dashboards/page.tsx       # Main dashboard page (replace placeholder)
```

---

## D) KPI Cards (Top Metrics)

### Card #1: Total Dossiers
```text
- Query: SELECT COUNT(*) FROM rvm_dossier
- Icon: bx:folder (Iconify/Boxicons)
- Label: "Total Dossiers"
- Value: Count or "0"
```

### Card #2: Active Dossiers
```text
- Query: SELECT COUNT(*) FROM rvm_dossier 
         WHERE status NOT IN ('decided', 'archived', 'cancelled')
- Icon: bx:folder-open
- Label: "Active Dossiers"
- Value: Count or "0"
```

### Card #3: Total Meetings
```text
- Query: SELECT COUNT(*) FROM rvm_meeting
- Icon: bx:calendar
- Label: "Total Meetings"
- Value: Count or "0"
```

### Card #4: Upcoming Meetings
```text
- Query: SELECT COUNT(*) FROM rvm_meeting 
         WHERE meeting_date >= CURRENT_DATE 
         AND status IN ('draft', 'published')
- Icon: bx:calendar-event
- Label: "Upcoming Meetings"
- Value: Count or "0"
```

### Card #5: Total Tasks
```text
- Query: SELECT COUNT(*) FROM rvm_task
- Icon: bx:task
- Label: "Total Tasks"
- Value: Count or "0"
```

### Card #6: Pending Tasks
```text
- Query: SELECT COUNT(*) FROM rvm_task 
         WHERE status IN ('todo', 'in_progress')
- Icon: bx:hourglass
- Label: "Pending Tasks"
- Value: Count or "0"
```

### StatCard Component Pattern (Darkone 1:1)
```tsx
// Following existing Darkone card pattern
<Card>
  <CardBody>
    <Row className="align-items-center">
      <Col xs={8}>
        <p className="text-muted mb-2 text-truncate">{label}</p>
        <h4 className="mb-0">{value}</h4>
      </Col>
      <Col xs={4} className="text-end">
        <IconifyIcon icon={icon} style={{ fontSize: '2.5rem' }} className="text-primary" />
      </Col>
    </Row>
  </CardBody>
</Card>
```

---

## E) Charts (ApexCharts — Darkone Pattern)

### Chart #1: Dossiers by Status (Donut)
```text
- Type: donut
- Data Source: COUNT(*) GROUP BY status FROM rvm_dossier
- Labels: Draft, Registered, In Preparation, Scheduled, Decided, Archived, Cancelled
- Colors: Existing Darkone palette ['#6658dd', '#1abc9c', '#4a81d4', '#f7b84b', '#00b19d', '#6c757d', '#f1556c']
- Empty State: Show "No data" message when 0 records
```

### Chart #2: Tasks by Status (Donut)
```text
- Type: donut
- Data Source: COUNT(*) GROUP BY status FROM rvm_task
- Labels: To Do, In Progress, Blocked, Done, Cancelled
- Colors: Existing Darkone palette
- Empty State: Show "No data" message when 0 records
```

### Chart Component Pattern
```tsx
// Following AllApexChart.tsx pattern exactly
const chartOpts: ApexOptions = {
  chart: { height: 320, type: 'donut' },
  colors: ['#6658dd', '#1abc9c', '#4a81d4', '#f7b84b', '#00b19d'],
  labels: [...],
  series: [...],
  legend: { show: true, position: 'bottom' },
  responsive: [{ breakpoint: 600, options: { chart: { height: 240 } } }]
}

<Card>
  <CardHeader>
    <CardTitle as="h4">{title}</CardTitle>
  </CardHeader>
  <CardBody>
    <div dir="ltr">
      <ReactApexChart height={320} options={chartOpts} series={chartOpts.series} type="donut" />
    </div>
  </CardBody>
</Card>
```

---

## F) Dashboard Service (Supabase Queries)

### dashboardService.ts
```typescript
import { supabase } from '@/integrations/supabase/client'

export type DashboardStats = {
  totalDossiers: number
  activeDossiers: number
  totalMeetings: number
  upcomingMeetings: number
  totalTasks: number
  pendingTasks: number
  dossiersByStatus: { status: string; count: number }[]
  tasksByStatus: { status: string; count: number }[]
}

export const dashboardService = {
  async fetchStats(): Promise<DashboardStats> {
    // Execute all queries in parallel for performance
    const [
      dossiersResult,
      activeDossiersResult,
      meetingsResult,
      upcomingMeetingsResult,
      tasksResult,
      pendingTasksResult,
      dossierStatusResult,
      taskStatusResult
    ] = await Promise.all([
      supabase.from('rvm_dossier').select('id', { count: 'exact', head: true }),
      supabase.from('rvm_dossier').select('id', { count: 'exact', head: true })
        .not('status', 'in', '(decided,archived,cancelled)'),
      supabase.from('rvm_meeting').select('id', { count: 'exact', head: true }),
      supabase.from('rvm_meeting').select('id', { count: 'exact', head: true })
        .gte('meeting_date', new Date().toISOString().split('T')[0])
        .in('status', ['draft', 'published']),
      supabase.from('rvm_task').select('id', { count: 'exact', head: true }),
      supabase.from('rvm_task').select('id', { count: 'exact', head: true })
        .in('status', ['todo', 'in_progress']),
      supabase.from('rvm_dossier').select('status'),
      supabase.from('rvm_task').select('status')
    ])

    // Aggregate status counts client-side
    const dossiersByStatus = aggregateByStatus(dossierStatusResult.data ?? [])
    const tasksByStatus = aggregateByStatus(taskStatusResult.data ?? [])

    return {
      totalDossiers: dossiersResult.count ?? 0,
      activeDossiers: activeDossiersResult.count ?? 0,
      totalMeetings: meetingsResult.count ?? 0,
      upcomingMeetings: upcomingMeetingsResult.count ?? 0,
      totalTasks: tasksResult.count ?? 0,
      pendingTasks: pendingTasksResult.count ?? 0,
      dossiersByStatus,
      tasksByStatus
    }
  }
}
```

---

## G) React Query Hook

### useDashboardStats.ts
```typescript
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboardService'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.fetchStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
```

---

## H) Dashboard Page Layout

### Grid Layout (Darkone Bootstrap pattern)
```text
Row 1: 6 KPI Cards (3 per row on desktop, 1 per row on mobile)
  - Col lg={4}: Total Dossiers
  - Col lg={4}: Active Dossiers  
  - Col lg={4}: Total Meetings
  - Col lg={4}: Upcoming Meetings
  - Col lg={4}: Total Tasks
  - Col lg={4}: Pending Tasks

Row 2: Charts
  - Col lg={6}: Dossiers by Status (Donut)
  - Col lg={6}: Tasks by Status (Donut)
```

---

## I) RLS Compliance

All queries respect existing RLS policies:
- `rvm_dossier_select`: Allows read for all RVM roles + super admin
- `rvm_meeting_select`: Allows read for all RVM roles + super admin
- `rvm_task_select`: Allows read for assigned role + secretary + super admin

No RLS changes required.

---

## J) Error & Empty State Handling

### Empty Database State
```tsx
// Charts show "No data available" message when series is empty
{hasData ? (
  <ReactApexChart ... />
) : (
  <div className="text-center text-muted py-4">
    <IconifyIcon icon="bx:bar-chart-alt-2" style={{ fontSize: '2rem' }} />
    <p className="mb-0 mt-2">No data available</p>
  </div>
)}
```

### Loading State
```tsx
// Use existing LoadingState component
{isLoading && <LoadingState message="Loading dashboard..." />}
```

### Error State
```tsx
// Use existing ErrorState component
{isError && <ErrorState message="Failed to load dashboard data" onRetry={refetch} />}
```

---

## K) Assets & Components Governance

| Asset Type | Source | Status |
|------------|--------|--------|
| Icons | Iconify via `IconifyIcon` wrapper | ✅ Existing |
| Charts | ApexCharts via `react-apexcharts` | ✅ Existing |
| Colors | Darkone palette from `AllApexChart.tsx` | ✅ Existing |
| Cards | `react-bootstrap` Card/CardBody | ✅ Existing |
| Grid | `react-bootstrap` Row/Col | ✅ Existing |

No new assets added.

---

## L) Technical Specifications

### Performance
- All database queries run in parallel via `Promise.all()`
- React Query caches results for 5 minutes
- No `SELECT *` queries — only required fields
- Count queries use `{ count: 'exact', head: true }` for efficiency

### Security
- All queries go through Supabase client (RLS enforced)
- No hardcoded data
- No mock/placeholder values
- User must be authenticated to see dashboard

---

## M) Files Changed Summary

### Created (5 files)
| File Path | Purpose |
|-----------|---------|
| `src/services/dashboardService.ts` | Dashboard statistics queries |
| `src/hooks/useDashboardStats.ts` | React Query hook |
| `src/app/(admin)/dashboards/components/StatCard.tsx` | KPI card component |
| `src/app/(admin)/dashboards/components/DossierStatusChart.tsx` | Dossier status donut |
| `src/app/(admin)/dashboards/components/TaskStatusChart.tsx` | Task status donut |

### Modified (1 file)
| File Path | Change |
|-----------|--------|
| `src/app/(admin)/dashboards/page.tsx` | Replace placeholder with real dashboard |

---

## N) Verification Plan

### After Implementation
1. Sign in as `info@devmart.sr`
2. Navigate to `/dashboards`
3. Verify:
   - [ ] 6 KPI cards render with "0" values (empty database)
   - [ ] 2 donut charts show "No data" message
   - [ ] No console errors
   - [ ] No infinite loading
   - [ ] Page loads within 3 seconds
4. Add test data (optional) and verify charts update

### RLS Verification
- [ ] Confirm queries succeed with super admin user
- [ ] Confirm no unauthorized data exposure

---

## O) Deliverables

Phase 7 completion will include:
1. Implementation of all files above
2. Completion report with:
   - Implemented KPIs list
   - Implemented Charts list
   - Supabase tables per metric
   - RLS confirmation per query
   - Darkone 1:1 compliance confirmation
3. Restore point: `RP-P7-post-YYYYMMDD.md`

---

## P) Hard Stops

- ❌ NO modifications to Auth
- ❌ NO modifications to RLS policies
- ❌ NO modifications to table schemas
- ❌ NO modifications to UI layout/SCSS
- ❌ NO Phase 8 work

---

## Q) Explicitly NOT Included

| Item | Reason |
|------|--------|
| CRUD forms for dossiers/meetings/tasks | Out of Phase 7 scope |
| Real-time subscriptions | Not required for MVP |
| Export functionality | Future phase |
| Date range filters | Future enhancement |
| User-specific dashboards | Future enhancement |
