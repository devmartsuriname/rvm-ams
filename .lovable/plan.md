# Phase 18C — Governance Remediation Pack (3 Fixes)

## Files to Create

1. `Project Restore Points/RP-P18C-governance-remediation-pre.md` — Pre-fix restore point
2. `Project Restore Points/RP-P18C-governance-remediation-post.md` — Post-fix restore point with evidence

## Files to Modify (exactly 3)

### Fix #1 — `src/services/dossierService.ts` (lines 141-151)

**Current:** `updateDossier()` uses `.select().single()` with `if (error) throw error` — bypasses `handleGuardedUpdate`, so RETURN NULL silent rejects throw a generic "no rows" error instead of fetching the governance violation reason.

**Change:** Replace `.select().single()` + direct throw with `.select()` + `handleGuardedUpdate(result, 'rvm_dossier', id)` — identical to `updateDossierStatus()` on line 157-164.

```typescript
async updateDossier(id: string, data: DossierUpdate) {
  const result = await supabase
    .from('rvm_dossier')
    .update(data)
    .eq('id', id)
    .select()

  return handleGuardedUpdate(result, 'rvm_dossier', id)
},
```

### Fix #2 — `src/services/documentService.ts` (lines 102-108 and 158-163)

**Current:** Both `createDocument()` (line 103) and `uploadNewVersion()` (line 159) fire `update({ current_version_id })` without checking the result. If RLS or a trigger blocks the update, the document silently has a stale `current_version_id`.

**Change:** Add `import { handleGuardedUpdate } from '@/utils/rls-error'` at top. For both locations, capture the result and pass through `handleGuardedUpdate`:

```typescript
// Line 102-107 becomes:
const versionLinkResult = await supabase
  .from('rvm_document')
  .update({ current_version_id: version.id })
  .eq('id', doc.id)
  .select()

await handleGuardedUpdate(versionLinkResult, 'rvm_document', doc.id)
```

Same pattern for lines 158-162 (using `documentId` instead of `doc.id`).

### Fix #3 — `src/services/agendaItemService.ts` (lines 88-104)

**Current:** `reorderAgendaItems()` fires parallel updates via `Promise.all` but only checks `.error` — it does not add `.select()` to the queries, so RETURN NULL silent rejects are invisible (no data array to check).

**Change:** Add `.select()` to each update query, then check each result for empty data (RETURN NULL pattern). If any update was silently rejected, fetch the violation reason and throw.

```typescript
async reorderAgendaItems(meetingId: string, itemOrder: { id: string; agenda_number: number }[]) {
  const updates = itemOrder.map(item =>
    supabase
      .from('rvm_agenda_item')
      .update({ agenda_number: item.agenda_number })
      .eq('id', item.id)
      .eq('meeting_id', meetingId)
      .select()
  )

  const results = await Promise.all(updates)

  // Check for explicit errors
  const errors = results.filter(r => r.error)
  if (errors.length > 0) {
    throw errors[0].error
  }

  // Check for silent RETURN NULL rejects (0 rows returned)
  for (let i = 0; i < results.length; i++) {
    if (!results[i].data || results[i].data.length === 0) {
      const reason = await fetchViolationReason('rvm_agenda_item', itemOrder[i].id)
      throw new Error(reason ?? 'Agenda reorder blocked by governance enforcement.')
    }
  }

  return true
},
```

This requires adding `fetchViolationReason` to the existing import from `@/utils/rls-error`.

## Governance Note (Non-Blocking Improvement)

For Fix #3 (Agenda Item Reorder handling):

The current plan retrieves the violation reason using `itemOrder[i].id` when detecting a silent reject in the Promise.all loop. This approach is generally correct because the index order is preserved, but in rare asynchronous edge cases it is safer to ensure that the violation reason is fetched using the exact item ID associated with the failed update operation.

Implementation guidance:

- Preserve the index-to-item mapping during the reorder loop.

- Ensure the violation reason lookup uses the same item ID that triggered the failed update.

- Document this mapping explicitly in the Phase 18C verification report.

This is a governance robustness recommendation only and does NOT block implementation of Phase 18C.  
Summary of All Changes


| Fix | File                   | Lines Changed                  | Pattern Applied                      |
| --- | ---------------------- | ------------------------------ | ------------------------------------ |
| #1  | `dossierService.ts`    | 141-151 → 8 lines              | `handleGuardedUpdate`                |
| #2  | `documentService.ts`   | 1-2 (import), 102-108, 158-163 | `handleGuardedUpdate`                |
| #3  | `agendaItemService.ts` | 1-3 (import), 88-104           | `.select()` + `fetchViolationReason` |


Zero schema/RLS/trigger/dependency changes. Zero refactors.