# Execution Plan (Phase-Gated, Task-Level)
## AMS – RVM Core (v1)

---

## 1. Document Purpose

This document provides a **task-level breakdown** per phase for AMS – RVM Core (v1). Each task includes:
- Task ID
- Description
- Dependencies
- Acceptance Criteria
- Phase Assignment

**Source Authority:**
- All 7 authoritative documents
- Approved implementation plan

**Scope Expansion:** None. Operationalization of approved scope only.

---

## 2. Task Format

```
[TASK-XXX] Task Title
├── Description: What needs to be done
├── Dependencies: Prerequisite tasks
├── Acceptance: Measurable completion criteria
├── Estimated: Story points (1-8)
└── Phase: Assigned phase
```

---

## 3. Phase 1: Foundation Layer

### P1-001: Enable External Supabase
- **Description:** Connect to external Supabase project and configure environment
- **Dependencies:** None
- **Acceptance:** External Supabase project accessible, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured, migration folder structure created (`/supabase/migrations/`)
- **Estimated:** 2
- **Phase:** 1

### P1-001a: Environment Variable Setup
- **Description:** Configure environment variables for all environments (local, dev, staging, prod)
- **Dependencies:** P1-001
- **Acceptance:** `.env.local` template created, documentation for Hostinger VPS env vars prepared
- **Estimated:** 1
- **Phase:** 1

### P1-002: Create Identity Schema
- **Description:** Deploy `app_user`, `app_role`, `user_role` tables
- **Dependencies:** P1-001
- **Acceptance:** Tables exist, FK constraints valid, roles seeded
- **Estimated:** 2
- **Phase:** 1

### P1-003: Configure Authentication
- **Description:** Set up email/password auth flow
- **Dependencies:** P1-002
- **Acceptance:** User can sign up, sign in, sign out
- **Estimated:** 2
- **Phase:** 1

### P1-004: Create Auth Context
- **Description:** Implement AuthContext with user/role state
- **Dependencies:** P1-003
- **Acceptance:** Current user and roles accessible in React context
- **Estimated:** 2
- **Phase:** 1

### P1-005: Create RoleGuard Component
- **Description:** Implement route protection by role
- **Dependencies:** P1-004
- **Acceptance:** Unauthorized users redirected, role check functional
- **Estimated:** 2
- **Phase:** 1

### P1-006: Add RVM Menu Structure
- **Description:** Extend menu-items.ts with RVM navigation
- **Dependencies:** None
- **Acceptance:** RVM menu visible in sidebar with placeholder routes
- **Estimated:** 1
- **Phase:** 1

### P1-007: Create Placeholder Pages
- **Description:** Create stub pages for all RVM routes
- **Dependencies:** P1-006
- **Acceptance:** All RVM routes render "Coming Soon" placeholder
- **Estimated:** 1
- **Phase:** 1

### P1-008: Identity RLS Policies
- **Description:** Deploy RLS for identity tables
- **Dependencies:** P1-002
- **Acceptance:** RLS active, unauthorized access blocked at DB level
- **Estimated:** 2
- **Phase:** 1

### P1-009: Phase 1 Verification
- **Description:** Verify all Phase 1 deliverables
- **Dependencies:** P1-001 through P1-008
- **Acceptance:** Checklist complete, approval obtained
- **Estimated:** 1
- **Phase:** 1

**Phase 1 Total:** 14 points

---

## 4. Phase 2: Core Domain — Dossier & Item Management

### P2-001: Create Core Enums
- **Description:** Deploy all enum types for RVM domain
- **Dependencies:** P1-009
- **Acceptance:** All enums exist in database
- **Estimated:** 1
- **Phase:** 2

### P2-002: Create Missive Keyword Table
- **Description:** Deploy `missive_keyword` taxonomy table
- **Dependencies:** P2-001
- **Acceptance:** Table exists, sample keywords seeded
- **Estimated:** 1
- **Phase:** 2

### P2-003: Create Dossier Schema
- **Description:** Deploy `rvm_dossier` and `rvm_item` tables
- **Dependencies:** P2-002
- **Acceptance:** Tables exist, constraints enforced
- **Estimated:** 3
- **Phase:** 2

