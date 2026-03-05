# Restore Point: RP-P14-decision-reports-pre

**Phase:** 14 — Decision List & Report Generation
**Created:** 2026-03-05
**Type:** PRE-implementation

## System State

- Phase 16 CLOSED (RETURN NULL Pattern Unification)
- All 9 enforcement triggers use unified RETURN NULL + log_illegal_attempt pattern
- All 10 mutation service methods use handleGuardedUpdate()
- Global decision list exists at /rvm/decisions (basic columns)
- Meeting detail page has Decisions tab
- decisionService.ts has fetchAllDecisions() and fetchDecisionsByMeeting()
- Print CSS exists in _print.scss (hides sidebar/topbar/footer)

## Files to be Modified

- src/services/decisionService.ts — Expand fetchAllDecisions() query
- src/app/(admin)/rvm/decisions/page.tsx — Enhanced columns, sorting, filters, print
- src/app/(admin)/rvm/meetings/[id]/page.tsx — Print button in Decisions tab
- src/assets/scss/components/_print.scss — Report print styles

## Files to be Created

- src/components/rvm/DecisionReport.tsx — Printable report component

## Governance

- Zero schema changes
- Zero RLS changes
- Zero new routes
- Zero sidebar changes
- Zero new dependencies
