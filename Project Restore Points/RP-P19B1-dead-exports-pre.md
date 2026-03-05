# RP-P19B1 — Dead Export Cleanup — PRE

**Created:** 2026-03-05
**Phase:** 19B — Dead Export + Type Cleanup
**Batch:** 19B-1
**Status:** PRE-EXECUTION
**Ops planned:** 5 (1 restore point + 4 edits)

## Targets

1. `src/utils/date.ts` — remove `addOrSubtractDaysFromDate`, `addOrSubtractMinutesFromDate`, `timeSince`; keep `formatDate`
2. `src/utils/change-casing.ts` — remove `snakeToTitleCase`, `kebabToTitleCase`, `toAlphaNumber`; keep `toSentenceCase`
3. `src/types/data.ts` — remove `IdType`, `EmailLabelType`, `EmailType`, `FileType`, dead import; keep `NotificationType`
4. `src/types/context.ts` — remove `ChatOffcanvasStatesType`, `EmailOffcanvasStatesType`, `EmailContextType`, dead import; keep layout types
5. `src/types/externals.d.ts` — remove jsvectormap module declarations (lines 527-591)

## Constraints
- Zero schema/RLS/trigger changes
- Zero new dependencies
- ≤25 file operations
