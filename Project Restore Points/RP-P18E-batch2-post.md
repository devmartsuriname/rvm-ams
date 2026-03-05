# Restore Point: RP-P18E-batch2-post

**Created:** 2026-03-05
**Phase:** 18E — SCSS & Demo Asset Cleanup (Batch 2)
**Type:** Post-implementation

## Files Deleted (13 files)

### Avatars — `src/assets/images/users/` (9 files)
- avatar-2.jpg through avatar-10.jpg
- **Protected:** avatar-1.jpg (used by ProfileDropdown.tsx)

### Demo Data/Components (3 files)
- `src/assets/data/other.ts`
- `src/components/from/DropzoneFormInput.tsx`
- `src/components/CustomFlatpickr.tsx`

### Demo SCSS (1 file)
- `src/assets/scss/plugins/_gridjs.scss`

## Files Edited (2 files)

### `src/types/component-props.ts`
- Removed: `UploadFileType`, `DropzoneFormInputProps`, `CalendarFormType`, `CalendarProps`
- Removed: unused imports (`IconProps`, `@fullcalendar/*`, `OffcanvasControlType`)
- Kept: `ChildrenType`, `BootstrapVariantType`, `FormInputProps`

### `src/types/data.ts`
- Removed 19 demo-only types: Employee, PaginationType, SearchType, SortingType, LoadingType, HiddenType, ReviewType, PropertyType, CustomerType, CustomerReviewsType, ActivityType, SocialEventType, GroupType, EmailCountType, TimelineType, PricingType, ProjectType, TodoType, SellerType
- Kept: IdType, EmailLabelType, EmailType, NotificationType, FileType

## Governance Correction
- `_boxicons.scss` + `icons.scss` — **PROTECTED** (used by Darkone breadcrumb + dropdown baseline)
- `_dropzone.scss` — **KEPT** (ambiguous, low risk to keep)
- `useFileUploader.ts` — orphaned hook (zero consumers), not deleted this batch

## Build Status
Build succeeds. Pre-existing apexcharts TS1540 warning only (unchanged).

## Scope Compliance
- ✅ Zero DB/schema/RLS/trigger changes
- ✅ Zero new dependencies
- ✅ Zero route/menu changes
- ✅ Zero functional changes

## Governance Declaration
- **Fully Implemented:** Phase 18E Batch 2 — 13 files deleted, 2 files cleaned up
- **Protected (governance correction):** _boxicons.scss, icons.scss (Darkone baseline dependency)
- **Kept (ambiguous):** _dropzone.scss, useFileUploader.ts
- **Total ops:** 17 (13 deletes + 2 edits + 2 restore points)

---

## PHASE 18E CUMULATIVE SUMMARY

| Batch | Files Deleted | Files Edited | Ops |
|-------|--------------|-------------|-----|
| 18E-1 | 20 (images + SCSS) | 1 (style.scss) | 23 |
| 18E-2 | 13 (avatars + data + components + SCSS) | 2 (types) | 17 |
| **Total** | **33 files** | **3 files** | **40 ops** |

### Runtime Verification
- Pending: smoke test on all 7 RVM pages
