
# Phase 2 Implementation Plan — Core Domain (DB Foundation)

## Authorization Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 2 (Core Domain — DB Foundation)
- **Date:** 2026-01-28
- **Scope:** Schema + RLS Preparation (No UI, No Business Logic)

---

## Pre-Phase Assessment

### Current State
| Component | Status |
|-----------|--------|
| External Supabase | Connected (`smjjpxhgnomucvmmllaj`) |
| Database Schema | Empty (verified) |
| Fake Auth Backend | Active in `src/App.tsx` (MUST DISABLE) |
| Migration Folder | Created (`/supabase/migrations/`) |

---

## Implementation Sequence (Numbered Steps)

### Step 1: DISABLE FAKE AUTH BACKEND (Critical First Step)

**Files to Modify:**
1. `src/App.tsx` — Remove `configureFakeBackend()` call
2. `src/helpers/fake-backend.ts` — Keep file but export empty function (preserve template parity)

**Technical Shim for Shell Loading:**
- Modify `src/context/useAuthContext.tsx` to support a "development bypass" mode
- This allows the admin shell to load without real authentication (temporary Phase 2 only)
- Uses localStorage flag `_AMS_RVM_DEV_MODE_` to bypass auth check
- NO new UI screens, NO styling changes

**Impact Assessment:**
- Sign-in form will remain visible (Darkone UI 1:1)
- Sign-in will no longer function (expected)
- Admin routes will load via dev bypass shim
- Users will see existing auth pages but cannot use fake credentials

---

### Step 2: CREATE PRE-PHASE RESTORE POINT

**Restore Point:** `RP-P2-pre-20260128`

Contents:
- Codebase snapshot reference
- Database state: Empty public schema
- Fake Auth status: Active (before disable)

---

### Step 3: CREATE IDENTITY SCHEMA MIGRATION

**Migration File:** `supabase/migrations/20260128_001_identity_schema.sql`

**Contents (from Backend Design):**

```sql
-- ============================================
-- PHASE 2: IDENTITY & ACCESS SCHEMA
-- AMS-RVM Core (v1)
-- ============================================

-- 3.1 Users Table
CREATE TABLE app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.2 Roles Table (9 RVM Roles)
CREATE TABLE app_role (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- 3.3 User-Role Mapping
CREATE TABLE user_role (
  user_id UUID REFERENCES app_user(id) ON DELETE CASCADE,
  role_code TEXT REFERENCES app_role(code) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_code)
);

-- 3.4 Super Admin Bootstrap (Test/Bootstrap ONLY)
CREATE TABLE super_admin_bootstrap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  purpose TEXT DEFAULT 'testing/bootstrap',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);
```

---

### Step 4: CREATE RLS HELPER FUNCTIONS

**Migration File:** `supabase/migrations/20260128_002_rls_functions.sql`

```sql
-- ============================================
-- RLS HELPER FUNCTIONS
-- ============================================

-- Get current user's app_user id
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM app_user WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's roles as array
CREATE OR REPLACE FUNCTION get_user_roles()
RETURNS TEXT[] AS $$
  SELECT COALESCE(ARRAY_AGG(role_code), ARRAY[]::TEXT[])
  FROM user_role
  WHERE user_id = (
    SELECT id FROM app_user WHERE auth_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT required_role = ANY(get_user_roles());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT get_user_roles() && required_roles;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Super Admin check (Test environment ONLY)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM super_admin_bootstrap
    WHERE auth_id = auth.uid()
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

### Step 5: SEED ROLE REFERENCE DATA

**Migration File:** `supabase/migrations/20260128_003_seed_roles.sql`

```sql
-- ============================================
-- SEED: RVM ROLE DEFINITIONS
-- 9 Independent Roles (No Hierarchy)
-- ============================================

