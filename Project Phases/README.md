# Project Phases — AMS–RVM Core (v1)

## Overview

This folder contains **phase-specific planning documents** for the AMS–RVM Core (v1) implementation.

Each phase document defines:
- Objective
- In-scope / Out-of-scope
- Entry / Exit criteria
- Restore point requirements
- Verification checklist
- Governance gates
- Hard stop statement

---

## Phase Index

| Phase | Document | Focus | Gate |
|-------|----------|-------|------|
| 1 | [Phase-1-Foundation-Layer.md](Phase-1-Foundation-Layer.md) | Backend, Auth, Identity | Foundation |
| 2 | [Phase-2-Core-Domain.md](Phase-2-Core-Domain.md) | Dossier & Item Management | Core Domain |
| 3 | [Phase-3-Workflow-Engine.md](Phase-3-Workflow-Engine.md) | Task & Workflow | Workflow |
| 4 | [Phase-4-Agenda-Management.md](Phase-4-Agenda-Management.md) | Meetings & Agenda | Agenda |
| 5 | [Phase-5-Decision-Management.md](Phase-5-Decision-Management.md) | Decisions & Chair RVM Gate | **CRITICAL** |
| 6 | [Phase-6-DMS-Light.md](Phase-6-DMS-Light.md) | Document Management | DMS |
| 7 | [Phase-7-Reporting-Dashboards.md](Phase-7-Reporting-Dashboards.md) | Reports & Dashboards | Reporting |
| 8 | [Phase-8-Audit-Finalization.md](Phase-8-Audit-Finalization.md) | Audit & Compliance | **SYSTEM READINESS** |

---

## Governance Rules

### Execution Model
- **Documentation-first, phase-gated execution**
- No phase may proceed without explicit authorization
- No implementation beyond current authorized phase

### Phase Discipline
1. Complete all tasks in current phase
2. Pass all verification tests
3. Create post-phase restore point
4. Obtain phase approval
5. Await authorization for next phase

### Change Control
- Any scope changes require governance approval
- Changes documented in `/Project Docs/AMS-RVM/change_control_registry_ams_rvm_core_v1.md`

### Restore Points
- **Pre-phase:** Before starting any phase work
- **Post-phase:** After phase completion and verification
- Naming: `RP-PX-[pre|post]-YYYYMMDD`

---

## Platform Configuration

| Setting | Value |
|---------|-------|
| **Backend** | External Supabase (managed project) |
| **Deployment Target** | Hostinger VPS (future, not current scope) |
| **Migration Discipline** | Versioned SQL in `/supabase/migrations/` |

---

## Document Status

**Status:** Phase Planning Documents — v1
**Implementation Status:** NOT STARTED
**Current Authorized Phase:** None (awaiting Phase 1 authorization)
