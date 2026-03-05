

# Phase 20 — Seeder Execution Guide & Data Report

Documentation-only deliverable. No code or database changes.

## Deliverable 1: Seeder Execution Guide

Will be created as `docs/Phase-20-Seeder-Guide.md` containing:

### A) Dashboard Invocation
Step-by-step: Supabase Dashboard → Edge Functions → `seed-rvm-workflow-data` → Invoke via HTTP

### B) CURL Command
```
curl -X POST \
  https://smjjpxhgnomucvmmllaj.supabase.co/functions/v1/seed-rvm-workflow-data \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

### C) Force Re-seed
Append `?force=true` — deletes all seed data (by `RVM-SEED-%` dossier numbers and `[SEED]` titles) then recreates.

### D) Safety Rules
Dev/staging only, never expose SERVICE_ROLE_KEY, idempotent by default.

---

## Deliverable 2: Seeder Data Report

Created as `docs/Phase-20-Seed-Data-Report.md` with all data from live database queries:

### Users (5)
| Email | Full Name | Role | app_user ID |
|-------|-----------|------|-------------|
| chair@rvm.local | Chair — RVM Test | chair_rvm | b52f9b23-... |
| secretary@rvm.local | Secretary — RVM Test | secretary_rvm | 239ec961-... |
| member1@rvm.local | Cabinet Member 1 — RVM Test | admin_dossier | 453656e1-... |
| member2@rvm.local | Cabinet Member 2 — RVM Test | admin_agenda | d3cd0997-... |
| observer@rvm.local | Observer — RVM Test | audit_readonly | b879a23c-... |

Password: `TestSeed2026!`

### Dossiers (6)
All with `[SEED]` prefix, statuses: draft, registered, in_preparation, scheduled, decided, archived.

### Meetings (5 seed)
3 closed (Jan 15, Feb 5, Feb 26), 1 published (Apr 10), 1 draft (May 1).

### Agenda Items (23 seed)
Distributed across 5 seed meetings (4-5 per meeting). Closed meetings → `presented`; future meetings → `scheduled`.

### Decisions (12 seed)
8 approved (with chair approval), 2 rejected, 2 deferred. Linked to presented agenda items in closed meetings.

### Tasks (10)
Mix of todo (4), in_progress (3), done (3). Assigned to member1 (admin_dossier), secretary, member2 (admin_agenda).

### Verification Summary
Totals and relational integrity confirmation.

---

## Deliverable 3: Doc Updates

### `docs/architecture.md`
Add "Phase 20 — Seeder Execution & Data Report" reference in completion status paragraph.

### `docs/backend.md`
Add reference to the two new docs in Phase 20 row description.

---

## Operations (4 total)

| # | Op | File |
|---|---|---|
| 1 | Create | `docs/Phase-20-Seeder-Guide.md` |
| 2 | Create | `docs/Phase-20-Seed-Data-Report.md` |
| 3 | Edit | `docs/architecture.md` — add seeder guide/report reference |
| 4 | Edit | `docs/backend.md` — add seeder guide/report reference |

