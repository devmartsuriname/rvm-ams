# Master PRD (Execution-Ready)
## AMS – RVM Core (v1)

---

## 1. Document Purpose

This document expands the baseline **PRD – AMS RVM Core v1** into an **execution-ready specification** with:
- Detailed acceptance criteria per requirement
- UI specifications per functional area
- Test scenarios for verification

**Source Authority:**
- `prd_ams_rvm_core_v_1.md`
- `ams_rvm_core_scope_governance_v_1.md`
- `ams_rvm_bestuurlijke_validatievragen_definitive_short.md`

**Scope Expansion:** None. This document adds implementation detail only.

---

## 2. Functional Requirements — Detailed Specifications

### 2.1 FR-001: Intake & Registration

**Description:**  
Register incoming RVM items with mandatory classification.

**Acceptance Criteria:**
- AC-001.1: System generates unique `dossier_number` on creation
- AC-001.2: `service_type` (proposal/missive) is mandatory
- AC-001.3: If `service_type = proposal`, then `proposal_subtype` (OPA/ORAG) is mandatory
- AC-001.4: If `service_type = missive`, then `missive_keyword_id` is required
- AC-001.5: `urgency` (regular/urgent/special) is mandatory
- AC-001.6: `sender_ministry` is mandatory
- AC-001.7: Initial status is `draft` until submitted
- AC-001.8: On submission, status transitions to `registered`
- AC-001.9: Audit event logged on creation and submission

**UI Specification:**
- Intake form with classification dropdowns
- Urgency selector with visual indicators
- Document upload section (optional at intake)
- Submit button triggers validation

**Test Scenarios:**
- TS-001.1: Create dossier without service_type → validation error
- TS-001.2: Create proposal without subtype → validation error
- TS-001.3: Complete all fields and submit → status = registered
- TS-001.4: Verify audit event created

---

### 2.2 FR-002: Task Assignment

**Description:**  
Assign administrative tasks per dossier with ownership tracking.

**Acceptance Criteria:**
- AC-002.1: Task requires `assigned_role_code`
- AC-002.2: Task may optionally have `assigned_user_id`
- AC-002.3: Task must be linked to exactly one `dossier_id`
- AC-002.4: Status transitions: `todo` → `in_progress` → `done`
- AC-002.5: `in_progress` requires `assigned_user_id`
- AC-002.6: Deadline tracking via `due_at`
- AC-002.7: Audit event on status change

**UI Specification:**
- Task list view per dossier
- Assignment dropdown (role + optional user)
- Status buttons (Start/Complete)
- Overdue indicator (red highlight if past due_at)

**Test Scenarios:**
- TS-002.1: Create task without role → validation error
- TS-002.2: Move to in_progress without user → validation error
- TS-002.3: Complete task → status = done, completed_at set
- TS-002.4: Verify overdue display when past due_at

---

### 2.3 FR-003: Agenda & Meeting Preparation

**Description:**  
Create RVM meetings and build agendas from prepared dossiers.

**Acceptance Criteria:**
- AC-003.1: Meeting requires `meeting_date` and `meeting_type`
- AC-003.2: Agenda items link `meeting_id` to `dossier_id`
- AC-003.3: `agenda_number` must be unique within meeting
- AC-003.4: Dossier status must be `in_preparation` or later to be scheduled
- AC-003.5: Meeting status transitions: `draft` → `published` → `closed`
- AC-003.6: Published meeting is visible to Chair RVM

**UI Specification:**
- Meeting calendar/list view
- Agenda builder with drag-and-drop ordering
- Dossier selector (filtered by eligible status)
- Publish button (requires confirmation)

**Test Scenarios:**
- TS-003.1: Add dossier with status `draft` → blocked
- TS-003.2: Duplicate agenda_number → validation error
- TS-003.3: Publish meeting → status = published
- TS-003.4: Closed meeting cannot be modified

---

### 2.4 FR-004: Decision Management

**Description:**  
Record decisions per agenda item with Chair RVM approval gate.

