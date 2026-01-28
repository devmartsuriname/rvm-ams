# Master Tasks Register — AMS–RVM Core (v1)

> **⚠️ DERIVED DOCUMENT**
>
> This document consolidates all tasks defined in Phase 1–8 documents.
> It contains NO new tasks and NO re-sequencing.
>
> Source: `execution_plan_ams_rvm_core_v1.md` and Phase documents.

---

## 1. Summary by Phase

| Phase | Name | Tasks | Points | Gate | Status |
|-------|------|-------|--------|------|--------|
| 1 | Foundation Layer | 10 | 16 | Foundation Approval | Planned |
| 2 | Core Domain | 14 | 28 | Core Domain Approval | Future Phase |
| 3 | Workflow Engine | 10 | 17 | Workflow Approval | Future Phase |
| 4 | Agenda Management | 11 | 24 | Agenda Approval | Future Phase |
| 5 | Decision Management | 13 | 27 | **Chair RVM Gate** | Future Phase |
| 6 | DMS-Light | 10 | 20 | DMS Approval | Future Phase |
| 7 | Reporting & Dashboards | 8 | 18 | Reporting Approval | Future Phase |
| 8 | Audit Finalization | 11 | 25 | **System Readiness** | Future Phase |

**Total:** 81 tasks, 164 points (document estimate) / 175 points (phase sum)

---

## 2. Complete Task Register

### Phase 1: Foundation Layer (16 points)

| Task ID | Task Name | Est. | Reference |
|---------|-----------|------|-----------|
| P1-001 | Enable External Supabase | 2 | Phase-1-Foundation-Layer.md |
| P1-001a | Environment Variable Setup | 1 | Phase-1-Foundation-Layer.md |
| P1-002 | Create Identity Schema | 2 | Phase-1-Foundation-Layer.md |
| P1-003 | Configure Authentication | 2 | Phase-1-Foundation-Layer.md |
| P1-004 | Create Auth Context | 2 | Phase-1-Foundation-Layer.md |
| P1-005 | Create RoleGuard Component | 2 | Phase-1-Foundation-Layer.md |
| P1-006 | Add RVM Menu Structure | 1 | Phase-1-Foundation-Layer.md |
| P1-007 | Create Placeholder Pages | 1 | Phase-1-Foundation-Layer.md |
| P1-008 | Identity RLS Policies | 2 | Phase-1-Foundation-Layer.md |
| P1-009 | Phase 1 Verification | 1 | Phase-1-Foundation-Layer.md |

---

### Phase 2: Core Domain (28 points)

| Task ID | Task Name | Est. | Reference |
|---------|-----------|------|-----------|
| P2-001 | Create Core Enums | 1 | Phase-2-Core-Domain.md |
| P2-002 | Create Missive Keyword Table | 1 | Phase-2-Core-Domain.md |
| P2-003 | Create Dossier Schema | 3 | Phase-2-Core-Domain.md |
| P2-004 | Dossier Number Generation | 1 | Phase-2-Core-Domain.md |
| P2-005 | Dossier RLS Policies | 3 | Phase-2-Core-Domain.md |
| P2-006 | Dossier Service Layer | 2 | Phase-2-Core-Domain.md |
| P2-007 | Dossier Hooks | 2 | Phase-2-Core-Domain.md |
| P2-008 | Dossier List Page | 3 | Phase-2-Core-Domain.md |
| P2-009 | Dossier Detail Page | 3 | Phase-2-Core-Domain.md |
| P2-010 | Intake Form | 3 | Phase-2-Core-Domain.md |
| P2-011 | Classification Selectors | 2 | Phase-2-Core-Domain.md |
| P2-012 | Status Badge Components | 1 | Phase-2-Core-Domain.md |
| P2-013 | Dossier Audit Events | 2 | Phase-2-Core-Domain.md |
| P2-014 | Phase 2 Verification | 1 | Phase-2-Core-Domain.md |

---

### Phase 3: Workflow Engine (17 points)

