
# Phase 3 Implementation Plan — REVISED (Blockers Resolved)

## Authorization Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 3 (Workflow Engine & RLS Deepening)
- **Date:** 2026-01-28
- **Revision:** v2 (Blockers Resolved)

---

## CORRECTION SUMMARY

### Blocker 1: Audit Event Insertion Risk — RESOLVED

| Original Plan | Corrected Status | Rationale |
|---------------|------------------|-----------|
| Step 5: `log_audit_event()` function | **DEFERRED TO PHASE 8** | Keeps all audit infrastructure together with immutability enforcement; eliminates potential bypass paths |

**Resolution:** Option A selected — The `log_audit_event()` function will be implemented in Phase 8 alongside `prevent_audit_modification()` and `prevent_audit_deletion()` triggers. Phase 3 will only establish the RLS SELECT policy for `audit_event`, with INSERT remaining denied for all authenticated users.

### Blocker 2: Sign-Up Flow Out of Scope — RESOLVED

| Original Plan | Corrected Status |
|---------------|------------------|
| Step 2.3: Wire sign-up to `supabase.auth.signUp()` | **REMOVED FROM PHASE 3** |

**Resolution:** Sign-up wiring is explicitly DEFERRED. Phase 3 will implement ONLY:
- Supabase auth state listener (`onAuthStateChange`)
- Sign-in via `signInWithPassword`
- Session persistence

---

## Current State Assessment

### Database State (Post-Phase 2B)
| Component | Status |
|-----------|--------|
| Identity Tables | `app_user`, `app_role`, `user_role`, `super_admin_bootstrap` |
| Domain Tables | 10 tables with baseline RLS (super-admin only) |
| Enums | 12 types deployed |
| RLS Helper Functions | `get_user_roles()`, `has_role()`, `has_any_role()`, `is_super_admin()`, `get_current_user_id()` |

### Frontend State
| Component | Status |
|-----------|--------|
| Dev Bypass Shim | ACTIVE (`_AMS_RVM_DEV_MODE_`) |
| Sign-In Form | Uses deprecated `httpClient.post('/login')` |

---

## REVISED Implementation Sequence

### Step 1: CREATE PRE-PHASE RESTORE POINT

**Restore Point:** `RP-P3-pre-20260128`

Contents:
- Database: Phase 2B schema (baseline RLS)
- Frontend: Dev bypass shim active
- Auth: Not integrated with Supabase

---

### Step 2: INTEGRATE SUPABASE AUTH (Sign-In Only)

**Objective:** Wire Supabase Auth at infrastructure level — SIGN-IN ONLY

**Files to Modify:**

#### 2.1 `src/context/useAuthContext.tsx`
- Add Supabase `onAuthStateChange` listener
- Map Supabase `auth.user` to existing `UserType` structure
- Query `app_user` table to get application user ID and roles
- Maintain session persistence via Supabase built-in mechanism
- Maintain dev bypass shim as fallback during Phase 3

#### 2.2 `src/app/(other)/auth/sign-in/useSignIn.ts`
- Replace `httpClient.post('/login')` with `supabase.auth.signInWithPassword()`
- Map Supabase auth response to existing session format
- Preserve existing form structure (Darkone 1:1 parity)

**REMOVED:** Sign-up wiring (DEFERRED)

**NO UI CHANGES:** Sign-in form remains visually identical

---

### Step 3: IMPLEMENT ROLE-BASED RLS POLICIES

**Objective:** Replace baseline (super-admin only) RLS with full role-based access per RLS Matrix

**Migration Files:**

#### 3.1 `rvm_dossier` and `rvm_item` RLS

