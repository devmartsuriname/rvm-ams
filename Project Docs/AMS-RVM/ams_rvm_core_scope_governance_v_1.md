# AMS – RVM Core Scope & Governance v1

## 1. Purpose of this Document
This document defines the **core scope, governance model, and strategic boundaries** of the AMS platform with **RVM as the sole and exclusive domain** in Phase 1.

It establishes *what AMS is*, *what AMS is not*, and *why RVM-first is mandatory* before any functional design, development, or automation work may begin.

This document is binding under **Devmart Governance** and serves as the foundation for all subsequent PRD, ERD, RLS, workflow, and implementation documents.

---

## 2. Strategic Positioning

### 2.1 AMS Definition
AMS (Administrative Management System) is a **governance-grade digital system** designed to support:
- Formal decision-making
- Legal traceability
- Controlled document flow
- Institutional accountability

AMS is **not** a generic task system, inbox, or collaboration tool.

### 2.2 RVM-First Principle
Phase 1 of AMS is **exclusively dedicated to the Raad van Ministers (RVM)**.

Confirmed constraints:
- AMS Phase 1 = RVM only
- No other Cabinet departments
- No Directorates
- No VP operational role
- No Cabinet-wide rollout

RVM is the **sole system owner** in Phase 1.

---

## 3. Governance Authority

### 3.1 Ownership
- **System Owner:** Raad van Ministers (RVM)
- **Operational Authority:** Secretary of the RVM
- **Decision Authority:** Chairman of the RVM

The Vice-President exists **only in the capacity of Chairman of the RVM** within this system.

### 3.2 Explicit Exclusions
The following are explicitly **out of scope** for Phase 1:
- VP personal workflow
- VP decision system
- Cabinet Director
- Directorate Cabinet VP
- Protocol
- Volkscommunicatie
- Administrative Directorates

---

## 4. Legal & Procedural Alignment

AMS RVM Core is aligned with:
- Reglement van Orde Raad van Ministers (SB 2011 no. 76)
- Resolution on Cabinet Organization Structure (SB 2022 no. 75)

Key enforced principles:
- No RVM item exits the system without Chairman approval
- Formal quorum & decision logging
- Decision lists and minutes generation
- Secretariat responsibility for records

---

## 5. Core RVM Domains (Phase 1)

The system supports **only** the following RVM domains:

1. **Council Proposals (Raadsvoorstellen)**
   - OPA: General Affairs
   - OPA: Personnel Affairs
   - ORAG: Procurement & Awards

2. **Missives**
   - Categorized according to official RVM classification

No other document types are allowed in Phase 1.

---

## 6. DMS Positioning (Phase 1)

A **Document Management Module (DMS)** is included with strict limitations:

- DMS is RVM-supporting only
- No standalone DMS functionality
- No Cabinet-wide archive
- No external department access

DMS exists solely to:
- Store RVM documents
- Maintain legal traceability
- Support audit and compliance

---

## 7. Security & Control Philosophy

- Default confidentiality
- Role-based access only
- No implicit visibility
- Full audit logging

All access is intentional, temporary where applicable, and accountable.

---

## 8. Phase Discipline

This document authorizes:
- PRD creation
- ERD creation
- RLS & Role Matrix
- Workflow modeling
- Lovable implementation planning

Any deviation requires **explicit governance approval**.

---

## 9. Status

**Status:** Approved – Governance Baseline

Next required document:
**AMS – RVM Bestuurlijke Validatievragen (Definitive & Short)**