# Phase 12 — DMS-Light Remediation Plan

## Scope

6 targeted fixes only. No new functionality. No schema/RLS/trigger changes.

## Pre-condition

Create `Project Restore Points/RP-P12-remediation-pre.md`

## Task 1 — Modal Size Compliance

**File:** `src/components/rvm/UploadDocumentModal.tsx` line 91

- Change `size="lg"` to `size="xl"`

## Task 2 — Linked Decision Column

**File:** `src/components/rvm/DossierDocumentsTab.tsx`

- Add `<th>Linked Decision</th>` to the table header (after Date column, before actions)
- Add `<td>` rendering `doc.decision_id` — if present, show decision text snippet; if null, show `—`
- The `decisions` prop is already passed to the component; create a lookup map from decisions array to display text

## Task 3 — Agenda Item Link Field

**File:** `src/components/rvm/UploadDocumentModal.tsx`

- Add `agendaItems` optional prop: `{ id: string; title_override?: string; agenda_number: number }[]`
- Add state `agendaItemId`
- Add optional `<Form.Select>` for agenda_item_id (similar pattern to decisions select)
- Pass `agendaItemId` to `createDoc.mutateAsync` call (service already supports it)
- Reset agendaItemId in `reset()`
- Update `DossierDocumentsTab.tsx` to pass agenda items if available (empty array default, no new data fetch required — graceful empty state)

## Task 4 — Confidentiality Badge in Version Modal

**File:** `src/components/rvm/DocumentVersionModal.tsx`

- Add `confidentialityLevel` prop (type `Enums<'confidentiality_level'> | null`)
- Import `ConfidentialityBadge` from `StatusBadges`
- Render badge next to document title in Modal.Title: `Version History — {documentTitle} <ConfidentialityBadge level={confidentialityLevel} />`
- Update `DossierDocumentsTab.tsx` to pass `confidentialityLevel={selectedDoc.confidentiality_level}` to the modal

## Task 5 — Backend Documentation

**File:** `docs/backend.md`

- Append Phase 12 section covering: storage bucket (`rvm-documents`, private), versioning model (version_number increment, current_version_id link), upload flow (insert doc → upload file → insert version → update current_version_id), role permissions (INSERT: secretary_rvm/admin_dossier/admin_reporting; SELECT: all RVM roles), governance constraints (no schema changes, UI + service layer only)

## Task 6 — Architecture Documentation

**File:** `docs/architecture.md`

- Update "Implemented Modules" table: Documents row from `— | — | — | Deferred` to `✅ | ✅ | N/A | ✅`
- Add Phase 12 to phase completion status line
- Add DMS-Light subsection covering: entity relationships (document → dossier mandatory, → decision/agenda_item optional), versioning model, confidentiality display, storage architecture

## Post-condition

Create `Project Restore Points/RP-P12-remediation-post.md` with verification report

## GOVERNANCE NOTE (Non-Blocking) — Decision Lookup Source

The linked decision column must use the existing decisions data already available in the component props.

Do NOT introduce any additional queries or joins to fetch decisions.

If the decisions array is empty, the table must gracefully display "—" for linked decisions.

No additional data fetching is authorized in Phase 12 remediation.  
  
  
Files Modified (Summary)

1. `src/components/rvm/UploadDocumentModal.tsx` — size xl + agenda_item_id field
2. `src/components/rvm/DossierDocumentsTab.tsx` — linked decision column + pass new props
3. `src/components/rvm/DocumentVersionModal.tsx` — confidentiality badge prop
4. `docs/backend.md` — Phase 12 section
5. `docs/architecture.md` — Phase 12 updates
6. `Project Restore Points/RP-P12-remediation-pre.md` — pre restore point
7. `Project Restore Points/RP-P12-remediation-post.md` — post restore point + verification report