| Task ID | Task Name | Est. | Reference |
|---------|-----------|------|-----------|
| P3-001 | Create Task Schema | 2 | Phase-3-Workflow-Engine.md |
| P3-002 | Task RLS Policies | 2 | Phase-3-Workflow-Engine.md |
| P3-003 | Task Service Layer | 2 | Phase-3-Workflow-Engine.md |
| P3-004 | Task Hooks | 2 | Phase-3-Workflow-Engine.md |
| P3-005 | Task List Component | 2 | Phase-3-Workflow-Engine.md |
| P3-006 | Task Assignment Form | 2 | Phase-3-Workflow-Engine.md |
| P3-007 | Task Status Management | 2 | Phase-3-Workflow-Engine.md |
| P3-008 | Overdue Detection | 1 | Phase-3-Workflow-Engine.md |
| P3-009 | Task Audit Events | 1 | Phase-3-Workflow-Engine.md |
| P3-010 | Phase 3 Verification | 1 | Phase-3-Workflow-Engine.md |

---

### Phase 4: Agenda Management (24 points)

| Task ID | Task Name | Est. | Reference |
|---------|-----------|------|-----------|
| P4-001 | Create Meeting Schema | 2 | Phase-4-Agenda-Management.md |
| P4-002 | Meeting RLS Policies | 2 | Phase-4-Agenda-Management.md |
| P4-003 | Meeting Service Layer | 2 | Phase-4-Agenda-Management.md |
| P4-004 | Meeting Hooks | 2 | Phase-4-Agenda-Management.md |
| P4-005 | Meeting List Page | 3 | Phase-4-Agenda-Management.md |
| P4-006 | Meeting Detail Page | 3 | Phase-4-Agenda-Management.md |
| P4-007 | Meeting Form | 2 | Phase-4-Agenda-Management.md |
| P4-008 | Agenda Builder | 3 | Phase-4-Agenda-Management.md |
| P4-009 | Dossier-Agenda Linking | 2 | Phase-4-Agenda-Management.md |
| P4-010 | Meeting Status Transitions | 2 | Phase-4-Agenda-Management.md |
| P4-011 | Phase 4 Verification | 1 | Phase-4-Agenda-Management.md |

---

### Phase 5: Decision Management & Chair RVM Gate (27 points) — CRITICAL

| Task ID | Task Name | Est. | Critical | Reference |
|---------|-----------|------|----------|-----------|
| P5-001 | Create Decision Schema | 2 | | Phase-5-Decision-Management.md |
| P5-002 | Decision Immutability Trigger | 2 | ⚠️ | Phase-5-Decision-Management.md |
| P5-003 | Decision RLS Policies | 3 | ⚠️ | Phase-5-Decision-Management.md |
| P5-004 | Decision Service Layer | 2 | | Phase-5-Decision-Management.md |
| P5-005 | Decision Hooks | 2 | | Phase-5-Decision-Management.md |
| P5-006 | Decision Panel Component | 2 | | Phase-5-Decision-Management.md |
| P5-007 | Decision Form | 2 | | Phase-5-Decision-Management.md |
| P5-008 | Chair Approval Button | 3 | ⚠️ | Phase-5-Decision-Management.md |
| P5-009 | Immutability UI Lock | 1 | | Phase-5-Decision-Management.md |
| P5-010 | Dossier Status Update | 2 | | Phase-5-Decision-Management.md |
| P5-011 | Decision Audit Events | 2 | ⚠️ | Phase-5-Decision-Management.md |
| P5-012 | Chair RVM Gate Verification | 2 | ⚠️ | Phase-5-Decision-Management.md |
| P5-013 | Phase 5 Verification | 2 | ⚠️ | Phase-5-Decision-Management.md |

---

### Phase 6: DMS-Light (20 points)

| Task ID | Task Name | Est. | Reference |
|---------|-----------|------|-----------|
| P6-001 | Create Document Schema | 2 | Phase-6-DMS-Light.md |
| P6-002 | Configure Storage Bucket | 2 | Phase-6-DMS-Light.md |
| P6-003 | Document RLS Policies | 2 | Phase-6-DMS-Light.md |
| P6-004 | Document Service Layer | 3 | Phase-6-DMS-Light.md |
| P6-005 | Document Hooks | 2 | Phase-6-DMS-Light.md |
| P6-006 | Document List Component | 2 | Phase-6-DMS-Light.md |
| P6-007 | Document Upload Form | 2 | Phase-6-DMS-Light.md |
| P6-008 | Version History Viewer | 2 | Phase-6-DMS-Light.md |
| P6-009 | Document Lock on Finalization | 2 | Phase-6-DMS-Light.md |
| P6-010 | Phase 6 Verification | 1 | Phase-6-DMS-Light.md |

