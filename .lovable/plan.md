# Document Refactor Plan: Darkone-Inspired User Manuals (EN + NL)

---

## TASK 1 — Document Design System

### Typography


| Element          | Font      | Size (pt) | Weight | Color                | Notes                                                              |
| ---------------- | --------- | --------- | ------ | -------------------- | ------------------------------------------------------------------ |
| Document Title   | Play      | 28        | 700    | `#21252e`            | Cover page only                                                    |
| H1 (Section)     | Play      | 20        | 700    | `#21252e`            | Purple left border accent (3pt line)                               |
| H2 (Subsection)  | Play      | 14        | 700    | `#424e5a` (gray-700) | &nbsp;                                                             |
| H3 (Sub-sub)     | Play      | 12        | 700    | `#424e5a`            | &nbsp;                                                             |
| Body text        | Helvetica | 10.5      | 400    | `#21252e`            | Print-safe serif-alternative; Play is less readable at small sizes |
| Muted / captions | Helvetica | 9         | 400    | `#8486a7`            | Footnotes, dates, version info                                     |
| Code / routes    | Courier   | 10        | 400    | `#424e5a`            | Route paths, button labels in monospace                            |


**Rationale**: Play (display font) for headings maintains Darkone identity. Helvetica for body ensures print readability — Play at 10pt is hard to read in dense paragraphs.

### Color System


| Token              | Hex                  | Usage                                                       |
| ------------------ | -------------------- | ----------------------------------------------------------- |
| Primary            | `#7e67fe`            | Accent lines, table headers, callout borders, cover accents |
| Primary-light      | `#E8E4FE`            | Table header fill (10% tint), callout backgrounds           |
| Dark text          | `#21252e`            | All headings, body text                                     |
| Secondary text     | `#424e5a`            | H2/H3, secondary labels                                     |
| Muted              | `#8486a7`            | Captions, footer text, dates                                |
| Table border       | `#d8dfe7` (gray-300) | All table borders                                           |
| Background         | `#ffffff`            | All content pages — white only                              |
| Callout tip bg     | `#f8f9fa` (gray-100) | Tip/note callout blocks                                     |
| Callout warning bg | `#FFF3E0`            | Warning blocks (light orange, print-safe)                   |


**Grayscale test**: Primary purple prints as medium gray — distinct from dark text and light backgrounds. All elements remain distinguishable.

### Layout Rules (A4: 210mm × 297mm)


| Property                   | Value                        |
| -------------------------- | ---------------------------- |
| Top margin                 | 25mm                         |
| Bottom margin              | 25mm                         |
| Left margin                | 25mm                         |
| Right margin               | 20mm                         |
| Section spacing (after H1) | 12pt                         |
| Paragraph spacing          | 6pt after                    |
| Line spacing               | 1.3×                         |
| Table cell padding         | 4pt vertical, 6pt horizontal |


### Table Styling

- Header row: `#E8E4FE` fill (primary-light), Play 10pt bold, `#21252e` text
- Body rows: white background, Helvetica 10pt
- Alternating rows: `#f8f9fa` (gray-100) every other row
- Borders: `#d8dfe7` (gray-300), 0.5pt
- No heavy borders, no dark fills

### Callout Blocks

```text
┌─────────────────────────────────────────┐
│ 3pt purple   TIP                        │
│ left border  Body text in normal font   │
│              on #f8f9fa background      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 3pt orange   IMPORTANT                  │
│ left border  Body text in normal font   │
│              on #FFF3E0 background      │
└─────────────────────────────────────────┘
```

---

## TASK 2 — Cover Page Design

### Layout (both EN and NL identical structure)

```text
┌──────────────────────────────────────────┐
│                                          │
│              (60mm from top)             │
│                                          │
│         ◆  RVM Flow                      │
│            Management System             │
│                                          │
│     ─────── purple line (80mm) ───────   │
│                                          │
│         User Manual                      │  ← EN
│         Gebruikershandleiding            │  ← NL
│                                          │
│         Council of Ministers             │
│         Agenda Management System         │
│                                          │
│                                          │
│                                          │
│                                          │
│                                          │
│     ─────── thin gray line ───────────   │
│         Version 1.0                      │
│         March 2026                       │
│                                          │
└──────────────────────────────────────────┘
```

**Specifics**:

- Logo: Grid icon (drawn as purple square/dots) + "RVM Flow" in Play 28pt bold + "Management System" in Play 14pt muted — centered
- Purple horizontal rule: 3pt, `#7e67fe`, 80mm wide, centered
- Subtitle ("User Manual"): Play 22pt, `#21252e`
- Organization line: Helvetica 12pt, `#8486a7`
- Version block at bottom: Helvetica 10pt, `#8486a7`, separated by thin gray line
- Background: pure white, no gradients, no dark panels
- **NL variant**: "Gebruikershandleiding" replaces "User Manual"; "Raad van Ministers — Agendabeheersysteem" replaces organization line

---

## TASK 3 — Internal Page Styling

### Header (every page except cover)

```text
◆ RVM Flow — Management System              Page X
───────────────────────────────────────────────────
```

