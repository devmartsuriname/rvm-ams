# Restore Point: RP-P20-seeder-post

**Created:** 2026-03-05
**Phase:** 20 — Test Data Seeder (Realistic Cabinet Workflow)
**Type:** Post-implementation
**Baseline:** Phase 19 complete

## Files Created

- `supabase/functions/seed-rvm-workflow-data/index.ts` — Edge function seeder
- `Project Restore Points/RP-P20-seeder-pre.md`
- `Project Restore Points/RP-P20-seeder-post.md`

## Files Modified

- `supabase/config.toml` — Added `[functions.seed-rvm-workflow-data]` with `verify_jwt = false`
- `docs/architecture.md` — Phase 20 completion note
- `docs/backend.md` — Phase 20 completion note + phase table entry

## Entity Counts Seeded

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

## Test Credentials

All seed accounts use password: `TestSeed2026!`

| Email | Role |
|-------|------|
| chair@rvm.local | chair_rvm |
| secretary@rvm.local | secretary_rvm |
| member1@rvm.local | admin_dossier |
| member2@rvm.local | admin_agenda |
| observer@rvm.local | audit_readonly |

## Invocation

```bash
curl -X POST \
  https://smjjpxhgnomucvmmllaj.supabase.co/functions/v1/seed-rvm-workflow-data \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

Re-seed with `?force=true` query parameter.

## Governance Compliance

- ✅ Zero schema changes
- ✅ Zero RLS policy changes
- ✅ Zero trigger modifications
- ✅ Zero npm dependency changes
- ✅ Zero UI changes
- ✅ Zero route changes
- ✅ Idempotent seeder (duplicate-safe)
- ✅ Total operations: 6 (well under 25 limit)
