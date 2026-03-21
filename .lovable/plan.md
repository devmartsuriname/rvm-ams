# Phase 23 — Final QA, Performance & Production Readiness Audit

## Pre-Execution Analysis

### Current Data State

- 7 dossiers, 6 meetings, 24 agenda items, 13 decisions, 10 tasks
- **0 documents, 0 document versions** — confirms document storage is untested
- 133 audit events, 4 illegal attempt log entries
- Storage bucket `rvm-documents` exists (private), with correct RLS on `storage.objects` (INSERT for secretary/admin_dossier/admin_reporting, SELECT for all RVM roles)

### Storage Policy Gap

No UPDATE or DELETE policy on `storage.objects` — this is correct by design (immutable documents), but means versioning creates new files rather than overwriting.

---

## Execution Plan

### Step 1 — Runtime QA (All 7 Routes)

Log in as `info@devmart.sr` (super admin) and navigate each route. Check for:

- Console errors
- Data loading
- Empty states where expected
- No broken UI

### Step 2 — Document Storage Validation (CRITICAL)

This is the highest-priority test since documents have never been tested with real files.

1. Log in as **[secretary@rvm.local](mailto:secretary@rvm.local)** (has `secretary_rvm` role — permitted to upload)
2. Navigate to `/rvm/dossiers` → open a seed dossier → Documents tab
3. Upload a test document (small text/PDF file)
4. Verify: document record created, version record created, file in storage
5. Upload a new version via DocumentVersionModal
6. Download both versions via signed URL
7. Log in as **[observer@rvm.local](mailto:observer@rvm.local)** → verify can VIEW documents but NOT upload (no upload button rendered)

### Step 3 — Performance Check

Use browser performance profiling on dashboard and search pages. Measure:

- Initial page load
- Search response time
- Any long tasks or blocking renders

### Step 4 — Lighthouse Audit

Run Lighthouse via browser tools on the dashboard page for Performance, Accessibility, Best Practices scores.

### Step 5 — UX Stability

Verify across modules:

- Buttons responsive on first click
- No double-submit issues (isPending guards)
- Loading states render correctly
- Navigation consistent

### Step 6 — Data Integrity Check

Query database for:

- Duplicate records
- Orphaned relations (agenda items without meetings, decisions without agenda items)
- Status consistency

### Step 7 — Security Sanity Check

- Unauthenticated access redirects to login
- RLS enforced (verify via role-restricted queries)
- No data leakage in UI components

---

## Deliverable

Create `docs/Phase-23-Final-QA-Report.md` with:

- PASS/FAIL per module and step
- Performance metrics
- Lighthouse scores (if obtainable)
- Document storage test results (upload, version, download, access control)
- Security observations
- Production readiness status

## Operations


| #   | Op     | File                               |
| --- | ------ | ---------------------------------- |
| 1   | Create | `docs/Phase-23-Final-QA-Report.md` |


**Total: 1 op** (documentation only)  
  
**NOTE — Documents Module Navigation Clarification**

The Documents module is still not visible in the sidebar navigation.

Before production readiness is declared, clarify and document one of the following:

1. Documents is intentionally dossier-scoped only

   - Access path: Dossiers → Dossier Detail → Documents tab

   - In this case, document this explicitly in the Phase 23 report and architecture docs.

OR

2. A standalone Documents navigation entry is intended

   - In that case, this remains a UI navigation gap and must be scheduled as a follow-up item before production readiness.

This is not a blocker for Phase 23 execution, but it must be explicitly resolved before Phase 25.  
  
