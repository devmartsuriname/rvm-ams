

# Phase 21 — Test Accounts & Role Verification

## Critical Blocker: Seed User Login Failure

The session replay shows login as `chair@rvm.local` with `TestSeed2026!` returns **"Invalid login credentials"**. Investigation confirms:

- All 5 auth users exist in `auth.users` with confirmed emails
- All 5 `app_user` records exist with correct `auth_id` linkage
- All 5 `user_role` records are assigned

**Root cause**: When the seeder ran with `?force=true`, auth users already existed. The catch branch reused their IDs but did NOT update their passwords. The original password may not have been set correctly during the initial `createUser` call, or was lost during re-creation.

## Fix Required (1 code change + re-invocation)

### Step 1: Update edge function

In `supabase/functions/seed-rvm-workflow-data/index.ts`, add a password reset call for existing users in the catch branch (line ~239):

```typescript
// After finding existing user, update their password
await supabase.auth.admin.updateUserById(match.id, {
  password: SEED_PASSWORD,
});
```

### Step 2: Re-deploy and invoke

Re-invoke the edge function with `?force=true` to reset all passwords.

### Step 3: Verify login for all 5 accounts

Log in as each seed user and navigate all RVM routes to verify role-based access.

## Phase 21 Test Matrix

Once login works, test each account against the verification matrix:

| Account | Role | Can View | Can Write | Cannot |
|---------|------|----------|-----------|--------|
| chair@rvm.local | chair_rvm | All dossiers, decisions, meetings | Approve/finalize decisions | Edit dossiers, modify agenda |
| secretary@rvm.local | secretary_rvm | All entities | Create/edit meetings, agenda, tasks | Finalize decisions |
| member1@rvm.local | admin_dossier | Dossiers, meetings, agenda, docs | Edit dossiers, update status | Create meetings, approve decisions |
| member2@rvm.local | admin_agenda | Dossiers, meetings, agenda | Manage agenda items | Edit dossiers, approve decisions |
| observer@rvm.local | audit_readonly | Dossiers, meetings, audit log | Nothing | Any write operation |

## Operations (3 total)

| # | Op | File |
|---|---|---|
| 1 | Edit | `supabase/functions/seed-rvm-workflow-data/index.ts` — add password reset for existing users |
| 2 | Invoke | Edge function with `?force=true` |
| 3 | Create | `docs/Phase-21-Role-Verification-Report.md` — test results |

## Deliverable

`docs/Phase-21-Role-Verification-Report.md` with:
- Login verification per account
- Permission test results (allowed/blocked actions)
- Audit log evidence of blocked attempts
- RLS enforcement confirmation

