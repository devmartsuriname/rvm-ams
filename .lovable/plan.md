# Phase 18 — Final System Completion QA Plan

## Overview

Phase 18 is a **validation-only phase** — no functional code changes. The build output confirms successful compilation (`✓ 878 modules transformed`); all warnings are pre-existing Sass/Bootstrap deprecation notices.

## Files to Create

1. `**Project Restore Points/RP-P18-final-qa-pre.md**` — Pre-QA restore point with phase identifier, timestamp, baseline state, modules under verification
2. `**Project Restore Points/RP-P18-final-qa-post.md**` — Post-QA restore point with QA summary, validation evidence, governance declaration

## Files to Modify

3. `**docs/backend.md**` — Add Phase 18 row to phase status table
4. `**docs/architecture.md**` — Add Phase 18 entry to completion status paragraph

## Verification Approach

Since this is a QA phase, I will use **browser automation** to navigate to each module and capture screenshots as evidence:

### Step 2 — System Integrity (7 modules)

Navigate to: `/dashboards`, `/rvm/meetings`, `/rvm/meetings/{id}` (agenda items tab), `/rvm/decisions`, `/rvm/dossiers`, `/rvm/dossiers/{id}` (documents tab), `/search`

### Step 3 — Workflow Validation

Verify the governance lifecycle chain exists in the UI: Meeting → Agenda Item → Dossier → Decision → Document. Confirm create/link/approve flows are wired.

### Step 4 — Role Access

Verify `useUserRoles()` hook gates all CRUD actions. Dashboard renders role-specific views (Chair/Secretary/Analyst).

### Step 5 — Dashboard Validation

Screenshot `/dashboards` — verify stat cards and charts render with data hooks.

### Step 6 — Search Validation

Navigate to `/search`, test query, verify all 5 entity groups render. Expand Advanced Filters and verify all filter inputs present (meeting date range, meeting type, decision status, decision date range, dossier ministry, agenda meeting reference).

### Step 7 — Regression Check

Confirm all routes in `src/routes/index.tsx` resolve. Verify service files exist for all CRUD modules.

### Step 8 — Documentation

Add Phase 18 entries to `docs/backend.md` and `docs/architecture.md`.

## Governance Note (Devmart)

For Phase 18 Workflow Validation, verification must include actual execution

of the governance lifecycle actions — not only confirmation that the flows exist.

Required validation steps:

1. Create a test Agenda Item linked to a Meeting

2. Link the Agenda Item to a Dossier

3. Create a Decision from the Agenda Item

4. Execute both Decision Approval and Decision Rejection scenarios

5. Complete Decision Documentation (attach or register a Document)

6. Verify Decision Report generation for the meeting

Evidence required in the QA report:

- Screenshots of each workflow step

- Confirmation that status transitions occur correctly

- Confirmation that the Decision appears correctly in the Decision Register

This validation must confirm the full lifecycle:

Meeting → Agenda Item → Dossier → Decision → Document

No schema, RLS, trigger, or dependency changes are permitted in Phase 18.  
Governance

- Zero schema changes
- Zero RLS changes
- Zero trigger changes
- Zero new dependencies
- Zero functional code changes — documentation and restore points only