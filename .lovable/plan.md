# Phase 22 — Full Workflow Simulation Plan

## Pre-Execution Findings

**Meeting `in_session` state does not exist.** The `status_transitions` table only defines `draft → published → closed` for meetings. The UI (`MeetingStatusActions.tsx`) matches this. Scenario 1 step 6 ("Move to in_session") will be **skipped as N/A** — this is by design, not a defect.

## Execution Approach

All 5 scenarios will be tested via browser automation using the seed accounts. Results will be documented in `docs/Phase-22-Workflow-Simulation-Report.md`.

---

## Scenario 1 — Full Happy Path

1. Login as **[secretary@rvm.local](mailto:secretary@rvm.local)** → Create new meeting → Add agenda item (link to seed dossier) → Publish meeting → Close meeting
2. Create decision on an agenda item
3. Login as **[chair@rvm.local](mailto:chair@rvm.local)** → Navigate to meeting → Approve decision → Finalize decision
4. Verify: decision locked (`is_final`), dossier cascaded to `decided`

## Scenario 2 — Invalid Transition Blocking

1. As chair: attempt to edit the finalized decision
2. As secretary: attempt to re-open the closed meeting (no transition button should exist)
3. As secretary: attempt to edit the now-decided dossier (RLS should block)
4. Verify toast error messages and audit/illegal attempt logs

## Scenario 3 — Role Violation

1. Login as **[observer@rvm.local](mailto:observer@rvm.local)** → verify no create/edit/approve buttons visible
2. Login as **[member2@rvm.local](mailto:member2@rvm.local)** (admin_agenda) → attempt decision approval (button should not render)
3. Login as **[member1@rvm.local](mailto:member1@rvm.local)** (admin_dossier) → attempt meeting creation (button should not render)

## Scenario 4 — Task Flow

1. As secretary: create task linked to seed dossier → assign to member1
2. Update task status: todo → in_progress → done
3. Verify status transition enforcement

## Scenario 5 — Document Flow

1. As secretary: upload a test document to a seed dossier
2. Add a version
3. Download via signed URL
4. Verify access control (observer can view but not upload)

---

## Deliverable

Create `docs/Phase-22-Workflow-Simulation-Report.md` with:

- PASS/FAIL per scenario and sub-step
- Error messages captured
- Audit log evidence (query `rvm_illegal_attempt_log`)
- Root causes for any failures
- Recommended fixes (if any)

## Operations


| #   | Op     | File                                          |
| --- | ------ | --------------------------------------------- |
| 1   | Create | `docs/Phase-22-Workflow-Simulation-Report.md` |


**Total: 1 op** (documentation only)  
  
**NOTE — Workflow State Model Clarification**

The meeting lifecycle currently supports:

draft → published → closed

The "in_session" state is NOT part of the current model.

This must be explicitly documented in [architecture.md](http://architecture.md)

to avoid confusion with future workflow expectations.

This is NOT a blocker for Phase 22, but a governance clarification.  
  
---  
  
**NOTE — Runtime Stability Requirement**

During Phase 22 execution:

If ANY runtime error, broken UI state, or missing data occurs:

→ classify as CRITICAL

→ stop scenario execution

→ report immediately

Phase 22 must validate real behavior, not assumptions.