# Restore Point: RP-P12-dms-light-pre

**Created:** 2026-03-05
**Phase:** 12 — DMS-Light UI
**Type:** Pre-implementation

## State Summary

Phase 11 (Illegal Attempt Logging) is formally closed. DMS-Light UI has not yet been implemented.
Storage bucket `rvm-documents` does not yet exist.

## Files to be Created

- `src/services/documentService.ts`
- `src/hooks/useDocuments.ts`
- `src/components/rvm/UploadDocumentModal.tsx`
- `src/components/rvm/DocumentVersionModal.tsx`
- `src/components/rvm/DossierDocumentsTab.tsx`

## Files to be Modified

- `src/app/(admin)/rvm/dossiers/[id]/page.tsx`
- `src/components/rvm/StatusBadges.tsx`
- `src/hooks/useUserRoles.ts`

## Governance Constraints

- Storage bucket creation via migration (required)
- No changes to `rvm_document` or `rvm_document_version` table schemas
- No changes to existing RLS policies on document tables
- No trigger modifications
- UI + service layer only (plus storage infrastructure)
