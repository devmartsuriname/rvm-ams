# Restore Point: RP-P23B-doc-validation-post

**Created:** 2026-03-21  
**Phase:** 23B — Document Upload Validation & Critical RLS Fix  
**Type:** Post-implementation  
**Baseline:** RLS RESTRICTIVE→PERMISSIVE migration applied; document upload awaiting manual test

## Changes Applied

### Migration: `convert_restrictive_policies_to_permissive`

Dropped and recreated 17 INSERT/UPDATE RLS policies across 9 domain tables:

- `missive_keyword` — INSERT, UPDATE
- `rvm_agenda_item` — INSERT, UPDATE
- `rvm_decision` — INSERT, UPDATE
- `rvm_document` — INSERT, UPDATE
- `rvm_document_version` — INSERT
- `rvm_dossier` — INSERT, UPDATE
- `rvm_item` — INSERT, UPDATE
- `rvm_meeting` — INSERT, UPDATE
- `rvm_task` — INSERT, UPDATE

All conditions preserved identically. Only policy type changed from RESTRICTIVE to PERMISSIVE (PostgreSQL default).

### Documentation Updated

- `docs/Phase-23-Final-QA-Report.md` — added RLS fix details and updated status
- `docs/architecture.md` — noted PERMISSIVE policy standard
- `docs/backend.md` — added Phase 23B entry

## Phase 23B Status

- Search fix: ✅ COMPLETE
- RLS migration: ✅ COMPLETE
- Document upload validation: ⏳ PARTIAL (manual test required)
- Overall: **PARTIAL** — awaiting manual document upload test

## Governance Compliance

- ✅ Pre-restore point created
- ✅ No schema changes (policies only)
- ✅ No trigger changes
- ✅ No code changes
- ✅ All conditions preserved exactly
