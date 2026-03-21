# Restore Point — Phase 26B Pre-Implementation

**Date:** 2026-03-21
**Phase:** 26B — Pre-VPS Hardening
**Type:** PRE-IMPLEMENTATION snapshot
**Author:** Claude Code (Remediation Agent)

---

## State Entering Phase 26B

Phase 26A is complete. The following changes have already been applied:

| Item | Status |
|------|--------|
| `src/integrations/supabase/client.ts` — env vars | ✅ Fixed in 26A |
| `vite.config.ts` — lovable-tagger removed | ✅ Fixed in 26A |
| `package.json` — lovable-tagger removed from devDependencies | ✅ Fixed in 26A |
| `src/services/documentService.ts` — upload-first | ✅ Fixed in 26A |
| `src/services/dossierService.ts` — orphan ID surfaced | ✅ Fixed in 26A |
| `.env.example` — created | ✅ Fixed in 26A |

---

## Files in Scope for Phase 26B

### `package.json` — BEFORE (relevant entry)

In `dependencies`:
```json
"axios-mock-adapter": "^2.1.0",
```

This is a test mocking library. It is in `dependencies` (production), not `devDependencies`. Phase 26B moves it to `devDependencies`.

---

### `src/services/decisionService.ts` — BEFORE (chair approval, lines 130–146)

```typescript
async recordChairApproval(id: string, chairUserId: string) {
  const result = await supabase
    .from('rvm_decision')
    .update({
      chair_approved_by: chairUserId,
      chair_approved_at: new Date().toISOString(),  // ← CLIENT-SIDE TIMESTAMP
    })
    .eq('id', id)
    .select()

  return handleGuardedUpdate(result, 'rvm_decision', id)
},
```

The `chair_approved_at` field is set from the client's system clock. Phase 26B determines the correct fix strategy for this (DB trigger required vs. code-level change). See Phase-26B-Hardening-Report.md for the determination.

---

## To Revert Phase 26B

If Phase 26B changes need to be reverted:
1. Move `"axios-mock-adapter": "^2.1.0"` back from `devDependencies` to `dependencies` in `package.json`
2. If `decisionService.ts` was modified, restore from RP-Phase-26B-post.md contents
3. Run `npm install` to update lock file