### P2-004: Dossier Number Generation
- **Description:** Implement auto-generation trigger
- **Dependencies:** P2-003
- **Acceptance:** New dossiers get unique RVM-YYYY-XXXXXX number
- **Estimated:** 1
- **Phase:** 2

### P2-005: Dossier RLS Policies
- **Description:** Deploy RLS for dossier tables
- **Dependencies:** P2-003, P1-008
- **Acceptance:** Role-based access enforced at DB level
- **Estimated:** 3
- **Phase:** 2

### P2-006: Dossier Service Layer
- **Description:** Create dossierService.ts with CRUD operations
- **Dependencies:** P2-003
- **Acceptance:** All CRUD operations functional
- **Estimated:** 2
- **Phase:** 2

### P2-007: Dossier Hooks
- **Description:** Create useDossiers and useDossier hooks
- **Dependencies:** P2-006
- **Acceptance:** React Query hooks functional
- **Estimated:** 2
- **Phase:** 2

### P2-008: Dossier List Page
- **Description:** Implement dossier list with filtering
- **Dependencies:** P2-007
- **Acceptance:** List displays, filters work, pagination functional
- **Estimated:** 3
- **Phase:** 2

### P2-009: Dossier Detail Page
- **Description:** Implement dossier detail view
- **Dependencies:** P2-007
- **Acceptance:** All dossier fields displayed, navigation works
- **Estimated:** 3
- **Phase:** 2

### P2-010: Intake Form
- **Description:** Implement dossier creation form
- **Dependencies:** P2-007
- **Acceptance:** Form validates, creates dossier, status = draft
- **Estimated:** 3
- **Phase:** 2

### P2-011: Classification Selectors
- **Description:** Implement service type and subtype dropdowns
- **Dependencies:** P2-010
- **Acceptance:** Classification enforced per requirements
- **Estimated:** 2
- **Phase:** 2

### P2-012: Status Badge Components
- **Description:** Create StatusBadge and UrgencyBadge
- **Dependencies:** None
- **Acceptance:** Badges render correctly with appropriate colors
- **Estimated:** 1
- **Phase:** 2

### P2-013: Dossier Audit Events
- **Description:** Implement audit logging for dossiers
- **Dependencies:** P2-003
- **Acceptance:** Create/update/status changes logged
- **Estimated:** 2
- **Phase:** 2

### P2-014: Phase 2 Verification
- **Description:** Verify all Phase 2 deliverables
- **Dependencies:** P2-001 through P2-013
- **Acceptance:** Checklist complete, approval obtained
- **Estimated:** 1
- **Phase:** 2

**Phase 2 Total:** 28 points

---

## 5. Phase 3: Workflow & Task Engine

### P3-001: Create Task Schema
- **Description:** Deploy `rvm_task` table
- **Dependencies:** P2-014
- **Acceptance:** Table exists, constraints enforced
- **Estimated:** 2
- **Phase:** 3

### P3-002: Task RLS Policies
- **Description:** Deploy RLS for task table
- **Dependencies:** P3-001
- **Acceptance:** Role-based access enforced
- **Estimated:** 2
- **Phase:** 3

### P3-003: Task Service Layer
- **Description:** Create taskService.ts
- **Dependencies:** P3-001
- **Acceptance:** CRUD operations functional
- **Estimated:** 2
- **Phase:** 3

### P3-004: Task Hooks
- **Description:** Create useTasks hook
- **Dependencies:** P3-003
- **Acceptance:** React Query hooks functional
- **Estimated:** 2
- **Phase:** 3

### P3-005: Task List Component
- **Description:** Implement task list per dossier
- **Dependencies:** P3-004
- **Acceptance:** Tasks display, filtering works
- **Estimated:** 2
- **Phase:** 3

### P3-006: Task Assignment Form
- **Description:** Implement task creation/assignment
- **Dependencies:** P3-004
- **Acceptance:** Tasks can be created and assigned
- **Estimated:** 2
- **Phase:** 3

### P3-007: Task Status Management
- **Description:** Implement status transitions
- **Dependencies:** P3-004
- **Acceptance:** Status changes work, validation enforced
- **Estimated:** 2
- **Phase:** 3

### P3-008: Overdue Detection
- **Description:** Implement overdue task highlighting
- **Dependencies:** P3-005
- **Acceptance:** Overdue tasks visually indicated
- **Estimated:** 1
- **Phase:** 3

