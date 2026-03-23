# Plan: Full Rebuild of User Manuals — Ministerial Document Standards (EN + NL)

## Approach

Write a complete new Python script (`/tmp/gen_manuals_v4.py`) using ReportLab Platypus that generates both manuals from scratch with strict formatting. The script will be self-contained with all content embedded, no external dependencies beyond ReportLab.

## Document Design System

### Typography


| Element                | Font      | Size   | Weight | Color                           |
| ---------------------- | --------- | ------ | ------ | ------------------------------- |
| Document Title (cover) | Play      | 28pt   | Bold   | #21252e                         |
| H1 (Section)           | Play      | 18pt   | Bold   | #21252e, 3pt purple left border |
| H2 (Subsection)        | Play      | 13pt   | Bold   | #424e5a                         |
| H3 (Sub-sub)           | Play      | 11pt   | Bold   | #424e5a                         |
| Body                   | Helvetica | 10.5pt | Normal | #21252e                         |
| Muted/captions         | Helvetica | 9pt    | Normal | #8486a7                         |
| Code/routes            | Courier   | 9.5pt  | Normal | #424e5a                         |


### Spacing System (strict)

- After H1: 18pt
- After H2: 10pt
- After body paragraph: 6pt
- Before/after tables: 12pt
- Before/after callout blocks: 10pt, internal padding 10pt
- Between major sections: 24pt minimum

### Colors

- Primary accent: #7e67fe (headings borders, table headers)
- Primary-light: #E8E4FE (table header fill)
- Dark text: #21252e
- Secondary text: #424e5a
- Muted: #8486a7
- Table borders: #d8dfe7
- Tip callout: #f8f9fa bg, #7e67fe left border
- Important callout: #FFF3E0 bg, #E65100 left border

## Document Structure (both EN + NL, identical)

### Cover Page

- Logo (programmatic: purple grid icon + "RVM Flow" in Play)
- Title + subtitle
- Organization line
- Version/date block
- Purple horizontal rule accent

### Content Pages

**Section 1 — System Overview**

- Short intro (3 lines max)
- What the system does
- Domain: [https://rvmflow.com](https://rvmflow.com)

**Section 2 — Logging In**

- Step-by-step login instructions
- Test accounts table (5 rows, fixed columns: Email | Password | Role | Capabilities)
- All @rvm.local, TestSeed2026!

**Section 3 — Your Role**

- Role matrix table with 6 rows (including admin_intake as distinct row)
- Explicit dual-role note for member1 (admin_intake + admin_dossier)
- Columns: Role | Can Do | Cannot Do | Screens
- IMPORTANT callout: "[member1@rvm.local](mailto:member1@rvm.local) has TWO roles..."

**Section 4 — The Meeting Workflow**

- 10 numbered steps, each with:
  - Step number (bold)
  - Action description
  - Location (route in monospace)
  - Expected result
- NOT a compressed table — each step is a styled block
- Lifecycle callout: Draft → Published → Closed

**Section 5 — Screen-by-Screen Guide**

- Table: Route | Screen Name | Available Actions
- 8 screens (Dashboard, Dossiers, Dossier Detail, Meetings, Meeting Detail, Decisions, Tasks, Audit Log, Search)

**Section 6 — Common Tasks**

- 6.1 Create a Dossier
  - Steps + IMPORTANT callout (Proposal requires OPA/ORAG subtype)
- 6.2 Create a Meeting
  - Steps
- 6.3 Add Agenda Item
  - Steps + TIP callout (only Registered/In Preparation dossiers eligible)
- 6.4 Manage Tasks

**Section 7 — Rules You Should Know**

- Governance enforcement statements
- RLS enforcement
- Decision immutability
- Audit logging
- Styled as a governance block with purple border

**Section 8 — System Governance Enforcement** (NEW dedicated section)

- RLS enforces all permissions at database level
- UI does not override backend rules
- All state transitions logged immutably
- Decisions immutable after Chair approval
- IMPORTANT callout block

**Section 9 — Quick Test Checklist**

- 10-item numbered checklist table

### Headers & Footers

- Header: Small logo + "RVM Flow — Management System" (left), page number (right), thin gray line below
- Footer: Thin gray line, "RVM-AMS v1.0" (left), "Confidential" / "Vertrouwelijk" (right)

## Table Design (standardized)

- Fixed column widths (calculated per table, never auto)
- Header: #E8E4FE fill, Play 9.5pt bold
- Body: Helvetica 9.5pt, alternating #f8f9fa rows
- Borders: 0.5pt #d8dfe7
- Cell padding: 6pt horizontal, 4pt vertical
- Word-wrap enabled (no overflow)

## Callout Block Design

```text
┌─────────────────────────────────────────┐
│ 3pt left   IMPORTANT                    │
│ border     Body text, 10pt padding      │
│ #E65100    on #FFF3E0 background        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 3pt left   TIP                          │
│ border     Body text, 10pt padding      │
│ #7e67fe    on #f8f9fa background        │
└─────────────────────────────────────────┘
```

## Content Sources (authoritative)


| Data          | Source                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| Roles         | rls_role_matrix_ams_rvm_core_v_1.md (9 roles defined; 5 in test accounts) |
| Workflows     | workflow_diagrams_ams_rvm_core_v_1.md (7 workflows)                       |
| Test accounts | Phase-20/21 seed data (@rvm.local, TestSeed2026!)                         |
| Routes        | src/routes/index.tsx (8 screens)                                          |
| Domain        | [https://rvmflow.com](https://rvmflow.com)                                |


## Language Handling

Single script with `lang` parameter. All content stored in EN/NL dictionaries. Structure, formatting, table widths, spacing are identical — only text differs.  
  
**NOTE — Mandatory Visual QA Gate (BLOCKING)**

Before finalizing PDFs, enforce a visual QA checkpoint:

1. Generate preview images using pdftoppm for:

   - Cover page

   - Roles table page

   - Workflow section

   - One table-heavy page

2. Validate:

   - No text overflow

   - No broken table wrapping

   - Consistent spacing between sections

   - Callout blocks render correctly

   - EN/NL documents visually identical in structure

3. If ANY issue found:

   - Fix in script

   - Regenerate PDFs

   - Repeat QA

4. Only finalize when:

   → Document is visually comparable to a government-issued manual

This QA step is MANDATORY and cannot be skipped.

## Implementation

1. Write complete `/tmp/gen_manuals_v4.py` (~600-800 lines)
2. Register Play font (download TTF or use built-in fallback)
3. Generate EN PDF → `/mnt/documents/RVM-AMS_User_Manual.pdf`
4. Generate NL PDF → `/mnt/documents/RVM-AMS_Gebruikershandleiding.pdf`
5. QA: `pdftoppm` → visual inspection of cover + 3 content pages per manual
6. Fix any issues found
7. Final verification: no lovable.app references, no testpass123, tables aligned

**Total: 0 application code changes. 2 PDFs regenerated from clean structure.**