

# Roadmap Correction + Phase Documents Plan

## Overview

This plan applies mandatory corrections to the project roadmap and creates the phase-specific planning documents in `/Project Phases/`. All changes are documentation-only; no implementation is authorized.

---

## PART A — BACKEND PLATFORM CORRECTIONS

### A.1 Platform Change: Lovable Cloud → External Supabase

The following documents require text updates to replace "Lovable Cloud" with "External Supabase":

| Document | Changes Required |
|----------|------------------|
| `deployment_strategy_ams_rvm_core_v1.md` | Lines 12-13: Source authority; Lines 38-44: Deployment flow; Line 179: Secret management; Lines 253: Phase 1 notes |
| `execution_plan_ams_rvm_core_v1.md` | Lines 38-44: Task P1-001 description ("Enable Lovable Cloud" → "Enable External Supabase") |

### A.2 New Environment Strategy Elements

Add to Phase 1 Foundation scope:

1. **External Supabase Project Assumptions**
   - Project reference ID and region (to be provided by project owner)
   - Supabase URL and anon key configuration
   - Service role key handling (secure, never in frontend)

2. **Environment Variable Strategy**
   - Local development: `.env.local` (gitignored)
   - Development/Staging: Supabase project settings
   - Production: Hostinger VPS environment variables
   - Variable naming: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

3. **Migration Discipline**
   - All schema changes tracked as versioned SQL files
   - No ad-hoc console-only changes in production
   - Migration files stored in `/supabase/migrations/` or equivalent
   - Each migration requires review before execution

### A.3 Hostinger VPS Acknowledgment

Add to deployment strategy:
- Future deployment target: Hostinger VPS
- No deployment work in current phases
- Architecture must support self-hosted Supabase or direct Postgres connection
- Build output compatible with static hosting + API endpoints

---

## PART B — SUPER ADMIN TEST BOOTSTRAP

### B.1 Table Specification

**Table Name:** `super_admin_bootstrap`

**Purpose:** Allow a controlled "full rights" test identity for verification runs during development and testing phases. This is NOT a production role mechanism.

**Schema Definition (PLANNING ONLY):**
```text
super_admin_bootstrap
├── id: UUID (PK, auto-generated)
├── auth_id: UUID (FK → auth.users.id, UNIQUE)
├── email: TEXT (NOT NULL)
├── is_active: BOOLEAN (DEFAULT true)
├── purpose: TEXT (documentation field: "testing/bootstrap")
├── created_at: TIMESTAMPTZ
└── expires_at: TIMESTAMPTZ (optional: auto-expiry for test accounts)
```

### B.2 RLS/Role Integration Notes

1. **Bypass Mechanism (Test Environment ONLY)**
   - `super_admin_bootstrap` users can bypass RLS in Test environment
   - Helper function: `is_super_admin()` → checks `super_admin_bootstrap` table
   - RLS policies include: `OR is_super_admin()` clause for Test environment

2. **Production Safeguards**
   - Table is NOT deployed to Live/Production environment
   - Or: `is_active` permanently set to `false` in production
   - Or: RLS policies do not include super_admin bypass in production

3. **Governance Constraints**
   - Super admin CANNOT bypass Chair RVM approval logic (governance rule)
   - Super admin CAN access all data for verification
   - All super admin actions are logged in `audit_event`

### B.3 Documentation Updates Required

| Document | Update Required |
|----------|-----------------|
| `backend_design_ams_rvm_core_v1.md` | Add `super_admin_bootstrap` table schema in Section 4.1 (Identity & Access) |
| `rls_role_matrix_ams_rvm_core_v_1.md` | Note: Reference only (authoritative doc, no modifications) — implementation doc notes this testing mechanism |
| `test_verification_plan_ams_rvm_core_v1.md` | Add test user: `test_superadmin` for bootstrap testing; update Section 3.1 Test User Setup |

---

## PART C — PHASE DOCUMENTS CREATION

### C.1 Folder Structure

Create:
```text
/Project Phases/
├── README.md
├── Phase-1-Foundation-Layer.md
├── Phase-2-Core-Domain.md
├── Phase-3-Workflow-Engine.md
├── Phase-4-Agenda-Management.md
├── Phase-5-Decision-Management.md
├── Phase-6-DMS-Light.md
├── Phase-7-Reporting-Dashboards.md
└── Phase-8-Audit-Finalization.md
```

### C.2 Document Template (Applied to All Phase Docs)

Each phase document will include:

```text
# Phase X: [Phase Name]
## AMS – RVM Core (v1)

---

## 1. Objective
[Clear statement of what this phase accomplishes]

## 2. Scope — Included
- [Explicit list of what is IN scope]

## 3. Scope — Excluded
- [Explicit list of what is OUT of scope]

## 4. Entry Criteria
- [What must already exist before this phase can begin]

## 5. Exit Criteria
- [What defines successful phase completion]

## 6. Restore Point Requirement
- Pre-phase backup mandatory
- Post-phase backup mandatory
- Naming convention: `RP-PX-[pre|post]-YYYYMMDD`

## 7. Verification Checklist
Mapped to Test & Verification Plan:
- [ ] [Test ID]: [Description]
- [ ] [Test ID]: [Description]
...

## 8. Governance Gate
- [Approval requirements for this phase]
- [CRITICAL notation if applicable]

## 9. Hard Stop Statement
Phase X implementation may NOT proceed until:
- All entry criteria verified
- Phase X-1 completion confirmed
- Explicit authorization received

---

**Document Status:** Planning Only — Implementation NOT Started
```

### C.3 Phase-Specific Content Summary

