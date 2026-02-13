
# PHASE 8C.3 — TASK EDIT FLOW IMPLEMENTATION PLAN

## PRE-IMPLEMENTATION VERIFICATION

### Prerequisites Status: ✅ ALL CLEAR

| Item | Status | Evidence |
|------|--------|----------|
| Task list page exists | ✅ | `/src/app/(admin)/rvm/tasks/page.tsx` (216 lines) |
| No task detail page exists | ⚠️ | Tasks are inline on list; no detail page route |
| Task service.updateTask exists | ✅ | `taskService.updateTask(id, data)` implemented (lines 101-111) |
| useUpdateTask hook exists | ✅ | Implemented with React Query (lines 74-84 in useTasks.ts) |
| canEditTask permission gate | ✅ | Already in useUserRoles.ts (line 31): `secretary_rvm`, `deputy_secretary`, `super_admin` |
| Create form exists (reference) | ✅ | `CreateTaskModal.tsx` with editable fields |

**Critical Finding:** No task detail page exists. Tasks are displayed inline on the task list page. Therefore, edit flow must be integrated as an **inline toggle editor** on the task list (similar to inline editing patterns), OR a new detail page must be created (deferred scope).

**Recommendation:** Implement inline edit mode on task list page, following toggle pattern from dossier/meeting detail pages.

---

## EDITABLE FIELDS EXTRACTED FROM CREATE FORM

### Task (from CreateTaskModal.tsx)

**Required fields** (editable):
- `title` (string, max 500)

**Optional fields** (editable):
- `task_type` (enum: intake/dossier_management/agenda_prep/reporting/review/distribution/other)
- `assigned_role_code` (string, linked to app_role.code)
- `priority` (enum: normal/high/urgent)
- `due_at` (datetime)
- `description` (string, textarea)

**Non-editable fields** (immutable):
- `dossier_id` (assigned at creation; immutable per governance pattern)
- `id` (PK)
- `status` (managed via TaskStatusActions, not edit form)
- `assigned_user_id` (managed separately; user assignment is permission-based)
- `created_at`, `updated_at` (system fields)
- `created_by` (immutable)

**Note:** `dossier_id` is immutable once created (tasks belong to specific dossiers). Including in edit form as disabled read-only field for clarity.

---

## IMMUTABILITY CONSTRAINTS (Backend Enforced)

### Task Status Constraints

Task has **5 statuses**: `todo`, `in_progress`, `blocked`, `done`, `cancelled`

**RLS UPDATE Policy** (line 258-265 in migration):
- Allows update if: `assigned_user_id = current_user` OR `has_any_role(['secretary_rvm', 'deputy_secretary'])` OR `is_super_admin`
- **NO status-based immutability lock in RLS** (unlike dossiers/meetings)

**Database Trigger** (lines 119-142 in migration):
- Validates status transitions via `validate_status_transition()` function
- Enforces: `in_progress` requires `assigned_user_id`
- Does NOT prevent edits based on status (e.g., `done` or `cancelled` tasks can still have title/description edited)

**UI Immutability Gate Recommendation:**
- Allow edits on all tasks (no status-based disabling)
- However, prevent status transition if user lacks assignment
- Show warning if editing a `done` or `cancelled` task (best practice)

---

## IMPLEMENTATION APPROACH

### Architecture Decision: Inline Edit vs. Detail Page

**Phase 8C.3 Scope:** Inline edit on task list page (no new routes)

**Rationale:**
1. Consistent with phase 8C.2 pattern (toggle-based edit)
2. No new route creation required (governance compliant)
3. Task list is the primary task management interface
4. Detail page deferred to future phase if needed

---

### Module 1: EditTaskForm Component

**File:** `src/components/rvm/EditTaskForm.tsx` (NEW)

**Structure:**
- Props: `task: Task`, `onSave: (data: TaskFormData) => void`, `onCancel: () => void`, `isLoading: boolean`
- Local state: `form` (title, task_type, assigned_role_code, priority, due_at, description), `errors`
- Zod schema: Extract same schema as CreateTaskModal
- Fields:
  - `title` (required, text, max 500)
  - `task_type` (enum select)
  - `assigned_role_code` (enum select, fetched from app_role)
  - `priority` (enum select)
  - `due_at` (datetime-local)
  - `description` (textarea)
  - `dossier_id` (read-only display, disabled field)
- Layout: Two-column grid (title full width, rest in 6-col pairs)
- Validation: Zod schema with inline error display
- Buttons: Cancel (reverts), Save (submits with validation)
- Disabled state: `isLoading === true`

**Type Definition:**
```typescript
type TaskFormData = {
  title: string
  task_type: Enums<'task_type'>
  assigned_role_code: string
  priority: Enums<'task_priority'>
  due_at: string | null
  description: string | null
}
```

---

### Module 2: Task List Page Integration

**File:** `src/app/(admin)/rvm/tasks/page.tsx` (MODIFY)

**Changes:**

1. **Add edit state tracking:**
   ```typescript
   const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
   ```

2. **Modify table row rendering** (lines 170-201):
   - If `editingTaskId === task.id`: Render inline edit form (below or replacing row)
   - If `editingTaskId !== task.id`: Render normal row with Edit button

3. **Add Edit button to Actions column:**
   - Button: `<Button size="sm" variant="outline-primary" onClick={() => setEditingTaskId(task.id)}>Edit</Button>`
   - Show only if `canEditTask` is true
   - Hidden if `editingTaskId === task.id` (editing mode active)

