# Phase 13 — Agenda Item Management UI Plan

## Schema Reality Check (Critical)

The `rvm_agenda_item` table has these fields: `id`, `meeting_id`, `dossier_id` (required, NOT NULL), `agenda_number`, `title_override`, `notes`, `status`, `created_at`.

**Schema-vs-Spec discrepancies (NO schema changes allowed):**

- Spec says "title" → schema has `title_override` (will use this)
- Spec says "description (optional)" → schema has `notes` (will use this)
- Spec says "proposed_by (optional)" → **does not exist in schema** → will omit
- Spec says "linked_dossier_id (optional)" → schema has `dossier_id` (required/NOT NULL) → must remain required
- Spec statuses: draft, scheduled, discussed, decision_taken → **actual enum**: `scheduled`, `presented`, `withdrawn`, `moved` → will use actual enum values

## Pre-condition

Create `Project Restore Points/RP-P13-agenda-ui-pre.md`

## What Already Exists

- `src/services/agendaItemService.ts` — full CRUD service
- `src/hooks/useAgendaItems.ts` — all hooks (fetch, add, update, reorder, withdraw)
- Meeting detail page shows agenda items inline (no tabs)

## Implementation Plan

### 1. Add `AgendaItemStatusBadge` to `StatusBadges.tsx`

Map: `scheduled` → primary, `presented` → success, `withdrawn` → secondary, `moved` → info

### 2. Add `canEditAgendaItem` to `useUserRoles.ts`

`canEditAgendaItem: isSuperAdmin || hasAnyRole(['secretary_rvm', 'admin_agenda'])`

### 3. Create `src/components/rvm/CreateAgendaItemModal.tsx`

- Modal `size="xl"` centered
- Fields: `dossier_id` (required, select from dossiers list), `title_override` (optional), `agenda_number` (required, pre-filled with next number), `notes` (optional textarea)
- Uses `useAddAgendaItem` hook + `useNextAgendaNumber` for default
- Uses `useDossiers()` to populate dossier select
- Zod validation

### 4. Create `src/components/rvm/EditAgendaItemForm.tsx`

- Inline edit form (consistent with existing edit patterns)
- Editable: `title_override`, `agenda_number`, `notes`
- Status NOT editable via this form (governed by backend)
- Uses `useUpdateAgendaItem` hook

### 5. Refactor Meeting Detail Page with Tabs

Restructure `src/app/(admin)/rvm/meetings/[id]/page.tsx`:

- Add `Tabs` / `Tab` from react-bootstrap
- **Tab 1: "Overview"** — existing meeting info card + decisions summary (left column content)
- **Tab 2: "Agenda Items"** — agenda items table (moved from current right column) + "Add Agenda Item" button (role-gated) + inline edit toggle per row + `AgendaItemStatusBadge` replacing inline badge function
- **Tab 3: "Decisions"** — decisions list extracted from current agenda items table decision column, showing all decisions for the meeting

The existing decision modals (CreateDecisionModal, DecisionManagementModal) remain attached to agenda item actions.

### 6. Agenda Items Tab Content

Table columns: #, Dossier, Title, Status (badge), Decision (linked or "—"), Created At, Actions

- "Add Agenda Item" button visible only for `canEditAgendaItem` roles
- Edit button per row (role-gated, inline toggle)
- Withdraw button per row (role-gated)
- Create Decision / Manage Decision buttons (existing logic preserved)

## Files to Create

1. `src/components/rvm/CreateAgendaItemModal.tsx`
2. `src/components/rvm/EditAgendaItemForm.tsx`
3. `Project Restore Points/RP-P13-agenda-ui-pre.md`
4. `Project Restore Points/RP-P13-agenda-ui-post.md`

## Files to Modify

1. `src/app/(admin)/rvm/meetings/[id]/page.tsx` — add tab navigation, restructure layout
2. `src/components/rvm/StatusBadges.tsx` — add `AgendaItemStatusBadge`
3. `src/hooks/useUserRoles.ts` — add `canEditAgendaItem`

## GOVERNANCE NOTE 1 — Dossier Selection Scope

The dossier selection in CreateAgendaItemModal must not load the entire dossier table without context.

If possible, limit the dossier query to dossiers relevant to the meeting or provide a searchable selector.

No uncontrolled full-table loading is allowed.

------------------------------------------------

GOVERNANCE NOTE 2 — Agenda Number Uniqueness

The UI must enforce that agenda_number is unique per meeting.

Before submitting the createAgendaItem mutation:

- Check if another agenda item in the same meeting already has that number.

- If duplicate → block submission and show validation message.

This is a UI validation only. No database constraint changes are authorized.  
  
**No Changes To**

- Database schema, RLS policies, triggers
- Dossiers, Tasks, Audit, Documents modules
- Service layer (already complete)
- Hooks (already complete)

## Governance

- Zero schema changes
- Zero RLS changes
- Zero trigger changes
- UI + component layer only