**Acceptance Criteria:**
- AC-004.1: Decision linked to exactly one `agenda_item_id`
- AC-004.2: Secretary RVM can create/edit decision draft
- AC-004.3: Chair RVM can approve decision (`chair_approved_at` set)
- AC-004.4: Approval sets `is_final = true`
- AC-004.5: Final decisions are immutable (no updates permitted)
- AC-004.6: Dossier status → `decided` after decision finalized
- AC-004.7: Decision statuses: approved, deferred, rejected, pending

**UI Specification:**
- Decision form (text, status dropdown)
- Draft save button (Secretary RVM)
- Approve button (Chair RVM only)
- Final indicator (locked icon after approval)

**Test Scenarios:**
- TS-004.1: Secretary drafts decision → saved as draft
- TS-004.2: Chair approves → is_final = true, timestamp set
- TS-004.3: Attempt edit after final → blocked
- TS-004.4: Verify dossier status updated to decided

---

### 2.5 FR-005: Decision Lists & Reporting

**Description:**  
Generate official decision lists and meeting reports.

**Acceptance Criteria:**
- AC-005.1: Only finalized decisions included in decision list
- AC-005.2: Decision list grouped by meeting
- AC-005.3: Short report includes meeting metadata + decision summary
- AC-005.4: Distribution logged with recipient list
- AC-005.5: Generated documents stored in DMS-light

**UI Specification:**
- Generate Decision List button per meeting
- Report preview before generation
- Distribution form with recipient checkboxes
- Download/export options (PDF)

**Test Scenarios:**
- TS-005.1: Generate list with pending decision → decision excluded
- TS-005.2: Complete generation → document created in DMS
- TS-005.3: Distribution logged in audit

---

### 2.6 FR-006: DMS-Light (Document Management)

**Description:**  
Upload, version, and link documents to dossiers/decisions.

**Acceptance Criteria:**
- AC-006.1: Document linked to `dossier_id` (mandatory)
- AC-006.2: Optional link to `agenda_item_id` or `decision_id`
- AC-006.3: Version number auto-incremented on new upload
- AC-006.4: Confidentiality level inherited from dossier (can be elevated)
- AC-006.5: Documents on finalized decisions are locked
- AC-006.6: Version history viewable

**UI Specification:**
- Upload zone per dossier
- Document type dropdown
- Version history accordion
- Lock indicator for finalized documents

**Test Scenarios:**
- TS-006.1: Upload new version → version_number incremented
- TS-006.2: Link to finalized decision → locked status shown
- TS-006.3: Attempt upload to locked document → blocked

---

## 3. Dashboard Specifications

### 3.1 Chair RVM Dashboard

**Widgets:**
- Open Dossiers Count (status = in_preparation, scheduled)
- Urgent Matters (urgency = urgent)
- Pending Decisions (is_final = false)
- Recent Decisions (last 7 days)

**Filters:**
- Date range
- Urgency
- Service type

### 3.2 Secretary RVM Dashboard

**Widgets:**
- Bottleneck Tasks (overdue)
- Processing Time Metrics
- Task Status Distribution
- Upcoming Meetings (next 14 days)

**Filters:**
- Role assignment
- Status
- Date range

---

## 4. Non-Functional Requirements — Verification

| Requirement | Verification Method |
|-------------|---------------------|
| Data integrity | RLS enforcement + FK constraints |
| Audit readiness | audit_event coverage review |
| Role separation | RLS policy testing |
| Immutability | UPDATE policy on is_final = true |
| Extensibility | Module boundary verification |

---

## 5. Traceability Matrix

| Functional Req | PRD Section | ERD Entity | RLS Policy |
|----------------|-------------|------------|------------|
| FR-001 | 5.1 | rvm_dossier, rvm_item | rvm_dossier_policy |
| FR-002 | 5.2 | rvm_task | rvm_task_policy |
| FR-003 | 5.3 | rvm_meeting, rvm_agenda_item | rvm_meeting_policy |
| FR-004 | 5.4 | rvm_decision | rvm_decision_policy |
| FR-005 | 5.5 | rvm_document | rvm_document_policy |
| FR-006 | 6.1 | rvm_document, rvm_document_version | rvm_document_policy |

---

## 6. Document Status

**Status:** Execution-Ready PRD v1
**Source Compliance:** 100% aligned with authoritative PRD
**Scope Expansion:** None