```sql
-- Drop baseline policies
DROP POLICY IF EXISTS rvm_dossier_baseline_select ON rvm_dossier;
DROP POLICY IF EXISTS rvm_dossier_baseline_insert ON rvm_dossier;
DROP POLICY IF EXISTS rvm_dossier_baseline_update ON rvm_dossier;

-- Role-based SELECT: All RVM roles
CREATE POLICY rvm_dossier_select ON rvm_dossier
  FOR SELECT TO authenticated
  USING (
    has_any_role(ARRAY['chair_rvm', 'secretary_rvm', 'deputy_secretary',
      'admin_intake', 'admin_dossier', 'admin_agenda', 'admin_reporting', 'audit_readonly'])
    OR is_super_admin()
  );

-- Role-based INSERT: admin_intake only
CREATE POLICY rvm_dossier_insert ON rvm_dossier
  FOR INSERT TO authenticated
  WITH CHECK (has_role('admin_intake') OR is_super_admin());

-- Role-based UPDATE: secretary_rvm, admin_dossier (not after decided/archived)
CREATE POLICY rvm_dossier_update ON rvm_dossier
  FOR UPDATE TO authenticated
  USING (
    (has_any_role(ARRAY['secretary_rvm', 'admin_dossier']) 
      AND status NOT IN ('decided', 'archived', 'cancelled'))
    OR is_super_admin()
  );
```

Similar pattern for `rvm_item`.

#### 3.2 `rvm_meeting` and `rvm_agenda_item` RLS

| Operation | Policy |
|-----------|--------|
| SELECT | All RVM roles |
| INSERT | `secretary_rvm`, `admin_agenda` |
| UPDATE | `secretary_rvm`, `admin_agenda` (meeting not closed) |
| DELETE | None |

#### 3.3 `rvm_decision` RLS

| Operation | Policy |
|-----------|--------|
| SELECT | `chair_rvm`, `secretary_rvm`, `deputy_secretary`, `admin_reporting`, `audit_readonly` |
| INSERT | `secretary_rvm`, `admin_reporting` |
| UPDATE | `secretary_rvm` (when not final), `chair_rvm` (for finalization) |
| DELETE | None |

#### 3.4 `rvm_document` and `rvm_document_version` RLS

| Operation | Policy |
|-----------|--------|
| SELECT | All RVM roles + `audit_readonly` |
| INSERT | `secretary_rvm`, `admin_dossier`, `admin_reporting` |
| UPDATE | `secretary_rvm`, `admin_dossier` (document only) |
| DELETE | None |

#### 3.5 `rvm_task` RLS

| Operation | Policy |
|-----------|--------|
| SELECT | Assigned role + `secretary_rvm` + `deputy_secretary` |
| INSERT | `secretary_rvm`, `deputy_secretary` |
| UPDATE | Own tasks + `secretary_rvm` + `deputy_secretary` |
| DELETE | None |

#### 3.6 `audit_event` RLS (SELECT Only)

```sql
-- Drop baseline policies
DROP POLICY IF EXISTS audit_event_baseline_select ON audit_event;
DROP POLICY IF EXISTS audit_event_baseline_insert ON audit_event;

-- Role-based SELECT only
CREATE POLICY audit_event_select ON audit_event
  FOR SELECT TO authenticated
  USING (
    has_any_role(ARRAY['audit_readonly', 'secretary_rvm', 'rvm_sys_admin'])
    OR is_super_admin()
  );

-- NO INSERT POLICY for authenticated users
-- INSERT will be controlled via Phase 8 infrastructure
-- Currently: No authenticated user can INSERT audit rows
```

**IMPORTANT:** `audit_event` has NO INSERT policy for `authenticated` role. Only super-admin bootstrap can insert during testing. Full audit infrastructure deferred to Phase 8.

#### 3.7 `missive_keyword` RLS (Reference Data)

```sql
-- Keep SELECT for all authenticated (reference data)
-- UPDATE/INSERT restricted to rvm_sys_admin
```

---

### Step 4: IMPLEMENT WORKFLOW STATE HELPERS

**Objective:** Create helper functions for workflow state validation (data-level only)

