# Plan: Apply Variation C Logo System-Wide

## Structure Confirmed

Two logo locations found:

1. `**src/components/wrapper/LogoBox.tsx**` — Sidebar logo (used by VerticalNavigationBar)
  - `.logo-dark` / `.logo-light` links with CSS switching
  - `logo-sm` (24×24, collapsed sidebar) + `logo-lg` (114×28, expanded sidebar)
2. `**src/app/(other)/auth/sign-in/components/SignIn.tsx**` — Login page logo
  - Same `.logo-dark` / `.logo-light` CSS pattern
  - Only uses expanded size (height 28–32)

No other logo locations exist. AuthLayout has no logo.

## Changes

### 1. `src/components/wrapper/LogoBox.tsx`

Replace PNG `<img>` tags with inline Iconify-based logo components. Preserve the existing `.logo-box` > `.logo-dark` / `.logo-light` > `.logo-sm` / `.logo-lg` class structure exactly.

- `logo-sm`: 24×24 div with `solar:widget-line-duotone` icon in `#7e67fe`
- `logo-lg`: 114×28 div with icon + "RVM Flow" (Play 700, 11px) + "Management System" (Play 400, 6.5px)
- `.logo-dark` variant: text `#21252e`, muted `#8486a7`
- `.logo-light` variant: text `#ffffff`, muted `#8486a7`
- Remove PNG imports (no longer needed)

### 2. `src/app/(other)/auth/sign-in/components/SignIn.tsx`

Replace PNG `<img>` tags with the same Iconify-based logo component (expanded size only).

- `.logo-dark`: text `#21252e`
- `.logo-light`: text `#ffffff`
- Remove PNG imports

### 3. No other files touched

- No structure changes
- No wrapper additions
- No CSS modifications
- Preview page (`logo-preview/page.tsx`) left as-is (excluded per instructions)

  
**NOTE — Visual Alignment Validation (MANDATORY)**

After replacing PNG with Iconify-based logo:

1. Verify visual alignment EXACTLY matches previous PNG:

   - Icon and text baseline alignment

   - Vertical centering within logo-lg (114x28)

   - Perfect centering in logo-sm (24x24)

2. Spacing rule:

   - Icon → Title spacing must visually match previous implementation

   - If mismatch detected → adjust using EXISTING utility classes ONLY (no new CSS)

3. Typography validation:

   - "RVM Flow" must render as Play 700

   - "Management System" as Play 400

   - No fallback font visible

4. Pixel check (critical):

   - Compare before/after visually

   - No shift allowed in:

     - Sidebar expanded

     - Sidebar collapsed

     - Login page

If any visual deviation occurs:

→ STOP and report

Goal: indistinguishable from original layout, only icon changed.  
  
  
**Validation**


| Check                     | Method                                           |
| ------------------------- | ------------------------------------------------ |
| Sidebar expanded (114×28) | Preserves `.logo-lg` class                       |
| Sidebar collapsed (24×24) | Preserves `.logo-sm` class                       |
| Dark/light switching      | Preserves `.logo-dark` / `.logo-light` CSS rules |
| Login page                | Same component pattern                           |
| No layout shift           | Same dimensions, no new wrappers                 |
| Darkone compliance        | Only authorized icon, colors, font               |


**Total: 2 files modified, 0 files created, 0 CSS changes**