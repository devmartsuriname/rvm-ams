# Restore Point: RP-P18C-governance-remediation-post

**Created:** 2026-03-05
**Phase:** 18C — Governance Remediation Pack
**Type:** Post-implementation

## Changes Applied

### Fix #1 — `src/services/dossierService.ts` (lines 141-151)
- Replaced `.select().single()` + `if (error) throw error` with `.select()` + `handleGuardedUpdate(result, 'rvm_dossier', id)`
- Now consistent with `updateDossierStatus()` pattern

### Fix #2 — `src/services/documentService.ts` (lines 1-2, 102-107, 158-163)
- Added `import { handleGuardedUpdate } from '@/utils/rls-error'`
- Both `createDocument()` and `uploadNewVersion()` now capture the `current_version_id` update result and pass through `handleGuardedUpdate`

### Fix #3 — `src/services/agendaItemService.ts` (lines 1-3, 88-104)
- Added `fetchViolationReason` to import from `@/utils/rls-error`
- Added `.select()` to each parallel update query
- Added post-`Promise.all` loop checking for empty data arrays (RETURN NULL pattern)
- On silent reject, fetches violation reason via `fetchViolationReason` with correct item ID

## Files Changed (exact list)
1. `src/services/dossierService.ts`
2. `src/services/documentService.ts`
3. `src/services/agendaItemService.ts`

## Build Status
- Build succeeds with pre-existing apexcharts TS1540 warning only (no new warnings)

## Governance Declaration

- **Fully Implemented:** Phase 18C fixes #1, #2, #3
- **Partially Implemented:** None
- **Deferred:** F-02 (over-fetching), F-04 (StatusActions duplication), F-05/F-06 (type safety) — quality improvements, no stability risk
- **Out of Scope:** F-07 (dead demo code removal)
- **Confirmed:** Zero schema/RLS/trigger/dependency changes. Zero refactors. Zero formatting changes.
