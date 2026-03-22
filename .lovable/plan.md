# Plan: Fix Test Accounts to Match Phase-20/21 Seed Data

## Problem

Both manuals contain incorrect test accounts (`admin@rvmams.com`, `testpass123`, "Admin", "Analyst" roles) that don't match the authoritative Phase-20/21 seeder data.

## Changes to `/tmp/gen_manuals_v2.py` (content only, no layout/style changes)

### 1. English Manual — Test Accounts Table (lines ~314-319)

**Before:**

```python
["admin@rvmams.com", "testpass123", "Admin", "Full system access"],
["secretary@rvmams.com", "testpass123", "Secretary", "Create/edit dossiers, meetings, agenda items"],
["chair@rvmams.com", "testpass123", "Chair (RVM)", "Approve/reject decisions, finalize meetings"],
["analyst@rvmams.com", "testpass123", "Analyst", "Review dossiers, manage tasks"],
["observer@rvmams.com", "testpass123", "Observer", "Read-only access to all data"],
```

**After:**

```python
["chair@rvm.local", "TestSeed2026!", "Chair (chair_rvm)", "Final decision authority — approve/finalize decisions"],
["secretary@rvm.local", "TestSeed2026!", "Secretary (secretary_rvm)", "Meeting & workflow management — create meetings, manage agenda"],
["member1@rvm.local", "TestSeed2026!", "Cabinet Member 1 (admin_dossier)", "Dossier lifecycle — create, edit, update status"],
["member2@rvm.local", "TestSeed2026!", "Cabinet Member 2 (admin_agenda)", "Agenda management — manage agenda items, link dossiers"],
["observer@rvm.local", "TestSeed2026!", "Observer (audit_readonly)", "Read-only audit access — view all, modify nothing"],
```

### 2. English Manual — Roles Table (lines ~334-339)

Replace "Admin" and "Analyst" rows with correct roles:

```python
["Chair (chair_rvm)", "View all dossiers/meetings; approve decisions; finalize decisions; view audit logs & dashboards", "Cannot edit dossiers; cannot modify agenda items; cannot create meetings", "Decisions, Meetings, Dossiers (read), Audit"],
["Secretary (secretary_rvm)", "Create/edit meetings; manage agenda items; assign tasks; upload documents; view all dossiers", "Cannot approve decisions; cannot finalize decisions", "Meetings, Dossiers, Tasks, Documents"],
["Cabinet Member 1 (admin_dossier)", "Edit dossiers; update dossier status; create tasks; view meetings and agenda items", "Cannot approve decisions; cannot create meetings; cannot manage agenda", "Dossiers, Tasks"],
["Cabinet Member 2 (admin_agenda)", "Manage agenda items; link dossiers to agenda; view meetings and dossiers", "Cannot modify dossiers; cannot finalize decisions; cannot chair-approve", "Agenda Items, Meetings (read)"],
["Observer (audit_readonly)", "View all dossiers, meetings, decisions, and audit logs", "Cannot create, edit, or delete anything", "All screens (read-only)"],
```

### 3. Dutch Manual — Test Accounts Table (lines ~512-517)

Same data as EN, with Dutch descriptions:

```python
["chair@rvm.local", "TestSeed2026!", "Chair (chair_rvm)", "Definitieve besluitbevoegdheid — besluiten goedkeuren/afsluiten"],
["secretary@rvm.local", "TestSeed2026!", "Secretary (secretary_rvm)", "Vergader- & workflowbeheer — vergaderingen aanmaken, agenda beheren"],
["member1@rvm.local", "TestSeed2026!", "Cabinet Member 1 (admin_dossier)", "Dossierlevenscyclus — aanmaken, bewerken, status bijwerken"],
["member2@rvm.local", "TestSeed2026!", "Cabinet Member 2 (admin_agenda)", "Agendabeheer — agendapunten beheren, dossiers koppelen"],
["observer@rvm.local", "TestSeed2026!", "Observer (audit_readonly)", "Alleen-lezen audittoegang — alles bekijken, niets wijzigen"],
```

### 4. Dutch Manual — Roles Table (lines ~532-537)

Same role structure as EN, with Dutch descriptions.

### 5. Column Width Adjustment

Widen Email and Password columns slightly to fit `TestSeed2026!` and longer role names:

- Email: 120 → 110
- Password: 70 → 80
- Role: 70 → 120
- Remaining: auto-calculated

## Output

Regenerate both PDFs (same filenames, overwrite):

- `/mnt/documents/RVM-AMS_User_Manual.pdf`
- `/mnt/documents/RVM-AMS_Gebruikershandleiding.pdf`

QA via `pdftoppm` to verify no `rvmams.com` or `testpass123` remains.

**Total: 0 code changes, 2 PDFs regenerated**  
  
NOTE — ROLE CONSISTENCY CHECK (MANDATORY)

Before applying changes:

1. Verify that the roles removed from the manual:

   - Admin

   - Analyst

DO NOT exist in the current application / database / RLS policies.

2. If these roles DO exist in the system:

   - DO NOT remove them from the manual

   - Instead:

     - Keep them

     - Mark them as:

       "System / Internal role (not part of seed test accounts)"

3. Manuals must reflect:

   - Actual system roles (UI + RLS)

   - AND seed test accounts (Phase-20/21)

4. No mismatch allowed between:

   - Manual

   - UI roles

   - Database roles