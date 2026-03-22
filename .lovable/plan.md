# Plan: Fix Domain + Improve Vertical Spacing (EN + NL Manuals)

## Changes to `/tmp/gen_manuals.py`

### 1. Domain Fix

Replace all instances of `https://rvmams.lovable.app` with `https://rvmflow.com` (found on lines 304 and 517).

### 2. Spacing Adjustments (styles only, no content changes)

Update `make_styles()` function:


| Style    | Property      | Current | New           |
| -------- | ------------- | ------- | ------------- |
| `h1`     | `spaceAfter`  | 12      | 18            |
| `h2`     | `spaceBefore` | 12      | 14            |
| `body`   | `spaceAfter`  | 6       | 6 (no change) |
| `bullet` | `spaceAfter`  | 3       | 4             |


Update `make_callout()` helper:

- Add `Spacer(1, 10)` before and after callout blocks — applied at call sites or wrapped in a helper
- Increase internal padding: `TOPPADDING` and `BOTTOMPADDING` from 8 to 10

Update `make_table()` helper:

- Not directly (table spacing is controlled at call sites); instead add spacers before/after tables

Add spacing around tables and callouts at the content-building level:

- Insert `Spacer(1, 10)` before and after every `make_table()` call
- Insert `Spacer(1, 10)` before and after every `make_callout()` call
- Ensure minimum 18pt between major sections (already handled by H1 `spaceBefore=18` + new `spaceAfter=18`)

### 3. Regenerate Both PDFs

Run the updated script to produce:

- `/mnt/documents/RVM-AMS_User_Manual.pdf`
- `/mnt/documents/RVM-AMS_Gebruikershandleiding.pdf`

### 4. QA

Visual inspection via `pdftoppm` — verify:

- No `lovable.app` references remain
- Improved vertical breathing between sections
- No table overflow or layout breaks

**Total: 0 code changes, 2 PDFs regenerated**  
  
**NOTE — COVER DESIGN REQUIREMENT (MISSING)**

Add logo to the cover page with strict layout rules:

1. Logo placement:

   - Centered horizontally

   - Positioned ABOVE the title block

2. Logo size:

   - Same visual scale as in app (approx 114x28 ratio)

   - Not oversized — must feel balanced with title

3. Spacing:

   - 20pt space between logo and title

   - Maintain clear visual hierarchy

4. Order (top → bottom):

   - Logo

   - Title: "RVM Flow"

   - Tagline: "Management System"

   - Subtitle: Council of Ministers / Raad van Ministers

   - Version + Date

5. Alignment:

   - Entire cover is CENTER aligned

6. Constraints:

   - Do NOT break page layout

   - Do NOT push content to next page

   - Must remain print-safe

Apply to BOTH:

- EN manual

- NL manual