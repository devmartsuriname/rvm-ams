

# Phase 19A + 19B — Codebase Cleanup Plan

## Phase 19A: Orphan File Deletion (1 batch, 19 ops)

### Confirmed Orphan Files (zero consumers outside themselves)

| # | File | Evidence |
|---|------|----------|
| 1 | `src/components/VectorMap/BaseVectorMap.tsx` | Only imported by sibling map files (all orphans) |
| 2 | `src/components/VectorMap/CanadaMap.tsx` | Only imported by index.tsx (orphan barrel) |
| 3 | `src/components/VectorMap/IraqVectorMap.tsx` | Same |
| 4 | `src/components/VectorMap/RussiaMap.tsx` | Same |
| 5 | `src/components/VectorMap/SpainMap.tsx` | Same |
| 6 | `src/components/VectorMap/WorldMap.tsx` | Same |
| 7 | `src/components/VectorMap/index.tsx` | 0 external imports |
| 8 | `src/helpers/httpClient.ts` | 0 imports |
| 9 | `src/context/useEmailContext.tsx` | 0 imports |
| 10 | `src/utils/promise.ts` | 0 imports (`sleep` unused) |
| 11 | `src/hooks/useFileUploader.ts` | 0 imports |
| 12 | `src/hooks/useModal.ts` | 0 imports (only consumer of useToggle) |
| 13 | `src/hooks/useToggle.ts` | Only imported by useModal.ts (also orphan) |
| 14 | `src/components/ComponentContainerCard.tsx` | 0 imports |
| 15 | `src/components/Preloader.tsx` | 0 imports |
| 16 | `src/components/from/TextAreaFormInput.tsx` | 0 imports |
| 17 | `src/components/from/ChoicesFormInput.tsx` | 0 imports |
| 18 | `src/assets/scss/plugins/_dropzone.scss` | Not imported in style.scss (removed in 18E), `.dropzone` CSS class unused by RVM |

### Protected (NOT deleted)
- `TextFormInput.tsx` — used by SignIn.tsx
- `PasswordFormInput.tsx` — used by SignIn.tsx
- `AnimationStar.tsx` — used by AdminLayout.tsx
- `ComingSoon.tsx` — used by pages-404-alt
- `icons.scss` / `_boxicons.scss` — Darkone baseline

### Operations (19 total)
1. Create `Project Restore Points/RP-P19A1-cleanup-pre.md` (1 op)
2. Delete 18 orphan files listed above (18 ops)

**Total: 19 ops (under 25 limit)**

---

## Phase 19B: Dead Export + Type Cleanup (1 batch, ~6 ops)

### Dead Exports to Remove

| # | File | Dead Exports | Reason |
|---|------|-------------|--------|
| 1 | `src/utils/date.ts` | `addOrSubtractDaysFromDate`, `addOrSubtractMinutesFromDate`, `timeSince` | 0 consumers; only `formatDate` is used |
| 2 | `src/utils/change-casing.ts` | `snakeToTitleCase`, `kebabToTitleCase`, `toAlphaNumber` | 0 consumers; only `toSentenceCase` is used |
| 3 | `src/types/data.ts` | `IdType`, `EmailLabelType`, `EmailType`, `FileType` | Only consumed by deleted `useEmailContext.tsx`; after 19A deletion, 0 consumers remain. Keep `NotificationType` (used by Notifications.tsx + topbar.ts) |
| 4 | `src/types/context.ts` | `ChatOffcanvasStatesType`, `EmailOffcanvasStatesType`, `EmailContextType` + remove `import { EmailLabelType, EmailType }` | Only consumed by deleted `useEmailContext.tsx`. Keep `ThemeType`, `OffcanvasControlType`, `MenuType`, `LayoutState`, `LayoutOffcanvasStatesType`, `LayoutType` (used by layout system) |
| 5 | `src/types/component-props.ts` | Remove `BootstrapVariantType` import from `data.ts` after cleaning data.ts | Actually `BootstrapVariantType` IS used by `useNotificationContext.tsx` — keep it. Just remove the now-dead import in `data.ts` |

### Operations (6 total)
1. Create `Project Restore Points/RP-P19B1-dead-exports-pre.md` (1 op)
2. Edit `src/utils/date.ts` — remove 3 dead exports (1 op)
3. Edit `src/utils/change-casing.ts` — remove 3 dead exports (1 op)
4. Edit `src/types/data.ts` — remove `IdType`, `EmailLabelType`, `EmailType`, `FileType` + dead import; keep `NotificationType` (1 op)
5. Edit `src/types/context.ts` — remove `ChatOffcanvasStatesType`, `EmailOffcanvasStatesType`, `EmailContextType` + dead import line (1 op)
6. Create `Project Restore Points/RP-P19B1-dead-exports-post.md` (1 op)

**Total: 6 ops (under 25 limit)**

---

## Post-Batch Verification (both batches)
- Grep scan: 0 refs to deleted files/exports
- Build: must pass (apexcharts TS1540 only)
- Runtime smoke: all 7 RVM routes, authenticated, no console errors
- Update `docs/architecture.md` and `docs/backend.md`

## Combined Totals
- **Phase 19A:** 19 ops (1 restore point + 18 deletions)
- **Phase 19B:** 6 ops (2 restore points + 4 edits)
- **Grand total:** 25 ops across 2 batches
- Zero functional changes
- Zero schema/RLS/trigger/route/dependency changes

