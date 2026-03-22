# Plan: Fix HMR Error + Full Smoke Test

## Pre-requisite: Fix Runtime Error

The console shows `formatDate is not defined` in `DecisionReport.tsx`. The source code looks correct (line 4 imports `formatDate as formatShortDateFn`, line 34 assigns `const formatShortDate = formatShortDateFn`). However, this is likely a **stale HMR cache** from the previous batch edit. A full page reload should resolve it.

If the error persists after reload, the fix is trivial: the import/alias chain works, but to eliminate any ambiguity, simplify line 4 and 34:

**Current:**

```typescript
import { formatDateLong, formatDate as formatShortDateFn } from '@/utils/date'
// ...
const formatShortDate = formatShortDateFn
```

**Simplified to:**

```typescript
import { formatDateLong, formatDate } from '@/utils/date'
// ...
// Remove line 34 entirely, replace all `formatShortDate(...)` calls with `formatDate(...)`
```

Lines 122 and 123 change from `formatShortDate(...)` to `formatDate(...)`.

**Files: 1 (`src/components/rvm/DecisionReport.tsx`), 0 structural changes**

---

## Smoke Test Execution

After the fix, I will use browser tools to perform the full end-to-end test across all 5 roles. **You must be logged out in the preview first** so I can start the login flow.

### Test Matrix


| Step | Login                                             | Action                         | Expected                          |
| ---- | ------------------------------------------------- | ------------------------------ | --------------------------------- |
| 1    | [member1@rvm.local](mailto:member1@rvm.local)     | Navigate to Dossiers           | "New Dossier" button visible      |
| 2    | [member1@rvm.local](mailto:member1@rvm.local)     | Create dossier                 | Appears in list, status=draft     |
| 3    | [secretary@rvm.local](mailto:secretary@rvm.local) | Create meeting + select date   | Correct date stored (no -1 day)   |
| 4    | [secretary@rvm.local](mailto:secretary@rvm.local) | Publish meeting                | Status → published                |
| 5    | [secretary@rvm.local](mailto:secretary@rvm.local) | Add agenda item + link dossier | Dossier in dropdown, item created |
| 6    | [secretary@rvm.local](mailto:secretary@rvm.local) | Close meeting                  | Status → closed, no error         |
| 7    | [chair@rvm.local](mailto:chair@rvm.local)         | View meeting + decisions       | Read access confirmed             |
| 8    | [observer@rvm.local](mailto:observer@rvm.local)   | View dossiers/meetings         | Read-only, no create/edit buttons |


Each step will include a screenshot as proof.  
  
NOTE — RUNTIME GATE BEFORE SMOKE TEST

Before starting the smoke test:

1. Fully reload the preview/application

2. Verify the runtime error is gone

3. Confirm:

   - /rvm/decisions renders correctly

   - browser console shows no formatDate-related errors

If the runtime error still exists:

- STOP

- fix that first

- do NOT continue into smoke testing

Smoke test results are only valid if runtime is clean before step 1.

**Output: Structured PASS/FAIL report with screenshots per role**