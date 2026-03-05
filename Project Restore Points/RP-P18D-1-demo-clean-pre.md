# Restore Point: RP-P18D-1-demo-clean-pre

**Created:** 2026-03-05
**Phase:** 18D-1 — Demo/Library Dead Code Removal (Batch 1)
**Type:** Pre-implementation
**Baseline:** Phase 18C complete; starting Phase 18D demo cleanup

## Scope Statement

Delete first batch of `src/app/(admin)/base-ui/` demo pages (23 files across 16 subdirectories).

### Directories targeted for deletion (Phase 18D-1):
1. accordion/ (1 file)
2. alerts/ (1 file)
3. avatar/ (1 file)
4. badge/ (1 file)
5. breadcrumb/ (1 file)
6. buttons/ (1 file)
7. cards/ (1 file)
8. carousel/ (1 file)
9. collapse/ (2 files)
10. dropdown/ (1 file)
11. list-group/ (1 file)
12. modals/ (2 files)
13. offcanvas/ (3 files)
14. pagination/ (2 files)
15. placeholders/ (2 files)
16. popovers/ (2 files)

**Total: 23 files deleted + 2 restore points = 25 ops (at limit)**

### Remaining for Phase 18D-2:
- base-ui: progress/, spinners/, tabs/, toasts/, tooltips/ (8 files)
- forms/ (8 files)
- apex-chart/ (2 files)
- maps/ (4 files)
- tables/ (4 files)
- icons/ (2 files)
- (layouts)/ (10 files)

## Pre-existing Conditions
- Zero demo routes registered in router
- Zero demo menu entries in sidebar
- Zero cross-imports from demo dirs into RVM code
- apexcharts TS1540 warning (cosmetic, pre-existing)
