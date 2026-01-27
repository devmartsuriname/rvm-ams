# Risk Register
## AMS – RVM Core (v1)

---

## 1. Document Purpose

This document identifies **risks**, **mitigation strategies**, **owners**, and **status** for AMS – RVM Core (v1). Updated per phase.

**Source Authority:**
- `ams_rvm_core_scope_governance_v_1.md`
- All authoritative documents

**Scope Expansion:** None. Risk identification from governance principles.

---

## 2. Risk Classification

### 2.1 Severity Levels

| Level | Impact | Response |
|-------|--------|----------|
| **Critical** | Project failure, legal exposure | Immediate action required |
| **High** | Major delay, significant rework | Priority mitigation |
| **Medium** | Moderate delay, limited rework | Planned mitigation |
| **Low** | Minor inconvenience | Monitor |

### 2.2 Probability Levels

| Level | Likelihood |
|-------|------------|
| **High** | > 70% |
| **Medium** | 30-70% |
| **Low** | < 30% |

### 2.3 Risk Score Matrix

| Probability | Low Impact | Medium Impact | High Impact | Critical Impact |
|-------------|------------|---------------|-------------|-----------------|
| High | Medium | High | Critical | Critical |
| Medium | Low | Medium | High | Critical |
| Low | Low | Low | Medium | High |

---

## 3. Risk Register

### 3.1 Security Risks

#### RISK-001: Chair RVM Approval Bypass
- **Description:** Decision finalized without proper Chair RVM approval
- **Severity:** Critical
- **Probability:** Low
- **Risk Score:** High
- **Mitigation:**
  - RLS policy prevents non-Chair approval
  - Database trigger enforces `chair_approved_at` before `is_final = true`
  - Audit logging captures all approval attempts
- **Owner:** Implementation team
- **Phase:** 5
- **Status:** Identified

#### RISK-002: Decision Mutability After Finalization
- **Description:** Finalized decisions modified, breaking legal traceability
- **Severity:** Critical
- **Probability:** Low
- **Risk Score:** High
- **Mitigation:**
  - Database trigger blocks UPDATE when `is_final = true`
  - RLS policy prevents modifications
  - Audit log captures any bypass attempts
- **Owner:** Implementation team
- **Phase:** 5
- **Status:** Identified

#### RISK-003: Document Access Leakage
- **Description:** Confidential documents accessed by unauthorized users
- **Severity:** High
- **Probability:** Medium
- **Risk Score:** High
- **Mitigation:**
  - RLS on storage bucket
  - Confidentiality level enforcement
  - No public bucket access
  - Audit logging of document access
- **Owner:** Implementation team
- **Phase:** 6
- **Status:** Identified

#### RISK-004: Audit Trail Gaps
- **Description:** Entity changes not captured in audit log
- **Severity:** High
- **Probability:** Medium
- **Risk Score:** High
- **Mitigation:**
  - Trigger-based audit logging (not application-level)
  - Coverage verification per phase
  - Automated gap detection
- **Owner:** Implementation team
- **Phase:** All
- **Status:** Identified

#### RISK-005: RLS Policy Bypass
- **Description:** Data accessed through unprotected path
- **Severity:** Critical
- **Probability:** Low
- **Risk Score:** High
- **Mitigation:**
  - RLS enabled on all tables
  - No direct database access
  - API-only data access
  - RLS testing per phase
- **Owner:** Implementation team
- **Phase:** All
- **Status:** Identified

---

### 3.2 Governance Risks

#### RISK-006: Scope Creep
- **Description:** Features added beyond authoritative document scope
- **Severity:** High
- **Probability:** Medium
- **Risk Score:** High
- **Mitigation:**
  - Phase-gated execution
  - Explicit approval for each phase
  - Change control registry
  - Scope boundary verification
- **Owner:** Project owner
- **Phase:** All
- **Status:** Identified

#### RISK-007: Phase Gate Violation
- **Description:** Phase started without explicit approval
- **Severity:** Medium
- **Probability:** Low
- **Risk Score:** Low
- **Mitigation:**
  - Documented phase completion reports
  - Explicit approval messages
  - Hard stop enforcement
- **Owner:** Implementation team
- **Phase:** All
- **Status:** Identified

