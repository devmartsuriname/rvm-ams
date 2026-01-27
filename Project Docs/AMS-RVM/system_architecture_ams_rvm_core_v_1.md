# System Architecture Document
## AMS – RVM Core (v1)

---

## 1. Purpose & Governance Alignment
This document defines the **high-level system architecture** for **AMS – RVM Core (v1)**.

It translates approved governance and PRD requirements into a **clear structural blueprint** that will be used by Lovable for:
- system decomposition;
- data boundaries;
- security and RLS enforcement;
- future extensibility under strict phase governance.

This architecture strictly complies with **Devmart Governance** principles:
- scope isolation;
- phase-gated expansion;
- security-first design;
- documentation-before-implementation.

---

## 2. Architectural Principles (Hard Rules)

1. **RVM-Only Boundary**  
   All system components operate strictly within the RVM domain.

2. **Governance-First**  
   Mandate, approval, and auditability are enforced at architectural level, not only UI.

3. **Security by Design**  
   Role-based access (RLS) is applied at the data layer as a mandatory control.

4. **Modular but Non-Autonomous**  
   Submodules (e.g. DMS) cannot function independently outside RVM workflows.

5. **Extensible, Not Expandable by Default**  
   Future integrations require explicit new governance approval.

---

## 3. High-Level Architecture Overview

AMS – RVM Core consists of **five tightly coupled core layers**:

1. Presentation Layer (UI)
2. Application Layer (Workflow & Logic)
3. Domain Modules (RVM Core)
4. Data Layer (Persistence)
5. Security & Audit Layer (Cross-cutting)

---

## 4. Module Breakdown

### 4.1 RVM Core Module (Primary)
**Responsibilities:**
- RVM dossier lifecycle management
- Classification: Council Proposal (OPA / ORAG) & Missive
- Agenda preparation
- Decision recording
- Decision list generation

This module is the **system anchor**. All other modules attach to it.

---

### 4.2 Workflow & Task Engine
**Responsibilities:**
- Step-based RVM workflows
- Task assignment and ownership
- Deadline and urgency tracking
- Bottleneck detection

No workflow step may exist without an assigned role.

---

### 4.3 DMS-Light Module (RVM-Supporting)
**Responsibilities:**
- Document upload and storage
- Version management
- Confidentiality classification
- Linking documents to dossiers and decisions

**Explicit constraints:**
- No standalone document workflows
- No cross-module document sharing

---

### 4.4 Reporting & Dashboards
**Responsibilities:**
- Chair RVM overview
- Secretary RVM operational dashboards
- Audit-ready reporting

---

### 4.5 Integration Boundary (Future)
**Purpose:**
- Controlled document sharing with external systems (e.g. VP-Flow)

**Status:**
- Design-only in v1
- No implementation permitted

---

## 5. Data Architecture (Logical View)

Core domain entities:
- RVM_Dossier
- RVM_Item (Proposal / Missive)
- Decision
- Document
- Task
- Role
- User
- Audit_Log

All data entities are owned by RVM domain.

---

## 6. Security & RLS Architecture

- RLS enforced at data layer
- Access determined by:
  - role
  - dossier assignment
  - process stage
- Final decisions are immutable

No UI-level bypass of RLS is allowed.

---

## 7. Deployment & Environment Assumptions

- Single controlled environment per phase
- Centralized logging
- Encrypted data storage
- Backup and recovery mandatory

---

## 8. Change & Phase Control

Any architectural change requires:
1. Updated governance document
2. Explicit scope approval
3. New phase identifier

---

## 9. Next Architectural Deliverables

Following this document, the next mandatory documents are:
1. ERD – AMS RVM Core
2. RLS & Role Matrix
3. Workflow Diagrams

---

**Status:** Architecture v1 – Approved for ERD & RLS Design
**Governance Level:** Hard-bound (no deviation without re-approval)

