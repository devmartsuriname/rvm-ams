# Restore Point: RP-P10B-nav-structure-pre

**Created:** 2026-02-26
**Phase:** 10B — Navigation Structure Correction
**Type:** Pre-Change
**Authority:** Devmart Guardian Rules

## Scope

Add standalone "Decisions" sidebar entry, route, and list page.

## Files to be Modified

- `src/assets/data/menu-items.ts` — Add `rvm-decisions` sidebar entry
- `src/routes/index.tsx` — Add `/rvm/decisions` route
- `src/services/decisionService.ts` — Add `fetchAllDecisions()` method
- `src/hooks/useDecisions.ts` — Add `useAllDecisions()` hook
- `docs/architecture.md` — Navigation correction note

## Files to be Created

- `src/app/(admin)/rvm/decisions/page.tsx` — Decisions list page

## Constraints

- Zero DB/RLS/trigger changes
- Bootstrap 5 + React-Bootstrap only
- Boxicons icon only
