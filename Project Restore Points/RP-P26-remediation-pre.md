# Restore Point — Phase 26C Pre-Implementation

**Date:** 2026-03-21
**Phase:** 26C — Chair Approval Timestamp Hardening
**Type:** PRE-IMPLEMENTATION snapshot
**Author:** Claude Code (Remediation Agent)

---

## State Entering Phase 26C

Phase 26B is complete. The following changes have already been applied:

| Item | Status |
|------|--------|
| `src/integrations/supabase/client.ts` — env vars | ✅ Fixed in 26A |
| `vite.config.ts` — lovable-tagger removed | ✅ Fixed in 26A |
| `package.json` — lovable-tagger removed from devDependencies | ✅ Fixed in 26A |
| `src/services/documentService.ts` — upload-first atomicity | ✅ Fixed in 26A |
| `src/services/dossierService.ts` — orphan ID surfaced | ✅ Fixed in 26A |
| `.env.example` — created | ✅ Fixed in 26A |
| `package.json` — axios-mock-adapter moved to devDependencies | ✅ Fixed in 26B |

---

## Files in Scope for Phase 26C

### `src/services/decisionService.ts` — BEFORE (lines 134–150)

```typescript
/**
 * Record Chair RVM approval (manual recording, no automation)
 * NOTE: This does NOT auto-finalize. Chair gate enforcement is Phase 5.
 * This method is for RECORDING that approval was given.
 */
async recordChairApproval(id: string, chairUserId: string) {
  const result = await supabase
    .from('rvm_decision')
    .update({
      chair_approved_by: chairUserId,
      chair_approved_at: new Date().toISOString(),  // ← CLIENT-SIDE TIMESTAMP (to be removed)
    })
    .eq('id', id)
    .select()

  return handleGuardedUpdate(result, 'rvm_decision', id)
},
```

`chair_approved_at` is currently set from the client's system clock. Phase 26C replaces this with a server-side DB trigger that sets the timestamp automatically when `chair_approved_by` is first assigned.

### Database — BEFORE

No server-side mechanism sets `chair_approved_at`. The field is entirely reliant on the client payload.

The existing `enforce_chair_approval_gate()` trigger (migration `20260226030704_...`) only CHECKS that `chair_approved_at IS NOT NULL` during finalization — it does NOT set the value.

---

## To Revert Phase 26C

If Phase 26C changes need to be reverted:

1. In `src/services/decisionService.ts`, restore `chair_approved_at: new Date().toISOString()` to the `recordChairApproval()` update payload
2. Drop the DB trigger and function:
   ```sql
   DROP TRIGGER IF EXISTS set_chair_approval_timestamp ON public.rvm_decision;
   DROP FUNCTION IF EXISTS public.set_chair_approval_timestamp();
   ```
3. Delete the migration file `supabase/migrations/20260321210000_chair-approval-server-timestamp.sql`
4. Run `npm install` is not required (no package changes)