#### RISK-008: Darkone Parity Loss
- **Description:** Admin template structure diverges from original
- **Severity:** Medium
- **Probability:** Medium
- **Risk Score:** Medium
- **Mitigation:**
  - Extension pattern (add, don't modify)
  - Separate RVM components
  - Regular parity verification
- **Owner:** Implementation team
- **Phase:** All
- **Status:** Identified

---

### 3.3 Technical Risks

#### RISK-009: Performance Degradation
- **Description:** System slows under realistic data volumes
- **Severity:** Medium
- **Probability:** Medium
- **Risk Score:** Medium
- **Mitigation:**
  - Proper indexing strategy
  - Query optimization
  - React Query caching
  - Performance testing per phase
- **Owner:** Implementation team
- **Phase:** All
- **Status:** Identified

#### RISK-010: Data Migration Errors
- **Description:** Schema changes cause data loss
- **Severity:** High
- **Probability:** Low
- **Risk Score:** Medium
- **Mitigation:**
  - Destructive change protocol
  - Pre-migration backups
  - Live data verification before publish
  - Rollback procedures
- **Owner:** Implementation team
- **Phase:** All
- **Status:** Identified

#### RISK-011: Authentication Failure
- **Description:** Auth system unavailable or misconfigured
- **Severity:** High
- **Probability:** Low
- **Risk Score:** Medium
- **Mitigation:**
  - Supabase managed service reliability
  - Session handling best practices
  - Error handling and retry logic
- **Owner:** Implementation team
- **Phase:** 1
- **Status:** Identified

---

### 3.4 Operational Risks

#### RISK-012: User Adoption Resistance
- **Description:** Users reject or misuse the system
- **Severity:** Medium
- **Probability:** Medium
- **Risk Score:** Medium
- **Mitigation:**
  - Clear, consistent UI
  - Workflow aligned with existing processes
  - Training documentation
  - Gradual rollout
- **Owner:** Project owner
- **Phase:** Post-deployment
- **Status:** Identified

#### RISK-013: Insufficient Role Assignment
- **Description:** Users lack necessary roles for their duties
- **Severity:** Medium
- **Probability:** Medium
- **Risk Score:** Medium
- **Mitigation:**
  - Clear role documentation
  - Role assignment UI for sys_admin
  - Role verification on deployment
- **Owner:** Project owner
- **Phase:** Deployment
- **Status:** Identified

---

## 4. Risk Monitoring

### 4.1 Monitoring Schedule

| Phase | Risk Review | Focus Areas |
|-------|-------------|-------------|
| Phase 1 | Phase completion | Auth, identity, RLS |
| Phase 2 | Phase completion | Dossier management, audit |
| Phase 3 | Phase completion | Workflow, task ownership |
| Phase 4 | Phase completion | Agenda, meeting management |
| Phase 5 | **Enhanced review** | **Chair RVM gate, decision immutability** |
| Phase 6 | Phase completion | Document security, versioning |
| Phase 7 | Phase completion | Reporting accuracy |
| Phase 8 | Final verification | All risks |

### 4.2 Risk Indicators

| Risk Category | Indicators to Monitor |
|---------------|----------------------|
| Security | Audit anomalies, access violations |
| Governance | Scope requests, approval delays |
| Technical | Performance metrics, error rates |
| Operational | User feedback, support requests |

---

## 5. Risk Response Actions

### 5.1 Active Mitigations

| Risk | Mitigation Action | Status | Due |
|------|-------------------|--------|-----|
| RISK-001 | Implement Chair approval RLS | Planned | Phase 5 |
| RISK-002 | Implement immutability trigger | Planned | Phase 5 |
| RISK-003 | Configure storage RLS | Planned | Phase 6 |
| RISK-004 | Implement trigger-based audit | Planned | Phase 2 |
| RISK-005 | Enable RLS on all tables | Planned | Per phase |
| RISK-006 | Maintain change control registry | Active | Ongoing |

### 5.2 Contingency Plans

| Risk | Contingency |
|------|-------------|
| RISK-001 | Manual decision review process |
| RISK-002 | Database restore from backup |
| RISK-010 | Rollback to previous schema |
| RISK-011 | Manual authentication fallback |

---

## 6. Risk History

### 6.1 Resolved Risks

*(None at this time)*

### 6.2 Escalated Risks

*(None at this time)*

### 6.3 Accepted Risks

*(None at this time)*

---

## 7. Document Status

**Status:** Risk Register v1
**Source Compliance:** Governance-derived risk identification
**Scope Expansion:** None
**Last Updated:** Document creation
**Next Review:** Phase 1 completion
