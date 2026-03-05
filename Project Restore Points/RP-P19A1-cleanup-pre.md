# RP-P19A1 — Orphan File Cleanup — PRE

**Created:** 2026-03-05
**Phase:** 19A — Orphan File Deletion
**Batch:** 19A-1
**Status:** PRE-EXECUTION
**Ops planned:** 19 (1 restore point + 18 deletions)

## Candidate Targets (18 files)

1. `src/components/VectorMap/BaseVectorMap.tsx`
2. `src/components/VectorMap/CanadaMap.tsx`
3. `src/components/VectorMap/IraqVectorMap.tsx`
4. `src/components/VectorMap/RussiaMap.tsx`
5. `src/components/VectorMap/SpainMap.tsx`
6. `src/components/VectorMap/WorldMap.tsx`
7. `src/components/VectorMap/index.tsx`
8. `src/helpers/httpClient.ts`
9. `src/context/useEmailContext.tsx`
10. `src/utils/promise.ts`
11. `src/hooks/useFileUploader.ts`
12. `src/hooks/useModal.ts`
13. `src/hooks/useToggle.ts`
14. `src/components/ComponentContainerCard.tsx`
15. `src/components/Preloader.tsx`
16. `src/components/from/TextAreaFormInput.tsx`
17. `src/components/from/ChoicesFormInput.tsx`
18. `src/assets/scss/plugins/_dropzone.scss`

## Evidence
All files confirmed zero external consumers via repo-wide import search.

## Constraints
- Zero schema/RLS/trigger changes
- Zero new dependencies
- Zero route/menu changes
- ≤25 file operations
