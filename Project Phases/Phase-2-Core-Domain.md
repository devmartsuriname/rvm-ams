# Phase 2: Core Domain — Dossier & Item Management
## AMS – RVM Core (v1)

---

## 1. Objective

Implement the **RVM dossier lifecycle**, **item classification**, and **intake workflow** that forms the core data model for all RVM operations.

---

## 2. Scope — Included

### 2.1 Enum Definitions
- [ ] `service_type` enum (proposal, missive)
- [ ] `proposal_subtype` enum (OPA, ORAG)
- [ ] `urgency_level` enum (regular, urgent, special)
- [ ] `dossier_status` enum (draft, registered, in_preparation, scheduled, decided, archived, cancelled)
- [ ] `confidentiality_level` enum

### 2.2 Taxonomy
- [ ] `missive_keyword` table
- [ ] Sample keyword data seeding

### 2.3 Core Domain Tables
- [ ] `rvm_dossier` table with all constraints
- [ ] `rvm_item` table
- [ ] Dossier number generation sequence and trigger
- [ ] Classification enforcement constraints

### 2.4 RLS Policies (Dossier)
- [ ] Dossier read policies (all RVM roles)
- [ ] Dossier create policies (admin_intake only)
- [ ] Dossier update policies (secretary_rvm, admin_dossier)

### 2.5 Service Layer
- [ ] `dossierService.ts` with CRUD operations
- [ ] `useDossiers` and `useDossier` hooks

### 2.6 UI Components
- [ ] Dossier list page with filtering
- [ ] Dossier detail page
- [ ] Intake form (dossier creation)
- [ ] Classification selectors (service type, subtype)
- [ ] `StatusBadge` and `UrgencyBadge` components

### 2.7 Audit
- [ ] Dossier creation audit events
- [ ] Dossier update audit events
- [ ] Status change audit events

---

## 3. Scope — Excluded

- ❌ Task management (Phase 3)
- ❌ Meeting/agenda functionality (Phase 4)
- ❌ Decision recording (Phase 5)
- ❌ Document management (Phase 6)
- ❌ Reporting/dashboards (Phase 7)

---

## 4. Entry Criteria

- [ ] Phase 1 completed and approved
- [ ] Identity tables deployed and RLS active
- [ ] Authentication functional
- [ ] AuthContext and RoleGuard working
- [ ] Explicit authorization for Phase 2 received

---

## 5. Exit Criteria

| Criterion | Verification |
|-----------|--------------|
| All enums deployed | Enums exist in database |
| Dossier tables exist | Tables with correct structure |
| Dossier number generation works | New dossiers get unique RVM-YYYY-XXXXXX |
| Classification enforced | Proposal requires subtype, missive requires keyword |
| Dossier RLS active | Role-based access enforced at DB level |
| Dossier CRUD functional | List, create, view, update working |
| Audit events logged | Create/update/status changes recorded |
| All Phase 2 tests pass | Verification checklist complete |

---

## 6. Restore Point Requirement

| Restore Point | Timing | Naming |
|---------------|--------|--------|
| Pre-Phase 2 | Before any Phase 2 work | `RP-P2-pre-YYYYMMDD` |
| Post-Phase 2 | After Phase 2 completion | `RP-P2-post-YYYYMMDD` |

---

## 7. Verification Checklist

### RLS Tests (from Test & Verification Plan)
- [ ] **RLS-DOSSIER-001:** Read access — All authorized roles can read dossiers
- [ ] **RLS-DOSSIER-002:** Create access — Only admin_intake can create
- [ ] **RLS-DOSSIER-003:** Update access — Only secretary_rvm, admin_dossier can update (not after decided)

### Workflow Tests
- [ ] **WF-INTAKE-001:** Classification enforcement — Proposal without subtype rejected
- [ ] **WF-INTAKE-002:** Dossier number generation — Unique format RVM-YYYY-XXXXXX

### Audit Tests
- [ ] **AUDIT-COV-001:** Dossier creation logged
- [ ] **AUDIT-COV-002:** Status change logged

---

## 8. Governance Gate

**Gate Name:** Core Domain Approval

**Requirements:**
- All verification tests passed
- Post-phase restore point created
- Phase 2 completion report submitted
- Explicit approval for Phase 3 obtained

---

## 9. Task Breakdown

| Task ID | Description | Est. |
|---------|-------------|------|
| P2-001 | Create Core Enums | 1 |
| P2-002 | Create Missive Keyword Table | 1 |
| P2-003 | Create Dossier Schema | 3 |
| P2-004 | Dossier Number Generation | 1 |
| P2-005 | Dossier RLS Policies | 3 |
| P2-006 | Dossier Service Layer | 2 |
| P2-007 | Dossier Hooks | 2 |
| P2-008 | Dossier List Page | 3 |
| P2-009 | Dossier Detail Page | 3 |
| P2-010 | Intake Form | 3 |
| P2-011 | Classification Selectors | 2 |
| P2-012 | Status Badge Components | 1 |
| P2-013 | Dossier Audit Events | 2 |
| P2-014 | Phase 2 Verification | 1 |

**Total Estimated Points:** 28

---

## 10. Hard Stop Statement

**Phase 2 implementation may NOT proceed until:**
- All Phase 1 exit criteria met
- Phase 1 approval confirmed
- Explicit Phase 2 authorization received

---

**Document Status:** Planning Only — Implementation NOT Started