### P3-009: Task Audit Events
- **Description:** Implement audit logging for tasks
- **Dependencies:** P3-001
- **Acceptance:** Task changes logged
- **Estimated:** 1
- **Phase:** 3

### P3-010: Phase 3 Verification
- **Description:** Verify all Phase 3 deliverables
- **Dependencies:** P3-001 through P3-009
- **Acceptance:** Checklist complete, approval obtained
- **Estimated:** 1
- **Phase:** 3

**Phase 3 Total:** 17 points

---

## 6. Phase 4: Agenda & Meeting Management

### P4-001: Create Meeting Schema
- **Description:** Deploy `rvm_meeting` and `rvm_agenda_item` tables
- **Dependencies:** P3-010
- **Acceptance:** Tables exist, constraints enforced
- **Estimated:** 2
- **Phase:** 4

### P4-002: Meeting RLS Policies
- **Description:** Deploy RLS for meeting tables
- **Dependencies:** P4-001
- **Acceptance:** Role-based access enforced
- **Estimated:** 2
- **Phase:** 4

### P4-003: Meeting Service Layer
- **Description:** Create meetingService.ts
- **Dependencies:** P4-001
- **Acceptance:** CRUD operations functional
- **Estimated:** 2
- **Phase:** 4

### P4-004: Meeting Hooks
- **Description:** Create useMeetings and useAgendaItems hooks
- **Dependencies:** P4-003
- **Acceptance:** React Query hooks functional
- **Estimated:** 2
- **Phase:** 4

### P4-005: Meeting List Page
- **Description:** Implement meeting list/calendar
- **Dependencies:** P4-004
- **Acceptance:** Meetings display with date filtering
- **Estimated:** 3
- **Phase:** 4

### P4-006: Meeting Detail Page
- **Description:** Implement meeting detail with agenda
- **Dependencies:** P4-004
- **Acceptance:** Meeting details and agenda items display
- **Estimated:** 3
- **Phase:** 4

### P4-007: Meeting Form
- **Description:** Implement meeting creation
- **Dependencies:** P4-004
- **Acceptance:** Meetings can be created
- **Estimated:** 2
- **Phase:** 4

### P4-008: Agenda Builder
- **Description:** Implement agenda item management
- **Dependencies:** P4-006
- **Acceptance:** Items can be added, reordered, removed
- **Estimated:** 3
- **Phase:** 4

### P4-009: Dossier-Agenda Linking
- **Description:** Implement dossier selection for agenda
- **Dependencies:** P4-008
- **Acceptance:** Dossiers can be linked to agenda items
- **Estimated:** 2
- **Phase:** 4

### P4-010: Meeting Status Transitions
- **Description:** Implement draft → published → closed
- **Dependencies:** P4-007
- **Acceptance:** Status changes enforced
- **Estimated:** 2
- **Phase:** 4

### P4-011: Phase 4 Verification
- **Description:** Verify all Phase 4 deliverables
- **Dependencies:** P4-001 through P4-010
- **Acceptance:** Checklist complete, approval obtained
- **Estimated:** 1
- **Phase:** 4

**Phase 4 Total:** 24 points

---

## 7. Phase 5: Decision Management & Chair RVM Gate

### P5-001: Create Decision Schema
- **Description:** Deploy `rvm_decision` table
- **Dependencies:** P4-011
- **Acceptance:** Table exists, constraints enforced
- **Estimated:** 2
- **Phase:** 5

### P5-002: Decision Immutability Trigger
- **Description:** Implement prevention of finalized decision updates
- **Dependencies:** P5-001
- **Acceptance:** Updates blocked when is_final = true
- **Estimated:** 2
- **Phase:** 5

### P5-003: Decision RLS Policies
- **Description:** Deploy RLS for decision table
- **Dependencies:** P5-001
- **Acceptance:** Role-based access enforced, Chair approval protected
- **Estimated:** 3
- **Phase:** 5

### P5-004: Decision Service Layer
- **Description:** Create decisionService.ts
- **Dependencies:** P5-001
- **Acceptance:** CRUD operations functional
- **Estimated:** 2
- **Phase:** 5

### P5-005: Decision Hooks
- **Description:** Create useDecisions hook
- **Dependencies:** P5-004
- **Acceptance:** React Query hooks functional
- **Estimated:** 2
- **Phase:** 5