- Left: Small grid icon (6pt) + "RVM Flow — Management System" in Play 8pt, `#8486a7`
- Right: Page number in Helvetica 8pt, `#8486a7`
- Below: 0.5pt line in `#d8dfe7`
- Height: ~10mm total

### Footer (every page except cover)

```text
───────────────────────────────────────────────────
RVM-AMS v1.0                    Confidential
```

- 0.5pt line in `#d8dfe7`
- Left: "RVM-AMS v1.0" in Helvetica 8pt, `#8486a7`
- Right: "Confidential" (or "Vertrouwelijk" for NL) in Helvetica 8pt, `#8486a7`

### Section Separators

- H1 sections: 3pt purple left border + purple text accent — full-width block
- Between major sections: 18pt vertical space (no horizontal rules)
- H2: 6pt space before, standard weight

### Table Templates

**Role Matrix Table**: Purple header, 5 columns (Role | Can Do | Cannot Do | Screens | Responsibility)

**Workflow Steps Table**: Numbered column (purple circle numbers), Action, Location, Result

**Screen Guide Table**: Route column in monospace, Description, Available Actions

---

## TASK 4 — Logo Usage Rules


| Context             | Size                       | Placement               | Version                             |
| ------------------- | -------------------------- | ----------------------- | ----------------------------------- |
| Cover page          | Icon 14pt + Text 28pt/14pt | Centered, 60mm from top | Full color (purple icon, dark text) |
| Page header         | Icon 6pt + Text 8pt inline | Left-aligned            | Muted (`#8486a7` text, purple icon) |
| No other placements | —                          | —                       | —                                   |


- Icon is always `#7e67fe` (even in print — prints as medium gray, distinguishable)
- Logo text in headers uses muted color to avoid competing with content
- No watermarks, no background logos

---

## TASK 5 — Output Structure

### English Manual

1. Cover Page
2. Table of Contents
3. Section 1 — System Overview
4. Section 2 — Logging In
5. Section 3 — Your Role (role matrix table)
6. Section 4 — The Meeting Workflow (numbered steps with outcomes)
7. Section 5 — Screen-by-Screen Guide
8. Section 6 — Common Tasks (4 mini-guides)
9. Section 7 — Rules You Should Know
10. Section 8 — Quick Test Checklist

### Dutch Manual

1. Omslagpagina
2. Inhoudsopgave
3. Sectie 1 — Systeemoverzicht
4. Sectie 2 — Inloggen
5. Sectie 3 — Uw Rol
6. Sectie 4 — Het Vergaderworkflow
7. Sectie 5 — Scherm-voor-Scherm Gids
8. Sectie 6 — Veelvoorkomende Taken
9. Sectie 7 — Regels die u Moet Weten
10. Sectie 8 — Snelle Testchecklist

Both manuals: identical structure, identical styling, only language differs.

---

## TASK 6 — Validation Checklist


| Check               | Rule                                            |
| ------------------- | ----------------------------------------------- |
| Print-safe (A4)     | 25/25/25/20mm margins, 10.5pt body              |
| Grayscale readable  | Purple → medium gray, all text dark enough      |
| No dark backgrounds | White only for all content pages                |
| No UI components    | No Bootstrap, no cards, no shadows              |
| EN/NL consistency   | Same page count target, same layout per section |
| Font fallback       | Helvetica → Arial for body if needed            |
| Cover professional  | No gradients, no stock images, minimal accent   |


---

## Before → After Summary


| Aspect          | Before (current PDFs)           | After (refactored)                                          |
| --------------- | ------------------------------- | ----------------------------------------------------------- |
| Cover           | Plain reportlab default         | Branded cover with logo, purple accent line, version block  |
| Headers/Footers | Basic or none                   | Consistent branded header + footer on every page            |
| Typography      | Single font, inconsistent sizes | Play headings + Helvetica body, strict size hierarchy       |
| Tables          | Basic styling                   | Purple-tinted headers, alternating rows, consistent borders |
| Color usage     | Minimal                         | Systematic use of Darkone tokens (primary, muted, gray-300) |
| Callouts        | None                            | Tip and Warning blocks with colored left borders            |
| Structure       | Linear text                     | Table of Contents, clear section numbering                  |
| Branding        | None                            | Logo on cover + headers, "Confidential" footer              |


---

**NOTE — Execution Constraints (CRITICAL)**

- This document will be used in a LIVE RVM meeting tomorrow

- PRIORITY = clarity and reliability over visual perfection

Add the following safeguards:

1. Generate a SIMPLE fallback version (no styling, plain layout)

   → Same content, minimal formatting

2. Ensure PDF size < 5MB

3. Validate:

   - Opens fast on standard laptops

   - Prints correctly (no cut margins)

   - No layout overflow (tables, text wrapping)

4. If any rendering issue occurs:

   → STOP styled version

   → Deliver fallback version immediately

Do NOT delay delivery for design perfection.  
  
**Implementation**

- Python script using reportlab Platypus
- Custom page templates for cover vs content pages
- Logo drawn programmatically (purple rectangle/dots + Play text) — no image dependency
- Same script generates both EN and NL with language parameter
- QA via pdftoppm visual inspection
- Output: `/mnt/documents/RVM-AMS_User_Manual.pdf` and `/mnt/documents/RVM-AMS_Gebruikershandleiding.pdf` (replace existing)