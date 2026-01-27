# Row-Level Security (RLS) & Role Matrix
## AMS – RVM Core (v1)

---

## 1. Purpose
This document defines the **Row-Level Security (RLS) model** and **Role Matrix** for **AMS – RVM Core (v1)**.

It translates governance rules, PRD requirements, and the ERD into **enforceable data-layer access controls**. RLS is treated as a **hard governance mechanism**, not a UI feature.

---

## 2. Core Security Principles (Hard Rules)

1. **RVM-Only Confidentiality**  
   All data in AMS is confidential by default.

2. **Data-Layer Enforcement**  
   Access is enforced at database level (RLS), never solely at application/UI level.

3. **Least Privilege**  
   Roles receive only the minimum access required to perform their function.

4. **Decision Immutability**  
   Final decisions cannot be modified by any role.

5. **Auditability**  
   All access and mutations must be traceable.

---

## 3. Roles (Authoritative List)

| Role Code | Role Name | Description |
|---------|----------|-------------|
| `chair_rvm` | Chair of the Council of Ministers | Final approval authority for RVM decisions |
| `secretary_rvm` | Secretary RVM | Procedural and reporting authority |
| `deputy_secretary` | Deputy Secretary / Coordinator | Operational coordination |
| `admin_intake` | Administration – Intake | Registration of incoming items |
| `admin_dossier` | Administration – Dossier Management | Dossier preparation & tracking |
| `admin_agenda` | Administration – Agenda & Convocation | Agenda preparation |
| `admin_reporting` | Administration – Decision Lists & Reports | Decision lists and reporting |
| `audit_readonly` | Audit | Read-only access for control bodies |
| `rvm_sys_admin` | System Administrator | Technical administration (no decision authority) |

---

## 4. Access Model Overview

Access is determined by a combination of:
- **User Role**
- **Dossier Assignment**
- **Workflow Stage**
- **Entity Type**

---

## 5. Entity-Level RLS Rules

### 5.1 `rvm_dossier`

| Role | Read | Create | Update | Delete |
|-----|------|--------|--------|--------|
| chair_rvm | Yes | No | Limited* | No |
| secretary_rvm | Yes | No | Yes | No |
| deputy_secretary | Yes | No | Limited | No |
| admin_intake | Yes | Yes | Limited | No |
| admin_dossier | Yes | No | Yes | No |
| admin_agenda | Yes | No | Limited | No |
| admin_reporting | Yes | No | No | No |
| audit_readonly | Yes | No | No | No |
| rvm_sys_admin | Metadata only | No | No | No |

*Limited = no modification after decision is final.

---

### 5.2 `rvm_item`

| Role | Read | Create | Update | Delete |
|-----|------|--------|--------|--------|
| chair_rvm | Yes | No | No | No |
| secretary_rvm | Yes | No | Yes | No |
| admin_intake | Yes | Yes | Limited | No |
| admin_dossier | Yes | No | Yes | No |
| audit_readonly | Yes | No | No | No |

---

### 5.3 `rvm_meeting` / `rvm_agenda_item`

| Role | Read | Create | Update | Delete |
|-----|------|--------|--------|--------|
| chair_rvm | Yes | No | No | No |
| secretary_rvm | Yes | Yes | Yes | No |
| admin_agenda | Yes | Yes | Yes | No |
| audit_readonly | Yes | No | No | No |

---

### 5.4 `rvm_decision`

| Role | Read | Create | Update | Delete |
|-----|------|--------|--------|--------|
| chair_rvm | Yes | Approve only | No* | No |
| secretary_rvm | Yes | Draft | Limited | No |
| admin_reporting | Yes | Draft | No | No |
| audit_readonly | Yes | No | No | No |

*Once `is_final = true`, no updates are permitted.

---

### 5.5 `rvm_document` / `rvm_document_version`

| Role | Read | Upload | New Version | Delete |
|-----|------|--------|-------------|--------|
| chair_rvm | Yes | No | No | No |
| secretary_rvm | Yes | Yes | Yes | No |
| admin_dossier | Yes | Yes | Yes | No |
| admin_reporting | Yes | Upload lists | Yes | No |
| audit_readonly | Yes | No | No | No |

---

### 5.6 `rvm_task`

| Role | Read | Create | Update | Complete |
|-----|------|--------|--------|----------|
| secretary_rvm | Yes | Yes | Yes | No |
| deputy_secretary | Yes | Yes | Yes | No |
| admin_* | Yes (assigned) | No | Yes (own) | Yes |
| chair_rvm | Yes | No | No | No |

---

### 5.7 `audit_event`

| Role | Read | Write |
|-----|------|-------|
| audit_readonly | Yes | No |
| secretary_rvm | Yes | No |
| rvm_sys_admin | Yes | No |

Audit events are append-only and system-generated.

---

## 6. Workflow Stage Restrictions

- **Draft / Registered**: editable by assigned admin roles
- **Scheduled**: limited edits
- **Decided (Final)**:
  - No entity updates allowed except audit logging
  - Documents locked

---

## 7. Special Rules

- Chair RVM approval is mandatory to finalize decisions
- System administrators have **no content authority**
- Audit role is strictly read-only

---

## 8. Enforcement Notes (Implementation Guidance)

- RLS policies should reference:
  - `current_user_role()`
  - dossier ownership / assignment tables
  - decision finality flags

- No bypass paths permitted.

---

**Status:** RLS & Role Matrix v1 – Ready for Workflow Diagramming & Implementation
**Governance Level:** Hard-bound

