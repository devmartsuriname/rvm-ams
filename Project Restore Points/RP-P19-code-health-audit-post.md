# Restore Point: RP-P19-code-health-audit-post

**Created:** 2026-03-05
**Phase:** 19 — Final Code Health Audit
**Type:** Post-implementation (report-only phase)

## Phase 19 Code Health Audit Report

### 1) Duplicate Code / Utilities

**Finding count: 2 patterns**

| # | Pattern | Files | Impact |
|---|---------|-------|--------|
| 1 | `FallbackLoading.tsx` and `LoadingFallback.tsx` are near-identical spinner components | `src/components/FallbackLoading.tsx` (used by AuthLayout), `src/components/LoadingFallback.tsx` (used by AdminLayout) | Low — both work, but maintenance burden. Consolidate to one. |
| 2 | `addOrSubtractDaysFromDate` / `addOrSubtractMinutesFromDate` / `timeSince` in `src/utils/date.ts` are Darkone demo utilities with zero RVM consumers (only `formatDate` is used by RVM) | `src/utils/date.ts` | Low — dead code, no runtime risk |

**Recommendation:** Consolidate `FallbackLoading` into `LoadingFallback` (1 file edit + 1 delete). Remove unused date utils (1 file edit).

---

### 2) Service Layer Consistency

**Finding: ALL mutation methods use `handleGuardedUpdate()` consistently ✅**

All UPDATE methods across all 5 domain services use the guarded pattern:
- `dossierService.updateDossier()` ✅
- `dossierService.updateDossierStatus()` ✅
- `meetingService.updateMeeting()` ✅
- `meetingService.updateMeetingStatus()` ✅
- `decisionService.updateDecision()` ✅
- `decisionService.updateDecisionStatus()` ✅
- `decisionService.recordChairApproval()` ✅
- `taskService.updateTask()` ✅
- `taskService.updateTaskStatus()` ✅
- `agendaItemService.updateAgendaItem()` ✅
- `agendaItemService.withdrawAgendaItem()` ✅
- `agendaItemService.reorderAgendaItems()` ✅ (manual loop with `fetchViolationReason`)
- `documentService.createDocument()` ✅ (version link uses `handleGuardedUpdate`)
- `documentService.uploadNewVersion()` ✅ (version link uses `handleGuardedUpdate`)

**INSERT methods use `.single()` correctly** — INSERT operations don't need guarded updates (RLS INSERT denials throw explicit errors, not RETURN NULL). All 6 INSERT methods (`createDossier`, `createMeeting`, `createDecision`, `createTask`, `addAgendaItem`, `createDocument`) use `.single()` + direct error throw. **This is correct behavior.**

**No stragglers found. Service layer is fully consistent.**

---

### 3) Component Hygiene — Unused Components/Hooks

**Finding count: 15 orphaned files (zero consumers)**

| # | File | Consumers | Recommendation |
|---|------|-----------|----------------|
| 1 | `src/components/VectorMap/BaseVectorMap.tsx` | 0 (only internal) | DELETE directory |
| 2 | `src/components/VectorMap/CanadaMap.tsx` | 0 | DELETE |
| 3 | `src/components/VectorMap/IraqVectorMap.tsx` | 0 | DELETE |
| 4 | `src/components/VectorMap/RussiaMap.tsx` | 0 | DELETE |
| 5 | `src/components/VectorMap/SpainMap.tsx` | 0 | DELETE |
| 6 | `src/components/VectorMap/WorldMap.tsx` | 0 | DELETE |
| 7 | `src/components/VectorMap/index.tsx` | 0 | DELETE |
| 8 | `src/components/ComponentContainerCard.tsx` | 0 | DELETE |
| 9 | `src/components/Preloader.tsx` | 0 | DELETE |
| 10 | `src/hooks/useFileUploader.ts` | 0 | DELETE |
| 11 | `src/hooks/useModal.ts` | 0 (only uses useToggle internally) | DELETE |
| 12 | `src/hooks/useToggle.ts` | 1 (useModal.ts — itself orphaned) | DELETE (after useModal) |
| 13 | `src/helpers/httpClient.ts` | 0 | DELETE |
| 14 | `src/context/useEmailContext.tsx` | 0 (defines EmailProvider but never mounted) | DELETE |
| 15 | `src/components/from/TextAreaFormInput.tsx` | 0 | DELETE |
| 16 | `src/components/from/ChoicesFormInput.tsx` | 0 | DELETE |
| 17 | `src/utils/promise.ts` | 0 | DELETE |