### P5-006: Decision Panel Component
- **Description:** Implement decision view per agenda item
- **Dependencies:** P5-005
- **Acceptance:** Decision details display
- **Estimated:** 2
- **Phase:** 5

### P5-007: Decision Form
- **Description:** Implement decision creation/editing
- **Dependencies:** P5-005
- **Acceptance:** Secretary can draft decisions
- **Estimated:** 2
- **Phase:** 5

### P5-008: Chair Approval Button
- **Description:** Implement Chair RVM approval action
- **Dependencies:** P5-007
- **Acceptance:** Only Chair can approve, timestamps set
- **Estimated:** 3
- **Phase:** 5

### P5-009: Immutability UI Lock
- **Description:** Implement visual lock for finalized decisions
- **Dependencies:** P5-006
- **Acceptance:** Finalized decisions show lock, no edit controls
- **Estimated:** 1
- **Phase:** 5

### P5-010: Dossier Status Update
- **Description:** Update dossier status on decision finalization
- **Dependencies:** P5-008
- **Acceptance:** Dossier → decided after Chair approval
- **Estimated:** 2
- **Phase:** 5

### P5-011: Decision Audit Events
- **Description:** Implement audit logging for decisions
- **Dependencies:** P5-001
- **Acceptance:** All decision changes logged
- **Estimated:** 2
- **Phase:** 5

### P5-012: Chair RVM Gate Verification
- **Description:** Verify Chair approval logic
- **Dependencies:** P5-008, P5-010
- **Acceptance:** No bypass paths exist, RLS verified
- **Estimated:** 2
- **Phase:** 5

### P5-013: Phase 5 Verification
- **Description:** Verify all Phase 5 deliverables
- **Dependencies:** P5-001 through P5-012
- **Acceptance:** Checklist complete, GOVERNANCE APPROVAL obtained
- **Estimated:** 2
- **Phase:** 5

**Phase 5 Total:** 27 points (CRITICAL PHASE)

---

## 8. Phase 6: DMS-Light

### P6-001: Create Document Schema
- **Description:** Deploy `rvm_document` and `rvm_document_version` tables
- **Dependencies:** P5-013
- **Acceptance:** Tables exist, constraints enforced
- **Estimated:** 2
- **Phase:** 6

### P6-002: Configure Storage Bucket
- **Description:** Create rvm-documents bucket with policies
- **Dependencies:** P6-001
- **Acceptance:** Bucket exists, access controlled
- **Estimated:** 2
- **Phase:** 6

### P6-003: Document RLS Policies
- **Description:** Deploy RLS for document tables
- **Dependencies:** P6-001
- **Acceptance:** Role-based access enforced
- **Estimated:** 2
- **Phase:** 6

### P6-004: Document Service Layer
- **Description:** Create documentService.ts
- **Dependencies:** P6-001, P6-002
- **Acceptance:** CRUD + upload operations functional
- **Estimated:** 3
- **Phase:** 6

### P6-005: Document Hooks
- **Description:** Create useDocuments hook
- **Dependencies:** P6-004
- **Acceptance:** React Query hooks functional
- **Estimated:** 2
- **Phase:** 6

### P6-006: Document List Component
- **Description:** Implement document list per dossier
- **Dependencies:** P6-005
- **Acceptance:** Documents display with metadata
- **Estimated:** 2
- **Phase:** 6

### P6-007: Document Upload Component
- **Description:** Implement file upload with dropzone
- **Dependencies:** P6-004
- **Acceptance:** Files upload, versions created
- **Estimated:** 3
- **Phase:** 6

### P6-008: Version History Component
- **Description:** Implement version listing
- **Dependencies:** P6-006
- **Acceptance:** Version history displays
- **Estimated:** 2
- **Phase:** 6

### P6-009: Document Lock on Final Decision
- **Description:** Implement document immutability
- **Dependencies:** P6-001, P5-010
- **Acceptance:** Documents on finalized decisions locked
- **Estimated:** 2
- **Phase:** 6

### P6-010: Phase 6 Verification
- **Description:** Verify all Phase 6 deliverables
- **Dependencies:** P6-001 through P6-009
- **Acceptance:** Checklist complete, approval obtained
- **Estimated:** 1
- **Phase:** 6

