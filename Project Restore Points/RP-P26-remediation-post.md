# Restore Point — Phase 26C Post-Implementation

**Date:** 2026-03-21
**Phase:** 26C — Chair Approval Timestamp Hardening
**Type:** POST-IMPLEMENTATION snapshot
**Author:** Claude Code (Remediation Agent)

---

## Summary of Changes Applied in Phase 26C

### 1. New Migration — `set_chair_approval_timestamp`

**File:** `supabase/migrations/20260321210000_chair-approval-server-timestamp.sql`

Adds a `BEFORE UPDATE` trigger on `public.rvm_decision` that fires when `chair_approved_by` transitions from NULL to a non-NULL value. When that condition is met, the trigger sets `NEW.chair_approved_at := now()` (server clock, UTC).

The function is defined with `SET search_path TO 'public'` for security, consistent with existing trigger functions in this codebase.

### 2. `src/services/decisionService.ts` — `recordChairApproval()` updated

**Before:**
```typescript
async recordChairApproval(id: string, chairUserId: string) {
  const result = await supabase
    .from('rvm_decision')
    .update({
      chair_approved_by: chairUserId,
      chair_approved_at: new Date().toISOString(),  // client clock
    })
    .eq('id', id)
    .select()
  return handleGuardedUpdate(result, 'rvm_decision', id)
},
```

**After:**
```typescript
async recordChairApproval(id: string, chairUserId: string) {
  const result = await supabase
    .from('rvm_decision')
    .update({
      chair_approved_by: chairUserId,
      // chair_approved_at set server-side by set_chair_approval_timestamp trigger
    })
    .eq('id', id)
    .select()
  return handleGuardedUpdate(result, 'rvm_decision', id)
},
```

---

## Files Changed in Phase 26C

| File | Type | Change |
|------|------|--------|
| `supabase/migrations/20260321210000_chair-approval-server-timestamp.sql` | Created | New DB trigger: server-side chair_approved_at |
| `src/services/decisionService.ts` | Modified | Removed client-side `chair_approved_at` assignment |
| `docs/restore-points/RP-Phase-26C-pre.md` | Created | Pre-change restore point |
| `docs/restore-points/RP-Phase-26C-post.md` | Created | This file |
| `docs/Phase-26C-Chair-Timestamp-Hardening-Report.md` | Created | Phase 26C report |
| `docs/VPS-Readiness-Boundary.md` | Modified | Updated 26C status to COMPLETE |

---

## To Revert Phase 26C

1. In `src/services/decisionService.ts`, restore `chair_approved_at: new Date().toISOString()` to the `recordChairApproval()` update payload
2. Drop the DB trigger and function (run against the Supabase project):
   ```sql
   DROP TRIGGER IF EXISTS set_chair_approval_timestamp ON public.rvm_decision;
   DROP FUNCTION IF EXISTS public.set_chair_approval_timestamp();
   ```
3. Delete `supabase/migrations/20260321210000_chair-approval-server-timestamp.sql`