```sql
-- Check if dossier is in editable state
CREATE OR REPLACE FUNCTION public.is_dossier_editable(p_dossier_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT status NOT IN ('decided', 'archived', 'cancelled')
     FROM rvm_dossier WHERE id = p_dossier_id),
    false
  );
$$;

-- Check if meeting is in editable state
CREATE OR REPLACE FUNCTION public.is_meeting_editable(p_meeting_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT status != 'closed'
     FROM rvm_meeting WHERE id = p_meeting_id),
    false
  );
$$;

-- Check if decision is in draft state (not finalized)
CREATE OR REPLACE FUNCTION public.is_decision_draft(p_decision_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_final = false
     FROM rvm_decision WHERE id = p_decision_id),
    false
  );
$$;

-- Check if current user is assigned to task
CREATE OR REPLACE FUNCTION public.is_task_assignee(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT assigned_user_id = get_current_user_id()
     FROM rvm_task WHERE id = p_task_id),
    false
  );
$$;
```

---

### Step 5: DEFERRED TO PHASE 8

**Original:** Create `log_audit_event()` function

**Status:** DEFERRED TO PHASE 8

**Rationale:** Audit insertion must be controlled alongside immutability enforcement. Phase 8 will implement:
- `log_audit_event()` function (callable only by service_role or triggers)
- `prevent_audit_modification()` trigger
- `prevent_audit_deletion()` trigger
- Complete audit access control

---

### Step 6: UPDATE TYPESCRIPT TYPES

**File:** `src/types/auth.ts`

```typescript
export type UserType = {
  id: string           // app_user.id
  auth_id: string      // Supabase auth.users.id
  username?: string    // Darkone compat (derived from email)
  email: string
  firstName?: string   // Darkone compat
  lastName?: string    // Darkone compat
  full_name: string    // app_user.full_name
  role: string         // Primary role (Darkone compat)
  roles: string[]      // All assigned role codes
  token?: string       // Supabase access_token (for compat)
}
```

---

### Step 7: RETIRE DEV BYPASS SHIM (Conditional)

**Condition:** Only if Supabase Auth integration is verified working

**Action:**
- Remove `_AMS_RVM_DEV_MODE_` localStorage check from `useAuthContext.tsx`
- Auth state now depends on real Supabase session

**Fallback:** If auth integration incomplete, document status and defer full retirement

---

### Step 8: CREATE POST-PHASE RESTORE POINT

**Restore Point:** `RP-P3-post-20260128`

Contents:
- Database: Role-based RLS deployed
- Frontend: Supabase Auth sign-in integrated
- Workflow helpers deployed
- Dev bypass status documented

---

## RLS Matrix Summary (Phase 3)

### Permission Matrix by Role

| Entity | chair_rvm | secretary_rvm | deputy_secretary | admin_intake | admin_dossier | admin_agenda | admin_reporting | audit_readonly | rvm_sys_admin |
|--------|-----------|---------------|------------------|--------------|---------------|--------------|-----------------|----------------|---------------|
| **rvm_dossier** | R | RU | R | RCU | RU | R | R | R | - |
| **rvm_item** | R | RU | - | RCU | RU | - | - | R | - |
| **rvm_meeting** | R | RCU | - | - | - | RCU | - | R | - |
| **rvm_agenda_item** | R | RCU | - | - | - | RCU | - | R | - |
| **rvm_decision** | RU* | RCU | R | - | - | - | RC | R | - |
| **rvm_document** | R | RCU | - | - | RCU | - | RCU | R | - |
| **rvm_document_version** | R | RC | - | - | RC | - | RC | R | - |
| **rvm_task** | R | RCU | RCU | R† | R† | R† | R† | - | - |
| **audit_event** | - | R | - | - | - | - | - | R | R |
| **missive_keyword** | R | R | R | R | R | R | R | R | RCU |

**Legend:** R=Read, C=Create, U=Update, *=Finalization only, †=Own tasks only

---

## Workflow State Model Summary

### Dossier Lifecycle
```text
draft → registered → in_preparation → scheduled → decided → archived
                                          ↓
                                      cancelled
```

### Meeting Lifecycle
```text
draft → published → closed
```

### Decision Lifecycle
```text
pending → approved/deferred/rejected
              ↓ (Chair approval)
         is_final = true
```

---

## Migration File Summary (REVISED)

