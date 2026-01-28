# Test & Verification Plan
## AMS – RVM Core (v1)

---

## 1. Document Purpose

This document defines **test scenarios** for verifying:
- RLS policy enforcement
- Chair RVM gate functionality
- Decision immutability
- Audit completeness

**Source Authority:**
- `rls_role_matrix_ams_rvm_core_v_1.md`
- `workflow_diagrams_ams_rvm_core_v_1.md`
- `erd_ams_rvm_core_v_1.md`

**Scope Expansion:** None. Verification mechanism for authoritative requirements.

---

## 2. Test Strategy

### 2.1 Test Levels

| Level | Purpose | Timing |
|-------|---------|--------|
| Unit | Component logic | During development |
| Integration | Service + database | Per feature |
| RLS | Security policies | Per phase |
| End-to-End | Full workflows | Per phase |
| Acceptance | User requirements | Phase completion |

### 2.2 Test Environments

| Environment | Use |
|-------------|-----|
| Test | All testing activities |
| Live | Post-deployment verification only |

### 2.3 Test Data Strategy

- Dedicated test users per role
- Representative dossier samples
- Edge case data sets
- Performance test volumes

---

## 3. RLS Verification Tests

### 3.1 Test User Setup

| User | Role(s) | Purpose |
|------|---------|---------|
| test_chair | chair_rvm | Chair RVM testing |
| test_secretary | secretary_rvm | Secretary testing |
| test_deputy | deputy_secretary | Deputy testing |
| test_intake | admin_intake | Intake testing |
| test_dossier | admin_dossier | Dossier management testing |
| test_agenda | admin_agenda | Agenda testing |
| test_reporting | admin_reporting | Reporting testing |
| test_audit | audit_readonly | Audit access testing |
| test_sysadmin | rvm_sys_admin | Admin testing |
| test_none | (no roles) | Unauthorized testing |
| **test_superadmin** | **(super_admin_bootstrap)** | **Full-rights bootstrap testing** |

### 3.2 Super Admin Bootstrap Testing

**Purpose:** The `test_superadmin` user is registered in the `super_admin_bootstrap` table (NOT in `user_role`) to enable full-access verification runs during development and testing phases.

**Usage Rules:**
- Used ONLY for verification and debugging in Test environment
- NEVER used for actual business operations
- All actions still logged in `audit_event`
- Cannot bypass Chair RVM approval governance logic (governance rule enforced)

**Bootstrap Verification Tests:**

| Test ID | Description | Expected |
|---------|-------------|----------|
| BOOTSTRAP-001 | Super admin can read all tables | Full read access in Test |
| BOOTSTRAP-002 | Super admin actions are logged | All operations appear in audit_event |
| BOOTSTRAP-003 | Super admin cannot bypass Chair approval | Chair RVM gate still enforced |
| BOOTSTRAP-004 | Super admin inactive in production | is_active = false OR table not present |
| BOOTSTRAP-005 | Expired super admin blocked | Access denied after expires_at |

### 3.2 Dossier RLS Tests

#### RLS-DOSSIER-001: Read Access
| Role | Expected | Test |
|------|----------|------|
| chair_rvm | All dossiers visible | ✓ |
| secretary_rvm | All dossiers visible | ✓ |
| admin_intake | All dossiers visible | ✓ |
| audit_readonly | All dossiers visible | ✓ |
| test_none | No dossiers visible | ✓ |

#### RLS-DOSSIER-002: Create Access
| Role | Expected | Test |
|------|----------|------|
| admin_intake | Can create | ✓ |
| secretary_rvm | Cannot create | ✓ |
| chair_rvm | Cannot create | ✓ |
| test_none | Cannot create | ✓ |

#### RLS-DOSSIER-003: Update Access
| Role | Dossier Status | Expected | Test |
|------|----------------|----------|------|
| admin_dossier | draft | Can update | ✓ |
| admin_dossier | decided | Cannot update | ✓ |
| secretary_rvm | in_preparation | Can update | ✓ |
| chair_rvm | Any | Limited update only | ✓ |

### 3.3 Decision RLS Tests

#### RLS-DECISION-001: Read Access
| Role | Expected | Test |
|------|----------|------|
| chair_rvm | All decisions visible | ✓ |
| secretary_rvm | All decisions visible | ✓ |
| admin_reporting | All decisions visible | ✓ |
| audit_readonly | All decisions visible | ✓ |
| admin_intake | No access | ✓ |

