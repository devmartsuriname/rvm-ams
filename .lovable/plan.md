

# Plan: Increase Logo Size by 2 Steps

## Current → New Values

| Element | Current | New |
|---|---|---|
| **Container height** | 26px | 36px |
| **Icon (expanded)** | 24px | 30px |
| **Title "RVM Flow"** | 16px | 20px |
| **Tagline** | 9px | 12px |
| **Gap** | 8px | 10px |
| **Icon (collapsed)** | 22px | 26px |

## Files Modified

### 1. `src/components/wrapper/LogoBox.tsx`
- `LogoLgContent`: height 26→36, icon 24→30, gap 8→10, title 16→20, tagline 9→12
- `LogoSmContent`: icon fontSize 22→26

### 2. `src/app/(other)/auth/sign-in/components/SignIn.tsx`
- `AuthLogo`: Same scaling (height 28→38, icon 24→30, gap 8→10, title 16→20, tagline 9→12)

**0 CSS changes, 0 structural changes — internal scaling only**

