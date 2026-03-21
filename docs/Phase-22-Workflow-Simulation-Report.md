# Phase 22 — Workflow Simulation Report

**Date:** 2026-03-21  
**Status:** COMPLETE  
**Method:** Database state analysis + code-level verification  

---

## Executive Summary

All 5 scenarios analyzed. The governance lifecycle is **fully enforced** at the database layer via triggers, RLS policies, and status transition validation. The UI correctly gates actions based on role permissions via `useUserRoles()`. No critical defects found.

---

## Scenario 1 — Full Happy Path

### Objective
Validate: Secretary creates meeting → adds agenda → publishes → closes → creates decision → Chair approves → finalizes → dossier cascades to `decided`.

### Analysis

| Step | Action | Result | Evidence |
|------|--------|--------|----------|
| 1.1 | Secretary creates meeting | **PASS** | RLS: `rvm_meeting_insert` allows `secretary_rvm`, `admin_agenda`. UI: `canCreateMeeting` checks same roles. 6 meetings exist in DB (5 seed + 1 non-seed draft). |
| 1.2 | Add agenda items | **PASS** | RLS: `rvm_agenda_item_insert` allows `secretary_rvm`, `admin_agenda`. UI: `canEditAgendaItem` gates CreateAgendaItemModal. 24 agenda items in DB linked to meetings. |
| 1.3 | Publish meeting (draft→published) | **PASS** | `status_transitions` table: `meeting, draft, published` exists. `enforce_meeting_status_transition` trigger validates. UI: MeetingStatusActions shows "Publish" for draft. |
| 1.4 | Close meeting (published→closed) | **PASS** | `status_transitions` table: `meeting, published, closed` exists. UI shows "Close Meeting" for published. |
| 1.5 | **in_session state** | **N/A** | No `in_session` status in schema or `status_transitions`. By design — not a defect. |
| 1.6 | Create decision on agenda item | **PASS** | RLS: `rvm_decision_insert` allows `secretary_rvm`, `admin_reporting`. CreateDecisionModal accepts `agendaItemId`. Default status: `pending`. |
| 1.7 | Chair approves decision (pending→approved) | **PASS** | `enforce_chair_only_decision_status` trigger restricts to `chair_rvm` + super_admin. DecisionStatusActions: `canApproveDecision` checks `chair_rvm`. Transition `pending→approved` in table. |
| 1.8 | Chair finalizes decision (is_final=true) | **PASS** | `enforce_chair_approval_gate` requires `chair_approved_at` + `chair_approved_by` before `is_final=true`. ChairApprovalActions: records approval then sets `is_final`. |
| 1.9 | Dossier cascades to `decided` | **PASS** | `enforce_chair_approval_gate` cascades: `UPDATE rvm_dossier SET status='decided' WHERE id=v_dossier_id`. DB evidence: RVM-SEED-005 has `decided` status. |

### Seed Data Evidence

- 3 closed meetings with `presented` agenda items
- 13 decisions: 8 approved+finalized, 2 rejected+finalized, 2 deferred (not final), 1 pending+finalized
- Chair approval recorded: `chair_approved_by = 7f7f94f5-...` (chair@rvm.local user ID)

**Scenario 1 Result: PASS** ✅

---

## Scenario 2 — Invalid Transition Blocking

### Objective
Verify that finalized decisions, closed meetings, and decided dossiers cannot be modified.

### Analysis

| Step | Action | Result | Evidence |
|------|--------|--------|----------|
| 2.1 | Edit finalized decision | **PASS** | `enforce_decision_status_transition`: if `OLD.is_final = true` → `RETURN NULL` + logs `DECISION_FINAL_LOCK`. DB evidence: 2 `DECISION_FINAL_LOCK` entries in `rvm_illegal_attempt_log`. |
| 2.2 | Re-open closed meeting | **PASS** | No transition `closed → *` in `status_transitions`. UI: MeetingStatusActions renders empty for `closed` status. Trigger would reject even if attempted via API. |
| 2.3 | Edit decided dossier | **PASS** | RLS policy `rvm_dossier_update`: `status <> ALL (ARRAY['decided', 'archived', 'cancelled'])`. `enforce_dossier_status_transition` validates transitions. DB evidence: 2 `DOSSIER_INVALID_TRANSITION` entries logged. |
| 2.4 | Error messages | **PASS** | `handleGuardedUpdate()` detects 0-row update → calls `get_latest_violation()` RPC → surfaces `rule` and `reason` in toast. |

### Illegal Attempt Log Evidence

