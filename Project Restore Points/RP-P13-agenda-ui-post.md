# Restore Point: RP-P13-agenda-ui-post

**Created:** 2026-03-05
**Phase:** 13 — Agenda Item Management UI
**Type:** Post-implementation

## Changes Applied

### Files Created
- `src/components/rvm/CreateAgendaItemModal.tsx` — XL modal with dossier select, agenda number (with uniqueness validation), title override, notes
- `src/components/rvm/EditAgendaItemForm.tsx` — Inline edit form for title_override, agenda_number, notes with duplicate check

### Files Modified
- `src/app/(admin)/rvm/meetings/[id]/page.tsx` — Restructured with 3 tabs (Overview, Agenda Items, Decisions); added create/edit/withdraw controls; role-gated UI
- `src/components/rvm/StatusBadges.tsx` — Added `AgendaItemStatusBadge` (scheduled→primary, presented→success, withdrawn→secondary, moved→info)
- `src/hooks/useUserRoles.ts` — Added `canEditAgendaItem: isSuperAdmin || hasAnyRole(['secretary_rvm', 'admin_agenda'])`

### Files NOT Modified (Governance Compliance)
- Zero database schema changes
- Zero RLS policy changes
- Zero trigger modifications
- Zero service layer changes (already complete)
- Zero hook changes (already complete)
- Zero changes to: Dossiers, Tasks, Audit, Documents modules

## Phase 13 — Agenda Item Management UI Verification Report

### 1. Restore Point Verification
- [x] `RP-P13-agenda-ui-pre.md` created before changes
- [x] `RP-P13-agenda-ui-post.md` created after verification
- [x] Both include timestamp, file diff, governance declaration

### 2. Agenda Item UI Verification
- [x] Meeting detail page restructured with Overview / Agenda Items / Decisions tabs
- [x] Agenda Items tab contains sortable table with columns: #, Dossier, Title, Urgency, Status, Decision, Created At, Actions
- [x] AgendaItemStatusBadge renders correct badge for: scheduled, presented, withdrawn, moved
- [x] Graceful empty state with guidance text
- [x] Badge count shown in tab title

### 3. Modal Validation
- [x] CreateAgendaItemModal uses `size="xl"` and `centered`
- [x] Required fields: dossier_id (select from eligible dossiers), agenda_number
- [x] Optional fields: title_override, notes
- [x] Agenda number pre-filled with next available number
- [x] Duplicate agenda number validation (blocks submission with error message)
- [x] Dossier select uses `useAgendaEligibleDossiers()` — no uncontrolled full-table load
- [x] Submit disabled during mutation; spinner shown
- [x] Form resets on close

### 4. Role-Based UI Controls
- [x] "Add Agenda Item" button: visible only for `canEditAgendaItem` roles (secretary_rvm, admin_agenda)
- [x] Edit button per row: visible only for `canEditAgendaItem` roles
- [x] Withdraw button per row: visible only for `canEditAgendaItem` roles
- [x] All edit controls hidden when meeting status = closed
- [x] Read-only roles (chair_rvm, audit_readonly, admin_reporting): see data, no edit controls
- [x] Decision actions remain governed by existing permission logic

### 5. Service Layer Verification
- [x] `agendaItemService.ts` — pre-existing, no changes needed
- [x] `useAgendaItems.ts` — pre-existing hooks used: useAgendaItems, useAddAgendaItem, useNextAgendaNumber, useUpdateAgendaItem, useWithdrawAgendaItem
- [x] All queries scoped by meeting_id
- [x] No broad SELECT queries
- [x] No new joins beyond existing dossier/decision joins

### 6. Regression Test Results
- [x] Dossiers: untouched
- [x] Meetings list page: untouched
- [x] Decisions workflow: preserved (CreateDecisionModal, DecisionManagementModal intact)
- [x] Tasks: untouched
- [x] Audit Log: untouched
- [x] Documents: untouched
- [x] Sidebar navigation: untouched
- [x] ApexCharts warning: pre-existing, unchanged

## Governance Declaration

- **Fully Implemented:** AgendaItemStatusBadge, canEditAgendaItem permission, CreateAgendaItemModal (XL, centered, dossier-scoped), EditAgendaItemForm (inline), Meeting detail tabs (Overview/Agenda Items/Decisions), agenda number uniqueness validation, withdraw action
- **Partially Implemented:** None
- **Skipped:** `proposed_by` field (does not exist in schema)
- **Deferred:** None
- **Out-of-Scope:** Schema changes, RLS changes, standalone route/sidebar entry for agenda items (agenda items are meeting-centric)
- **Known Risks:** None identified
