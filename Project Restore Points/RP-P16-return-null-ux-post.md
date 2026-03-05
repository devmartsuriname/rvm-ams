# Restore Point: RP-P16-return-null-ux-post

**Created:** 2026-03-05
**Phase:** 16 — RETURN NULL Pattern Unification + UX Exception Handling
**Type:** Post-implementation

## Changes Applied

### Database Migrations (4 trigger function replacements)

| Trigger | Old Pattern | New Pattern | Rule Code(s) |
|---------|-------------|-------------|---------------|
| `enforce_meeting_status_transition` | RAISE EXCEPTION | RETURN NULL + `log_illegal_attempt` | MEETING_INVALID_TRANSITION |
| `enforce_task_status_transition` | RAISE EXCEPTION | RETURN NULL + `log_illegal_attempt` | TASK_INVALID_TRANSITION, TASK_NO_ASSIGNEE |
| `enforce_agenda_item_status_transition` | RAISE EXCEPTION | RETURN NULL + `log_illegal_attempt` | AGENDA_CLOSED_MEETING, AGENDA_INVALID_TRANSITION |
| `enforce_dossier_immutability` | RAISE EXCEPTION | RETURN NULL + `log_illegal_attempt` | DOSSIER_IMMUTABILITY |

### Service Layer (6 methods converted)

| File | Method | Old | New |
|------|--------|-----|-----|
| `meetingService.ts` | `updateMeeting` | `.single()` | `handleGuardedUpdate()` |
| `meetingService.ts` | `updateMeetingStatus` | `.single()` | `handleGuardedUpdate()` |
| `taskService.ts` | `updateTask` | `.single()` | `handleGuardedUpdate()` |
| `taskService.ts` | `updateTaskStatus` | `.single()` | `handleGuardedUpdate()` |
| `agendaItemService.ts` | `updateAgendaItem` | `.single()` | `handleGuardedUpdate()` |
| `agendaItemService.ts` | `withdrawAgendaItem` | `.single()` | `handleGuardedUpdate()` |

### Documentation

- `docs/backend.md` — Added Phase 16 section with enforcement vector table, service layer standard, UX message mapping
- `docs/architecture.md` — Updated phase completion status paragraph
- `src/utils/rls-error.ts` — Updated comments to reflect unified pattern

## Verification

- All 9 enforcement triggers now use RETURN NULL + `log_illegal_attempt`
- All 10 mutation service methods use `handleGuardedUpdate()`
- Zero schema changes (tables/columns/enums)
- Zero RLS policy changes
- Zero new dependencies
- Zero workflow expansion
- Existing validation logic preserved in all 4 converted triggers
- `started_at`/`completed_at` timestamp logic preserved in task trigger
- Closed-meeting check preserved in agenda item trigger
- UX error mapping in `rls-error.ts` covers all violation patterns

## Governance Declaration

- **Fully Implemented:** Part A (4 trigger conversions), Part B (6 service method conversions), Part D (documentation)
- **Partially Implemented:** Part C (negative tests documented as expected behavior; manual verification required via UI)
- **Skipped:** None
- **Deferred:** None
- **Out-of-Scope:** Automated test infrastructure, new UI components
- **Known Risks:** None — enforcement behavior preserved, only error delivery mechanism changed
