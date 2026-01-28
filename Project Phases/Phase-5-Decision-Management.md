# Phase 5: Decision Management & Chair RVM Gate
## AMS – RVM Core (v1)

---

# ⚠️ CRITICAL PHASE — GOVERNANCE GATE REQUIRED

This phase implements the **core governance logic** of the RVM system:
- **Chair RVM approval workflow**
- **Decision immutability**
- **No RVM item may exit the system without Chair approval**

**Extended verification and governance approval mandatory before proceeding.**

---

## 1. Objective

Implement **decision recording** with the **Chair RVM approval workflow** and **decision immutability** that ensures no RVM decision can be finalized without explicit Chair approval.

---

## 2. Scope — Included

### 2.1 Decision Schema
- [ ] `decision_status` enum (approved, deferred, rejected, pending)
- [ ] `rvm_decision` table
- [ ] `is_final` immutability flag
- [ ] `chair_approved_at` and `chair_approved_by` fields
- [ ] Decision immutability trigger (prevent_decision_modification)

### 2.2 RLS Policies (Decision) — CRITICAL
- [ ] Decision read policies
- [ ] Decision create policies (secretary_rvm, admin_reporting)
- [ ] Decision update policies (secretary_rvm for draft, chair_rvm for approval)
- [ ] **Chair-only approval protection** (CRITICAL)

### 2.3 Service Layer
- [ ] `decisionService.ts` with CRUD operations
- [ ] Chair approval function
- [ ] Finalization logic
- [ ] `useDecisions` hook

### 2.4 UI Components
- [ ] Decision panel component (per agenda item)
- [ ] Decision form (Secretary drafting)
- [ ] **Chair Approval Button** (role-restricted, CRITICAL)
- [ ] Immutability lock UI (visual indicator for finalized decisions)

### 2.5 Cascading Updates
- [ ] Dossier status update on decision finalization (→ decided)

### 2.6 Audit — CRITICAL
- [ ] Decision creation audit events
- [ ] Decision update audit events
- [ ] **Chair approval audit events** (CRITICAL)
- [ ] Finalization audit events

---

## 3. Scope — Excluded

- ❌ Document management (Phase 6)
- ❌ Decision list generation (Phase 7)
- ❌ PDF export (Phase 7)

---

## 4. Entry Criteria

- [ ] Phase 4 completed and approved
- [ ] Meeting/agenda functionality working
- [ ] Agenda items can be linked to dossiers
- [ ] Explicit authorization for Phase 5 received

---

## 5. Exit Criteria — CRITICAL

| Criterion | Verification | CRITICAL |
|-----------|--------------|----------|
| Decision table exists | Table with correct structure | |
| Decision RLS active | Role-based access enforced | ⚠️ |
| **Chair-only approval works** | Only chair_rvm can approve | ⚠️ CRITICAL |
| **Immutability enforced** | Finalized decisions cannot be modified | ⚠️ CRITICAL |
| **No bypass paths exist** | RLS + trigger verification | ⚠️ CRITICAL |
| Dossier status updates | Dossier → decided after finalization | |
| All audit events logged | Complete trail of decision lifecycle | ⚠️ |
| All Phase 5 tests pass | Verification checklist complete | ⚠️ |

---

## 6. Restore Point Requirement

| Restore Point | Timing | Naming |
|---------------|--------|--------|
| Pre-Phase 5 | Before any Phase 5 work | `RP-P5-pre-YYYYMMDD` |
| **Post-Chair Gate** | After Chair approval verification | `RP-P5-gate-YYYYMMDD` |
| Post-Phase 5 | After Phase 5 completion | `RP-P5-post-YYYYMMDD` |

---

## 7. Verification Checklist — CRITICAL

### Chair RVM Gate Tests (from Test & Verification Plan)
- [ ] **GATE-001:** Decision draft without approval — Operation blocked
- [ ] **GATE-002:** Chair approval sets timestamp — chair_approved_at and chair_approved_by set
- [ ] **GATE-003:** Approval enables finalization — is_final = true succeeds
- [ ] **GATE-004:** Non-Chair cannot approve — RLS blocks operation
- [ ] **GATE-005:** Dossier status update on finalization — Dossier → decided