#### Phase 1: Foundation Layer
- **Objective:** Establish backend infrastructure, authentication, identity model
- **Key Deliverables:** External Supabase connection, identity schema, auth flow, AuthContext, RoleGuard, RVM menu placeholders
- **Verification Tests:** P1-TEST-001 through P1-TEST-008
- **Special Notes:** Includes `super_admin_bootstrap` table for testing

#### Phase 2: Core Domain
- **Objective:** Implement RVM dossier lifecycle and item classification
- **Key Deliverables:** Enums, `missive_keyword`, `rvm_dossier`, `rvm_item`, dossier UI, audit events
- **Verification Tests:** RLS-DOSSIER-001 through RLS-DOSSIER-003

#### Phase 3: Workflow Engine
- **Objective:** Implement task assignment and ownership tracking
- **Key Deliverables:** `rvm_task` table, task UI, overdue detection
- **Verification Tests:** WF-TASK-001

#### Phase 4: Agenda Management
- **Objective:** Implement RVM meeting and agenda preparation
- **Key Deliverables:** `rvm_meeting`, `rvm_agenda_item`, meeting UI, agenda builder
- **Verification Tests:** WF-MEETING-001

#### Phase 5: Decision Management (CRITICAL GATE)
- **Objective:** Implement decision recording with Chair RVM approval workflow
- **Key Deliverables:** `rvm_decision`, immutability trigger, Chair approval button
- **Verification Tests:** GATE-001 through GATE-005, IMMUTABLE-001 through IMMUTABLE-006
- **Special Notes:** CRITICAL GATE — Governance approval mandatory

#### Phase 6: DMS-Light
- **Objective:** Implement document upload, versioning, and linking
- **Key Deliverables:** `rvm_document`, `rvm_document_version`, storage bucket
- **Verification Tests:** IMMUTABLE-006

#### Phase 7: Reporting & Dashboards
- **Objective:** Implement decision list generation and role-based dashboards
- **Key Deliverables:** Chair/Secretary dashboards, decision list generator, PDF export

#### Phase 8: Audit Finalization (SYSTEM READINESS)
- **Objective:** Complete audit logging and verify immutability
- **Key Deliverables:** Audit log viewer, compliance documentation
- **Special Notes:** SYSTEM READINESS gate — Full verification required

---

## PART D — DOCUMENT UPDATE MATRIX

### Documents to be Updated

| Document Path | Update Type | Description |
|---------------|-------------|-------------|
| `Project Docs/AMS-RVM/deployment_strategy_ams_rvm_core_v1.md` | Modify | Replace "Lovable Cloud" references with "External Supabase"; add Hostinger VPS acknowledgment; add migration discipline section |
| `Project Docs/AMS-RVM/execution_plan_ams_rvm_core_v1.md` | Modify | Update task P1-001 description; add environment variable strategy |
| `Project Docs/AMS-RVM/backend_design_ams_rvm_core_v1.md` | Modify | Add `super_admin_bootstrap` table schema |
| `Project Docs/AMS-RVM/test_verification_plan_ams_rvm_core_v1.md` | Modify | Add `test_superadmin` user; add bootstrap testing section |

### Documents to be Created

| Document Path | Description |
|---------------|-------------|
| `Project Phases/README.md` | Phase folder index and governance reminders |
| `Project Phases/Phase-1-Foundation-Layer.md` | Full Phase 1 specification |
| `Project Phases/Phase-2-Core-Domain.md` | Full Phase 2 specification |
| `Project Phases/Phase-3-Workflow-Engine.md` | Full Phase 3 specification |
| `Project Phases/Phase-4-Agenda-Management.md` | Full Phase 4 specification |
| `Project Phases/Phase-5-Decision-Management.md` | Full Phase 5 specification (CRITICAL GATE) |
| `Project Phases/Phase-6-DMS-Light.md` | Full Phase 6 specification |
| `Project Phases/Phase-7-Reporting-Dashboards.md` | Full Phase 7 specification |
| `Project Phases/Phase-8-Audit-Finalization.md` | Full Phase 8 specification (SYSTEM READINESS) |

---

## PART E — GOVERNANCE COMPLIANCE

| Rule | Status |
|------|--------|
| Planning ONLY — no implementation | CONFIRMED |
| No schema/RLS/UI changes | CONFIRMED |
| No scope expansion beyond authoritative docs | CONFIRMED |
| External Supabase platform documented | PLANNED |
| Super Admin table documented as testing mechanism | PLANNED |
| Hostinger VPS acknowledged for future deployment | PLANNED |

---

## EXECUTION SUMMARY

Upon approval, the following will be created/updated:

**Modified (4 documents):**
1. `Project Docs/AMS-RVM/deployment_strategy_ams_rvm_core_v1.md`
2. `Project Docs/AMS-RVM/execution_plan_ams_rvm_core_v1.md`
3. `Project Docs/AMS-RVM/backend_design_ams_rvm_core_v1.md`
4. `Project Docs/AMS-RVM/test_verification_plan_ams_rvm_core_v1.md`

**Created (9 documents):**
1. `Project Phases/README.md`
2. `Project Phases/Phase-1-Foundation-Layer.md`
3. `Project Phases/Phase-2-Core-Domain.md`
4. `Project Phases/Phase-3-Workflow-Engine.md`
5. `Project Phases/Phase-4-Agenda-Management.md`
6. `Project Phases/Phase-5-Decision-Management.md`
7. `Project Phases/Phase-6-DMS-Light.md`
8. `Project Phases/Phase-7-Reporting-Dashboards.md`
9. `Project Phases/Phase-8-Audit-Finalization.md`

**Total: 13 documentation operations**

---

## CONFIRMATION

- **Implementation has NOT started**
- **No code, schema, RLS, or UI changes made**
- **Awaiting explicit authorization to proceed**

