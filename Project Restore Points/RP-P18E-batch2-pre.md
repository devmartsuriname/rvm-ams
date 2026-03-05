# Restore Point: RP-P18E-batch2-pre

**Created:** 2026-03-05
**Phase:** 18E — SCSS & Demo Asset Cleanup (Batch 2)
**Type:** Pre-implementation
**Baseline:** Phase 18E Batch 1 complete; 20 demo files deleted

## Scope Statement

### Deletions (13 files)
- `src/assets/images/users/avatar-2.jpg` through `avatar-10.jpg` (9 files)
- `src/assets/data/other.ts` (1 file)
- `src/components/from/DropzoneFormInput.tsx` (1 file)
- `src/components/CustomFlatpickr.tsx` (1 file)
- `src/assets/scss/plugins/_gridjs.scss` (1 file)

### Edits (2 files)
- `src/types/component-props.ts` — remove DropzoneFormInputProps and UploadFileType
- `src/types/data.ts` — remove 19 demo-only types, keep NotificationType, EmailLabelType, EmailType, FileType, IdType

### NOT deleting (governance correction)
- `src/assets/scss/plugins/_dropzone.scss` — KEEP (ambiguous, low risk)
- `src/assets/scss/icons/_boxicons.scss` — PROTECTED (used by breadcrumb + dropdown baseline)
- `src/assets/scss/icons.scss` — PROTECTED (imports _boxicons.scss)

**Total: 13 deletes + 2 edits + 2 restore points = 17 ops (under 25 limit)**
