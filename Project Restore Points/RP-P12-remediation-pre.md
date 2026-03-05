# Restore Point: RP-P12-remediation-pre

**Created:** 2026-03-05
**Phase:** 12 — DMS-Light Remediation
**Type:** Pre-remediation

## State Summary

Phase 12 DMS-Light UI implementation is complete but PARTIAL. Six defects identified in governance verification require remediation.

## Defects to Remediate

1. `UploadDocumentModal` uses `size="lg"` instead of `size="xl"`
2. Linked Decision column missing from `DossierDocumentsTab` table
3. `agenda_item_id` field missing from upload form
4. `ConfidentialityBadge` missing from `DocumentVersionModal` header
5. `docs/backend.md` not updated with Phase 12 outcome
6. `docs/architecture.md` not updated with Phase 12 outcome

## Files to be Modified

- `src/components/rvm/UploadDocumentModal.tsx`
- `src/components/rvm/DossierDocumentsTab.tsx`
- `src/components/rvm/DocumentVersionModal.tsx`
- `docs/backend.md`
- `docs/architecture.md`

## Governance Constraints

- No schema changes
- No RLS policy changes
- No trigger modifications
- No new dependencies
- No new data fetches
- Targeted fixes only
