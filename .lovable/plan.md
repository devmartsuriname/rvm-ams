

# Plan: Generate Dutch Version of RVM-AMS User Manual

## What
Create a Dutch translation of the existing RVM-AMS User Manual PDF at `/mnt/documents/RVM-AMS_Gebruikershandleiding.pdf`.

## Approach
- Translate all 8 sections to Dutch using the same structure and layout
- Keep technical terms (route names, button labels) as they appear in the UI
- Use the same reportlab Platypus layout, styling, and color coding
- Same professional formatting: headers, footers, page numbers, role colors

## Content Translation Map

| English Section | Dutch Section |
|---|---|
| System Overview | Systeemoverzicht |
| Logging In | Inloggen |
| Your Role | Uw Rol |
| The Meeting Workflow | Het Vergaderworkflow |
| Screen-by-Screen Guide | Scherm-voor-Scherm Gids |
| Common Tasks | Veelvoorkomende Taken |
| Rules You Should Know | Regels die u Moet Weten |
| Quick Test Checklist | Snelle Testchecklist |

## Output
- `/mnt/documents/RVM-AMS_Gebruikershandleiding.pdf`
- QA via `pdftoppm` visual inspection
- **0 code changes**

