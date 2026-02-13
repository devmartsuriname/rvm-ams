# Restore Point: RP-P2D-auth-redirect-pre.md

**Date:** 2026-02-13  
**Commit Hash:** Not recorded (AI-applied changes)  
**Phase:** Phase 2D (Auth Redirect Fix Gate)

## Problem Summary

1. **Login Redirect Stall:**
   - User successfully authenticates in Supabase Auth.
   - `handleAuthChange` is called but redirect does not happen reliably.
   - Root cause: `hasInitializedRef` guard in `useAuthContext.tsx` prevented auth listener from re-initializing after React 18 StrictMode's mount-unmount-remount cycle.

2. **Double Spinner During Boot:**
   - Multiple `<Suspense>` fallbacks with `<LoadingFallback />` in `router.tsx` and `AdminLayout.tsx`.
   - Stacked/sequential spinners visible during initial auth resolution.

## Reproduction Steps

1. Open `/auth/sign-in?redirectTo=%2Fdashboards` in a new incognito window.
2. Enter valid credentials and submit.
3. **Expected:** Redirect to `/dashboards` within 2 seconds.
4. **Actual:** Page stays on sign-in or shows loading spinner indefinitely.

## Current Implementation State

**File: `src/context/useAuthContext.tsx`**
- Status: **FIXED (previous edit)**
  - `hasInitializedRef` ref removed (line 96 in old version)
  - `isProcessingRef.current = false` added at start of `useEffect` (line 145)
  - Auth listener now re-initializes correctly on every mount

**File: `src/routes/router.tsx`**
- Status: **NOT YET FIXED**
  - Line 18: `<Suspense fallback={<LoadingFallback />}>`
  - Line 35–36: Redundant `isLoading ? <LoadingFallback />` per protected route
  - Line 55–56: Redundant `isLoading ? <LoadingFallback />` in catch-all route
  - No route-aware loading gate; auth routes can be blocked during loading

## Known Governance

- **Bootstrap/react-bootstrap:** Part of Darkone baseline (5.3.3 / 2.10.10)
- **Routes:** RVM-only allowlist active (Phase 2C complete)
- **Supabase Auth:** "Leaked Password Protection" enabled (Task 4 complete)

## Test URLs (to be validated in Step 4)

- Preview: `https://id-preview--05409e90-adea-494b-a980-374b142fbf8b.lovable.app/auth/sign-in?redirectTo=%2Fdashboards`
- Live: `https://rvmams.lovable.app/auth/sign-in?redirectTo=%2Fdashboards`

## Files to be Modified

1. `src/routes/router.tsx` — Consolidate loading gate and implement route-aware logic
2. `Project Restore Points/RP-P2D-auth-redirect-post.md` — Document results
3. `docs/backend.md` (if exists) — Update auth flow documentation
4. `docs/architecture.md` (if exists) — Update architecture notes

---

**Next Step:** Step 1 verification → Step 2 router fix → Step 3 governance check → Step 4 runtime tests → Step 5 post restore point
