# Phase 23B — Document Upload Validation & Critical RLS Fix

## Root Cause Identified

The error "Cannot coerce the result to a single JSON object" (HTTP 406) is caused by a **systemic RLS policy defect**: ALL INSERT and UPDATE policies across every domain table are `RESTRICTIVE` with no `PERMISSIVE` counterpart.

PostgreSQL RLS requires at least one PERMISSIVE policy to grant access. RESTRICTIVE policies can only narrow access granted by PERMISSIVE ones. With only RESTRICTIVE INSERT/UPDATE policies, **no authenticated user can write to any table** through the Supabase client.

### Affected Tables (17 policies total)

```text
missive_keyword    — INSERT, UPDATE
rvm_agenda_item    — INSERT, UPDATE
rvm_decision       — INSERT, UPDATE
rvm_document       — INSERT, UPDATE
rvm_document_version — INSERT
rvm_dossier        — INSERT, UPDATE
rvm_item           — INSERT, UPDATE
rvm_meeting        — INSERT, UPDATE
rvm_task           — INSERT, UPDATE
```

This explains why the document upload fails and why no real user has successfully created any entity through the UI (all seed data was created via SERVICE_ROLE_KEY which bypasses RLS).

### Why this was not caught earlier

Phase 20 seeder uses `SERVICE_ROLE_KEY` (bypasses RLS). Phase 21-22 tests were code-level verifications, not real browser interactions. This is the first real user-initiated write operation.

---

## Fix

**Single migration**: Drop all 17 RESTRICTIVE INSERT/UPDATE policies and recreate them as PERMISSIVE with identical conditions.

The storage.objects policies are already PERMISSIVE (correct) — no changes needed there.

---

## Execution Plan


| #   | Op        | Description                                                          |
| --- | --------- | -------------------------------------------------------------------- |
| 1   | Create    | `Project Restore Points/RP-P23B-doc-validation-pre.md`               |
| 2   | Migration | Convert 17 RESTRICTIVE INSERT/UPDATE policies to PERMISSIVE          |
| 3   | Update    | `docs/Phase-23-Final-QA-Report.md` — add document validation results |
| 4   | Create    | `Project Restore Points/RP-P23B-doc-validation-post.md`              |
| 5   | Update    | `docs/architecture.md` + `docs/backend.md` — note RLS fix            |


After the migration, the user will need to manually test the document upload flow to confirm PASS status. If upload succeeds, Phase 23B is marked COMPLETE. If not, remains PARTIAL.

---

**Governance Note — CRITICAL RLS DEFECT (BLOCKING)**

The current failure is not a UI or API issue but a SYSTEM-WIDE RLS MISCONFIGURATION.

All INSERT/UPDATE policies are defined as RESTRICTIVE without any PERMISSIVE base policy.

This results in:

- ALL authenticated writes being blocked

- System effectively read-only for all users

- Seeder bypassed this via SERVICE_ROLE_KEY (not representative of real usage)

This is a CRITICAL BLOCKER for production.

---

Required correction:

1. Convert all INSERT and UPDATE policies from RESTRICTIVE → PERMISSIVE

2. Preserve ALL existing conditions (no logic change)

3. Do NOT modify SELECT policies

4. Do NOT modify storage policies (already correct)

---

Execution classification:

This is NOT a feature change.

This is a SYSTEM CORRECTION to restore intended behavior.

---

Completion rule:

Phase 23B cannot be marked COMPLETE until:

- RLS fix applied

- Document upload succeeds via real user

- At least one write operation succeeds (document OR dossier OR task)

Until then:

→ Status must remain BLOCKED / PARTIAL  
  
  
  
**Technical Detail — Migration SQL**

```sql
-- For each of the 17 policies:
-- DROP POLICY "<name>" ON <table>;
-- CREATE POLICY "<name>" ON <table>
--   FOR <INSERT|UPDATE> TO authenticated
--   USING (<same condition>)        -- for UPDATE
--   WITH CHECK (<same condition>);  -- for INSERT
```

All conditions remain identical. Only the policy type changes from RESTRICTIVE to PERMISSIVE (which is the PostgreSQL default when no `AS RESTRICTIVE` clause is specified).