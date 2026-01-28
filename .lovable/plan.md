
# Phase 2B Implementation Plan — REVISED (Scope-Aligned)

## Authorization Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 2B (Core Domain — DATA MODEL ONLY)
- **Date:** 2026-01-28
- **Revision:** v2 (Scope Correction Applied)

---

## CORRECTION SUMMARY

### Correction 1: Immutability Triggers — DEFERRED

| Trigger | Original Plan | Corrected Status | Deferred To |
|---------|---------------|------------------|-------------|
| `prevent_decision_modification()` | Step 6 | **REMOVED** | Phase 5 (Decision Management) |
| `prevent_audit_modification()` | Step 9 | **REMOVED** | Phase 8 (Audit Finalization) |
| `prevent_audit_deletion()` | Step 9 | **REMOVED** | Phase 8 (Audit Finalization) |

**Rationale:** These are governance/behavior enforcement mechanisms, not data model definitions. They enforce business rules that belong to their respective domain phases.

### Correction 2: RLS Policies — REDUCED TO BASELINE

| Original Plan | Corrected Status |
|---------------|------------------|
| Full role-based CRUD matrix per table | **REMOVED** |
| Decision-state-dependent policies | **REMOVED** |
| Audit-readonly semantics | **REMOVED** |
| Role-specific INSERT/UPDATE guards | **REMOVED** |

**Baseline RLS (Phase 2B scope):**
- Enable RLS on all tables
- Deny-by-default for anonymous
- Super-admin bypass for testing/bootstrap
- Authenticated SELECT for reference data only

---

## REVISED IMPLEMENTATION SEQUENCE

### Step 1: CREATE PRE-PHASE RESTORE POINT

**Restore Point:** `RP-P2B-pre-20260128`

Contents:
- Database state: Phase 2 identity schema deployed
- No domain enums or tables yet

---

### Step 2: CREATE ENUM TYPES

**Migration File:** `20260128_001_enums.sql`

12 enum types (unchanged from original plan):
- `service_type` (proposal, missive)
- `proposal_subtype` (OPA, ORAG)
- `urgency_level` (regular, urgent, special)
- `dossier_status` (draft, registered, in_preparation, scheduled, decided, archived, cancelled)
- `meeting_type` (regular, urgent, special)
- `meeting_status` (draft, published, closed)
- `agenda_item_status` (scheduled, presented, withdrawn, moved)
- `decision_status` (approved, deferred, rejected, pending)
- `document_type` (proposal, missive, attachment, decision_list, minutes, other)
- `task_status` (todo, in_progress, blocked, done, cancelled)
- `task_priority` (normal, high, urgent)
- `task_type` (intake, dossier_management, agenda_prep, reporting, review, distribution, other)
- `confidentiality_level` (standard_confidential, restricted, highly_restricted)

---

### Step 3: CREATE TAXONOMY TABLE

**Migration File:** `20260128_002_taxonomy.sql`

**Table:** `missive_keyword`
- Standard columns: id, code, label, description, is_active, created_at

**NO TRIGGERS** (data model only)

---

### Step 4: CREATE DOSSIER & ITEM TABLES

**Migration File:** `20260128_003_dossier.sql`

**Table:** `rvm_dossier`
- All columns as originally specified
- CHECK constraints for data integrity:
  - `proposal_requires_subtype`
  - `missive_requires_keyword`

**Table:** `rvm_item`
- All columns as originally specified

**Sequence:** `dossier_number_seq` for auto-numbering
**Trigger:** `generate_dossier_number()` — This is a DATA GENERATION trigger (not governance), therefore ALLOWED

---

### Step 5: CREATE MEETING & AGENDA TABLES

**Migration File:** `20260128_004_meeting.sql`

**Table:** `rvm_meeting`
- All columns as originally specified

**Table:** `rvm_agenda_item`
- All columns as originally specified
- UNIQUE constraint: (meeting_id, agenda_number)

**NO TRIGGERS** (data model only)

---

### Step 6: CREATE DECISION TABLE

**Migration File:** `20260128_005_decision.sql`

**Table:** `rvm_decision`
- All columns as originally specified
- `is_final` column present (for future governance trigger)

**REMOVED:** `prevent_decision_modification()` trigger
**DEFERRED TO:** Phase 5 (Decision Management)

---

### Step 7: CREATE DOCUMENT TABLES

**Migration File:** `20260128_006_document.sql`

**Table:** `rvm_document`
- All columns as originally specified

**Table:** `rvm_document_version`
- All columns as originally specified
- UNIQUE constraint: (document_id, version_number)

**NO TRIGGERS** (data model only)

---

### Step 8: CREATE TASK TABLE

**Migration File:** `20260128_007_task.sql`

**Table:** `rvm_task`
- All columns as originally specified
- CHECK constraint: `in_progress_requires_user`

**NO TRIGGERS** (data model only)

---

### Step 9: CREATE AUDIT TABLE

**Migration File:** `20260128_008_audit.sql`

**Table:** `audit_event`
- All columns as originally specified

**REMOVED:** `prevent_audit_modification()` trigger
**REMOVED:** `prevent_audit_deletion()` trigger
**DEFERRED TO:** Phase 8 (Audit Finalization)

---

### Step 10: ENABLE BASELINE RLS

**Migration File:** `20260128_009_baseline_rls.sql`

**Baseline Policy Pattern (all tables):**

```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Baseline: Deny anonymous, allow super-admin bypass
CREATE POLICY [table]_baseline_select ON [table_name]
  FOR SELECT TO authenticated
  USING (is_super_admin());

CREATE POLICY [table]_baseline_insert ON [table_name]
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY [table]_baseline_update ON [table_name]
  FOR UPDATE TO authenticated
  USING (is_super_admin());

-- DELETE remains blocked (no policy = denied)
```