#### RLS-DECISION-002: Create Access
| Role | Expected | Test |
|------|----------|------|
| secretary_rvm | Can create draft | ✓ |
| admin_reporting | Can create draft | ✓ |
| chair_rvm | Cannot create | ✓ |
| test_none | Cannot create | ✓ |

#### RLS-DECISION-003: Approval Access
| Role | Expected | Test |
|------|----------|------|
| chair_rvm | Can set chair_approved_at | ✓ |
| secretary_rvm | Cannot set chair_approved_at | ✓ |
| admin_reporting | Cannot set chair_approved_at | ✓ |

#### RLS-DECISION-004: Final Decision Access
| Role | is_final | Expected | Test |
|------|----------|----------|------|
| Any | true | Cannot update | ✓ |
| chair_rvm | true | Cannot update | ✓ |
| secretary_rvm | true | Cannot update | ✓ |

### 3.4 Audit RLS Tests

#### RLS-AUDIT-001: Read Access
| Role | Expected | Test |
|------|----------|------|
| audit_readonly | All events visible | ✓ |
| secretary_rvm | All events visible | ✓ |
| rvm_sys_admin | All events visible | ✓ |
| chair_rvm | Limited access | ✓ |
| admin_* | No access | ✓ |

#### RLS-AUDIT-002: Write Access
| Role | Expected | Test |
|------|----------|------|
| Any | Cannot insert directly | ✓ |
| Any | Cannot update | ✓ |
| Any | Cannot delete | ✓ |

---

## 4. Chair RVM Gate Tests

### 4.1 Approval Flow Tests

#### GATE-001: Decision Draft Without Approval
- **Precondition:** Decision exists with is_final = false
- **Action:** Secretary attempts to set is_final = true without chair_approved_at
- **Expected:** Operation blocked
- **Verification:** Database constraint or trigger error

#### GATE-002: Chair Approval Sets Timestamp
- **Precondition:** Decision exists with is_final = false
- **Action:** Chair RVM approves decision
- **Expected:** chair_approved_at set to current timestamp, chair_approved_by set to Chair user ID
- **Verification:** Query decision record

#### GATE-003: Approval Enables Finalization
- **Precondition:** Decision has chair_approved_at set
- **Action:** System sets is_final = true
- **Expected:** Operation succeeds
- **Verification:** is_final = true in database

#### GATE-004: Non-Chair Cannot Approve
- **Precondition:** Decision exists with is_final = false
- **Action:** Secretary attempts to set chair_approved_at
- **Expected:** RLS blocks operation
- **Verification:** Error returned, no change in database

#### GATE-005: Dossier Status Update on Finalization
- **Precondition:** Decision finalized
- **Action:** Automatic trigger
- **Expected:** Linked dossier status → decided
- **Verification:** Query dossier record

---

## 5. Decision Immutability Tests

### 5.1 Finalized Decision Tests

#### IMMUTABLE-001: Cannot Update Decision Text
- **Precondition:** Decision with is_final = true
- **Action:** Attempt to update decision_text
- **Expected:** Operation blocked by trigger
- **Verification:** Error returned, decision unchanged

#### IMMUTABLE-002: Cannot Change Decision Status
- **Precondition:** Decision with is_final = true, status = approved
- **Action:** Attempt to change decision_status to deferred
- **Expected:** Operation blocked
- **Verification:** Error returned, status unchanged

#### IMMUTABLE-003: Cannot Remove Approval
- **Precondition:** Decision with is_final = true
- **Action:** Attempt to set chair_approved_at = null
- **Expected:** Operation blocked
- **Verification:** Error returned, approval unchanged

#### IMMUTABLE-004: Cannot Delete Finalized Decision
- **Precondition:** Decision with is_final = true
- **Action:** Attempt DELETE operation
- **Expected:** Operation blocked (no delete policy)
- **Verification:** Error returned, record exists

### 5.2 Related Entity Immutability

#### IMMUTABLE-005: Cannot Modify Linked Dossier After Decision
- **Precondition:** Dossier with status = decided
- **Action:** Attempt to update dossier fields
- **Expected:** Operation blocked or limited
- **Verification:** Error or limited change

#### IMMUTABLE-006: Cannot Add Version to Locked Document
- **Precondition:** Document linked to finalized decision
- **Action:** Attempt to upload new version
- **Expected:** Operation blocked
- **Verification:** Error returned, no new version

---

## 6. Audit Completeness Tests

### 6.1 Event Coverage Tests

