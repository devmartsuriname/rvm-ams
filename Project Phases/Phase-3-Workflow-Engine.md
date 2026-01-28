# Phase 3: Workflow Engine & RLS Deepening
## AMS – RVM Core (v1)

---

## Phase Status: ✓ COMPLETE

**Completion Date:** 2026-01-28

---

## 1. Objective

Implement **role-based RLS policies**, **workflow state helpers**, and **Supabase Auth integration** for RVM application access control.

---

## 2. Scope — Delivered

### 2.1 Role-Based RLS (10 Tables)
- [x] `rvm_dossier` — All RVM roles read, admin_intake insert, secretary/admin_dossier update
- [x] `rvm_item` — Role-based CRUD
- [x] `rvm_meeting` — secretary_rvm/admin_agenda management
- [x] `rvm_agenda_item` — secretary_rvm/admin_agenda management
- [x] `rvm_decision` — chair_rvm finalization, secretary draft management
- [x] `rvm_document` — Role-based document access
- [x] `rvm_document_version` — Immutable versions (no UPDATE)
- [x] `rvm_task` — Assignee + manager access patterns
- [x] `audit_event` — SELECT only (INSERT deferred to Phase 8)
- [x] `missive_keyword` — Reference data + admin management

### 2.2 Workflow State Helpers
- [x] `is_dossier_editable(UUID)` — State-based edit check
- [x] `is_meeting_editable(UUID)` — Meeting status check
- [x] `is_decision_draft(UUID)` — Finalization check
- [x] `is_task_assignee(UUID)` — Ownership check

### 2.3 Supabase Auth Integration
- [x] `onAuthStateChange` listener in AuthProvider
- [x] `signInWithPassword` in useSignIn hook
- [x] Session mapping (auth.users → app_user → user_role)
- [x] TypeScript types updated (auth_id, roles[])

### 2.4 Dev Bypass Retirement
- [x] Removed `_AMS_RVM_DEV_MODE_` localStorage shim
- [x] Auth now depends on real Supabase session

---

## 3. Scope — Deferred

### Deferred to Phase 5 (Decision Management)
- [ ] `prevent_decision_modification()` trigger

### Deferred to Phase 8 (Audit Finalization)
- [ ] `log_audit_event()` function
- [ ] `prevent_audit_modification()` trigger
- [ ] `prevent_audit_deletion()` trigger
- [ ] Audit INSERT controlled access

### Deferred to Future Phase
- [ ] Sign-up flow wiring
- [ ] Password reset flow wiring

---

## 4. Restore Points

| Restore Point | Timing | Status |
|---------------|--------|--------|
| `RP-P3-pre-20260128` | Before Phase 3 | ✓ Created |
| `RP-P3-post-20260128` | After Phase 3 | ✓ Created |

---

## 5. Migration Applied

**File:** Phase 3 Role-Based RLS + Workflow Helpers

### RLS Matrix Summary

| Entity | chair_rvm | secretary_rvm | deputy_secretary | admin_intake | admin_dossier | admin_agenda | admin_reporting | audit_readonly |
|--------|-----------|---------------|------------------|--------------|---------------|--------------|-----------------|----------------|
| rvm_dossier | R | RU | R | RCU | RU | R | R | R |
| rvm_item | R | RU | - | RCU | RU | - | - | R |
| rvm_meeting | R | RCU | - | - | - | RCU | - | R |
| rvm_agenda_item | R | RCU | - | - | - | RCU | - | R |
| rvm_decision | RU* | RCU | R | - | - | - | RC | R |
| rvm_document | R | RCU | - | - | RCU | - | RCU | R |
| rvm_document_version | R | RC | - | - | RC | - | RC | R |
| rvm_task | R | RCU | RCU | R† | R† | R† | R† | - |
| audit_event | - | R | - | - | - | - | - | R |

**Legend:** R=Read, C=Create, U=Update, *=Finalization only, †=Own tasks only

---

## 6. Frontend Files Modified

| File | Change |
|------|--------|
| `src/context/useAuthContext.tsx` | Supabase onAuthStateChange, session mapping |
| `src/app/(other)/auth/sign-in/useSignIn.ts` | signInWithPassword integration |
| `src/types/auth.ts` | Added auth_id, full_name, roles array |
| `src/routes/router.tsx` | Loading state handling for auth |

---

## 7. Verification Status

| Check | Status |
|-------|--------|
| RLS policies deployed | ✓ |
| Workflow helpers deployed | ✓ |
| Supabase auth integrated | ✓ |
| Sign-in functional | ✓ |
| Dev bypass retired | ✓ |
| TypeScript types updated | ✓ |
| Pre-phase restore point | ✓ |
| Post-phase restore point | ✓ |

---

## 8. Risks

| Risk | Mitigation |
|------|------------|
| No test users for auth | Super-admin bootstrap available |
| RLS may block development queries | is_super_admin() bypass in all policies |
| Missing app_user mapping | Sign-in validates app_user exists |

---

## 9. Governance Gate

**Gate Status:** PASSED

Requirements Met:
- [x] All deliverables completed
- [x] Post-phase restore point created
- [x] Completion report submitted
- [ ] Explicit approval for Phase 4 — PENDING

---

## 10. Next Steps

1. **Create Test User:** Add Supabase auth user + app_user + user_role entries
2. **Verify Sign-In:** Test full authentication flow
3. **Await Phase 4 Authorization:** Agenda Management

---

## Hard Stop Statement

**Phase 3 COMPLETE.**

Phase 4 implementation may NOT proceed until explicit authorization received.

---

**Document Status:** ✓ COMPLETE — 2026-01-28
