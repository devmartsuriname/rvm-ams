# Master PRD — AMS–RVM Core (v1)

> **⚠️ DERIVED DOCUMENT**
>
> This document is DERIVED from the authoritative Phase Documents (Phase 1–8) and source PRD.
> In case of conflict, **Phase Documents prevail**.
>
> This document is for **executive overview only** and does not authorize implementation.

---

## 1. Project Summary

**Product Name:** AMS – RVM Core (v1)

**Description:** AMS – RVM Core is a governance-driven workflow and document management system designed exclusively for the Council of Ministers (Raad van Ministers – RVM). The system supports controlled intake, formal agenda preparation, legally traceable decision registration, RVM-supporting document management (DMS-light), and audit compliance.

**Boundary:** RVM-only. No other Cabinet departments, VP-general roles, or external systems are included in v1.

---

## 2. Scope Definition

### 2.1 In Scope (v1)

**Processes:**
- RVM intake and registration
- Agenda preparation and meeting management
- Decision recording per agenda item
- Decision list and short report generation
- Post-decision processing and archiving

**RVM Service Types:**
- **Council Proposals**
  - OPA: General Affairs / Personnel Affairs
  - ORAG: Procurement & Awarding
- **Missives**

**Supporting Modules:**
- Task assignment for RVM administrative staff
- RVM-supporting Document Management (DMS-light)
- Reporting and dashboards

### 2.2 Explicitly Out of Scope (v1)

- VP role as Vice President (only Chair of RVM exists)
- Other Cabinet departments or directorates
- Cabinet-wide or generic DMS
- Policy execution after RVM decision
- External publication or communication modules
- External integrations (except planning)

---

## 3. Phase Overview

| Phase | Name | Focus | Est. Points | Gate |
|-------|------|-------|-------------|------|
| 1 | Foundation Layer | Backend, Auth, Identity | 16 | Foundation Approval |
| 2 | Core Domain | Dossier & Item Management | 28 | Core Domain Approval |
| 3 | Workflow Engine | Task & Workflow | 17 | Workflow Approval |
| 4 | Agenda Management | Meetings & Agenda | 24 | Agenda Approval |
| 5 | Decision Management | Decisions & Chair RVM Gate | 27 | **CRITICAL GATE** |
| 6 | DMS-Light | Document Management | 20 | DMS Approval |
| 7 | Reporting & Dashboards | Reports & Dashboards | 18 | Reporting Approval |
| 8 | Audit Finalization | Audit & Compliance | 25 | **SYSTEM READINESS** |

**Total:** 81 tasks, 164–175 points

---

## 4. Critical Governance Gates

### 4.1 Phase 5: Chair RVM Gate (CRITICAL)

This is the **most critical governance gate** in the system:

- **Chair RVM approval workflow** must be fully functional
- **Decision immutability** must be enforced
- **No RVM item may exit the system** without explicit Chair approval
- Extended verification and security review mandatory
- No bypass paths permitted

**Exit Requirements:**
- All Chair RVM gate tests passed (GATE-001 through GATE-005)
- All immutability tests passed (IMMUTABLE-001 through IMMUTABLE-004)
- All RLS decision tests passed
- Security review completed
- Governance approval explicitly obtained

### 4.2 Phase 8: System Readiness Gate (FINAL)

This is the **final gate before production deployment**:

- Full audit logging verification
- Complete immutability verification
- Chair RVM Gate re-verification (no regressions)
- Full RLS test suite execution
- Compliance documentation complete
- Production-ready restore point created

---

## 5. User Roles

| Role | Primary Responsibility |
|------|------------------------|
| Chair RVM | Decision approval authority |
| Secretary RVM | Full operational authority |
| Deputy Secretary / Coordinator | Secretariat support |
| Admin Intake | Item registration |
| Admin Dossier | Dossier management |
| Admin Agenda | Meeting & agenda preparation |
| Admin Reporting | Decision list generation |
| Audit Readonly | Read-only access for audit |
| RVM Sys Admin | System administration |

All roles are custom RVM roles. No role inheritance.

---

## 6. Governance Rules

### 6.1 Execution Model

- **Documentation-first, phase-gated execution**
- No phase may proceed without explicit authorization
- No implementation beyond current authorized phase

### 6.2 Phase Discipline

1. Complete all tasks in current phase
2. Pass all verification tests
3. Create post-phase restore point
4. Obtain phase approval
5. Await authorization for next phase

### 6.3 Change Control

- Any scope changes require governance approval
- Changes documented in `change_control_registry_ams_rvm_core_v1.md`

### 6.4 Restore Points

- **Pre-phase:** Before starting any phase work
- **Post-phase:** After phase completion and verification
- Naming convention: `RP-PX-[pre|post]-YYYYMMDD`

---

## 7. Platform & Deployment Summary

| Setting | Value |
|---------|-------|
| **Frontend** | React 18+ (Vite), Darkone Admin Template |
| **Backend** | External Supabase (managed Supabase project) |
| **Database** | PostgreSQL via Supabase |
| **Authentication** | Supabase Auth (email/password) |
| **Deployment Target** | Hostinger VPS (future, not current scope) |
| **Migration Discipline** | Versioned SQL in `/supabase/migrations/` |

---

## 8. Success Criteria

- 100% traceability of RVM decisions
- No RVM item exits without Chair approval
- Measurable reduction in processing delays
- Clear audit and reporting capabilities
- Full compliance with governance requirements

---

## 9. Source Documents

This Master PRD is derived from:

| Document | Location |
|----------|----------|
| prd_ams_rvm_core_v_1.md | /Project Docs/AMS-RVM/ |
| Phase-1-Foundation-Layer.md | /Project Phases/ |
| Phase-2-Core-Domain.md | /Project Phases/ |
| Phase-3-Workflow-Engine.md | /Project Phases/ |
| Phase-4-Agenda-Management.md | /Project Phases/ |
| Phase-5-Decision-Management.md | /Project Phases/ |
| Phase-6-DMS-Light.md | /Project Phases/ |
| Phase-7-Reporting-Dashboards.md | /Project Phases/ |
| Phase-8-Audit-Finalization.md | /Project Phases/ |

---

**Document Status:** Derived Document — Non-Authoritative
**Implementation Status:** NOT STARTED
**Current Authorized Phase:** None (awaiting Phase 1 authorization)
