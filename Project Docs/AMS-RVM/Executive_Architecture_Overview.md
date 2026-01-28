# Executive Architecture Overview — AMS–RVM Core (v1)

> **⚠️ NON-AUTHORITATIVE OVERVIEW**
>
> This document is a NON-AUTHORITATIVE overview for executive and audit audiences.
> The **Phase Architecture Documents remain leading**.
>
> For technical implementation details, refer to:
> - `system_architecture_ams_rvm_core_v_1.md`
> - `technical_architecture_ams_rvm_core_v1.md`
> - `backend_design_ams_rvm_core_v1.md`

---

## 1. Architecture Summary

AMS – RVM Core is built on a **five-layer architecture** designed for governance, security, and auditability:

| Layer | Purpose |
|-------|---------|
| Presentation | User interface (React-based admin dashboard) |
| Application | Workflow logic, state management, API orchestration |
| Domain | RVM core entities and business rules |
| Data | PostgreSQL persistence with RLS enforcement |
| Security & Audit | Cross-cutting authentication, authorization, and logging |

---

## 2. Technology Stack Summary

### 2.1 Frontend

| Component | Technology |
|-----------|------------|
| Framework | React 18+ (Vite) |
| UI Framework | Darkone Admin Template (React Bootstrap + shadcn/ui) |
| Styling | Tailwind CSS + SCSS |
| State Management | React Query + React Context |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Zod validation |

### 2.2 Backend

| Component | Technology |
|-----------|------------|
| Platform | External Supabase (managed Supabase project) |
| Database | PostgreSQL |
| Authentication | Supabase Auth (email/password) |
| API | Auto-generated Supabase Client |
| Storage | Supabase Storage (documents) |
| Edge Functions | Supabase Edge Functions (if required) |

### 2.3 Development

| Component | Technology |
|-----------|------------|
| Build | Vite |
| Language | TypeScript (strict mode) |
| Package Manager | Bun |
| Linting | ESLint |

---

## 3. Security Architecture Overview

### 3.1 Authentication

- Email/password authentication via Supabase Auth
- Session-based JWT token management
- Secure session handling with automatic refresh

### 3.2 Authorization

- **Role-Based Access Control (RLS)** enforced at database level
- 9 predefined RVM-specific roles (no generic system roles)
- No role inheritance — roles are independent
- RLS is the true security gate (UI guards are UX-only)

### 3.3 Key Security Principles

| Principle | Implementation |
|-----------|----------------|
| Security by Design | RLS applied at data layer as mandatory control |
| No UI Bypass | All authorization enforced at database level |
| Least Privilege | Roles grant minimum necessary access |
| Immutability | Final decisions cannot be modified |
| Audit Trail | All changes logged with actor identification |

### 3.4 Chair RVM Protection

The Chair approval mechanism is protected at multiple levels:

1. **Database Level (RLS):** Only chair_rvm role can set approval fields
2. **Trigger Level:** Finalized decisions cannot be modified by ANY user
3. **Application Level:** Chair Approval UI only rendered for chair_rvm users

---

## 4. Data Architecture Summary

### 4.1 Core Domain Entities

| Entity | Description |
|--------|-------------|
| RVM_Dossier | Central case record for RVM items |
| RVM_Item | Proposal (OPA/ORAG) or Missive classification |
| RVM_Meeting | Council meeting with agenda |
| RVM_Agenda_Item | Items scheduled for a meeting |
| RVM_Decision | Recorded decision with Chair approval |
| RVM_Task | Assigned workflow tasks |
| RVM_Document | Supporting documents with versions |
| Audit_Event | Immutable audit log entries |

### 4.2 Identity Entities

| Entity | Description |
|--------|-------------|
| App_User | Links to Supabase Auth |
| App_Role | 9 predefined RVM roles |
| User_Role | Junction table for role assignments |

### 4.3 Data Ownership

All data entities are owned by the RVM domain. No cross-departmental data sharing is permitted in v1.

---

## 5. Platform Configuration

| Setting | Value |
|---------|-------|
| Backend Platform | External Supabase (managed Supabase project) |
| Environment Variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Migration Location | `/supabase/migrations/` |
| Future Deployment | Hostinger VPS |

### 5.1 Environment Strategy

| Environment | Purpose |
|-------------|---------|
| Local | Developer workstations |
| Dev/Staging | Testing and verification |
| Production | Live system (future) |

---

## 6. Governance & Compliance Summary

### 6.1 Architectural Principles (Hard Rules)

1. **RVM-Only Boundary:** All components operate strictly within RVM domain
2. **Governance-First:** Mandate, approval, and auditability enforced at architecture level
3. **Security by Design:** RLS mandatory on all data tables
4. **Modular but Non-Autonomous:** Submodules cannot function outside RVM workflows
5. **Extensible, Not Expandable:** Future integrations require new governance approval

### 6.2 Audit Compliance

| Requirement | Implementation |
|-------------|----------------|
| Full Audit Trail | All entity changes logged to audit_event |
| Actor Identification | User ID and role captured for every action |
| Immutability | Audit events cannot be modified or deleted |
| Retention | Long-term retention with no expiration |

### 6.3 Decision Immutability

Once a decision is finalized by the Chair RVM:
- Decision text cannot be changed
- Decision status cannot be modified
- Approval cannot be removed
- Decision cannot be deleted
- Linked documents are locked

---

## 7. Module Overview

| Module | Status | Description |
|--------|--------|-------------|
| RVM Core | Primary | Dossier lifecycle, classification, decisions |
| Workflow & Task Engine | Supporting | Task assignment, ownership tracking |
| DMS-Light | Supporting | RVM-specific document management |
| Reporting & Dashboards | Supporting | Chair and Secretary dashboards |
| Integration Boundary | Future | Controlled external sharing (v2+) |

---

## 8. Source Documents

This overview is derived from:

| Document | Type |
|----------|------|
| system_architecture_ams_rvm_core_v_1.md | Authoritative |
| technical_architecture_ams_rvm_core_v1.md | Execution |
| backend_design_ams_rvm_core_v1.md | Execution |
| deployment_strategy_ams_rvm_core_v1.md | Execution |

---

**Document Status:** Non-Authoritative Overview — For Executive and Audit Use Only
**Implementation Status:** NOT STARTED