---

### Phase 7: Reporting & Dashboards (18 points)

| Task ID | Task Name | Est. | Reference |
|---------|-----------|------|-----------|
| P7-001 | Chair RVM Dashboard | 3 | Phase-7-Reporting-Dashboards.md |
| P7-002 | Secretary RVM Dashboard | 3 | Phase-7-Reporting-Dashboards.md |
| P7-003 | Decision List Query | 2 | Phase-7-Reporting-Dashboards.md |
| P7-004 | Decision List Preview | 2 | Phase-7-Reporting-Dashboards.md |
| P7-005 | PDF Export | 3 | Phase-7-Reporting-Dashboards.md |
| P7-006 | Meeting Summary Report | 2 | Phase-7-Reporting-Dashboards.md |
| P7-007 | Distribution Tracking | 2 | Phase-7-Reporting-Dashboards.md |
| P7-008 | Phase 7 Verification | 1 | Phase-7-Reporting-Dashboards.md |

---

### Phase 8: Audit Finalization (25 points) — SYSTEM READINESS

| Task ID | Task Name | Est. | Critical | Reference |
|---------|-----------|------|----------|-----------|
| P8-001 | Audit Log Viewer | 3 | | Phase-8-Audit-Finalization.md |
| P8-002 | Entity Audit Trail Component | 2 | | Phase-8-Audit-Finalization.md |
| P8-003 | Audit Coverage Verification | 2 | ⚠️ | Phase-8-Audit-Finalization.md |
| P8-004 | Audit Immutability Verification | 2 | ⚠️ | Phase-8-Audit-Finalization.md |
| P8-005 | Decision Immutability Re-verification | 2 | ⚠️ | Phase-8-Audit-Finalization.md |
| P8-006 | Chair RVM Gate Re-verification | 2 | ⚠️ | Phase-8-Audit-Finalization.md |
| P8-007 | RLS Complete Verification | 3 | ⚠️ | Phase-8-Audit-Finalization.md |
| P8-008 | Performance Baseline Testing | 2 | | Phase-8-Audit-Finalization.md |
| P8-009 | Compliance Documentation | 3 | | Phase-8-Audit-Finalization.md |
| P8-010 | System Readiness Report | 2 | ⚠️ | Phase-8-Audit-Finalization.md |
| P8-011 | Phase 8 Verification | 2 | ⚠️ | Phase-8-Audit-Finalization.md |

---

## 3. Critical Tasks Summary

The following tasks are marked as **CRITICAL** for governance compliance:

| Phase | Task ID | Task Name | Why Critical |
|-------|---------|-----------|--------------|
| 5 | P5-002 | Decision Immutability Trigger | Prevents modification of finalized decisions |
| 5 | P5-003 | Decision RLS Policies | Protects Chair approval authority |
| 5 | P5-008 | Chair Approval Button | Core governance control |
| 5 | P5-011 | Decision Audit Events | Legal traceability |
| 5 | P5-012 | Chair RVM Gate Verification | Governance gate |
| 5 | P5-013 | Phase 5 Verification | Critical phase completion |
| 8 | P8-003 | Audit Coverage Verification | Compliance requirement |
| 8 | P8-004 | Audit Immutability Verification | Legal requirement |
| 8 | P8-005 | Decision Immutability Re-verification | Regression check |
| 8 | P8-006 | Chair RVM Gate Re-verification | Regression check |
| 8 | P8-007 | RLS Complete Verification | Security verification |
| 8 | P8-010 | System Readiness Report | Final approval gate |
| 8 | P8-011 | Phase 8 Verification | Production readiness |

---

## 4. Status Legend

| Status | Meaning |
|--------|---------|
| Planned | Ready for implementation when phase is authorized |
| Future Phase | Not yet authorized, awaiting previous phase completion |
| In Progress | Currently being implemented |
| Done | Completed and verified |

---

## 5. Source Reference

All task definitions are derived from:

| Document | Location |
|----------|----------|
| execution_plan_ams_rvm_core_v1.md | /Project Docs/AMS-RVM/ |
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
