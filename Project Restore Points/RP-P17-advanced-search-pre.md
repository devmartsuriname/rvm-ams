# Restore Point: RP-P17-advanced-search-pre

**Created:** 2026-03-05
**Phase:** 17 — Advanced Search & Filtering
**Type:** Pre-implementation

## State Summary

Phase 16 (RETURN NULL Pattern Unification) is closed. Phase 15 (Role-Specific Dashboards) is closed. Global search functionality does not exist — topbar search input is non-functional.

## Modules Affected

- `src/components/layout/TopNavigationBar/page.tsx` — static search form to be replaced
- `src/routes/index.tsx` — new `/search` route to be added
- `src/assets/data/menu-items.ts` — search menu entry to be added

## Files to be Created

- `src/services/searchService.ts`
- `src/hooks/useSearch.ts`
- `src/components/search/GlobalSearch.tsx`
- `src/components/search/SearchFilters.tsx`
- `src/app/(admin)/search/page.tsx`

## Governance Constraints

- No schema changes
- No RLS policy changes
- No trigger modifications
- No new dependencies
- All queries via Supabase client (RLS enforced)
