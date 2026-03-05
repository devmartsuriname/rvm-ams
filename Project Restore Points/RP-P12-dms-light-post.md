# Restore Point: RP-P12-dms-light-post

**Created:** 2026-03-05
**Phase:** 12 — DMS-Light UI
**Type:** Post-implementation

## State Summary

Phase 12 (DMS-Light UI) implementation complete. Document management is now available within the dossier detail view.

## Infrastructure Created

- Storage bucket `rvm-documents` (private) with RLS policies:
  - **SELECT**: chair_rvm, secretary_rvm, deputy_secretary, admin_intake, admin_dossier, admin_agenda, admin_reporting, audit_readonly (matches `rvm_document_select` policy)
  - **INSERT**: secretary_rvm, admin_dossier, admin_reporting (matches `rvm_document_insert` policy)
  - **No UPDATE/DELETE** on storage objects

## Files Created

| File | Purpose |
|------|---------|
| `src/services/documentService.ts` | CRUD + storage operations for documents and versions |
| `src/hooks/useDocuments.ts` | React Query hooks for document operations |
| `src/components/rvm/UploadDocumentModal.tsx` | Upload form with dropzone, doc_type, confidentiality |
| `src/components/rvm/DocumentVersionModal.tsx` | Version history table + new version upload |
| `src/components/rvm/DossierDocumentsTab.tsx` | Document list table within dossier detail |

## Files Modified

| File | Change |
|------|--------|
| `src/app/(admin)/rvm/dossiers/[id]/page.tsx` | Added Tabs (Details / Documents) |
| `src/components/rvm/StatusBadges.tsx` | Added `ConfidentialityBadge` component |
| `src/hooks/useUserRoles.ts` | Added `canUploadDocument` permission |

## Governance Verification

| Check | Status |
|-------|--------|
| No schema changes to rvm_document / rvm_document_version | ✅ PASS |
| No existing RLS policy changes | ✅ PASS |
| No trigger modifications | ✅ PASS |
| Storage bucket SELECT roles match document table SELECT roles | ✅ PASS |
| Storage bucket INSERT roles match document table INSERT roles | ✅ PASS |
| No UPDATE/DELETE on storage objects | ✅ PASS |

## Storage Role Alignment Table

| Role | Document Table SELECT | Storage SELECT | Document Table INSERT | Storage INSERT |
|------|----------------------|----------------|----------------------|----------------|
| chair_rvm | ✅ | ✅ | ❌ | ❌ |
| secretary_rvm | ✅ | ✅ | ✅ | ✅ |
| deputy_secretary | ✅ | ✅ | ❌ | ❌ |
| admin_intake | ✅ | ✅ | ❌ | ❌ |
| admin_dossier | ✅ | ✅ | ✅ | ✅ |
| admin_agenda | ✅ | ✅ | ❌ | ❌ |
| admin_reporting | ✅ | ✅ | ✅ | ✅ |
| audit_readonly | ✅ | ✅ | ❌ | ❌ |
