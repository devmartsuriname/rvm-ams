

# Phase 8B: UI Write Flows (Dossiers, Meetings, Tasks)

## Baseline Gap Analysis

Currently all three RVM modules are **read-only** in the UI. The service layer and React Query hooks for create/update/status mutations already exist but are not connected to any forms or action buttons. There is no role-based UI gating -- all users see the same interface regardless of permissions.

## Implementation Order

### Step 0: Restore Point (Pre)
Create `Project Restore Points/RP-P8B-write-flows-pre.md` documenting current state.

### Step 1: Shared Infrastructure

**1a. Role-aware hook** (`src/hooks/useUserRoles.ts`)
- Exposes `user.roles` from AuthContext
- Helper: `canCreateDossier`, `canEditDossier`, `canCreateMeeting`, `canEditMeeting`, `canCreateTask`, `canEditTask`
- Maps directly to RLS permission matrix (no client-side security -- UI hints only)

**1b. RLS error handler utility** (`src/utils/rls-error.ts`)
- Detects Supabase RLS denial errors (code `42501` / `new row violates row-level security`)
- Returns user-friendly message: "You do not have permission to perform this action"
- Used by all mutation `onError` handlers

**1c. Toast integration**
- Use existing `react-toastify` (already installed) for success/error feedback
- Add `<ToastContainer />` to `AdminLayout.tsx` if not already present

### Step 2: Dossier Write Flows

**2a. Create Dossier Modal** (`src/components/rvm/CreateDossierModal.tsx`)
- Bootstrap Modal following Darkone pattern
- Fields: title (required), service_type (required), sender_ministry (required), urgency, confidentiality_level, summary, proposal_subtype (conditional on service_type=proposal)
- Item fields: reference_code, received_date, description, attachments_expected
- Zod validation schema
- Calls `useCreateDossier()` hook
- Success toast + list refresh; RLS error toast on denial
- Only rendered when user has `admin_intake` role

**2b. Create button on Dossier list page** (`src/app/(admin)/rvm/dossiers/page.tsx`)
- "New Dossier" button in card header, visible only to `admin_intake` role
- Opens CreateDossierModal

**2c. Edit Dossier form** (`src/components/rvm/EditDossierForm.tsx`)
- Inline editable fields on detail page (title, summary, urgency, confidentiality)
- Uses `useUpdateDossier()` hook
- Disabled when dossier status is decided/archived/cancelled
- Only visible to `secretary_rvm` / `admin_dossier`

**2d. Status transition buttons** (on Dossier detail page)
- Show only valid next statuses based on current status (from status_transitions table)
- Each button calls `useUpdateDossierStatus()`
- Confirm dialog for destructive transitions (cancel)
- Disabled/hidden for users without update permission

Valid dossier transitions:
```text
draft -> registered
registered -> in_preparation, cancelled
in_preparation -> scheduled, cancelled
scheduled -> decided, cancelled
decided -> archived
```

### Step 3: Meeting Write Flows

**3a. Create Meeting Modal** (`src/components/rvm/CreateMeetingModal.tsx`)
- Fields: meeting_date (required), meeting_type, location
- Zod validation
- Calls `useCreateMeeting()` hook
- Only rendered for `secretary_rvm` / `admin_agenda`

**3b. Create button on Meeting list page**
- "New Meeting" button, role-gated

**3c. Edit Meeting** (on detail page)
- Editable fields: meeting_date, meeting_type, location
- Disabled when status is `closed`
- Uses `useUpdateMeeting()` hook

**3d. Status transition buttons** (on Meeting detail page)
- draft -> published -> closed
- Role-gated to `secretary_rvm` / `admin_agenda`

### Step 4: Task Write Flows

**4a. Create Task Modal** (`src/components/rvm/CreateTaskModal.tsx`)
- Fields: title (required), dossier_id (required, dropdown of editable dossiers), task_type (required), assigned_role_code (required), description, priority, due_at, assigned_user_id
- Zod validation
- Calls `useCreateTask()` hook
- Only for `secretary_rvm` / `deputy_secretary`

**4b. Create button on Task list page**
- Role-gated

**4c. Task status transitions** (inline on list or detail)
- Buttons for valid next statuses
- `in_progress` requires `assigned_user_id` (enforced by DB trigger)
- Role-gated: task assignee + secretary_rvm + deputy_secretary

Valid task transitions:
```text
todo -> in_progress, blocked, cancelled
in_progress -> done, blocked, cancelled
blocked -> in_progress, cancelled
```

### Step 5: Cross-Module Checks

- Verify dossier immutability: creating tasks/meetings for decided/archived/cancelled dossiers shows error
- Verify meeting close prevents agenda item modification
- Verify chair approval gate on decisions (existing DB trigger -- no UI change needed in this phase)

### Step 6: Audit Verification

- All mutations go through existing Supabase client inserts/updates
- DB triggers (`log_audit_event`) fire automatically on INSERT/UPDATE
- No additional code needed -- verify by querying `audit_event` table after test operations

## New Files

| File | Purpose |
|------|---------|
| `src/hooks/useUserRoles.ts` | Role permission helpers |
| `src/utils/rls-error.ts` | RLS error parsing utility |
| `src/components/rvm/CreateDossierModal.tsx` | Create dossier form |
| `src/components/rvm/EditDossierForm.tsx` | Edit dossier inline form |
| `src/components/rvm/DossierStatusActions.tsx` | Status transition buttons |
| `src/components/rvm/CreateMeetingModal.tsx` | Create meeting form |
| `src/components/rvm/EditMeetingForm.tsx` | Edit meeting inline form |
| `src/components/rvm/MeetingStatusActions.tsx` | Status transition buttons |
| `src/components/rvm/CreateTaskModal.tsx` | Create task form |
| `src/components/rvm/TaskStatusActions.tsx` | Status transition buttons |

## Modified Files

| File | Change |
|------|--------|
| `src/app/(admin)/rvm/dossiers/page.tsx` | Add create button + modal |
| `src/app/(admin)/rvm/dossiers/[id]/page.tsx` | Add edit form + status actions |
| `src/app/(admin)/rvm/meetings/page.tsx` | Add create button + modal |
| `src/app/(admin)/rvm/meetings/[id]/page.tsx` | Add edit form + status actions |
| `src/app/(admin)/rvm/tasks/page.tsx` | Add create button + modal + inline status |
| `src/layouts/AdminLayout.tsx` | Add ToastContainer (if missing) |

## No Database Changes Required

All required tables, triggers, RLS policies, and audit functions are already in place from Phase 8A.

## Technical Notes

- All forms use react-bootstrap components (Modal, Form, Button) -- Darkone 1:1
- Zod for client-side validation; DB triggers for server-side enforcement
- Role checks are UI hints only; RLS remains source of truth
- Single spinner pattern maintained (no new Suspense boundaries)
- `react-toastify` already installed -- just needs container mount

## Smoke Tests (Post-Implementation)

| Test | Description |
|------|-------------|
| S1 | Sign-in redirect to /dashboards within 2s |
| S2 | Logout works on Preview/Live |
| S3 | Create dossier (admin_intake) -> appears in list -> audit_event |
| S4 | Disallowed role -> create button hidden + RLS denial toast |
| S5 | Valid dossier status transition -> success + audit_event |
| S6 | Create meeting -> list updates + audit_event |
| S7 | Create task -> status update -> audit_event |
| S8 | No double spinner during any flow |

## Restore Points

- Pre: `Project Restore Points/RP-P8B-write-flows-pre.md`
- Post: `Project Restore Points/RP-P8B-write-flows-post.md`

