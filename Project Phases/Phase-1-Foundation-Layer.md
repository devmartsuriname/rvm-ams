# Phase 1: Foundation Layer
## AMS – RVM Core (v1)

---

## 1. Objective

Establish the **backend infrastructure**, **authentication system**, **identity model**, and **UI shell** that all subsequent phases depend on.

This phase creates the foundation for secure, role-based access to the RVM system.

---

## 2. Scope — Included

### 2.1 Backend Infrastructure
- [ ] External Supabase project connection
- [ ] Environment variable configuration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] Migration folder structure (`/supabase/migrations/`)
- [ ] `.env.local` template for local development

### 2.2 Identity Schema
- [ ] `app_user` table (links to Supabase Auth)
- [ ] `app_role` table with 9 predefined RVM roles
- [ ] `user_role` junction table
- [ ] `super_admin_bootstrap` table (testing mechanism)
- [ ] Initial role data seeding

### 2.3 Authentication
- [ ] Email/password auth flow
- [ ] Sign up functionality
- [ ] Sign in functionality
- [ ] Sign out functionality
- [ ] Session management

### 2.4 Authorization
- [ ] `AuthContext` with user/role state
- [ ] `RoleGuard` component for route protection
- [ ] Role-based UI visibility patterns

### 2.5 RLS Policies (Identity)
- [ ] `app_user` RLS policies
- [ ] `user_role` RLS policies
- [ ] Helper functions: `get_user_roles()`, `has_role()`, `has_any_role()`, `get_current_user_id()`
- [ ] `is_super_admin()` helper function (Test environment only)

### 2.6 UI Shell
- [ ] RVM menu section in navigation (extend `menu-items.ts`)
- [ ] Placeholder pages for all RVM routes
- [ ] Darkone 1:1 layout preservation

---

## 3. Scope — Excluded

- ❌ Dossier management (Phase 2)
- ❌ Task/workflow functionality (Phase 3)
- ❌ Meeting/agenda functionality (Phase 4)
- ❌ Decision recording (Phase 5)
- ❌ Document management (Phase 6)
- ❌ Reporting/dashboards (Phase 7)
- ❌ Audit log viewer (Phase 8)
- ❌ Any business logic beyond identity
- ❌ Production deployment

---

## 4. Entry Criteria

- [x] Phase 0 documentation baseline locked
- [x] All 17 authoritative/execution documents present
- [x] External Supabase project credentials available (to be provided)
- [x] Explicit authorization for Phase 1 received

---

## 5. Exit Criteria

| Criterion | Verification |
|-----------|--------------|
| External Supabase connected | Can query database from frontend |
| Identity tables deployed | Tables exist with correct structure |
| RLS policies active | Unauthorized access blocked at DB level |
| Auth functional | User can sign up, sign in, sign out |
| Role assignment works | User-role link created, visible in AuthContext |
| RoleGuard functional | Unauthorized users redirected |
| RVM menu visible | Navigation renders with all RVM items |
| Placeholder pages load | No 404 errors on RVM routes |
| Super admin bootstrap works | test_superadmin can access all data in Test |
| All Phase 1 tests pass | Verification checklist complete |

---

## 6. Restore Point Requirement

| Restore Point | Timing | Naming |
|---------------|--------|--------|
| Pre-Phase 1 | Before any Phase 1 work | `RP-P1-pre-YYYYMMDD` |
| Post-Phase 1 | After Phase 1 completion | `RP-P1-post-YYYYMMDD` |

**Backup Contents:**
- Full codebase state
- Database schema export
- Environment configuration documentation

---

## 7. Verification Checklist

Mapped to Test & Verification Plan:

### Authentication Tests
- [ ] **P1-TEST-001:** User can sign up with email/password → Account created in Supabase Auth + `app_user`
- [ ] **P1-TEST-002:** User can sign in → Session established, AuthContext populated
- [ ] **P1-TEST-003:** User can sign out → Session cleared, redirect to login

### Role Tests
- [ ] **P1-TEST-004:** Role assignment works → User-role link created, visible in context
- [ ] **P1-TEST-005:** RoleGuard blocks unauthorized access → Redirect to dashboard or error

### RLS Tests
- [ ] **P1-TEST-006:** RLS blocks unauthenticated queries → Database error on direct query attempt
- [ ] **P1-TEST-007:** Identity tables enforce RLS → Only authorized queries succeed

### UI Tests
- [ ] **P1-TEST-008:** All RVM menu items visible → Navigation renders with placeholders
- [ ] **P1-TEST-009:** Placeholder pages load → No 404 errors on RVM routes

### Bootstrap Tests
- [ ] **BOOTSTRAP-001:** Super admin can read all tables in Test
- [ ] **BOOTSTRAP-002:** Super admin actions are logged
- [ ] **BOOTSTRAP-004:** Super admin inactive in production config

---

## 8. Governance Gate

**Gate Name:** Foundation Approval

**Requirements:**
- All verification tests passed
- Post-phase restore point created
- Phase 1 completion report submitted
- Explicit approval for Phase 2 obtained

**Approver:** Project Governance

---

## 9. Dependencies on Later Phases

| Phase 1 Component | Used By |
|-------------------|---------|
| `app_user` table | All phases (foreign key references) |
| `app_role` table | All phases (RLS policies, task assignment) |
| `user_role` table | All phases (role checking) |
| RLS helper functions | All phases (policy evaluation) |
| `AuthContext` | All pages (user state) |
| `RoleGuard` | All protected routes |
| `super_admin_bootstrap` | All phases (Test environment verification) |

---

## 10. Risks

| Risk ID | Description | Severity | Mitigation |
|---------|-------------|----------|------------|
| RISK-011 | Authentication Failure | High | Use Supabase managed service; implement proper error handling |
| RISK-005 | RLS Policy Bypass | Critical | Enable RLS immediately on all identity tables; test thoroughly |
| RISK-008 | Darkone Parity Loss | Medium | Use extension pattern only; no modifications to existing Darkone files |

---

## 11. Task Breakdown

Reference: `execution_plan_ams_rvm_core_v1.md`

| Task ID | Description | Est. |
|---------|-------------|------|
| P1-001 | Enable External Supabase | 2 |
| P1-001a | Environment Variable Setup | 1 |
| P1-002 | Create Identity Schema | 2 |
| P1-003 | Configure Authentication | 2 |
| P1-004 | Create Auth Context | 2 |
| P1-005 | Create RoleGuard Component | 2 |
| P1-006 | Add RVM Menu Structure | 1 |
| P1-007 | Create Placeholder Pages | 1 |
| P1-008 | Identity RLS Policies | 2 |
| P1-009 | Phase 1 Verification | 1 |

**Total Estimated Points:** 16

---

## 12. Hard Stop Statement

**Phase 1 implementation may NOT proceed until:**
- All entry criteria verified
- Phase 0 completion confirmed
- Explicit Phase 1 authorization received

**After Phase 1 completion:**
- Phase 2 may NOT proceed until Phase 1 approval obtained
- Explicit Phase 2 authorization required

---

**Document Status:** Planning Only — Implementation NOT Started