**Total: 17 files confirmed orphaned**

**Used but low-value (DO NOT DELETE):**
- `src/hooks/useQueryParams.ts` — used by `useLayoutContext` (1 consumer)
- `src/hooks/useViewPort.ts` — used by `LeftSideBarToggle` (1 consumer)
- `src/hooks/useLocalStorage.ts` — used by `useLayoutContext` (1 consumer)
- `src/utils/change-casing.ts` — used by `ThemeCustomizer` (1 consumer)
- `src/utils/layout.ts` — used by `useLayoutContext` (1 consumer)
- `src/components/FallbackLoading.tsx` — used by `AuthLayout` (1 consumer)

---

### 4) Search & Filters Performance Sanity

**All filtering is server-side ✅**

- `searchService.ts`: All 5 entity searches use `.ilike()` / `.eq()` / `.gte()` / `.lte()` server-side with `LIMIT 10`
- `dossierService.fetchDossiers()`: `.eq()` / `.or()` server-side
- `meetingService.fetchMeetings()`: `.eq()` / `.gte()` / `.lte()` server-side
- `taskService.fetchTasks()`: `.eq()` server-side
- `dashboardService`: All count queries use `{ count: 'exact', head: true }` (COUNT-only, no data transfer)

**One minor observation:** `searchService.searchAgendaItems()` uses `.or('title_override.ilike.${pattern}')` — this only searches `title_override` and doesn't search the dossier title for agenda items that have no override. This is a functional limitation (not a bug), previously accepted.

---

### 5) Dead Imports / Unused Exports

**Finding count: 3 dead imports, 5 unused exports**

| # | File | Issue |
|---|------|-------|
| 1 | `src/utils/date.ts` | `addOrSubtractDaysFromDate`, `addOrSubtractMinutesFromDate`, `timeSince` exported but never imported |
| 2 | `src/utils/change-casing.ts` | `snakeToTitleCase`, `kebabToTitleCase`, `toAlphaNumber` exported but never imported (only `toSentenceCase` used) |
| 3 | `src/assets/scss/plugins/_dropzone.scss` | SCSS file exists but not imported by style.scss (orphaned after 18E) |

---

### 6) Type Safety / TS Warnings

**Pre-existing (unchanged):**
- `node_modules/apexcharts/types/apexcharts.d.ts(60,16): error TS1540` — third-party, non-blocking

**New warnings introduced: 0** ✅

**`searchService.ts` uses `any[]` for all result types** — low risk but technically untyped. 5 occurrences of `any[]` in `SearchResults` interface.

---

### 7) Security Posture Review (Code-Level)

**No direct privileged updates bypassing services ✅**

- All Supabase mutations go through service layer
- All UPDATE mutations use `handleGuardedUpdate()` 
- No raw `supabase.from().update()` calls outside services
- No localStorage/sessionStorage admin checks
- `useUserRoles()` hook fetches from `user_role` table (server-validated)
- UI permission gates (`hasRole()` checks) align with RLS assumptions

**One observation:** `ProfileDropdown.tsx` has `onClick={removeSession}` on the `<span>` inside a `<DropdownItem as={Link}>`. The logout action should be on the `<DropdownItem>` itself, not a nested span. This is a UX issue (not security), but clicking the padding around the text won't trigger logout. **Low severity.**

---

## Ranked Fix Plan

### Batch 19A — Orphaned File Deletion (17 files + 2 restore points = 19 ops)

