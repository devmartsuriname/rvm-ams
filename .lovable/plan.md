# Phase 17 Remediation — Filter Completion Plan

## Scope

Two missing filters identified during governance verification. No schema/RLS/trigger/dependency changes.

## Files to Create

1. `**Project Restore Points/RP-P17-remediation-filters-pre.md**` — Pre-remediation restore point with phase identifier, timestamp, baseline state, affected modules
2. `**Project Restore Points/RP-P17-remediation-filters-post.md**` — Post-remediation restore point with implementation summary and governance declaration

## Files to Modify

### 1. `src/services/searchService.ts`

Add two new fields to `SearchFilters` interface:

- `decisionDateFrom?: string`
- `decisionDateTo?: string`
- `agendaMeetingId?: string`

In `searchDecisions()`: filter by joined `rvm_agenda_item.rvm_meeting.meeting_date` using `.gte()` / `.lte()` on the nested relation. Since Supabase PostgREST does not support filtering on nested joined columns directly, the approach will be: after fetching results, apply client-side date filtering on `rvm_agenda_item.rvm_meeting.meeting_date`. This is safe because results are already capped at 10.

**Alternative (preferred):** The `rvm_decision` table has `created_at` and `updated_at` columns. Use `created_at` as proxy for decision date range filtering server-side with `.gte('created_at', from)` and `.lte('created_at', to)`. This avoids client-side filtering and keeps it performant.

In `searchAgendaItems()`: add `.eq('meeting_id', filters.agendaMeetingId)` when the filter is set.

### 2. `src/components/search/SearchFilters.tsx`

**Decision column (Col md={3}):** Add two `Form.Control type="date"` inputs below the existing Decision Status dropdown:

- "Date From" → `decisionDateFrom`
- "Date To" → `decisionDateTo`

**Agenda column (Col md={3}):** Add a `Form.Control` text input for meeting ID. Since we don't have a meeting dropdown loader in this component, we'll add a simple text-based meeting ID input. However, a better UX approach: fetch meetings list for a dropdown. We can use an inline Supabase query (already done elsewhere in the app) to populate a `<Form.Select>` with recent meetings (meeting_date + type) keyed by ID.

For simplicity and zero-dependency compliance: fetch meetings inline with `useEffect` in SearchFilters, populate a `<Form.Select>` with `meeting_date | meeting_type` labels.

### 3. `docs/backend.md`

Add line in Phase 17 row: "Remediation: Decision date range filter (created_at) + Agenda meeting reference filter (meeting_id) added."

### 4. `docs/architecture.md`

Add remediation note to Phase 17 entry.

## Technical Details

- Decision date filtering uses `rvm_decision.created_at` for server-side `.gte()` / `.lte()` — this is an existing column, no schema change needed
- Agenda meeting_id filtering uses `.eq('meeting_id', id)` — `meeting_id` is an existing FK column on `rvm_agenda_item`
- Meeting list for the dropdown selector fetched via `supabase.from('rvm_meeting').select('id, meeting_date, meeting_type').order('meeting_date', { ascending: false }).limit(20)`
- All changes remain RLS-governed, no bypass

## Governance Note (Devmart)

Agenda meeting selector must display labels formatted as:

meeting_date — meeting_type

Example:

2026-03-10 — Regular RVM Meeting

The meeting ID must remain hidden in the UI but used internally

as the filter value.  
Governance

- Zero schema changes
- Zero RLS changes
- Zero trigger changes
- Zero new dependencies
- Existing caps unchanged (10 service, 3 dropdown)