INSERT INTO app_role (code, name, description) VALUES
  ('chair_rvm', 'Chair of the Council of Ministers', 
   'Final approval authority for RVM decisions'),
  ('secretary_rvm', 'Secretary RVM', 
   'Procedural and reporting authority'),
  ('deputy_secretary', 'Deputy Secretary / Coordinator', 
   'Operational coordination'),
  ('admin_intake', 'Administration – Intake', 
   'Registration of incoming items'),
  ('admin_dossier', 'Administration – Dossier Management', 
   'Dossier preparation & tracking'),
  ('admin_agenda', 'Administration – Agenda & Convocation', 
   'Agenda preparation'),
  ('admin_reporting', 'Administration – Decision Lists & Reports', 
   'Decision lists and reporting'),
  ('audit_readonly', 'Audit', 
   'Read-only access for control bodies'),
  ('rvm_sys_admin', 'System Administrator', 
   'Technical administration (no decision authority)');
```

---

### Step 6: ENABLE RLS ON IDENTITY TABLES

**Migration File:** `supabase/migrations/20260128_004_identity_rls.sql`

```sql
-- ============================================
-- RLS POLICIES: IDENTITY TABLES
-- ============================================

-- Enable RLS
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_bootstrap ENABLE ROW LEVEL SECURITY;

-- app_user policies
CREATE POLICY app_user_select ON app_user
  FOR SELECT TO authenticated
  USING (
    auth_id = auth.uid() 
    OR has_any_role(ARRAY['secretary_rvm', 'deputy_secretary', 'rvm_sys_admin'])
    OR is_super_admin()
  );

-- app_role policies (roles are public reference data)
CREATE POLICY app_role_select ON app_role
  FOR SELECT TO authenticated
  USING (true);

-- user_role policies
CREATE POLICY user_role_select ON user_role
  FOR SELECT TO authenticated
  USING (
    user_id = get_current_user_id()
    OR has_any_role(ARRAY['secretary_rvm', 'rvm_sys_admin'])
    OR is_super_admin()
  );

-- super_admin_bootstrap (sys_admin only)
CREATE POLICY super_admin_select ON super_admin_bootstrap
  FOR SELECT TO authenticated
  USING (
    auth_id = auth.uid() 
    OR has_role('rvm_sys_admin')
  );
```

---

### Step 7: CREATE INDEXES

**Migration File:** `supabase/migrations/20260128_005_identity_indexes.sql`

```sql
-- ============================================
-- INDEXES: IDENTITY TABLES
-- ============================================