**Phase 6 Total:** 21 points

---

## 9. Phase 7: Reporting & Dashboards

### P7-001: Chair Dashboard Page
- **Description:** Implement Chair RVM dashboard
- **Dependencies:** P6-010
- **Acceptance:** All widgets display correct data
- **Estimated:** 3
- **Phase:** 7

### P7-002: Secretary Dashboard Page
- **Description:** Implement Secretary RVM dashboard
- **Dependencies:** P6-010
- **Acceptance:** All widgets display correct data
- **Estimated:** 3
- **Phase:** 7

### P7-003: Decision List Generator
- **Description:** Implement decision list generation
- **Dependencies:** P5-010
- **Acceptance:** Lists generated from finalized decisions
- **Estimated:** 3
- **Phase:** 7

### P7-004: Report Preview
- **Description:** Implement report preview before generation
- **Dependencies:** P7-003
- **Acceptance:** Preview displays correctly
- **Estimated:** 2
- **Phase:** 7

### P7-005: PDF Export
- **Description:** Implement PDF generation for reports
- **Dependencies:** P7-003
- **Acceptance:** PDFs generate and download
- **Estimated:** 3
- **Phase:** 7

### P7-006: Distribution Tracking
- **Description:** Implement distribution logging
- **Dependencies:** P7-005
- **Acceptance:** Distribution events logged
- **Estimated:** 2
- **Phase:** 7

### P7-007: Phase 7 Verification
- **Description:** Verify all Phase 7 deliverables
- **Dependencies:** P7-001 through P7-006
- **Acceptance:** Checklist complete, approval obtained
- **Estimated:** 1
- **Phase:** 7

**Phase 7 Total:** 17 points

---

## 10. Phase 8: Audit & Compliance Finalization

### P8-001: Audit Log Viewer Page
- **Description:** Implement audit log viewing
- **Dependencies:** P7-007
- **Acceptance:** Logs display with filtering
- **Estimated:** 3
- **Phase:** 8

### P8-002: Entity Audit Trail Component
- **Description:** Implement per-entity audit trail
- **Dependencies:** P8-001
- **Acceptance:** Trail displays on entity detail pages
- **Estimated:** 2
- **Phase:** 8

### P8-003: Audit Coverage Verification
- **Description:** Verify all entities have audit logging
- **Dependencies:** All previous phases
- **Acceptance:** Coverage report complete
- **Estimated:** 2
- **Phase:** 8

### P8-004: Immutability Verification
- **Description:** Verify all immutability rules
- **Dependencies:** P5-012
- **Acceptance:** No bypass paths found
- **Estimated:** 2
- **Phase:** 8

### P8-005: RLS Complete Verification
- **Description:** Verify all RLS policies
- **Dependencies:** All previous phases
- **Acceptance:** No unauthorized access possible
- **Estimated:** 3
- **Phase:** 8

### P8-006: System Readiness Report
- **Description:** Generate final compliance documentation
- **Dependencies:** P8-001 through P8-005
- **Acceptance:** Report approved
- **Estimated:** 2
- **Phase:** 8

### P8-007: Phase 8 Verification
- **Description:** Final system verification
- **Dependencies:** P8-001 through P8-006
- **Acceptance:** System ready for deployment
- **Estimated:** 2
- **Phase:** 8

**Phase 8 Total:** 16 points

---

## 11. Summary

| Phase | Tasks | Points | Critical Gate |
|-------|-------|--------|---------------|
| Phase 1 | 9 | 14 | Foundation Approval |
| Phase 2 | 14 | 28 | Core Domain Approval |
| Phase 3 | 10 | 17 | Workflow Approval |
| Phase 4 | 11 | 24 | Agenda Approval |
| Phase 5 | 13 | 27 | **CHAIR RVM GATE** |
| Phase 6 | 10 | 21 | DMS Approval |
| Phase 7 | 7 | 17 | Reporting Approval |
| Phase 8 | 7 | 16 | **SYSTEM READINESS** |

**Total:** 81 tasks, 164 points

---

## 12. Document Status

**Status:** Execution Plan v1
**Source Compliance:** 100% aligned with authoritative documents
**Scope Expansion:** None
**Execution Status:** NOT STARTED (documentation only)
