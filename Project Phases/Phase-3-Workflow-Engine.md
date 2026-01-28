# Phase 3: Workflow & Task Engine
## AMS – RVM Core (v1)

---

## 1. Objective

Implement **task assignment**, **ownership tracking**, and **workflow state management** for RVM dossier processing.

---

## 2. Scope — Included

### 2.1 Task Schema
- [ ] `task_status` enum
- [ ] `task_priority` enum
- [ ] `task_type` enum
- [ ] `rvm_task` table with all constraints
- [ ] In-progress requires user constraint

### 2.2 RLS Policies (Task)
- [ ] Task read policies (role-based)
- [ ] Task create policies
- [ ] Task update policies (assignee + managers)

### 2.3 Service Layer
- [ ] `taskService.ts` with CRUD operations
- [ ] `useTasks` hook

### 2.4 UI Components
- [ ] Task list component (per dossier)
- [ ] Task assignment form
- [ ] Task status management
- [ ] Overdue detection and highlighting

### 2.5 Audit
- [ ] Task creation audit events
- [ ] Task assignment audit events
- [ ] Task status change audit events

---

## 3. Scope — Excluded

- ❌ Meeting/agenda functionality (Phase 4)
- ❌ Decision recording (Phase 5)
- ❌ Document management (Phase 6)
- ❌ Automated task creation (future enhancement)

---

## 4. Entry Criteria

- [ ] Phase 2 completed and approved
- [ ] Dossier tables deployed and functional
- [ ] Dossier RLS verified
- [ ] Explicit authorization for Phase 3 received

---

## 5. Exit Criteria

| Criterion | Verification |
|-----------|--------------|
| Task table exists | Table with correct structure |
| Task RLS active | Role-based access enforced |
| Task CRUD functional | Create, read, update working |
| Task assignment works | Users can be assigned to tasks |
| Status transitions enforced | In-progress requires assignee |
| Overdue detection works | Past-due tasks highlighted |
| Audit events logged | Task changes recorded |
| All Phase 3 tests pass | Verification checklist complete |

---

## 6. Restore Point Requirement

| Restore Point | Timing | Naming |
|---------------|--------|--------|
| Pre-Phase 3 | Before any Phase 3 work | `RP-P3-pre-YYYYMMDD` |
| Post-Phase 3 | After Phase 3 completion | `RP-P3-post-YYYYMMDD` |

---

## 7. Verification Checklist

### RLS Tests
- [ ] **RLS-TASK-001:** Read access by authorized roles
- [ ] **RLS-TASK-002:** Create access by authorized roles
- [ ] **RLS-TASK-003:** Update access by assignee and managers

### Workflow Tests
- [ ] **WF-TASK-001:** In-progress requires user — Validation error without assignee

### Audit Tests
- [ ] **AUDIT-TASK-001:** Task creation logged
- [ ] **AUDIT-TASK-002:** Task status change logged

---

## 8. Governance Gate

**Gate Name:** Workflow Approval

**Requirements:**
- All verification tests passed
- Post-phase restore point created
- Phase 3 completion report submitted
- Explicit approval for Phase 4 obtained

---

## 9. Task Breakdown

| Task ID | Description | Est. |
|---------|-------------|------|
| P3-001 | Create Task Schema | 2 |
| P3-002 | Task RLS Policies | 2 |
| P3-003 | Task Service Layer | 2 |
| P3-004 | Task Hooks | 2 |
| P3-005 | Task List Component | 2 |
| P3-006 | Task Assignment Form | 2 |
| P3-007 | Task Status Management | 2 |
| P3-008 | Overdue Detection | 1 |
| P3-009 | Task Audit Events | 1 |
| P3-010 | Phase 3 Verification | 1 |

**Total Estimated Points:** 17

---

## 10. Hard Stop Statement

**Phase 3 implementation may NOT proceed until:**
- All Phase 2 exit criteria met
- Phase 2 approval confirmed
- Explicit Phase 3 authorization received

---

**Document Status:** Planning Only — Implementation NOT Started
