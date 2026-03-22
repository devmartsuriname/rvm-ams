

# Plan: Fix Logo Visual Size to Match Darkone Demo

## Problem
Current logo renders too small inside containers. Comparing screenshots:
- **Darkone demo**: Icon ~26px, title ~18px, tagline ~10px — fills the logo area with strong visual weight
- **Current RVM Flow**: Icon 18px, title 11px, tagline 6.5px — appears thin and undersized

## Changes (internal scaling only, no container changes)

### 1. `src/components/wrapper/LogoBox.tsx`

**LogoLgContent** (inside 26px height container):
- Icon: `fontSize: 18` → `fontSize: 24`
- Gap: `6` → `8`
- Title "RVM Flow": `fontSize: 11` → `fontSize: 16`, keep `fontWeight: 700`
- Tagline "Management System": `fontSize: 6.5` → `fontSize: 9`

**LogoSmContent** (inside 24×24 container):
- Icon: `fontSize: 18` → `fontSize: 22`

### 2. `src/app/(other)/auth/sign-in/components/SignIn.tsx`

**AuthLogo** (inside 28px height container):
- Same scaling: icon 24px, gap 8, title 16px, tagline 9px

### Files touched
| File | Change |
|---|---|
| `src/components/wrapper/LogoBox.tsx` | Icon/text size increase, gap adjustment |
| `src/app/(other)/auth/sign-in/components/SignIn.tsx` | Same scaling applied |

**0 container changes, 0 CSS changes, 0 structural changes**