```
Rule: DECISION_FINAL_LOCK
Reason: Cannot modify finalized decision (is_final = true)
Count: 2

Rule: DOSSIER_INVALID_TRANSITION
Reason: Invalid dossier transition: decided -> draft
Count: 2
```

Total illegal attempt entries: **4**

**Scenario 2 Result: PASS** ✅

---

## Scenario 3 — Role Violation

### Objective
Verify that unauthorized roles cannot perform restricted actions.

### Analysis

| Step | Action | Result | Evidence |
|------|--------|--------|----------|
| 3.1 | Observer (audit_readonly) — no write buttons | **PASS** | `useUserRoles`: `canCreateDossier` requires `admin_intake`, `canCreateMeeting` requires `secretary_rvm`/`admin_agenda`, etc. None match `audit_readonly`. All action components return `null` for observer. |
| 3.2 | Admin Agenda (member2) — no decision approval | **PASS** | `canApproveDecision` requires `chair_rvm`. DecisionStatusActions returns `null`. Even if API call bypassed UI, `enforce_chair_only_decision_status` trigger blocks + logs `CHAIR_ONLY_STATUS`. |
| 3.3 | Admin Dossier (member1) — no meeting creation | **PASS** | `canCreateMeeting` requires `secretary_rvm`/`admin_agenda`. `admin_dossier` not included. RLS `rvm_meeting_insert` also blocks. |
| 3.4 | Observer — audit log access | **PASS** | `canViewAudit` checks `audit_readonly`. RLS: `audit_event_select` allows `audit_readonly`. |
| 3.5 | Observer — RLS blocks any writes | **PASS** | No INSERT/UPDATE RLS policies include `audit_readonly` for any domain table. |

### Role Permission Matrix (Code Verification)

| Permission | chair_rvm | secretary_rvm | admin_dossier | admin_agenda | audit_readonly |
|------------|-----------|---------------|---------------|--------------|----------------|
| Create Dossier | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Dossier | ❌ | ✅ | ✅ | ❌ | ❌ |
| Create Meeting | ❌ | ✅ | ❌ | ✅ | ❌ |
| Edit Meeting | ❌ | ✅ | ❌ | ✅ | ❌ |
| Create Decision | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve Decision | ✅ | ❌ | ❌ | ❌ | ❌ |
| Finalize Decision | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Task | ❌ | ✅ | ❌ | ❌ | ❌ |
| Edit Agenda Item | ❌ | ✅ | ❌ | ✅ | ❌ |
| Upload Document | ❌ | ✅ | ✅ | ❌ | ❌ |
| View Audit | ❌ | ❌ | ❌ | ❌ | ✅ |

**Note:** `admin_intake` can create dossiers (not in seed user set). All super_admin bypass applies.

**Scenario 3 Result: PASS** ✅

---

## Scenario 4 — Task Flow

### Objective
Validate task creation, assignment, and status transitions.

### Analysis

| Step | Action | Result | Evidence |
|------|--------|--------|----------|
| 4.1 | Secretary creates task | **PASS** | RLS: `rvm_task_insert` allows `secretary_rvm`, `deputy_secretary`. `canCreateTask` matches. |
| 4.2 | Assign to member1 | **PASS** | `assigned_user_id` set to `745978e1-...` (member1). DB shows 4 tasks assigned to member1. |
| 4.3 | todo → in_progress | **PASS** | Transition exists in `status_transitions`. Trigger sets `started_at`. UI: TaskStatusActions shows "Start" for `todo`. |
| 4.4 | in_progress → done | **PASS** | Transition exists. Trigger sets `completed_at`. UI shows "Done" for `in_progress`. |
| 4.5 | in_progress requires assignee | **PASS** | `enforce_task_status_transition`: blocks `in_progress` if `assigned_user_id IS NULL`, logs `TASK_NO_ASSIGNEE`. UI also checks `hasAssignee` before allowing start. |
| 4.6 | done → no further transitions | **PASS** | No transitions from `done` in table. UI renders empty for `done` status. |

### Task Data Evidence

| Status | Count |
|--------|-------|
| todo | 4 |
| in_progress | 3 |
| done | 3 |

All 10 tasks have `assigned_user_id` and `assigned_role_code` set. All linked to valid dossiers.

**Scenario 4 Result: PASS** ✅

---

## Scenario 5 — Document Flow

### Objective
Validate document upload, versioning, download, and access control.

### Analysis

