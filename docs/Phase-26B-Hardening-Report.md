# Phase 26B — Pre-VPS Hardening Report

**Date:** 2026-03-21
**Phase:** 26B
**Type:** CONTROLLED IMPLEMENTATION — Dependency hardening + Chair timestamp analysis
**Author:** Claude Code (Remediation Agent)
**Preceding:** Phase 26A (docs/Phase-26A-Remediation-Report.md)

---

## 1. What Was Changed

### Item 1 — `axios-mock-adapter` Moved to devDependencies

**Audit finding:** H5 — `axios-mock-adapter` in production dependencies
**File changed:** `package.json`

**Before:**
```json
"dependencies": {
  ...
  "axios-mock-adapter": "^2.1.0",
  ...
}
```

**After:**
```json
"devDependencies": {
  ...
  "axios-mock-adapter": "^2.1.0",
  ...
}
```

**Why:** `axios-mock-adapter` is a library for intercepting and mocking HTTP requests in automated tests. It has no function in a production frontend build. Its presence in `dependencies` meant it was being bundled into every production deployment. It is now correctly classified as a development-only tool.

**Risk introduced:** None. The package is only ever used in test files. Moving it to `devDependencies` has no effect on production builds (Vite bundles `src/` imports, not arbitrary `dependencies`). The change ensures VPS production installs (`npm ci --omit=dev`) do not include it.

**Stray blank line also removed** from `devDependencies` block (leftover from Phase 26A edit).

---

## 2. Chair Approval Timestamp — Authoritative Analysis

**Audit finding:** H3 — `chair_approved_at` set client-side in `decisionService.recordChairApproval()`

### The Problem

```typescript
// src/services/decisionService.ts — recordChairApproval()
async recordChairApproval(id: string, chairUserId: string) {
  const result = await supabase
    .from('rvm_decision')
    .update({
      chair_approved_by: chairUserId,
      chair_approved_at: new Date().toISOString(),  // ← CLIENT CLOCK
    })
    ...
}
```

A user with the `chair_rvm` role can set their system clock to any value before calling this function, producing an approval timestamp that predates or postdates the actual event. For a government audit trail, approval timestamps must be authoritative.

### Migration Investigation

All 21 migration files were searched for:
- `chair_approved_at = now()` — **0 matches**
- `NEW.chair_approved_at :=` — **0 matches**

The current `enforce_chair_approval_gate()` trigger (Phase 16 rewrite, `20260226030704_...`) was read in full:

```sql
CREATE OR REPLACE FUNCTION public.enforce_chair_approval_gate()
RETURNS TRIGGER LANGUAGE plpgsql AS $function$
BEGIN
  IF NEW.is_final = true AND OLD.is_final = false THEN
    IF NEW.chair_approved_at IS NULL OR NEW.chair_approved_by IS NULL THEN
      PERFORM public.log_illegal_attempt(...);
      RETURN NULL;   -- blocks finalization
    END IF;
    -- cascade: set parent dossier to 'decided'
    ...
  END IF;
  RETURN NEW;
END;
```

**Finding:** The trigger CHECKS that `chair_approved_at IS NOT NULL` but NEVER ASSIGNS the value. The value must be provided in the `UPDATE` payload. No other trigger or function in the codebase sets `chair_approved_at` automatically.

### Why a Code-Level Fix Is Invalid

If `chair_approved_at` is removed from `decisionService.recordChairApproval()`:

1. The UPDATE payload would contain `{ chair_approved_by: chairUserId }` only
2. `chair_approved_at` would remain NULL in the database
3. Any subsequent finalization attempt (`is_final = true`) would be blocked by the gate trigger: `IF NEW.chair_approved_at IS NULL → RETURN NULL`
4. **All decision finalization would be permanently broken**

This is not a code-level defect. It is a missing database-level control.

### Verdict

**CLASSIFICATION: DB-LEVEL HARDENING REQUIRED BEFORE VPS**

The fix requires a new migration. No application code change can resolve this safely.

### Recommended Implementation (Phase 26C)

Add a `BEFORE UPDATE` trigger on `rvm_decision` that automatically sets `chair_approved_at = now()` when `chair_approved_by` transitions from NULL to a value:

