# Restore Point: RP-P17-advanced-search-post

**Created:** 2026-03-05
**Phase:** 17 — Advanced Search & Filtering
**Type:** Post-implementation

## Changes Applied

### New Files
- `src/services/searchService.ts` — Unified search service with `searchGovernanceEntities()`, 5 parallel Supabase queries, `.ilike()` matching, `.limit(10)` per entity, max query length 80 chars
- `src/hooks/useSearch.ts` — `useGlobalSearch()` React Query hook, staleTime 5min, enabled when query >= 2 chars
- `src/components/search/GlobalSearch.tsx` — Topbar search dropdown with 300ms debounce, grouped results (max 3 per entity), click navigation, Escape/outside-click close
- `src/components/search/SearchFilters.tsx` — Collapsible filter panel for dossier/meeting/decision/agenda filters
- `src/app/(admin)/search/page.tsx` — Full search results page with filter integration, grouped entity tables

### Modified Files
- `src/components/layout/TopNavigationBar/page.tsx` — Static search form replaced with `<GlobalSearch />`
- `src/routes/index.tsx` — Added `/search` route
- `src/assets/data/menu-items.ts` — Added Search menu entry
- `docs/backend.md` — Phase 17 row added
- `docs/architecture.md` — Phase 17 architecture note added

## Governance Declaration

- Zero schema changes
- Zero RLS policy changes
- Zero trigger modifications
- Zero new dependencies
- All queries via Supabase client (RLS enforced)
- All queries use `.limit(10)` and `Promise.all()` for parallel execution
- One new route: `/search`
