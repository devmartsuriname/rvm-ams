# Plan: Generate RVM Flow Logo Variations (Darkone-Compliant)

## Analysis Summary

### Darkone Design Tokens (from codebase)

- **Font**: "Play", sans-serif (Google Fonts, weights 400 & 700)
- **Primary color**: `#7e67fe` (purple)
- **Gray-500 (muted)**: `#8486a7`
- **Gray-900 (dark text)**: `#21252e`
- **White**: `#ffffff`
- **Logo-lg height**: 26px CSS
- **Logo-sm height**: 24px CSS
- **Logo-lg img dimensions**: 114×28px (from LogoBox.tsx)
- **Logo-sm img dimensions**: 24×24px (from LogoBox.tsx)
- **Icon libraries**: Iconify — `solar:*`, `mingcute:*`, `bx:*`

### Current LogoBox Structure

- `.logo-box` contains `.logo-dark` and `.logo-light` links
- Each has a `logo-sm` (collapsed sidebar, 24×24) and `logo-lg` (expanded sidebar, 114×28)
- Dark/light variants swap via CSS display rules

---

## 3 Logo Variations

All variations share:

- Layout: icon LEFT, "RVM Flow" title RIGHT, "Management System" tagline below title
- Font: Play (700 for title, 400 for tagline)
- Dimensions: logo-lg = 114×28px, logo-sm = 24×24px (icon only)
- Dark mode: light text on dark bg; Light mode: dark text on light bg

### Variation A — "Flow Node" (mingcute:flow-line)

- **Icon**: `mingcute:flow-line` — represents workflow/flow
- **Icon color**: Primary purple `#7e67fe`
- **Title color**: Dark `#21252e` (light mode) / White (dark mode)
- **Tagline color**: Muted `#8486a7`
- **Style**: Clean, minimal — icon and text baseline-aligned

### Variation B — "Shield Governance" (bx:shield-quarter)

- **Icon**: `bx:shield-quarter` — represents governance/authority (already used for Audit)
- **Icon color**: Primary purple `#7e67fe`
- **Title color**: Dark `#21252e` / White
- **Tagline color**: Muted `#8486a7`
- **Style**: Authoritative, institutional feel

### Variation C — "Grid System" (solar:widget-line-duotone)

- **Icon**: `solar:widget-line-duotone` — represents system/dashboard
- **Icon color**: Primary purple `#7e67fe`
- **Title color**: Dark `#21252e` / White
- **Tagline color**: Muted `#8486a7`
- **Style**: Modern, system-oriented

---

**NOTE — Integration Constraint (MANDATORY)**

Before rendering the logo variations:

1. Inspect existing LogoBox.tsx component

2. Confirm:

   - Alignment behavior (flex, baseline, spacing)

   - Collapsed vs expanded sidebar rendering

   - logo-sm vs logo-lg switching logic

   - dark/light variant handling

3. Ensure ALL variations:

   - Fit EXACTLY inside LogoBox without layout shift

   - Do NOT introduce new wrappers or structure changes

   - Respect existing classNames and spacing

4. Validate preview in:

   - Expanded sidebar

   - Collapsed sidebar

   - Dark mode

   - Light mode

If any variation breaks layout:

→ discard it

This is a UI-bound component, not a standalone design.  
  
  
**Implementation Approach**

1. Create a preview page component (temporary) that renders all 3 variations side-by-side
2. Each variation rendered as an inline React component using:
  - `IconifyIcon` wrapper (authorized icon component)
  - Play font (already loaded globally)
  - Darkone color tokens as inline styles
  - Exact 114×28 bounding box for logo-lg, 24×24 for logo-sm
3. Show both light and dark mode variants for each
4. No changes to existing LogoBox or any production files

## Validation Checklist

- Icons: All from authorized Iconify sets (mingcute, bx, solar)
- Colors: Only Darkone tokens (#7e67fe, #21252e, #8486a7, #ffffff)
- Font: Play (already loaded)
- Dimensions: 114×28px (lg), 24×24px (sm) — matches LogoBox exactly
- Dark/light: Both variants provided
- No custom styles outside system tokens

## Output

- Temporary preview component at a test route
- 3 variations displayed for review
- **No production files modified**