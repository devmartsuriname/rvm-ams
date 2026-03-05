# Restore Point: RP-P17-remediation-filters-post

**Created:** 2026-03-05
**Phase:** 17 (Remediation) — Filter Completion
**Type:** Post-implementation

## Changes Applied

### `src/services/searchService.ts`
- Added `decisionDateFrom`, `decisionDateTo`, `agendaMeetingId` to `SearchFilters` interface
- `searchDecisions()`: added `created_at` field to select; applies `.gte('created_at', from)` and `.lte('created_at', to + T23:59:59)` server-side filtering
- `searchAgendaItems()`: applies `.eq('meeting_id', agendaMeetingId)` when filter is set

### `src/components/search/SearchFilters.tsx`
- Decision column: added "Date From" and "Date To" date inputs (`decisionDateFrom`, `decisionDateTo`)
- Agenda column: added Meeting dropdown selector populated from `rvm_meeting` (20 most recent), displaying `meeting_date — meeting_type` labels with hidden meeting IDs
- Added `useEffect` to fetch meeting list on mount

### `docs/backend.md`
- Added Phase 17R remediation row to phase status table

### `docs/architecture.md`
- Added remediation note to Phase 17 description

## Governance Declaration

- Zero schema changes
- Zero RLS policy changes
- Zero trigger modifications
- Zero new dependencies
- Existing caps unchanged (10 service, 3 dropdown)
- All queries remain RLS-governed via Supabase client
