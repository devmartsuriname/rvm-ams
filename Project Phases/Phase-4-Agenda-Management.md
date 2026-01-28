# Phase 4: Agenda & Meeting Management
## AMS – RVM Core (v1)

---

## 1. Objective

Implement **RVM meeting preparation** and **agenda building workflows** to support the formal Council decision-making process.

---

## 2. Scope — Included

### 2.1 Meeting Schema
- [ ] `meeting_type` enum (regular, urgent, special)
- [ ] `meeting_status` enum (draft, published, closed)
- [ ] `agenda_item_status` enum (scheduled, presented, withdrawn, moved)
- [ ] `rvm_meeting` table
- [ ] `rvm_agenda_item` table with ordering constraint

### 2.2 RLS Policies (Meeting)
- [ ] Meeting read policies
- [ ] Meeting create/update policies (admin_agenda, secretary_rvm)
- [ ] Agenda item policies

### 2.3 Service Layer
- [ ] `meetingService.ts` with CRUD operations
- [ ] `useMeetings` and `useAgendaItems` hooks

### 2.4 UI Components
- [ ] Meeting list page with date filtering
- [ ] Meeting detail page with agenda
- [ ] Meeting creation form
- [ ] Agenda builder (add, reorder, remove items)
- [ ] Dossier-agenda linking selector

### 2.5 Status Transitions
- [ ] Draft → Published transition
- [ ] Published → Closed transition
- [ ] Transition validation

---

## 3. Scope — Excluded

- ❌ Decision recording (Phase 5)
- ❌ Document management (Phase 6)
- ❌ Meeting minutes generation (Phase 7)
- ❌ External notifications

---

## 4. Entry Criteria

- [ ] Phase 3 completed and approved
- [ ] Task workflow functional
- [ ] Dossier data available for linking
- [ ] Explicit authorization for Phase 4 received

---

## 5. Exit Criteria

| Criterion | Verification |
|-----------|--------------|
| Meeting tables exist | Tables with correct structure |
| Meeting RLS active | Role-based access enforced |
| Meeting CRUD functional | List, create, view, update working |
| Agenda builder works | Items can be added, reordered, removed |
| Dossier linking works | Dossiers can be attached to agenda items |
| Status transitions enforced | Draft → Published → Closed validated |
| All Phase 4 tests pass | Verification checklist complete |

---

## 6. Restore Point Requirement

| Restore Point | Timing | Naming |
|---------------|--------|--------|
| Pre-Phase 4 | Before any Phase 4 work | `RP-P4-pre-YYYYMMDD` |
| Post-Phase 4 | After Phase 4 completion | `RP-P4-post-YYYYMMDD` |

---

## 7. Verification Checklist

### RLS Tests
- [ ] **RLS-MEETING-001:** Read access by authorized roles
- [ ] **RLS-MEETING-002:** Create/update access by admin_agenda, secretary_rvm

### Workflow Tests
- [ ] **WF-MEETING-001:** Publish transition — Status changes, Chair can view

### UI Tests
- [ ] **UI-MEETING-001:** Meeting list displays correctly
- [ ] **UI-MEETING-002:** Agenda builder functions correctly

---

## 8. Governance Gate

**Gate Name:** Agenda Approval

**Requirements:**
- All verification tests passed
- Post-phase restore point created
- Phase 4 completion report submitted
- Explicit approval for Phase 5 obtained

---

## 9. Task Breakdown

| Task ID | Description | Est. |
|---------|-------------|------|
| P4-001 | Create Meeting Schema | 2 |
| P4-002 | Meeting RLS Policies | 2 |
| P4-003 | Meeting Service Layer | 2 |
| P4-004 | Meeting Hooks | 2 |
| P4-005 | Meeting List Page | 3 |
| P4-006 | Meeting Detail Page | 3 |
| P4-007 | Meeting Form | 2 |
| P4-008 | Agenda Builder | 3 |
| P4-009 | Dossier-Agenda Linking | 2 |
| P4-010 | Meeting Status Transitions | 2 |
| P4-011 | Phase 4 Verification | 1 |

**Total Estimated Points:** 24

---

## 10. Hard Stop Statement

**Phase 4 implementation may NOT proceed until:**
- All Phase 3 exit criteria met
- Phase 3 approval confirmed
- Explicit Phase 4 authorization received

---

**Document Status:** Planning Only — Implementation NOT Started
