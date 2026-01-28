# Project Plan — AMS–RVM Core (v1)

## Phase Status Registry

| Phase | Name | Status | Restore Point |
|-------|------|--------|---------------|
| 1 | Foundation Layer | CLOSED | RP-P1-post-20260128.md |
| 2 | Core Domain | CLOSED | RP-P2-post-20260128.md |
| 3 | Workflow Engine | CLOSED | RP-P3-post-20260128.md |
| 4 | Agenda Management | CLOSED | RP-P4-post-20260128.md |
| 5 | Decision Management | CLOSED | RP-P5-post-20260128.md |
| 6 | Auth Replacement | CLOSED | RP-P6-CLOSURE-20260128.md |
| 7 | Reporting & Dashboards | **COMPLETE** | RP-P7-post-20260128.md |
| 8 | Audit Finalization | PENDING | - |

---

## Phase 7 — Completion Report

### Authorization Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 7 — Reporting & Dashboards
- **Completed:** 2026-01-28
- **Mode:** STRICT (Darkone 1:1)

---

### Implemented KPIs (6 Total)

| # | KPI | Icon | Data Source | Query Type |
|---|-----|------|-------------|------------|
| 1 | Total Dossiers | bx:folder | `rvm_dossier` | COUNT(*) |
| 2 | Active Dossiers | bx:folder-open | `rvm_dossier` | COUNT(*) WHERE status NOT IN (decided, archived, cancelled) |
| 3 | Total Meetings | bx:calendar | `rvm_meeting` | COUNT(*) |
| 4 | Upcoming Meetings | bx:calendar-event | `rvm_meeting` | COUNT(*) WHERE date >= TODAY AND status IN (draft, published) |
| 5 | Total Tasks | bx:task | `rvm_task` | COUNT(*) |
| 6 | Pending Tasks | bx:hourglass | `rvm_task` | COUNT(*) WHERE status IN (todo, in_progress) |

---

### Implemented Charts (2 Total)

| Chart | Type | Data Source | RLS Enforced |
|-------|------|-------------|--------------|
| Dossiers by Status | Donut | `rvm_dossier.status` | ✅ YES |
| Tasks by Status | Donut | `rvm_task.status` | ✅ YES |

---

### Files Created

| File | Purpose |
|------|---------|
| `src/services/dashboardService.ts` | Parallel Supabase queries for all metrics |
| `src/hooks/useDashboardStats.ts` | React Query hook with 5-minute cache |
| `src/app/(admin)/dashboards/components/StatCard.tsx` | KPI card (Darkone pattern) |
| `src/app/(admin)/dashboards/components/DossierStatusChart.tsx` | Donut chart component |
| `src/app/(admin)/dashboards/components/TaskStatusChart.tsx` | Donut chart component |

### Files Modified

| File | Change |
|------|--------|
| `src/app/(admin)/dashboards/page.tsx` | Full dashboard with 6 KPIs + 2 charts |

---

### RLS Compliance

| Table | Policy | Verified |
|-------|--------|----------|
| `rvm_dossier` | `rvm_dossier_select` | ✅ |
| `rvm_meeting` | `rvm_meeting_select` | ✅ |
| `rvm_task` | `rvm_task_select` | ✅ |

All queries use Supabase client which enforces RLS via `auth.uid()`.

---

### Compliance Confirmations

| Requirement | Status |
|-------------|--------|
| No demo/mock data | ✅ CONFIRMED |
| Darkone 1:1 preserved | ✅ CONFIRMED |
| No scope creep | ✅ CONFIRMED |
| No new dependencies | ✅ CONFIRMED |
| No SCSS modifications | ✅ CONFIRMED |
| No auth changes | ✅ CONFIRMED |
| No RLS changes | ✅ CONFIRMED |
| No schema changes | ✅ CONFIRMED |

---

### Hard Stop Statement

**Phase 7 is COMPLETE.**

All checklist items verified. Dashboard implementation uses real Supabase data with RLS enforcement. Darkone 1:1 compliance maintained.

Phase 8 (Audit Finalization) awaits explicit authorization.
