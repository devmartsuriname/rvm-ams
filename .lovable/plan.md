# Plan: Governance Alignment — Update EN + NL User Manuals

## What Changed (Source of Truth)

From smoke test + governance docs, these facts must be reflected in manuals:


| Topic              | Current Manual Content            | Correct Behavior                                                             |
| ------------------ | --------------------------------- | ---------------------------------------------------------------------------- |
| Roles              | 5 roles listed, no `admin_intake` | 6 roles — `admin_intake` is separate, assigned as secondary role to member1  |
| Dossier creation   | Generic "create dossier"          | Only `admin_intake` role can create; Proposal type requires OPA/ORAG subtype |
| Agenda eligibility | Implies all dossiers selectable   | Only `registered` or `in_preparation` status dossiers appear                 |
| Meeting lifecycle  | Not explicitly documented         | Draft → Published → Closed; secretary can publish AND close                  |


## Changes to `/tmp/gen_manuals_v2.py`

### 1. Test Accounts Table — Add admin_intake info

Update member1 row description in both EN and NL:

- EN: `"Cabinet Member 1 (admin_dossier + admin_intake)"` → `"Dossier lifecycle + intake — create and manage dossiers"`
- NL: Same structure, Dutch description

### 2. Roles Table — Add admin_intake as distinct role

Add a new row (or split member1's row) to clearly show `admin_intake` as a separate capability:

**EN roles table** — add row:

```python
["Intake (admin_intake)", "Create new dossiers; register incoming items", "Cannot edit existing dossiers; cannot manage agenda or decisions", "Dossiers (create only)"]
```

Update member1 row to show dual-role:

```python
["Cabinet Member 1 (admin_dossier + admin_intake)", "Create AND edit dossiers; update status; view meetings", "Cannot approve decisions; cannot create meetings", "Dossiers"]
```

**NL roles table** — same structure, Dutch text.

### 3. Dossier Creation Section — Add proposal subtype constraint

In Section 6 (Common Tasks / Veelvoorkomende Taken), update "Create a Dossier" guide:

**EN**: Add callout block:

```
IMPORTANT: When Service Type is "Proposal", you MUST select a Proposal Subtype (OPA or ORAG). The form will not submit without it.
```

**NL**: Same as BELANGRIJK callout.

### 4. Agenda Item Section — Clarify eligibility filter

In Section 6, update "Add Agenda Item" guide:

**EN**: Add note:

```
TIP: Only dossiers with status "Registered" or "In Preparation" appear in the dossier dropdown. Draft or decided dossiers are not eligible for agenda scheduling.
```

**NL**: Same as TIP callout.

### 5. Meeting Workflow Section — Confirm lifecycle

In Section 4 (Meeting Workflow), explicitly state:

**EN**:

- Meeting lifecycle: Draft → Published → Closed
- Secretary (secretary_rvm) can publish AND close meetings
- Once closed, no further modifications are allowed

**NL**: Same content in Dutch.

### 6. Regenerate Both PDFs

Run updated script → overwrite:

- `/mnt/documents/RVM-AMS_User_Manual.pdf`
- `/mnt/documents/RVM-AMS_Gebruikershandleiding.pdf`

QA via `pdftoppm`.

## Files Affected


| File                                               | Change                                                     |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `/tmp/gen_manuals_v2.py`                           | Content updates (roles, dossier, agenda, meeting sections) |
| `/mnt/documents/RVM-AMS_User_Manual.pdf`           | Regenerated                                                |
| `/mnt/documents/RVM-AMS_Gebruikershandleiding.pdf` | Regenerated                                                |


**0 application code changes. 2 PDFs regenerated.**  
  
**NOTE — Governance Traceability Enforcement**

Before regenerating manuals, enforce alignment with authoritative AMS-RVM core documents:

1. Cross-check all documented roles against:

   - rls_role_matrix_ams_rvm_core_v_[1.md](http://1.md)

   Ensure admin_intake is either:

   a) Explicitly defined in RLS, OR

   b) Documented as a derived/secondary capability (not a primary governance role)

2. Validate workflow statements against:

   - workflow_diagrams_ams_rvm_core_v_[1.md](http://1.md)

   Confirm:

   - Draft → Published → Closed transitions match status_transitions table

   - Secretary permissions are enforced at data layer (not UI only)

3. Add clarification in manuals:

   - System behavior is enforced via backend governance (RLS + DB constraints)

   - UI visibility does not override governance rules

4. Ensure auditability statement remains accurate:

   - Any new role (admin_intake) must not bypass audit logging or decision immutability

This ensures manuals remain audit-proof and governance-compliant, not just UI-aligned.