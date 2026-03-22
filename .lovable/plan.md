# Analysis Report: Dossier Creation + Meeting Flow + Calendar Bug

## PART 1 — DOSSIER CREATION

### Root Cause: Missing `admin_intake` role in seed accounts

**By design**, dossier creation requires the `admin_intake` role:

- UI gate: `canCreateDossier` = `isSuperAdmin || hasRole('admin_intake')` (line 20, useUserRoles.ts)
- RLS INSERT policy: `has_role('admin_intake') OR is_super_admin()`

**No seed test account has `admin_intake**`:

- chair = `chair_rvm`
- secretary = `secretary_rvm`
- member1 = `admin_dossier` (can EDIT, not CREATE)
- member2 = `admin_agenda`
- observer = `audit_readonly`

**This is NOT a bug** — it's a gap in test data. The "New Dossier" button is implemented (lines 43-51, dossiers/page.tsx) but hidden because no test user has `admin_intake`.

### Fix Options

- **Option A (recommended)**: Add `admin_intake` as a secondary role to `member1@rvm.local` (who already has `admin_dossier`). This makes member1 the full dossier lifecycle user (intake + management).
- **Option B**: Grant `admin_intake` to `secretary@rvm.local` as a secondary role.

**Implementation**: Database INSERT into `user_role` table for the chosen user. No code changes needed.

---

## PART 2 — MEETING CLOSE PERMISSION

### Analysis: Should work — needs runtime verification

The RLS UPDATE policy for `rvm_meeting`:

```sql
(has_any_role(['secretary_rvm', 'admin_agenda']) AND status <> 'closed') OR is_super_admin()
```

The `USING` expression checks the **current** (old) row. When a meeting is `published`, `status <> 'closed'` = TRUE, so the update is allowed. The `enforce_meeting_status_transition` trigger then validates `published → closed` via the `status_transitions` table.

**Possible causes of the reported error**:

1. The `published → closed` transition may be missing from `status_transitions` table
2. The `meetingService.updateMeetingStatus` uses `handleGuardedUpdate` which checks for RETURN NULL violations — the trigger may be blocking silently

### Fix

- **Step 1**: Query `status_transitions` table to confirm `(meeting, published, closed)` exists
- **Step 2**: If missing, add it via migration
- **Step 3**: If present, the issue is likely a different trigger or RLS edge case — add console logging

---

## PART 3 — CALENDAR DATE BUG (CONFIRMED)

### Root Cause: Timezone interpretation of date-only strings

`new Date('2026-03-22')` parses as **UTC midnight** (2026-03-22T00:00:00Z). In any timezone west of UTC, this becomes the previous day. In timezones east of UTC (like Suriname, UTC-3), `toLocaleDateString` may show the correct day, but this is fragile.

The bug affects **every `formatDate` function** across the codebase (10+ files, 65+ occurrences). All use the same pattern: `new Date(dateString).toLocaleDateString(...)`.

### Fix

Update the centralized `src/utils/date.ts` `formatDate` function to append `T12:00:00` to date-only strings (no "T" present), forcing midday interpretation that's safe in all timezones. Then replace all inline `formatDate` definitions across the codebase with imports from `src/utils/date.ts`.

```typescript
// Fix: force local timezone interpretation for date-only strings
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  // Date-only strings (YYYY-MM-DD) → append T12:00:00 to avoid UTC midnight rollback
  const safe = dateString.includes('T') ? dateString : dateString + 'T12:00:00'
  return new Date(safe).toLocaleDateString('nl-NL', { ... })
}
```

**Files to update** (replace inline formatDate with import):

1. `src/app/(admin)/rvm/dossiers/page.tsx`
2. `src/app/(admin)/rvm/dossiers/[id]/page.tsx`
3. `src/app/(admin)/rvm/meetings/page.tsx`
4. `src/app/(admin)/rvm/meetings/[id]/page.tsx`
5. `src/app/(admin)/rvm/tasks/page.tsx`
6. `src/app/(admin)/rvm/decisions/page.tsx`
7. `src/components/rvm/DecisionReport.tsx`
8. `src/components/rvm/DossierDocumentsTab.tsx`
9. `src/components/rvm/DocumentVersionModal.tsx`

---

## PART 4 — SMOKE TEST

Cannot perform live smoke test in plan mode. After fixes are implemented, a structured test per role should verify:

1. member1 can create + edit dossier
2. secretary can create meeting, publish, and close
3. secretary can add agenda items and link dossiers
4. chair can approve decisions
5. observer has read-only access everywhere

---

## Summary


| Issue                      | Type                        | Root Cause                                | Fix                                     |
| -------------------------- | --------------------------- | ----------------------------------------- | --------------------------------------- |
| Dossier creation invisible | Data gap                    | No test account has `admin_intake`        | Add role to member1 via DB              |
| Meeting close fails        | Possibly missing transition | Need to verify `status_transitions` table | Add row if missing                      |
| Date off by one day        | Code bug                    | UTC midnight timezone shift               | Fix `formatDate` in utils + consolidate |


## Implementation Order

1. Query `status_transitions` to confirm/add `published → closed`
2. Add `admin_intake` role to member1
3. Fix `formatDate` timezone bug in `src/utils/date.ts`
4. Replace all inline formatDate with centralized import (9 files)

**Total: ~10 files modified, 1 DB migration (role + possibly transition row)**  
  
NOTE — GOVERNANCE VALIDATION REQUIRED

Before implementing the admin_intake role assignment:

1. Confirm from project workflow:

   - Which role is officially responsible for dossier creation?

2. If Cabinet Member (admin_dossier) is NOT intended for intake:

   - Do NOT assign admin_intake to member1

   - Instead:

     - Assign to secretary OR

     - Define dedicated intake role

3. Document this decision explicitly in:

   - Role matrix

   - Manual (EN + NL)

No role changes without governance confirmation.