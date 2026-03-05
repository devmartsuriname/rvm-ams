# Restore Point: RP-P20-seeder-pre

**Created:** 2026-03-05
**Phase:** 20 — Test Data Seeder (Realistic Cabinet Workflow)
**Type:** Pre-implementation
**Baseline:** Phase 19 complete; all code health cleanup done

## Scope Statement

Create a Supabase Edge Function (`seed-rvm-workflow-data`) that populates the system with realistic RVM cabinet workflow data for testing and demo purposes.

## Files to be Created

- `supabase/functions/seed-rvm-workflow-data/index.ts`

## Files to be Modified

- `supabase/config.toml` — Add function config with `verify_jwt = false`
- `docs/architecture.md` — Phase 20 completion note
- `docs/backend.md` — Phase 20 completion note

## Entity Counts

| Entity | Count |
|--------|-------|
| Auth users | 5 |
| app_user | 5 |
| user_role | 5 |
| rvm_dossier | 6 |
| rvm_meeting | 5 |
| rvm_agenda_item | 24 |
| rvm_decision | 12 |
| rvm_task | 10 |

## Governance Constraints

- No schema changes
- No RLS policy changes
- No trigger modifications
- No new npm dependencies
- No UI changes
- No route changes
- Development-only seeder
- Idempotent (safe to run multiple times)
