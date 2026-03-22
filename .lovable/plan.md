# Plan: Generate RVM-AMS User Manual (PDF, Non-Technical)

## What

Generate a user-friendly PDF manual for RVM-AMS at `/mnt/documents/RVM-AMS_User_Manual.pdf`. Written for non-technical RVM team members using simple instructional language ("Go to…", "Click…", "Select…").

## Content (8 sections, derived from codebase analysis already completed)

1. **System Overview** — What the system is, what it helps you do (2 paragraphs)
2. **Logging In** — Step-by-step with test accounts table
3. **Your Role** — What each role can/cannot do, written as bullet lists
4. **The Meeting Workflow** — Full narrative from Secretary creating a meeting through Chair finalizing decisions (numbered steps with "Go to…", "Click…" instructions)
5. **Screen-by-Screen Guide** — Each page explained: what you see, what you can do
6. **Common Tasks** — 4 how-to mini-guides (create meeting, approve decision, assign task, check audit)
7. **Rules You Should Know** — Governance rules in plain language
8. **Quick Test Checklist** — 10-step numbered checklist for live demo

## Implementation

- Python script using `reportlab` Platypus
- Professional layout: headers, footers, page numbers, role color coding
- Simple language throughout — no technical jargon
- QA via `pdftoppm` visual inspection, fix any issues found
- Output: `/mnt/documents/RVM-AMS_User_Manual.pdf`

**Total: 1 PDF generated, 0 code changes**  
  
NOTE — ACTION-LEVEL CLARITY REQUIRED

For every step in workflows and tasks:

- Specify EXACT UI interaction:

  - Button names

  - Form fields

  - Tabs/pages

- Include outcome after action:

  - What should the user see?

  - What confirms success?

Example:

Instead of:

"Click create meeting"

Use:

"Click 'Create Meeting' button → a form opens → fill in title and date → click 'Save' → meeting appears in list"