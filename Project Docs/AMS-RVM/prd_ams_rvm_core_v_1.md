# Product Requirements Document (PRD)
## AMS – RVM Core (v1)

---

## 1. Purpose of This Document
This Product Requirements Document (PRD) defines the **functional, governance, and scope requirements** for the **Algemeen Management Systeem (AMS)**, version **RVM Core v1**.

This document is written in **English** and is intended to be used directly by **Lovable** as the authoritative source for functional design, architecture, ERD, RLS, and implementation planning.

The PRD is strictly aligned with the approved documents:
- *AMS – RVM Core Scope & Governance v1*
- *AMS – RVM Bestuurlijke Validatievragen (Definitief & Kort)*

---

## 2. Product Overview

### 2.1 Product Name
**AMS – RVM Core (v1)**

### 2.2 Product Description
AMS – RVM Core is a **governance-driven workflow and document management system** designed exclusively for the **Council of Ministers (Raad van Ministers – RVM)**.

The system supports:
- controlled intake and processing of RVM matters;
- formal agenda preparation and decision-making;
- legally traceable decision registration;
- RVM-supporting document management (DMS-light);
- auditability, compliance, and reporting.

AMS is **RVM-only**. No other Cabinet departments or VP-general roles are included in v1.

---

## 3. Scope Definition

### 3.1 In Scope (v1)

**Processes**
- RVM intake and registration
- Agenda preparation and meeting preparation
- Decision recording per agenda item
- Decision list and short report generation
- Post-decision processing and archiving

**RVM Services**
- **Council Proposals**
  - OPA: General Affairs / Personnel Affairs
  - ORAG: Procurement & Awarding
- **Missives**

**Supporting Modules**
- Task assignment for RVM administrative staff
- RVM-supporting Document Management (DMS-light)
- Reporting and dashboards

---

### 3.2 Explicitly Out of Scope (v1)
- VP role as Vice President (only Chair of RVM exists)
- Other Cabinet departments or directorates
- Cabinet-wide or generic DMS
- Policy execution after RVM decision
- External publication or communication modules

---

## 4. Users & Roles

### 4.1 Primary User Roles
- **Chair of the Council of Ministers (Chair RVM)**
- **Secretary of the Council of Ministers**
- **Deputy Secretary / Coordinator**
- **RVM Administration – Intake & Registration**
- **RVM Administration – Dossier Management**
- **RVM Administration – Agenda & Convocation**
- **RVM Administration – Decision List & Reporting**
- **Audit / Read-only**

All roles are **custom RVM roles**. Generic system roles are not allowed.

---

## 5. Functional Requirements

### 5.1 Intake & Registration
- Register incoming RVM items
- Classify items as Council Proposal (OPA/ORAG) or Missive
- Assign urgency: Regular / Urgent / Special
- Create a unique RVM dossier

### 5.2 Task Assignment
- Assign administrative tasks per dossier
- Track task ownership, status, and deadlines
- Mandatory task ownership for each workflow step

### 5.3 Agenda & Meeting Preparation
- Create and manage RVM agendas
- Attach dossiers to agenda items
- Support agenda updates and additions

### 5.4 Decision Management
- Record decisions per agenda item
- Enforce Chair RVM approval before exit
- Support statuses: Approved / Deferred / Rejected / Pending

### 5.5 Decision Lists & Reporting
- Generate official decision lists
- Generate short meeting reports
- Track distribution and acknowledgment

---

## 6. DMS-Light (RVM-Supporting)

### 6.1 Capabilities
- Upload documents per RVM dossier
- Version control
- Document classification and confidentiality level
- Link documents to decisions

### 6.2 Limitations
- No standalone DMS workflows
- No cross-departmental document sharing
- No public or external access

---

## 7. Security, RLS & Audit

- Default confidentiality for all RVM content
- Role-based access control (RLS)
- Full audit trail (who, what, when)
- Immutable records for final decisions

---

## 8. Reporting & Dashboards

### Chair RVM Dashboard
- Open dossiers
- Urgent matters
- Decision status overview

### Secretary RVM Dashboard
- Bottlenecks
- Processing times
- Task status overview

---

## 9. Non-Functional Requirements

- High reliability and data integrity
- Audit-ready at all times
- Clear separation of roles and permissions
- Extensible architecture (future phases)

---

## 10. Dependencies & Assumptions

- Governance documents are final and approved
- DMS is limited to RVM-supporting scope
- Integration with VP-Flow is future phase (document sharing only)

---

## 11. Success Criteria

- 100% traceability of RVM decisions
- No RVM item exits without Chair approval
- Measurable reduction in processing delays
- Clear audit and reporting capabilities

---

**Status:** PRD v1 – Ready for Architecture & Design
**Next Documents:**
- System Architecture Document
- ERD (Data Model)
- RLS & Role Matrix
- Workflow Diagrams