### Decision Immutability Tests
- [ ] **IMMUTABLE-001:** Cannot update decision_text after finalization
- [ ] **IMMUTABLE-002:** Cannot change decision_status after finalization
- [ ] **IMMUTABLE-003:** Cannot remove approval after finalization
- [ ] **IMMUTABLE-004:** Cannot delete finalized decision

### RLS Tests
- [ ] **RLS-DECISION-001:** Read access by authorized roles
- [ ] **RLS-DECISION-002:** Create access by secretary_rvm, admin_reporting
- [ ] **RLS-DECISION-003:** Approval access by chair_rvm ONLY
- [ ] **RLS-DECISION-004:** Finalized decisions cannot be updated by ANY role

### Audit Tests
- [ ] **AUDIT-COV-003:** Chair approval logged with full details

---

## 8. Governance Gate — CRITICAL

**Gate Name:** Chair RVM Gate Verification

**This is the MOST CRITICAL governance gate in the system.**

**Requirements:**
- [ ] All Chair RVM gate tests passed (GATE-001 through GATE-005)
- [ ] All immutability tests passed (IMMUTABLE-001 through IMMUTABLE-004)
- [ ] All RLS decision tests passed
- [ ] Security review completed
- [ ] No bypass paths identified
- [ ] Post-gate restore point created
- [ ] **Governance approval explicitly obtained**

**Approver:** Project Governance (elevated approval required)

---

## 9. Task Breakdown

| Task ID | Description | Est. | Critical |
|---------|-------------|------|----------|
| P5-001 | Create Decision Schema | 2 | |
| P5-002 | Decision Immutability Trigger | 2 | ⚠️ |
| P5-003 | Decision RLS Policies | 3 | ⚠️ |
| P5-004 | Decision Service Layer | 2 | |
| P5-005 | Decision Hooks | 2 | |
| P5-006 | Decision Panel Component | 2 | |
| P5-007 | Decision Form | 2 | |
| P5-008 | Chair Approval Button | 3 | ⚠️ |
| P5-009 | Immutability UI Lock | 1 | |
| P5-010 | Dossier Status Update | 2 | |
| P5-011 | Decision Audit Events | 2 | ⚠️ |
| P5-012 | Chair RVM Gate Verification | 2 | ⚠️ |
| P5-013 | Phase 5 Verification | 2 | ⚠️ |

**Total Estimated Points:** 27

---

## 10. Security Considerations

### Chair Approval Protection

The Chair RVM approval mechanism must be protected at multiple levels:

1. **Database Level (RLS)**
   - Only users with `chair_rvm` role can set `chair_approved_at`
   - Only users with `chair_rvm` role can set `chair_approved_by`

2. **Application Level**
   - Chair Approval Button only rendered for chair_rvm users
   - Service layer validates role before approval action

3. **Trigger Level**
   - Finalized decisions cannot be modified by ANY user
   - Trigger fires BEFORE UPDATE, rejecting all changes

### Bypass Prevention

Verify NO bypass paths exist:
- [ ] Direct SQL UPDATE blocked by trigger
- [ ] API endpoint protected by role check
- [ ] UI button hidden for non-Chair
- [ ] Super admin cannot bypass Chair approval (governance rule)

---

## 11. Hard Stop Statement

**Phase 5 implementation may NOT proceed until:**
- All Phase 4 exit criteria met
- Phase 4 approval confirmed
- Explicit Phase 5 authorization received

**After Phase 5 completion:**
- Phase 6 may NOT proceed until:
  - Chair RVM Gate verification complete
  - Governance approval explicitly obtained
  - Phase 5 completion report accepted

---

**Document Status:** Planning Only — Implementation NOT Started

**⚠️ This phase requires elevated governance approval.**