```sql
-- Migration: Phase 26C — Server-side chair approval timestamp
CREATE OR REPLACE FUNCTION public.set_chair_approval_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Set server-side timestamp when chair approval is first recorded
  IF NEW.chair_approved_by IS NOT NULL AND (OLD.chair_approved_by IS NULL OR OLD.chair_approved_by != NEW.chair_approved_by) THEN
    NEW.chair_approved_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_chair_approval_timestamp
  BEFORE UPDATE ON public.rvm_decision
  FOR EACH ROW
  EXECUTE FUNCTION public.set_chair_approval_timestamp();
```

**After this migration is deployed**, the application code change is:

```typescript
// Remove chair_approved_at from recordChairApproval()
async recordChairApproval(id: string, chairUserId: string) {
  const result = await supabase
    .from('rvm_decision')
    .update({
      chair_approved_by: chairUserId,
      // chair_approved_at is now set server-side by trigger
    })
    .eq('id', id)
    .select()

  return handleGuardedUpdate(result, 'rvm_decision', id)
},
```

**This is a two-part change: migration first, then application code.** Do NOT remove `chair_approved_at` from the application code until the migration is verified in production.

---

## 3. Files Changed

| File | Type | Change |
|------|------|--------|
| `package.json` | Modified | `axios-mock-adapter` moved from `dependencies` to `devDependencies` |
| `docs/restore-points/RP-Phase-26B-pre.md` | Created | Pre-change restore point |
| `docs/restore-points/RP-Phase-26B-post.md` | Created | Post-change restore point |
| `docs/VPS-Readiness-Boundary.md` | Created | Authoritative VPS readiness boundary document |
| `docs/Phase-26B-Hardening-Report.md` | Created | This document |

**Not changed:**
- `src/services/decisionService.ts` — no code change (DB trigger required first)
- Any other application file
- Any database migration
- Any RLS policy

---

## 4. Chair Approval Timestamp Verdict

| | |
|---|---|
| **Status** | UNRESOLVED — DB-level hardening required |
| **Application code change valid?** | NO — would break finalization |
| **Required fix** | New migration: `set_chair_approval_timestamp` BEFORE UPDATE trigger |
| **Assigned to** | Phase 26C |
| **Risk until fixed** | `chair_approved_at` is not server-authoritative. Manipulation requires `chair_rvm` role AND deliberate clock tampering. Low exploitation probability in internal government system, but governance integrity is not fully satisfied. |

---

## 5. Remaining VPS Blockers

After Phase 26A + 26B, the application code blockers are reduced to:

| Blocker | Type | Phase |
|---------|------|-------|
| `chair_approved_at` DB trigger missing | Migration required | Phase 26C |
| nginx SPA routing config | Infrastructure | Manual |
| PM2/systemd process manager | Infrastructure | Manual |
| SSL/TLS configuration | Infrastructure | Manual |
| `.env` file on VPS | Infrastructure | Manual |

---

## 6. Validation

The following validations apply after Phase 26B changes:

| Test | Expected | Notes |
|------|----------|-------|
| `npm run build` | Exits 0, no errors | axios-mock-adapter is devDep — not imported in `src/` |
| App loads | Dashboard renders | No change to runtime behavior |
| Login works | Auth completes | No auth changes |
| Document upload | Upload succeeds | No document service changes |
| Document download | File downloads | No changes |
| Chair approval | `recordChairApproval()` still sets both fields | No change — client-side timestamp unchanged |
| Decision finalization | Gate trigger allows with valid approval | No change to trigger |

The `axios-mock-adapter` move has **zero runtime impact** because Vite bundles `src/` file imports, not `package.json` entries. The package was never imported in production source code.

---

## 7. Status

**PHASE 26B COMPLETE**

**VPS READY WITH CONDITIONS**

Conditions remaining:
1. Phase 26C: `chair_approved_at` DB trigger + application code cleanup
2. Infrastructure: nginx, PM2, SSL, `.env` deployment

See `docs/VPS-Readiness-Boundary.md` for the complete boundary document.

---

*Report generated by Claude Code, 2026-03-21*
*Stopping. Awaiting further instructions for Phase 26C.*
