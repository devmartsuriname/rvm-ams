# Phase 23B — Document Upload Root Cause & Fix

## Root Cause (Confirmed)

The upload was attempted on dossier **RVM-SEED-005** which has status `decided`. The `enforce_dossier_immutability` BEFORE INSERT trigger on `rvm_document` checks the linked dossier's status and returns `NULL` (silently blocks) for dossiers in `decided`, `archived`, or `cancelled` states. This causes `.select().single()` to receive 0 rows → PostgREST error PGRST116 "Cannot coerce the result to a single JSON object".

**The RLS PERMISSIVE fix was correct and necessary.** The current failure is NOT an RLS issue — it is a governance enforcement trigger working as designed, but the error is not surfaced correctly to the user.

## Two Issues to Fix

### Issue 1: UX — Silent governance rejection shows cryptic error

The `documentService.createDocument()` uses `.select().single()` which throws a generic PostgREST error when `RETURN NULL` blocks the insert. The `handleGuardedUpdate` utility already handles this pattern, but it is not used for the initial INSERT — only for the step-4 `current_version_id` update.

**Fix:** Replace `.select().single()` with `.select()` (no `.single()`) and check for empty result array. If empty, fetch the violation reason from `rvm_illegal_attempt_log` using the existing `fetchViolationReason()` utility.

**File:** `src/services/documentService.ts` — lines 59-73

```typescript
// Current:
const { data: doc, error: docError } = await supabase
  .from('rvm_document')
  .insert({...})
  .select()
  .single()
if (docError) throw docError

// Fixed:
const { data: docs, error: docError } = await supabase
  .from('rvm_document')
  .insert({...})
  .select()
if (docError) throw docError
if (!docs || docs.length === 0) {
  const reason = await fetchViolationReason('rvm_document', dossierId)
  throw new Error(reason ?? 'Document creation blocked by governance enforcement.')
}
const doc = docs[0]
```

### Issue 2: Same pattern needed for version INSERT (line 87-101)

The `rvm_document_version` table also has a trigger. Same fix: replace `.select().single()` with `.select()` + empty-check.

## Validation Plan

After the fix, test with:

1. **Blocked dossier** (RVM-SEED-005, status `decided`) → should show "Cannot modify entities in locked dossier" toast
2. **Open dossier** (RVM-SEED-001, status `draft`) → should upload successfully

## Operations (3 total, within 5-op limit)


| #   | Op     | File                                                                                             |
| --- | ------ | ------------------------------------------------------------------------------------------------ |
| 1   | Edit   | `src/services/documentService.ts` — replace `.single()` with guarded empty-check on INSERT paths |
| 2   | Update | `docs/Phase-23-Final-QA-Report.md` — document root cause and fix                                 |
| 3   | Update | `Project Restore Points/RP-P23B-doc-validation-post.md` — update with final status               |


  
**Governance Note — Completion Evidence Required**

Phase 23B may only be marked COMPLETE after both validation cases pass with evidence:

1. Blocked dossier validation

   - Upload attempt on a decided dossier must show the correct governance rejection message

   - No cryptic PostgREST error may remain

2. Open dossier validation

   - Upload on an open dossier must complete successfully

   - Verify:

     a) rvm_document row created

     b) rvm_document_version row created

     c) current_version_id set correctly

     d) storage object exists

     e) signed URL download works

If only the blocked-dossier UX is fixed but the open-dossier upload is not verified end-to-end,

Phase 23B must remain PARTIAL.  
  
**Governance Note**

- No schema changes
- No RLS changes
- No trigger changes
- This is a client-side error handling fix only
- The trigger is working correctly — the UX was not handling the `RETURN NULL` pattern for INSERT operations