CREATE INDEX idx_app_user_auth_id ON app_user(auth_id);
CREATE INDEX idx_app_user_email ON app_user(email);
CREATE INDEX idx_app_user_active ON app_user(is_active) WHERE is_active = true;
CREATE INDEX idx_user_role_user ON user_role(user_id);
CREATE INDEX idx_user_role_code ON user_role(role_code);
CREATE INDEX idx_super_admin_auth ON super_admin_bootstrap(auth_id);
```

---

### Step 8: UPDATE SUPABASE TYPES

After migration execution, the types file will be auto-regenerated to include:
- `app_user` table type
- `app_role` table type
- `user_role` table type
- `super_admin_bootstrap` table type

---

### Step 9: CREATE POST-PHASE RESTORE POINT

**Restore Point:** `RP-P2-post-20260128`

Contents:
- Codebase snapshot reference
- Database state: Identity schema deployed
- Tables: `app_user`, `app_role`, `user_role`, `super_admin_bootstrap`
- RLS: Enabled on all identity tables
- Functions: 5 helper functions deployed
- Seed data: 9 RVM roles

---

## Scope Compliance Matrix

### Allowed — Implementation Plan
| Scope Item | Status |
|------------|--------|
| Disable Fake Auth Backend | Planned (Step 1) |
| Create schema migrations | Planned (Steps 3-7) |
| Create enums | Deferred (Phase 2B — Core Domain tables) |
| Create identity tables | Planned (Step 3) |
| Create RLS helper functions | Planned (Step 4) |
| Seed role reference data | Planned (Step 5) |
| Enable RLS on identity tables | Planned (Step 6) |
| Create indexes | Planned (Step 7) |
| Pre-phase restore point | Planned (Step 2) |
| Post-phase restore point | Planned (Step 9) |

### Forbidden — Compliance Verification
| Forbidden Item | Status |
|----------------|--------|
| Business logic | NOT IMPLEMENTED |
| AMS modules | NOT IMPLEMENTED |
| Auth UI flows | NOT IMPLEMENTED |
| Role management UI | NOT IMPLEMENTED |
| User provisioning UI | NOT IMPLEMENTED |
| Super Admin user creation | NOT IMPLEMENTED |
| New UI libraries | NOT IMPLEMENTED |
| Layout refactors | NOT IMPLEMENTED |
| Styling changes | NOT IMPLEMENTED |

---

## Technical Details

### Files to Create
1. `supabase/migrations/20260128_001_identity_schema.sql`
2. `supabase/migrations/20260128_002_rls_functions.sql`
3. `supabase/migrations/20260128_003_seed_roles.sql`
4. `supabase/migrations/20260128_004_identity_rls.sql`
5. `supabase/migrations/20260128_005_identity_indexes.sql`
6. `Project Restore Points/RP-P2-pre-20260128.md`
7. `Project Restore Points/RP-P2-post-20260128.md`

### Files to Modify
1. `src/App.tsx` — Remove fake backend call
2. `src/helpers/fake-backend.ts` — Export empty function
3. `src/context/useAuthContext.tsx` — Add dev bypass shim

### Dev Bypass Shim (Technical Detail)

The shim adds a check in `useAuthContext.tsx`:

```typescript
// Development bypass for Phase 2 (no real auth yet)
const DEV_BYPASS_KEY = '_AMS_RVM_DEV_MODE_'

const isDevBypass = (): boolean => {
  try {
    return localStorage.getItem(DEV_BYPASS_KEY) === 'true'
  } catch {
    return false
  }
}
```

This allows:
- Admin shell to load during Phase 2 development
- No new UI screens
- No styling changes
- Removable when real Supabase auth is implemented

---

## Database Entity Summary

### Tables Created (Phase 2)
| Table | Purpose | RLS |
|-------|---------|-----|
| `app_user` | User identity linked to auth.users | Enabled |
| `app_role` | 9 RVM role definitions | Enabled |
| `user_role` | User-role assignments | Enabled |
| `super_admin_bootstrap` | Test/bootstrap access | Enabled |

### Functions Created
| Function | Purpose |
|----------|---------|
| `get_current_user_id()` | Returns app_user.id for current session |
| `get_user_roles()` | Returns array of role codes for current user |
| `has_role(role)` | Checks if user has specific role |
| `has_any_role(roles[])` | Checks if user has any of specified roles |
| `is_super_admin()` | Checks super admin bootstrap status |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Dev bypass could be exploited | Clearly documented as Phase 2 only; removed in Phase 3+ |
| RLS recursion issues | Used SECURITY DEFINER functions per Supabase best practices |
| Schema drift | All changes via versioned migrations |

---

## Deliverables

1. **Fake Auth Disabled** — Confirmed with impact assessment
2. **Pre-Phase Restore Point** — `RP-P2-pre-20260128`
3. **5 Migration Files** — Versioned in `/supabase/migrations/`
4. **Post-Phase Restore Point** — `RP-P2-post-20260128`
5. **Phase 2 Completion Report** — DONE/SKIPPED/DEFERRED matrix

---

## HARD STOP

After completing Phase 2 (DB Foundation):
- Identity schema deployed
- RLS enabled
- Fake Auth disabled
- Restore points created

**Await explicit authorization for Phase 2B (Core Domain enums/tables) or Phase 3 (Workflow Engine).**
