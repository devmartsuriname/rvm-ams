# Phase 12 — DMS-Light UI Implementation Plan

## Pre-condition

Create restore point `Project Restore Points/RP-P12-dms-light-pre.md`.

## Infrastructure: Storage Bucket

No storage bucket exists. A migration is needed to create:

- Bucket `rvm-documents` (private) with RLS policies allowing:
  - **INSERT**: `secretary_rvm`, `admin_dossier`, `admin_reporting`
  - **SELECT**: all RVM roles (chair_rvm, secretary_rvm, deputy_secretary, admin_intake, admin_dossier, admin_agenda, admin_reporting, audit_readonly)
  - **No UPDATE/DELETE** on storage objects

No schema changes to `rvm_document` or `rvm_document_version` tables — they already exist with correct structure.

## Files to Create

### 1. `src/services/documentService.ts`

Service layer for document CRUD:

- `fetchDocumentsByDossier(dossierId)` — query `rvm_document` with joined `rvm_document_version` and `app_user` (created_by)
- `createDocument(data)` — insert into `rvm_document`, upload file to `rvm-documents` bucket, insert into `rvm_document_version`, update `current_version_id`
- `uploadNewVersion(documentId, file)` — get max version_number, increment, upload file, insert version row, update `current_version_id`
- `fetchVersionHistory(documentId)` — query `rvm_document_version` ordered by version_number desc
- `getDownloadUrl(storagePath)` — create signed URL from storage

### 2. `src/hooks/useDocuments.ts`

React Query hooks:

- `useDocumentsByDossier(dossierId)` — list documents for a dossier
- `useCreateDocument()` — mutation
- `useUploadNewVersion()` — mutation
- `useDocumentVersions(documentId)` — version history query

### 3. `src/components/rvm/ConfidentialityBadge.tsx`

Badge component added to `StatusBadges.tsx`:

- `standard_confidential` → `secondary` / "Standard"
- `restricted` → `warning` / "Restricted"
- `highly_restricted` → `danger` / "Highly Restricted"

### 4. `src/components/rvm/UploadDocumentModal.tsx`

Modal (size="xl", centered) with form fields:

- title (required)
- doc_type (select: proposal, missive, attachment, decision_list, minutes, other)
- confidentiality_level (select)
- file upload (react-dropzone, already installed)
- optional decision_id (select from decisions linked to dossier's agenda items)
- dossier_id auto-populated (hidden)

### 5. `src/components/rvm/DocumentVersionModal.tsx`

Modal showing version history table + upload new version form:

- Version number, file name, size, uploaded by, date
- Upload new version button (role-gated)

### 6. `src/components/rvm/DossierDocumentsTab.tsx`

Card component rendering:

- Document list table with columns: Title, Type, Confidentiality (badge), Version, Uploaded By, Date, Linked Decision
- "Upload Document" button (role-gated: secretary_rvm, admin_dossier, admin_reporting)
- Row click opens version history modal
- Download button per row

## Files to Modify

### 7. `src/app/(admin)/rvm/dossiers/[id]/page.tsx`

- Add Tab navigation (react-bootstrap `Tabs`/`Tab`) to the main content area:
  - Tab 1: "Details" (existing dossier info + edit form)
  - Tab 2: "Documents" (new `DossierDocumentsTab` component)
- Pass `dossierId` to documents tab

### 8. `src/components/rvm/StatusBadges.tsx`

- Add `ConfidentialityBadge` export

### 9. `src/hooks/useUserRoles.ts`

- Add `canUploadDocument` permission: `secretary_rvm || admin_dossier || admin_reporting`

## Execution Order

1. Create restore point (pre)
2. Create storage bucket migration (rvm-documents + RLS)
3. Create `documentService.ts`
4. Create `useDocuments.ts` hooks
5. Add `ConfidentialityBadge` to `StatusBadges.tsx`
6. Create `UploadDocumentModal.tsx`
7. Create `DocumentVersionModal.tsx`
8. Create `DossierDocumentsTab.tsx`
9. Update `useUserRoles.ts` with document permission
10. Update dossier detail page with tabs
11. Create restore point (post)

## GOVERNANCE NOTE (Non-Blocking) — Storage Bucket Provisioning Method

The plan states “create storage bucket via migration.” On Supabase, bucket provisioning may require using the Storage API (or a controlled SQL step for policies) rather than a standard schema migration. This is acceptable, but you must:

- Treat bucket creation as infrastructure provisioning (not a schema change)

- Provide explicit evidence of bucket existence + privacy setting

- Provide explicit evidence of storage policy/RLS alignment

No other schema/RLS changes are authorized.  
---  
**GOVERNANCE NOTE (Non-Blocking) — Storage SELECT Scope Must Match RLS Matrix**

The plan proposes SELECT on storage objects for “all RVM roles.”

Before implementing storage read policies, confirm the allowed reader roles strictly match the official RLS role matrix and document confidentiality expectations.

If documentation does not explicitly authorize broad storage read access, default to the same read roles as the document tables (least privilege).

Provide a role-by-role table in the Phase 12 verification report showing:

- Storage SELECT allowed roles

- Document table SELECT allowed roles

- Any differences + documented justification  
  
**Governance Constraints**

- Storage bucket creation via migration (required)
- No changes to `rvm_document` or `rvm_document_version` table schemas
- No changes to existing RLS policies on document tables
- No trigger modifications
- UI + service layer only (plus storage infrastructure)