| # | Migration File | Contents |
|---|----------------|----------|
| 1 | `20260128_001_role_rls_dossier.sql` | `rvm_dossier`, `rvm_item` role-based RLS |
| 2 | `20260128_002_role_rls_meeting.sql` | `rvm_meeting`, `rvm_agenda_item` role-based RLS |
| 3 | `20260128_003_role_rls_decision.sql` | `rvm_decision` role-based RLS |
| 4 | `20260128_004_role_rls_document.sql` | `rvm_document`, `rvm_document_version` role-based RLS |
| 5 | `20260128_005_role_rls_task.sql` | `rvm_task` role-based RLS |
| 6 | `20260128_006_role_rls_audit.sql` | `audit_event` SELECT-only RLS (no INSERT for authenticated) |
| 7 | `20260128_007_workflow_helpers.sql` | Workflow state helper functions |

**REMOVED:** `20260128_008_audit_helper.sql` — DEFERRED TO PHASE 8

---

## Files to Modify (Frontend)

| File | Change |
|------|--------|
| `src/context/useAuthContext.tsx` | Supabase Auth listener, session mapping |
| `src/app/(other)/auth/sign-in/useSignIn.ts` | Replace httpClient with `signInWithPassword` |
| `src/types/auth.ts` | Add `auth_id`, `roles` array |

**REMOVED:** Sign-up file modifications — DEFERRED

**UI Files:** NO CHANGES (Darkone 1:1 parity preserved)

---

## Deferred Items Register (Phase 3)

### Deferred to Phase 8 (Audit Finalization)
| Item | Type | Reason |
|------|------|--------|
| `log_audit_event()` | Function | Must be controlled alongside immutability triggers |
| `prevent_audit_modification()` | Trigger | Governance enforcement |
| `prevent_audit_deletion()` | Trigger | Governance enforcement |
| Audit INSERT policy | RLS | Controlled insertion only |

### Deferred to Future Phase (TBD)
| Item | Type | Reason |
|------|------|--------|
| Sign-up flow wiring | Auth | Out of Phase 3 scope |
| Password reset flow | Auth | Out of Phase 3 scope |

### Deferred to Phase 5 (Decision Management)
| Item | Type | Reason |
|------|------|--------|
| `prevent_decision_modification()` | Trigger | Governance enforcement |

---

## Scope Compliance Confirmation

### Phase 3 NOW CONTAINS ONLY:
- Supabase Auth integration (sign-in only)
- Auth state listener (`onAuthStateChange`)
- Session persistence via Supabase
- Role-based RLS policies (all domain tables)
- Workflow state helper functions
- TypeScript type updates

### Phase 3 DOES NOT CONTAIN:
- Sign-up flow (DEFERRED)
- Audit insertion function (DEFERRED TO PHASE 8)
- Immutability triggers (DEFERRED)
- UI components or changes
- Decision automation
- Notifications or integrations

---

## Blocker Resolution Confirmation

**Blocker 1 (Audit Event Insertion Risk):** RESOLVED
- `log_audit_event()` function DEFERRED to Phase 8
- `audit_event` table has NO INSERT policy for `authenticated` role
- Only `is_super_admin()` can insert audit rows during testing
- Complete audit infrastructure consolidated in Phase 8

**Blocker 2 (Sign-Up Flow Out of Scope):** RESOLVED
- Sign-up wiring REMOVED from Phase 3
- Only sign-in via `signInWithPassword` implemented
- Sign-up explicitly DEFERRED to future authorized phase

---

## Deliverables

1. **Pre-Phase Restore Point** — `RP-P3-pre-20260128`
2. **7 Migration Files** — Role-based RLS + workflow helpers
3. **Frontend Auth Integration** — Sign-in only (no sign-up)
4. **Post-Phase Restore Point** — `RP-P3-post-20260128`
5. **Phase 3 Completion Report** — DONE/SKIPPED/DEFERRED matrix

---

## HARD STOP

After completing Phase 3:
- Role-based RLS deployed for all domain tables
- Workflow state helpers created
- Supabase Auth sign-in integrated
- Audit infrastructure DEFERRED to Phase 8
- Sign-up DEFERRED to future phase

**Await explicit authorization for Phase 4 (Agenda Management).**
