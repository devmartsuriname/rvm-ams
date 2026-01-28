# Phase 7: Reporting & Dashboards
## AMS – RVM Core (v1)

---

## 1. Objective

Implement **decision list generation**, **meeting reports**, and **role-based dashboards** for RVM operations oversight.

---

## 2. Scope — Included

### 2.1 Dashboards
- [ ] Chair RVM dashboard (decisions pending, approved, meeting overview)
- [ ] Secretary RVM dashboard (workflow status, pending tasks, upcoming meetings)

### 2.2 Decision List Generation
- [ ] Decision list query (per meeting)
- [ ] Decision list preview component
- [ ] PDF export functionality

### 2.3 Reports
- [ ] Meeting summary report
- [ ] Dossier status report
- [ ] Distribution tracking

### 2.4 UI Components
- [ ] Dashboard layout (role-specific views)
- [ ] Report viewer
- [ ] Export controls

---

## 3. Scope — Excluded

- ❌ External publication
- ❌ Email distribution (future enhancement)
- ❌ Advanced analytics
- ❌ Historical trend analysis

---

## 4. Entry Criteria

- [ ] Phase 6 completed and approved
- [ ] Document management functional
- [ ] Decisions can be finalized
- [ ] Explicit authorization for Phase 7 received

---

## 5. Exit Criteria

| Criterion | Verification |
|-----------|--------------|
| Chair dashboard functional | Shows relevant data for Chair role |
| Secretary dashboard functional | Shows relevant data for Secretary role |
| Decision lists generated | Query returns correct decisions |
| PDF export works | Valid PDF file generated |
| Distribution logged | Distribution events in audit_event |
| All Phase 7 tests pass | Verification checklist complete |

---

## 6. Restore Point Requirement

| Restore Point | Timing | Naming |
|---------------|--------|--------|
| Pre-Phase 7 | Before any Phase 7 work | `RP-P7-pre-YYYYMMDD` |
| Post-Phase 7 | After Phase 7 completion | `RP-P7-post-YYYYMMDD` |

---

## 7. Verification Checklist

### Dashboard Tests
- [ ] **DASH-001:** Chair dashboard displays correct data
- [ ] **DASH-002:** Secretary dashboard displays correct data
- [ ] **DASH-003:** Dashboard respects role access

### Report Tests
- [ ] **REPORT-001:** Decision list contains all finalized decisions for meeting
- [ ] **REPORT-002:** PDF export generates valid file
- [ ] **REPORT-003:** Distribution event logged

---

## 8. Governance Gate

**Gate Name:** Reporting Approval

**Requirements:**
- All verification tests passed
- Post-phase restore point created
- Phase 7 completion report submitted
- Explicit approval for Phase 8 obtained

---

## 9. Task Breakdown

| Task ID | Description | Est. |
|---------|-------------|------|
| P7-001 | Chair RVM Dashboard | 3 |
| P7-002 | Secretary RVM Dashboard | 3 |
| P7-003 | Decision List Query | 2 |
| P7-004 | Decision List Preview | 2 |
| P7-005 | PDF Export | 3 |
| P7-006 | Meeting Summary Report | 2 |
| P7-007 | Distribution Tracking | 2 |
| P7-008 | Phase 7 Verification | 1 |

**Total Estimated Points:** 18

---

## 10. Hard Stop Statement

**Phase 7 implementation may NOT proceed until:**
- All Phase 6 exit criteria met
- Phase 6 approval confirmed
- Explicit Phase 7 authorization received

---

**Document Status:** Planning Only — Implementation NOT Started
