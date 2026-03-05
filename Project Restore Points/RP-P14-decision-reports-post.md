# Restore Point: RP-P14-decision-reports-post

**Phase:** 14 — Decision List & Report Generation
**Created:** 2026-03-05
**Type:** POST-implementation

## Changes Implemented

### Service Layer
- `decisionService.fetchAllDecisions()` — expanded select to include `updated_at`, `chair_approved_at`, `chair_approved_by`, and joined `rvm_meeting` (meeting_date, meeting_type, status) through agenda item; also added `sender_ministry` from dossier join

### Global Decision Register (`/rvm/decisions`)
- Enhanced columns: #, Decision, Dossier, Responsible Unit (sender_ministry), Meeting (date link), Status, Final, Date
- Client-side sorting by agenda_number, meeting_date, decision_status, created_at
- Meeting filter dropdown populated from distinct meetings in data
- "Print Register" button triggers `window.print()` with DecisionReport component

### Decision Report Component (`DecisionReport.tsx`)
- Printable HTML report with:
  - Header: "RVM-AMS" + report title + generation timestamp
  - Meeting info section (if meeting-scoped): date, type, location
  - Decision table sorted by meeting_date then agenda_number (governance ordering)
  - Summary: totals by status + finalized count
  - Signature placeholders: Chair RVM + Secretary RVM with name/date lines
- forwardRef component, used in both global and meeting-scoped views

### Meeting Detail Page
- "Print Decision Report" button added to Decisions tab header
- Print-only div renders DecisionReport with meeting info context

### Print CSS
- Added `.decision-report` print styles: borders, backgrounds, font sizing, page-break rules

### Documentation
- `docs/backend.md` — Phase 14 entry added to phase table
- `docs/architecture.md` — Phase 14 completion noted

## Governance
- Zero schema changes
- Zero RLS changes
- Zero new routes
- Zero sidebar changes
- Zero new dependencies
- Zero migration files