4. **Render EditTaskForm when editingTaskId matches:**
   ```typescript
   {editingTaskId === task.id && (
     <tr>
       <td colSpan={7}>
         <EditTaskForm 
           task={task}
           onSave={handleSaveTask}
           onCancel={() => setEditingTaskId(null)}
           isLoading={isUpdating}
         />
       </td>
     </tr>
   )}
   ```

5. **Add mutation handler:**
   ```typescript
   const updateTask = useUpdateTask()
   const [isUpdating, setIsUpdating] = useState(false)
   
   const handleSaveTask = async (formData: TaskFormData) => {
     try {
       setIsUpdating(true)
       await updateTask.mutateAsync({
         id: editingTaskId!,
         data: {
           title: formData.title,
           task_type: formData.task_type,
           assigned_role_code: formData.assigned_role_code,
           priority: formData.priority,
           due_at: formData.due_at,
           description: formData.description,
         }
       })
       toast.success('Task updated successfully')
       refetch()
       setEditingTaskId(null)
     } catch (error) {
       toast.error(getErrorMessage(error))
     } finally {
       setIsUpdating(false)
     }
   }
   ```

6. **UI Gate:**
   - Edit button hidden if `!canEditTask`
   - Backend RLS enforces final authorization

---

## GOVERNANCE CONSTRAINTS COMPLIANCE

| Constraint | Implementation |
|-----------|---|
| No schema changes | ✅ Uses existing rvm_task table |
| No RLS policy changes | ✅ RLS enforced at backend via existing policies |
| No trigger modifications | ✅ Phase 8A triggers fire on UPDATE automatically |
| No new dependencies | ✅ Uses existing Zod, React Bootstrap, React Query |
| Backend authoritative | ✅ UI validation is UX layer only; RLS enforces final state |
| Immutability constraints | ✅ UI shows all statuses as editable; backend enforces RLS |
| Audit events created | ✅ Phase 8A `log_audit_event()` trigger fires on all UPDATEs |
| No workflow engine changes | ✅ Status transitions remain in TaskStatusActions; not touched |

---

## AUDIT VERIFICATION (Automated via Triggers)

When `updateTask()` succeeds:
1. Database `log_audit_event()` trigger fires
2. New `audit_event` row created with:
   - `event_type = 'updated'`
   - `event_payload = { old: {...}, new: {...} }`
   - `actor_user_id = current user`
   - `occurred_at = now()`
3. Viewable in `/rvm/audit` page (Phase 8C.1)

No additional code needed for audit logging.

---

## FILES TO BE CREATED/MODIFIED

### NEW FILES
```
src/components/rvm/EditTaskForm.tsx
Project Restore Points/RP-P8C3-pre.md
Project Restore Points/RP-P8C3-post.md
```

### MODIFIED FILES
```
src/app/(admin)/rvm/tasks/page.tsx
```

### NOT MODIFIED
```
src/hooks/useTasks.ts (hooks already exist)
src/services/taskService.ts (service methods already exist)
src/hooks/useUserRoles.ts (permissions already exist)
src/components/rvm/TaskStatusActions.tsx (separate status transition flow)
```

---

## BUILD ORDER

1. Create `RP-P8C3-pre.md` restore point
2. Create `EditTaskForm.tsx` component (reusable, no dependencies)
3. Integrate `EditTaskForm` into task list page (add state, button, handler)
4. Manual runtime verification (see Acceptance Criteria below)
5. Create `RP-P8C3-post.md` restore point

---

## ACCEPTANCE CRITERIA & VERIFICATION CHECKLIST

### ✅ TASK EDIT FLOW (Inline)
- [ ] Edit button visible on task rows (not hidden for unauthorized users)
- [ ] Click Edit → form renders inline with current values prefilled
- [ ] Cancel button → reverts to task row (no write)
- [ ] Save button → calls updateTask, refetches, shows success toast
- [ ] Form displays: title, task_type, assigned_role_code, priority, due_at, description
- [ ] Dossier ID shown as read-only (cannot change parent dossier)
- [ ] Unauthorized user (no canEditTask) → Edit button not visible
- [ ] Backend RLS blocks write if user lacks permission → error toast shown
- [ ] Audit event created on successful save (verify in `/rvm/audit`)
- [ ] All task statuses (todo, in_progress, blocked, done, cancelled) are editable
- [ ] No console errors or React warnings during edit/save cycle

### ✅ GOVERNANCE
- [ ] No new schema migrations
- [ ] No RLS policy changes
- [ ] No new npm dependencies
- [ ] Service and hook layers unchanged (no new patterns)
- [ ] Darkone styling consistent (Bootstrap, no custom CSS)
- [ ] Single ToastContainer used (no duplicates)
- [ ] No workflow engine changes (status transitions remain separate)

---

## KNOWN LIMITATIONS & DEFERRED SCOPE

1. **Task detail page**: Out of scope for Phase 8C.3; deferred to future phase
2. **User assignment editor**: Complex (requires mapping tasks to users by role); deferred
3. **Bulk edit**: Out of scope; single-task inline edit only
4. **Workflow state machine**: Out of scope; status transitions remain in TaskStatusActions
5. **Modal refactoring**: Out of scope; noted for UI Polish phase

---

## HARD STOP AFTER COMPLETION

Once all files are created and integrated:
1. Provide summary of what changed and where (file paths)
2. Provide verification results (checklist status)
3. Report any blockers found
4. Declare: **"Await Further Instructions. Do not proceed with Phase 8C.4 or beyond without explicit user authorization."**

