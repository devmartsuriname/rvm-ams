# Phase 20: Test Data Seeder — Implementation Plan

## Architecture Decision

Since Lovable cannot run standalone Node/TS scripts, the seeder will be implemented as a **Supabase Edge Function** (`seed-rvm-workflow-data`). This function uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and insert data directly. It is invoked via HTTP POST (curl or the Supabase dashboard).

The user's requested `scripts/seed-rvm-workflow-data.ts` path is not executable in this environment. The edge function approach is functionally equivalent and deployable.

## Role Mapping

The user's requested roles mapped to the existing `app_role` codes:


| Requested Role | Mapped `app_role.code` | Rationale                 |
| -------------- | ---------------------- | ------------------------- |
| Chair          | `chair_rvm`            | Direct match              |
| Secretary      | `secretary_rvm`        | Direct match              |
| Member 1       | `admin_dossier`        | Operational cabinet admin |
| Member 2       | `admin_agenda`         | Agenda management admin   |
| Observer       | `audit_readonly`       | Read-only audit access    |


## Idempotency Strategy

All seed dossiers will have titles prefixed with `[SEED]`. Before inserting, the function checks if any `[SEED]` dossier already exists. If found, it returns early with a "already seeded" message. A `?force=true` query param will delete existing seed data and re-seed.

## Data Graph

```text
5 app_user (auth accounts) + 5 user_role
  └── 6 rvm_dossier (various statuses)
        └── 5 rvm_meeting (3 closed, 2 draft/published)
              └── 24 rvm_agenda_item (4-6 per meeting)
                    └── 12 rvm_decision (on presented items from closed meetings)
        └── 10 rvm_task (follow-ups from decisions)
```

## Entity Counts


| Entity          | Count |
| --------------- | ----- |
| Auth users      | 5     |
| app_user        | 5     |
| user_role       | 5     |
| rvm_dossier     | 6     |
| rvm_meeting     | 5     |
| rvm_agenda_item | 24    |
| rvm_decision    | 12    |
| rvm_task        | 10    |


## Operations (7 total, well under 25 limit)


| #   | Op     | File                                                 |
| --- | ------ | ---------------------------------------------------- |
| 1   | Create | `Project Restore Points/RP-P20-seeder-pre.md`        |
| 2   | Create | `supabase/functions/seed-rvm-workflow-data/index.ts` |
| 3   | Edit   | `docs/architecture.md` — Phase 20 completion note    |
| 4   | Edit   | `docs/backend.md` — Phase 20 completion note         |
| 5   | Create | `Project Restore Points/RP-P20-seeder-post.md`       |


Total: **5 ops**

## Technical Details

### Edge Function: `supabase/functions/seed-rvm-workflow-data/index.ts`

1. **Auth user creation**: Uses `supabase.auth.admin.createUser()` with `email_confirm: true` to create 5 test accounts (password: `TestSeed2026!`).
2. **app_user records**: Inserts matching `app_user` rows with `auth_id` linkage.
3. **user_role records**: Assigns one role per user.
4. **Dossiers**: 6 dossiers with varied statuses (`draft`, `registered`, `in_preparation`, `scheduled`, `decided`, `archived`). Uses `dossier_number` format `RVM-SEED-001` through `RVM-SEED-006`. The `generate_dossier_number` trigger fires on NULL — we provide explicit numbers to avoid conflicts.
5. **Meetings**: 3 closed (past dates), 2 draft/published (future dates). `created_by` set to secretary user.
6. **Agenda items**: 4-6 per meeting, linked to dossiers. Closed-meeting items get `presented` status; draft/published meeting items stay `scheduled`.
7. **Decisions**: Created for presented agenda items in closed meetings. Mix of `approved`, `rejected`, `deferred` statuses. Approved decisions get `chair_approved_by`/`chair_approved_at` set.
8. **Tasks**: 10 follow-up tasks linked to dossiers, assigned to various users/roles. Mix of `todo`, `in_progress`, `done` statuses.

### Status transition compliance

All entity statuses are set at INSERT time (not via UPDATE), so status transition triggers do not fire. This is intentional — seeded data represents final states, not workflow progression.

### Idempotency check

- On entry: query `SELECT count(*) FROM rvm_dossier WHERE dossier_number LIKE 'RVM-SEED-%'`
- If > 0 and `?force=true` not set → return 200 with "Already seeded"
- If `?force=true` → delete seed data in reverse dependency order, then re-seed

### Invocation

```bash
curl -X POST \
  https://smjjpxhgnomucvmmllaj.supabase.co/functions/v1/seed-rvm-workflow-data \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

## Governance Note — Phase 20 Seeder Safety

Before creating new auth users in the seed function, add a safety check to prevent duplicate accounts.

Implementation requirement:

1) For each seed email (chair@rvm.local, secretary@rvm.local, member1@rvm.local, member2@rvm.local, observer@rvm.local):

   - First query existing users using:

     supabase.auth.admin.listUsers() or getUserByEmail()

2) If the user already exists:

   - Reuse the existing auth user ID

   - Do NOT create a new user

3) Only call supabase.auth.admin.createUser() when the email does not exist.

4) Ensure the seeder remains idempotent for both:

   - application data

   - auth users

This prevents duplicate auth accounts if the seeder is executed multiple times or when ?force=true is used.  
  
Verification

After deployment, invoke the edge function and then verify:

- `/rvm/dossiers` shows 6 seed dossiers
- `/rvm/meetings` shows 5 seed meetings
- Meeting detail pages show agenda items
- `/rvm/decisions` shows 12 decisions
- `/rvm/tasks` shows 10 tasks
- `/search` returns seed entities