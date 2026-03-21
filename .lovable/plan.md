# Phase 23B — Critical Remediation Plan

## BLOCKER 1 — Search Runtime Error

**File:** `src/services/searchService.ts`, line 72

**Current:** `.or(`location.ilike.${pattern},meeting_type.ilike.${pattern}`)`

**Fix:** `.or(`location.ilike.${pattern}`)`

The `meeting_type` column is a PostgreSQL enum and cannot use `ilike`. The existing `.eq()` filter on line 77 already handles meeting type filtering correctly.

**1 file edit.**

## BLOCKER 2 — Document Upload Validation

This requires real browser interaction. The plan:

1. Log in as `secretary@rvm.local` in the preview
2. Navigate to a seed dossier's Documents tab
3. Attempt file upload via the UI modal
4. Verify DB records created (`rvm_document`, `rvm_document_version`)
5. Verify storage bucket file exists
6. Test download via signed URL
7. Log in as `observer@rvm.local` and verify no Upload button renders

**Note:** Browser automation cannot interact with native file dialogs. The user will need to perform the actual file selection manually. I can verify the surrounding UI (upload button visibility, modal rendering, observer restrictions) and confirm DB/storage state after upload.  
  
**Governance Note (Required Before Approval)**

This Phase 23B remediation includes a code change and therefore must follow full Devmart phase governance.

Add the following before execution:

1. Create pre-restore point:

   Project Restore Points/[RP-P23B-remediation-pre.md](http://RP-P23B-remediation-pre.md)

2. Create post-restore point:

   Project Restore Points/[RP-P23B-remediation-post.md](http://RP-P23B-remediation-post.md)

3. Update the remediation completion rule:

   - Search fix is only COMPLETE after /search runs without runtime error

   - Document validation is only COMPLETE after a real file upload is manually performed and verified through:

     a) UI upload success

     b) rvm_document record created

     c) rvm_document_version record created

     d) storage object exists

     e) signed URL download works

     f) observer cannot upload

4. If the real upload is not manually completed, Phase 23B must be marked PARTIAL, not COMPLETE.

This remediation may not proceed without restore points.

## Deliverable

Update `docs/Phase-23-Final-QA-Report.md` with search fix confirmation and document test results.

## Operations (2 total, within 5-op limit)


| #   | Op     | File                                                          |
| --- | ------ | ------------------------------------------------------------- |
| 1   | Edit   | `src/services/searchService.ts` — remove enum ilike (line 72) |
| 2   | Update | `docs/Phase-23-Final-QA-Report.md` — add remediation results  |
