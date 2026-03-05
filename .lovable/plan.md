# Phase 17 — Advanced Search & Filtering: Implementation Plan

## Architecture

The topbar already has a search input (non-functional). Phase 17 will wire it to a global search service, add a dedicated search results page, and integrate advanced filters.

```text
TopNavigationBar (existing search input)
  └── GlobalSearch component (dropdown results)
        └── "View all results" → /search page

/search page
  ├── SearchBar
  ├── SearchFilters panel
  └── ResultsGrid (grouped by entity)
```

## Part 1 — Search Service

**New file:** `src/services/searchService.ts`

Single function `searchGovernanceEntities(query, filters?)` that runs 5 parallel Supabase queries (one per entity) with `.ilike()` for case-insensitive partial matching and `.limit(10)` per entity.

Search fields per entity:

- **Dossiers:** `title`, `dossier_number`, `sender_ministry`
- **Meetings:** `location`, `meeting_type` (cast), plus date-based matching
- **Agenda items:** joined with dossier title, agenda_number text match
- **Decisions:** `decision_text`
- **Documents:** `title`

Returns typed grouped result: `{ dossiers, meetings, agendaItems, decisions, documents }`.

Filter parameters (optional): `meetingDateFrom`, `meetingDateTo`, `meetingType`, `meetingStatus`, `decisionStatus`, `dossierStatus`, `dossierMinistry`, `agendaStatus`.

## Part 2 — React Query Hook

**New file:** `src/hooks/useSearch.ts`

- `useGlobalSearch(query, filters)` — queryKey `['global-search', query, filters]`, enabled only when query length >= 2, debounced via the component.

## Part 3 — Global Search Component (Topbar Dropdown)

**New file:** `src/components/search/GlobalSearch.tsx`

- Replaces the static `<form>` in the topbar with a functional search input
- 300ms debounce on input
- Dropdown below input showing grouped results (max 3 per entity)
- Each result: entity type badge + title/identifier + click navigates to detail page
- "View all results" link → `/search?q={query}`
- Closes on outside click or Escape

**Modified:** `src/components/layout/TopNavigationBar/page.tsx` — replace static search form with `<GlobalSearch />`

## Part 4 — Search Filters Component

**New file:** `src/components/search/SearchFilters.tsx`

Collapsible filter panel with:

- Meeting: date range (2 date inputs), type dropdown, status dropdown
- Decision: status dropdown, date range
- Dossier: ministry text input, status dropdown
- Agenda: status dropdown
- Clear all button

## Part 5 — Search Results Page

**New file:** `src/app/(admin)/search/page.tsx`

- Reads `?q=` from URL params
- Full-width layout: SearchBar + FilterPanel + ResultsGrid
- Results grouped by entity type in cards/tables
- Each section shows up to 10 results
- Uses existing Bootstrap Card, Table, Badge components

**Modified:** `src/routes/index.tsx` — add `/search` route

## Part 6 — Sidebar Menu

**Modified:** `src/assets/data/menu-items.ts` — add Search entry under MENU section

## Files to Create

1. `src/services/searchService.ts`
2. `src/hooks/useSearch.ts`
3. `src/components/search/GlobalSearch.tsx`
4. `src/components/search/SearchFilters.tsx`
5. `src/app/(admin)/search/page.tsx`
6. `Project Restore Points/RP-P17-advanced-search-pre.md`
7. `Project Restore Points/RP-P17-advanced-search-post.md`

## Files to Modify

1. `src/components/layout/TopNavigationBar/page.tsx` — replace static search with GlobalSearch
2. `src/routes/index.tsx` — add search route
3. `src/assets/data/menu-items.ts` — add search menu item
4. `docs/backend.md` — Phase 17 entry
5. `docs/architecture.md` — Phase 17 entry

## Governance Note (Devmart):

Search must never broaden data visibility.

Requirements:

1) All queries must remain strictly RLS-governed (no service-role, no bypass).

2) Limit results per entity: 10 (already planned). In the dropdown, cap at 3 per entity.

3) Do not query large text blobs or document bodies (metadata only: title/type/refs).

4) Ensure GlobalSearch input does not fire requests when query length < 2 and when query is whitespace-only.

5) Add a defensive max query length (e.g., 80 chars) to avoid pathological ilike scans.  
  
G**overnance**

- Zero schema changes
- Zero RLS changes
- Zero new dependencies
- All queries via Supabase client (RLS enforced)
- All queries use `.limit(10)` and `Promise.all()` for parallel execution
- One new route: `/search`