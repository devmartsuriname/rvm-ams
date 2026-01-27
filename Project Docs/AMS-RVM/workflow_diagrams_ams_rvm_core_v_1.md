# Workflow Diagrams
## AMS – RVM Core (v1)

---

## 1. Purpose
This document defines the **end-to-end operational workflows** for **AMS – RVM Core (v1)**.

It translates the PRD, Architecture, ERD, and RLS documents into **clear, enforceable process flows**. These workflows are **authoritative** for implementation and must be followed exactly by Lovable.

---

## 2. Core Workflow Principles (Hard Rules)

1. **RVM-Only Flow**  
   All workflows exist exclusively within the RVM domain.

2. **Mandatory Ownership**  
   Every workflow step must have an assigned role or user.

3. **Chair RVM Gate**  
   No workflow may exit the decision stage without Chair RVM approval.

4. **Audit by Default**  
   Every state transition is logged.

---

## 3. Workflow 1 – Intake & Registration

**Trigger:** Incoming Council Proposal or Missive

**Steps:**
1. Item received by RVM Secretariat
2. `admin_intake` registers dossier
3. Classification:
   - Service type: Proposal (OPA / ORAG) or Missive
   - Urgency: Regular / Urgent / Special
   - Sender ministry
4. Initial documents uploaded (if available)
5. Status → `registered`

**Controls:**
- Dossier number auto-generated
- Mandatory classification fields enforced

---

## 4. Workflow 2 – Dossier Preparation

**Trigger:** Registered dossier

**Steps:**
1. Task assigned to `admin_dossier`
2. Completeness check (documents, metadata)
3. Additional document uploads (DMS-light)
4. Internal notes added
5. Status → `in_preparation`

**Controls:**
- Task assignment required before progress
- Versioning enforced on documents

---

## 5. Workflow 3 – Agenda Preparation

**Trigger:** Prepared dossier

**Steps:**
1. Task assigned to `admin_agenda`
2. Draft agenda created for RVM meeting
3. Dossier linked as agenda item
4. Agenda order set
5. Meeting status → `published`

**Controls:**
- One agenda item per dossier per meeting
- Agenda order uniqueness enforced

---

## 6. Workflow 4 – RVM Meeting & Decision

**Trigger:** Published agenda

**Steps:**
1. Meeting held (regular / urgent / special)
2. Agenda item presented
3. Decision drafted by Secretary RVM
4. Chair RVM reviews decision
5. Chair RVM approves decision
6. Decision status → `final`
7. Dossier status → `decided`

**Decision Outcomes:**
- Approved
- Deferred
- Rejected
- Pending

**Controls:**
- Chair RVM approval mandatory
- Decision immutable after finalization

---

## 7. Workflow 5 – Decision Lists & Reporting

**Trigger:** One or more finalized decisions

**Steps:**
1. Task assigned to `admin_reporting`
2. Decision list generated
3. Short meeting report compiled
4. Documents attached (decision list, minutes)
5. Distribution logged

**Controls:**
- Only finalized decisions included
- Distribution audit required

---

## 8. Workflow 6 – Archiving & Closure

**Trigger:** Reporting completed

**Steps:**
1. Dossier reviewed for completeness
2. Status → `archived`
3. Documents locked
4. Access restricted per RLS

**Controls:**
- Archived dossiers are read-only
- Audit remains accessible

---

## 9. Workflow 7 – Urgent RVM Path

**Trigger:** Urgency = `urgent`

**Differences:**
- No fixed meeting date required
- Agenda may be created ad-hoc
- Same decision logic applies

**Controls:**
- Urgency flag visible in all views
- Same Chair RVM approval gate

---

## 10. Exception Handling

- **Incomplete dossiers:** blocked until resolved
- **Deferred decisions:** returned to preparation stage
- **Withdrawn items:** marked and archived with reason

---

## 11. Workflow-to-Role Mapping (Summary)

| Workflow Step | Primary Role |
|--------------|-------------|
| Intake | admin_intake |
| Preparation | admin_dossier |
| Agenda | admin_agenda |
| Decision Draft | secretary_rvm |
| Decision Approval | chair_rvm |
| Reporting | admin_reporting |
| Audit | audit_readonly |

---

## 12. Implementation Notes for Lovable

- Workflow states must be enforced at backend level
- State transitions must validate RLS rules
- No manual overrides permitted

---

**Status:** Workflow Diagrams v1 – Ready for Implementation Instructions
**Next Document:** Implementation Instructions & Phase Plan for Lovable

