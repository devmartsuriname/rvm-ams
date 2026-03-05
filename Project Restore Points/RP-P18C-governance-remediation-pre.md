# Restore Point: RP-P18C-governance-remediation-pre

**Created:** 2026-03-05
**Phase:** 18C — Governance Remediation Pack
**Type:** Pre-implementation
**Baseline:** Phase 18B CONCERN (audit report-only, no fixes applied)

## Scope Statement

Report-only baseline. Exactly 3 governance fixes authorized:

- **Fix #1 (F-01):** `src/services/dossierService.ts` — `updateDossier()` bypass of `handleGuardedUpdate`
- **Fix #2 (F-08):** `src/services/documentService.ts` — `current_version_id` update not verified
- **Fix #3 (F-09):** `src/services/agendaItemService.ts` — `reorderAgendaItems()` no silent reject detection

No other changes allowed. Zero schema/RLS/trigger/dependency changes.

## Pre-existing Build Warning

- `apexcharts.d.ts` TS1540 namespace/module keyword warning (cosmetic, pre-existing since Phase 7+)
