# Phase 20 — Seeder Execution Guide

**Created:** 2026-03-05
**Function:** `seed-rvm-workflow-data`
**Type:** Supabase Edge Function

---

## A) Invocation via Supabase Dashboard

1. Open your Supabase project at https://supabase.com/dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Locate function: `seed-rvm-workflow-data`
4. Click the function to view its details
5. Use the **Invoke** button or copy the function URL
6. Send a POST request with the `SERVICE_ROLE_KEY` as Bearer token

---

## B) Invocation via CURL

```bash
curl -X POST \
  https://smjjpxhgnomucvmmllaj.supabase.co/functions/v1/seed-rvm-workflow-data \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

**Expected response (first run):**
```json
{
  "status": "success",
  "message": "Seed data created successfully",
  "counts": {
    "users": 5,
    "dossiers": 6,
    "meetings": 5,
    "agendaItems": 23,
    "decisions": 12,
    "tasks": 10
  }
}
```

**Expected response (already seeded):**
```json
{
  "status": "skipped",
  "message": "Seed data already exists. Use ?force=true to re-seed."
}
```

---

## C) Force Re-seed

Append `?force=true` to delete all existing seed data and recreate:

```bash
curl -X POST \
  "https://smjjpxhgnomucvmmllaj.supabase.co/functions/v1/seed-rvm-workflow-data?force=true" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

**What happens with `?force=true`:**

1. Deletes all `rvm_task` records linked to seed dossiers
2. Deletes all `rvm_decision` records linked to seed agenda items
3. Deletes all `rvm_agenda_item` records linked to seed meetings
4. Deletes all seed `rvm_meeting` records (identified by `[SEED]` in location)
5. Deletes all seed `rvm_dossier` records (identified by `RVM-SEED-%` dossier numbers)
6. Deletes `user_role` and `app_user` records for seed accounts
7. Recreates all data from scratch

**Auth users are NOT deleted** — existing auth accounts are reused via email lookup.

---

## D) Safety Rules

| Rule | Detail |
|------|--------|
| **Environment** | Only use in development or staging environments |
| **SERVICE_ROLE_KEY** | Never expose publicly — this key bypasses all RLS policies |
| **Idempotency** | Default behavior is idempotent — returns "already seeded" if data exists |
| **No production use** | Seed data includes `[SEED]` prefixes and `@rvm.local` test emails |
| **Auth accounts** | Test accounts use password `TestSeed2026!` — change in production |
| **RLS bypass** | The edge function uses the service role key to insert data directly, bypassing all Row Level Security policies |

---

## E) Identification of Seed Data

All seed data can be identified by these markers:

| Entity | Marker |
|--------|--------|
| Dossiers | `dossier_number LIKE 'RVM-SEED-%'` |
| Dossier titles | Prefixed with `[SEED]` |
| Meetings | `location LIKE '%[SEED]%'` |
| Users | `email LIKE '%@rvm.local'` |
| Agenda items, decisions, tasks | Linked via foreign keys to seed dossiers/meetings |