#### AUDIT-COV-001: Dossier Creation Logged
- **Action:** Create new dossier
- **Expected:** audit_event created with event_type = 'created'
- **Verification:** Query audit_event for entity

#### AUDIT-COV-002: Status Change Logged
- **Action:** Update dossier status
- **Expected:** audit_event created with event_type = 'status_changed'
- **Verification:** Query audit_event, verify old/new values in payload

#### AUDIT-COV-003: Decision Approval Logged
- **Action:** Chair approves decision
- **Expected:** audit_event created with event_type = 'chair_approved'
- **Verification:** Query audit_event, verify approval details in payload

#### AUDIT-COV-004: Document Upload Logged
- **Action:** Upload document version
- **Expected:** audit_event created with event_type = 'version_created'
- **Verification:** Query audit_event, verify file details in payload

### 6.2 Audit Immutability Tests

#### AUDIT-IMMUT-001: Cannot Update Audit Event
- **Action:** Attempt UPDATE on audit_event
- **Expected:** Trigger blocks operation
- **Verification:** Error returned

#### AUDIT-IMMUT-002: Cannot Delete Audit Event
- **Action:** Attempt DELETE on audit_event
- **Expected:** Trigger blocks operation
- **Verification:** Error returned

### 6.3 Actor Identification Tests

#### AUDIT-ACTOR-001: User ID Captured
- **Action:** Any audited operation
- **Expected:** actor_user_id matches current user
- **Verification:** Query audit_event

#### AUDIT-ACTOR-002: Role Captured
- **Action:** Any audited operation
- **Expected:** actor_role_code matches current session role
- **Verification:** Query audit_event

---

## 7. Workflow Tests

### 7.1 Intake Workflow

#### WF-INTAKE-001: Classification Enforcement
- **Action:** Create proposal without subtype
- **Expected:** Validation error
- **Verification:** Error message displayed

#### WF-INTAKE-002: Dossier Number Generation
- **Action:** Create valid dossier
- **Expected:** Unique dossier_number generated
- **Verification:** Check format RVM-YYYY-XXXXXX

### 7.2 Task Workflow

#### WF-TASK-001: In-Progress Requires User
- **Action:** Move task to in_progress without assigned_user_id
- **Expected:** Validation error
- **Verification:** Constraint error

### 7.3 Meeting Workflow

#### WF-MEETING-001: Publish Transition
- **Action:** Publish meeting
- **Expected:** Status changes to published, meeting visible to Chair
- **Verification:** Query meeting, verify Chair access

---

## 8. Performance Tests

### 8.1 Load Tests

| Test | Scenario | Target |
|------|----------|--------|
| PERF-001 | List 1000 dossiers | < 2 seconds |
| PERF-002 | Load dossier with 50 documents | < 1 second |
| PERF-003 | Query audit log (10000 events) | < 3 seconds |
| PERF-004 | Generate decision list (100 decisions) | < 5 seconds |

### 8.2 Concurrent User Tests

| Test | Scenario | Target |
|------|----------|--------|
| PERF-005 | 10 simultaneous users | No errors |
| PERF-006 | 5 simultaneous document uploads | No conflicts |

---

## 9. Test Execution Schedule

| Phase | Test Focus | Timing |
|-------|------------|--------|
| Phase 1 | Identity, Auth RLS | Phase completion |
| Phase 2 | Dossier RLS, Audit start | Phase completion |
| Phase 3 | Task RLS, Workflow tests | Phase completion |
| Phase 4 | Meeting RLS | Phase completion |
| Phase 5 | **Chair RVM Gate, Immutability** | Phase completion |
| Phase 6 | Document RLS, Version tests | Phase completion |
| Phase 7 | Reporting tests | Phase completion |
| Phase 8 | Full regression, Performance | Phase completion |

---

## 10. Test Reporting

### 10.1 Test Report Format

```
Phase X Test Report
├── Date: YYYY-MM-DD
├── Tests Executed: X
├── Tests Passed: X
├── Tests Failed: X
├── Blockers: List
├── Notes: Observations
└── Approval: Ready/Not Ready for next phase
```

### 10.2 Failure Handling

1. Document failure details
2. Identify root cause
3. Implement fix
4. Re-execute failed test
5. Update test report
6. Proceed only when all tests pass

---

## 11. Document Status

**Status:** Test & Verification Plan v1
**Source Compliance:** 100% aligned with RLS Matrix and Workflows
**Scope Expansion:** None
**Implementation Status:** NOT STARTED (documentation only)