| Priority | Files | Risk | Ops |
|----------|-------|------|-----|
| HIGH | `src/components/VectorMap/` (7 files) | Zero — completely orphaned, imports `jsvectormap` unnecessarily | 7 |
| HIGH | `src/helpers/httpClient.ts` | Zero — wraps axios, never imported | 1 |
| HIGH | `src/context/useEmailContext.tsx` | Zero — EmailProvider never mounted | 1 |
| HIGH | `src/utils/promise.ts` | Zero — `sleep()` never imported | 1 |
| MED | `src/hooks/useFileUploader.ts` | Zero — confirmed orphaned in 18E | 1 |
| MED | `src/hooks/useModal.ts` + `src/hooks/useToggle.ts` | Zero — only useModal imports useToggle, both orphaned | 2 |
| MED | `src/components/ComponentContainerCard.tsx` | Zero — demo component | 1 |
| MED | `src/components/Preloader.tsx` | Zero — demo component | 1 |
| LOW | `src/components/from/TextAreaFormInput.tsx` | Zero — never imported | 1 |
| LOW | `src/components/from/ChoicesFormInput.tsx` | Zero — never imported | 1 |

**Regression risk: ZERO** — all files have 0 consumers confirmed by grep.
**Test recommendation:** Build check + runtime smoke test on all 7 RVM pages.

### Batch 19B — Dead Export Cleanup (3 file edits + 2 restore points = 5 ops)

| Priority | File | Change | Risk |
|----------|------|--------|------|
| LOW | `src/utils/date.ts` | Remove 3 unused exports (keep `formatDate` only) | Zero — no consumers |
| LOW | `src/utils/change-casing.ts` | Remove 3 unused exports (keep `toSentenceCase` only) | Zero — no consumers |
| LOW | `src/assets/scss/plugins/_dropzone.scss` | DELETE file (not imported by style.scss) | Zero — already unlinked |

**Regression risk: ZERO**
**Test recommendation:** Build check.

### Batch 19C — Minor Improvements (2 file edits + 2 restore points = 4 ops)

| Priority | File | Change | Risk |
|----------|------|--------|------|
| LOW | `src/components/FallbackLoading.tsx` | Merge into LoadingFallback.tsx + update AuthLayout import | Low — visual component |
| LOW | `src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx` | Move `onClick={removeSession}` from `<span>` to `<DropdownItem>` | Low — UX fix only |

**Regression risk: LOW** — visual/UX only.
**Test recommendation:** Manual test of logout flow + auth page loading.

### Optional Batch 19D — Type Hardening (1 file edit)

| Priority | File | Change | Risk |
|----------|------|--------|------|
| LOW | `src/services/searchService.ts` | Replace `any[]` with proper typed arrays in `SearchResults` | Low — read-only service |

---

## Unused npm Dependencies (identified, removal deferred)

These packages have zero imports in any RVM component after demo cleanup:
- `jsvectormap` (used only by VectorMap/ — orphaned)
- `gridjs` + `gridjs-react` (demo data tables — deleted)
- `react-quill` (demo editors — deleted)
- `google-maps-react` (demo maps — deleted)
- `choices.js` (demo forms — deleted)
- `react-flatpickr` (CustomFlatpickr.tsx — deleted)
- `@fullcalendar/*` (5 packages — demo calendar — deleted)
- `axios` + `axios-mock-adapter` (httpClient.ts — orphaned)
- `cookies-next` (zero imports)
- `gumshoejs` (zero imports)
- `react-dropzone` (zero imports after DropzoneFormInput deletion)
- `react-select` (zero imports)

**Total: ~17 packages** — removal requires separate governance authorization.

---

## Governance Declaration

- **Phase 19 Type:** Report-only audit — ZERO code modifications made
- **Scope respected:** No schema, RLS, trigger, route, or dependency changes
- **Documentation updated:** `docs/architecture.md` + `docs/backend.md` (Phase 19 status row)

---

**STOP — Awaiting Devmart governance confirmation.**