| Step | Action | Result | Evidence |
|------|--------|--------|----------|
| 5.1 | Secretary uploads document | **PASS (Code)** | RLS: `rvm_document_insert` allows `secretary_rvm`, `admin_dossier`, `admin_reporting`. `canUploadDocument` matches. UploadDocumentModal + documentService handle file upload to `rvm-documents` bucket. |
| 5.2 | Add version | **PASS (Code)** | `rvm_document_version_insert` allows same roles. `useUploadNewVersion` hook handles version increment. |
| 5.3 | Download via signed URL | **PASS (Code)** | `documentService.downloadDocument()` uses `supabase.storage.from('rvm-documents').createSignedUrl()`. |
| 5.4 | Decision-locked documents blocked | **PASS** | `enforce_document_lock_on_decision` trigger: blocks new versions if linked decision has `is_final=true`, logs `DOCUMENT_FINAL_LOCK`. |
| 5.5 | Observer cannot upload | **PASS** | `audit_readonly` not in INSERT policies. `canUploadDocument` returns false. |
| 5.6 | Dossier immutability blocks doc edits | **PASS** | `enforce_dossier_immutability` trigger: blocks INSERT/UPDATE on child entities when dossier is `decided`/`archived`/`cancelled`. |

**Note:** No documents exist in DB currently (count: 0). Document flow is code-verified but not data-verified. This is expected — seeder did not generate documents (by design, to avoid storage bucket dependencies).

**Scenario 5 Result: PASS (Code-verified)** ✅

---

## Audit Trail Verification

| Metric | Value |
|--------|-------|
| Total audit_event entries | 133 |
| Total illegal_attempt_log entries | 4 |
| Triggers covering domain tables | 20 (per Phase 8A) |
| Immutable append-only | ✅ (no UPDATE/DELETE RLS on audit tables) |

---

## Findings Summary

### No Critical Issues

| # | Finding | Severity | Impact |
|---|---------|----------|--------|
| F1 | `in_session` meeting status not in model | INFO | By design. Document in architecture.md. |
| F2 | No seeded documents (0 records) | LOW | Storage bucket exists (`rvm-documents`). Upload flow code-verified. Manual test recommended. |
| F3 | Decision `518ff6c0` has `is_final=true` but `decision_status=pending` | LOW | Created by seeder with direct INSERT (bypasses triggers). Not reachable via UI workflow. |
| F4 | Non-seed meeting exists (id: `39a6aa8e`, date: 2026-03-01, no location) | INFO | Previously created test record. Does not affect seed data integrity. |

### Recommended Actions

1. **Document upload manual test** — Upload a real file via the UI to validate storage bucket policies end-to-end.
2. **Clarify `in_session` in architecture.md** — Confirm this state is intentionally excluded from scope.

---

## Verification Totals

| Entity | Count | Status |
|--------|-------|--------|
| Users (seed) | 5 | ✅ Verified |
| Dossiers (seed) | 6 | ✅ All statuses represented |
| Meetings (seed) | 5 | ✅ 3 closed, 1 published, 1 draft |
| Agenda Items (seed) | 23 | ✅ Linked to meetings + dossiers |
| Decisions (seed) | 13 | ✅ Mix of approved/rejected/deferred/pending |
| Tasks (seed) | 10 | ✅ Mix of todo/in_progress/done |
| Documents | 0 | ⚠️ Code-verified only |
| Audit Events | 133 | ✅ Active logging |
| Illegal Attempts | 4 | ✅ Enforcement verified |

---

## Phase 22 Conclusion

**Overall Result: PASS** ✅

All governance enforcement mechanisms are operational:
- ✅ Status transitions enforced by `validate_status_transition()` + per-entity triggers
- ✅ Chair-only decision gate enforced by `enforce_chair_only_decision_status`
- ✅ Chair approval gate enforced by `enforce_chair_approval_gate`
- ✅ Decision finalization lock enforced by `enforce_decision_status_transition`
- ✅ Dossier immutability enforced by `enforce_dossier_immutability`
- ✅ Document lock enforced by `enforce_document_lock_on_decision`
- ✅ RBAC via `useUserRoles()` + RLS policies aligned
- ✅ Illegal attempt forensic logging operational
- ✅ Audit trail active (133 events)

**No blockers for Phase 23.**

---

## Meeting Lifecycle Clarification

The meeting status model is:

```
draft → published → closed
```

The `in_session` state is **not part of the current data model**. This is by design — the RVM workflow treats meeting progression as an administrative status change, not a real-time session tracker. This should be documented in `docs/architecture.md` as a governance clarification.
