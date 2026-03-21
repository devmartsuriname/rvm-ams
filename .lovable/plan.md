# Phase 25 — Production Readiness & Go-Live Preparation

## Pre-Execution Analysis

The system is code-complete with all security, governance, and functional validations passed in Phases 23-24. This phase is documentation and verification only.

### What Can Be Verified vs. What Requires Manual Testing

**Verifiable via code inspection:**

- Environment configuration (no hardcoded secrets beyond publishable anon key)
- Console logging inventory (10 instances in auth context + sign-in)
- Error handling patterns (all services use `handleGuardedUpdate` / guarded INSERT)
- Route structure and auth guards

**Requires manual/browser testing (user-assisted):**

- Domain resolution (rvmflow.com)
- Role-based access per user
- Document flow on production domain
- Performance baselines

**Requires DB action:**

- Super admin deactivation (migration to set `is_active = false`)

---

## Execution Plan

### Step 1 — Environment Configuration Audit

Code inspection confirms:

- Supabase URL + anon key in `client.ts` (publishable, acceptable)
- No service role key in client code
- No `.env` secrets beyond `VITE_SUPABASE_*` (publishable)
- No debug/test endpoints active
- Console logging: 10 `console.info/warn` statements in auth flow — document as known, recommend removal for hardened production

**Output:** Section in report.

### Step 2 — Domain & Routing Validation

User must verify manually:

- rvmflow.com resolves to the app
- HTTPS enforced
- Direct URL access to `/auth/sign-in`, `/dashboards`, `/rvm/dossiers`, `/rvm/meetings`, `/search`
- SPA routing works (no 404 on refresh)

**Output:** User-reported results documented in report.

### Step 3 — Role-Based Access Validation

User must test with real role accounts. Code confirms:

- `useUserRoles.ts` gates all UI actions by role
- Router redirects unauthenticated users
- RLS enforces DB-level access

**Output:** User-reported results documented in report.

### Step 4 — Document Flow Final Validation

User must re-test on production domain (not Lovable preview):

- Upload, version, download
- Signed URL works without iframe workaround (production = direct navigation)

**Output:** User-reported results documented in report.

### Step 5 — Error Handling Verification

Code inspection confirms all services use guarded patterns. No raw PostgREST errors should surface.

**Output:** Section in report.

### Step 6 — Logging & Audit Verification

Already validated in Phase 23. Confirm audit_event and illegal_attempt_log are active.

**Output:** Section in report referencing Phase 23 evidence.

### Step 7 — Super Admin Deactivation (MANDATORY)

**Single migration:** `UPDATE super_admin_bootstrap SET is_active = false WHERE is_active = true;`

This is the only DB change in this phase.

### Step 8 — Performance Baseline

User must measure and report load times. No optimization work.

### Step 9 — Security Quick Recheck

Code inspection for console exposure (already inventoried in Step 1).

### Step 10 — Production Checklist Document

Create `docs/Phase-25-Production-Readiness.md`.

---

## Operations


| #   | Op        | Description                             |
| --- | --------- | --------------------------------------- |
| 1   | Migration | Deactivate super_admin_bootstrap        |
| 2   | Create    | `docs/Phase-25-Production-Readiness.md` |


**Total: 2 ops** (1 migration + 1 document)

---

## Technical Detail

### Migration SQL

```sql
UPDATE public.super_admin_bootstrap
SET is_active = false, expires_at = now()
WHERE is_active = true;
```

### User-Required Manual Verifications

The following cannot be automated and require user input before the report is finalized:

1. **Domain:** Confirm rvmflow.com loads the app with HTTPS
2. **Routes:** Test direct URL access to 5 key routes on production domain
3. **Roles:** Log in as secretary, chair, and observer — confirm correct access
4. **Documents:** Upload + download on production domain (not preview)
5. **Performance:** Report approximate load times for dashboard + search

Results will be incorporated into the Phase 25 report.

### Console Logging Inventory (10 statements)


| File                 | Line | Level | Content                     |
| -------------------- | ---- | ----- | --------------------------- |
| `useAuthContext.tsx` | 43   | error | No app_user found           |
| `useAuthContext.tsx` | 48   | warn  | User account inactive       |
| `useAuthContext.tsx` | 109  | info  | User authenticated + email  |
| `useAuthContext.tsx` | 113  | warn  | User mapping failed         |
| `useAuthContext.tsx` | 118  | info  | No active session           |
| `useAuthContext.tsx` | 138  | info  | Auth state change event     |
| `useSignIn.ts`       | 38   | info  | Redirecting to path         |
| `useSignIn.ts`       | 41   | info  | Redirecting to default      |
| `useSignIn.ts`       | 53   | info  | Auth confirmed, redirecting |
| `useSignIn.ts`       | 65   | info  | Already authenticated       |


  
**NOTE — Governance Hardening Additions (Phase 25)**

1. Super Admin Deactivation Safety

- Before executing the migration, confirm:

  - At least one active admin user exists with full access

  - Login with that account is verified

- Add rollback plan:

  UPDATE public.super_admin_bootstrap SET is_active = true WHERE is_active = false;

2. Manual Validation Criteria (Make measurable)

Each manual test must result in:

- PASS → expected behavior occurs without console errors

- FAIL → any error, redirect issue, or missing data

Apply to:

- Domain resolution

- Routing

- Role access

- Document upload/download

- Signed URL behavior

3. Performance Baseline Definition

Define minimum acceptable targets:

- Dashboard load ≤ 2s

- Search response ≤ 1.5s

- Document upload ≤ 3s (small file)

4. Domain Scope Clarification

This phase validates:

- [rvmflow.com](http://rvmflow.com) as pre-production domain (Lovable environment)

- Not final VPS production environment

5. Logging Risk Note

Console logs currently expose user email.

Mark as:

- NON-BLOCKING for go-live

- MUST be removed in Phase 26 (hardening)  
  
  
  
**Recommendation:** Downgrade to `console.debug` or remove email from log output before hardened production. Not blocking for initial go-live.