**Special Case — Reference Data:**
- `missive_keyword`: SELECT allowed for all authenticated (reference data)
- All other tables: super-admin only until full RLS in later phases

**DEFERRED:** Full role-based RLS matrix → Phase 3+ (per table domain)

---

### Step 11: CREATE INDEXES

**Migration File:** `20260128_010_indexes.sql`

All performance indexes as originally specified (unchanged):
- `idx_dossier_status`, `idx_dossier_urgency`, `idx_dossier_created_at`
- `idx_task_dossier`, `idx_task_status`, `idx_task_due`
- `idx_meeting_date`, `idx_agenda_meeting`
- `idx_decision_final`
- `idx_audit_entity`, `idx_audit_occurred`
- `idx_document_dossier`, `idx_docversion_document`

---

### Step 12: CREATE POST-PHASE RESTORE POINT

**Restore Point:** `RP-P2B-post-20260128`

Contents:
- All 12 enums deployed
- All 10 domain tables deployed
- Baseline RLS enabled (super-admin access)
- All indexes created
- NO governance triggers deployed

---

## MIGRATION FILE SUMMARY (REVISED)

| # | File | Contents | Scope Status |
|---|------|----------|--------------|
| 1 | `20260128_001_enums.sql` | 12 enum types | DATA MODEL |
| 2 | `20260128_002_taxonomy.sql` | `missive_keyword` table | DATA MODEL |
| 3 | `20260128_003_dossier.sql` | `rvm_dossier`, `rvm_item`, sequence, number-gen trigger | DATA MODEL |
| 4 | `20260128_004_meeting.sql` | `rvm_meeting`, `rvm_agenda_item` | DATA MODEL |
| 5 | `20260128_005_decision.sql` | `rvm_decision` (no immutability trigger) | DATA MODEL |
| 6 | `20260128_006_document.sql` | `rvm_document`, `rvm_document_version` | DATA MODEL |
| 7 | `20260128_007_task.sql` | `rvm_task` | DATA MODEL |
| 8 | `20260128_008_audit.sql` | `audit_event` (no immutability triggers) | DATA MODEL |
| 9 | `20260128_009_baseline_rls.sql` | RLS enable + super-admin baseline only | DATA MODEL |
| 10 | `20260128_010_indexes.sql` | Performance indexes | DATA MODEL |

---

## DEFERRED ITEMS REGISTER

### Deferred to Phase 5 (Decision Management)
| Item | Type | Reason |
|------|------|--------|
| `prevent_decision_modification()` | Trigger | Governance enforcement |
| Decision-state-dependent RLS policies | RLS | Business rule enforcement |
| Chair RVM approval gate logic | RLS | Business rule enforcement |

### Deferred to Phase 8 (Audit Finalization)
| Item | Type | Reason |
|------|------|--------|
| `prevent_audit_modification()` | Trigger | Governance enforcement |
| `prevent_audit_deletion()` | Trigger | Governance enforcement |
| Audit-readonly RLS semantics | RLS | Business rule enforcement |

### Deferred to Phase 3+ (Per Domain)
| Item | Type | Reason |
|------|------|--------|
| Full role-based CRUD matrix | RLS | Workflow-dependent access |
| Role-specific INSERT/UPDATE guards | RLS | Business rule enforcement |
| Status-transition guards | RLS | State machine logic |

---

## BASELINE RLS SUMMARY (REVISED)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `missive_keyword` | All authenticated | super_admin | super_admin | Denied |
| `rvm_dossier` | super_admin | super_admin | super_admin | Denied |
| `rvm_item` | super_admin | super_admin | super_admin | Denied |
| `rvm_meeting` | super_admin | super_admin | super_admin | Denied |
| `rvm_agenda_item` | super_admin | super_admin | super_admin | Denied |
| `rvm_decision` | super_admin | super_admin | super_admin | Denied |
| `rvm_document` | super_admin | super_admin | super_admin | Denied |
| `rvm_document_version` | super_admin | super_admin | super_admin | Denied |
| `rvm_task` | super_admin | super_admin | super_admin | Denied |
| `audit_event` | super_admin | super_admin | Denied | Denied |

**Note:** `audit_event` UPDATE is denied at baseline (append-only pattern prepared, enforcement deferred)

---

## SCOPE COMPLIANCE CONFIRMATION

### Phase 2B NOW CONTAINS ONLY:
- Table definitions (columns, types, constraints)
- Foreign key relationships
- CHECK constraints (data integrity)
- Sequences and data-generation triggers
- Performance indexes
- Baseline RLS (enable + super-admin access)

### Phase 2B DOES NOT CONTAIN:
- Immutability triggers (governance)
- Role-based access matrices (business rules)
- State-dependent policies (workflow logic)
- Audit enforcement triggers (compliance logic)
- Any UI changes
- Any workflow automation

---

## CONFIRMATION STATEMENT

Phase 2B Implementation Plan has been corrected to align with "DATA MODEL ONLY" scope:

1. **Immutability Triggers** — REMOVED from Phase 2B, documented for deferral to Phases 5 and 8
2. **RLS Policies** — REDUCED to baseline enforcement only (enable + super-admin bypass)
3. **All Other Items** — Verified as data model definitions (tables, constraints, indexes)

Phase 2B is now strictly "DATA MODEL ONLY" as authorized.

---

## HARD STOP

Corrected plan delivered. Awaiting re-approval before execution.
