# Restore Point: RP-P16-return-null-ux-pre

**Created:** 2026-03-05
**Phase:** 16 — RETURN NULL Pattern Unification + UX Exception Handling
**Type:** Pre-implementation

## State Summary

4 enforcement triggers still use RAISE EXCEPTION pattern (meeting, task, agenda_item status transitions + dossier immutability). 6 service layer methods use `.single()` instead of `handleGuardedUpdate`. Phase 13 is FULLY IMPLEMENTED.

## Files to be Modified

- `src/services/meetingService.ts` — 2 methods (updateMeeting, updateMeetingStatus)
- `src/services/taskService.ts` — 2 methods (updateTask, updateTaskStatus)
- `src/services/agendaItemService.ts` — 2 methods (updateAgendaItem, withdrawAgendaItem)
- `docs/backend.md` — Phase 16 section
- `docs/architecture.md` — Phase 16 section

## Database Migrations

4 trigger function replacements:
1. `enforce_meeting_status_transition` — RAISE EXCEPTION → RETURN NULL + log
2. `enforce_task_status_transition` — RAISE EXCEPTION → RETURN NULL + log
3. `enforce_agenda_item_status_transition` — RAISE EXCEPTION → RETURN NULL + log
4. `enforce_dossier_immutability` — RAISE EXCEPTION → RETURN NULL + log

## Governance Constraints

- No schema changes (tables/columns/enums)
- No RLS policy changes
- No new tables
- No new dependencies
- No workflow expansion
- Trigger logic preserved — only error delivery mechanism changes
