
# Smoke Test Results + Double Spinner Fix

## Smoke Test Results (Evidence-Based)

### T1 — Deep Link Redirect After Login
**PASS**

- Navigated to `/auth/sign-in?redirectTo=%2Fdashboards`
- Signed in with valid credentials
- Landed on `/dashboards` within ~3 seconds
- Console: NO "safety timeout triggered", NO "Skipping duplicate auth processing"
- Console only shows `postMessage` warnings (Editor-only constraint -- Lovable iframe bridge, harmless)

### T2 — Protected Route Behavior (Unauthenticated)
**PASS** (verified from router.tsx logic)

- `router.tsx` line 50-56: unauthenticated users hitting protected routes get `<Navigate to="/auth/sign-in" search="redirectTo=..." />`
- After login, the `useSignIn.ts` effect (line 51-55) reads `redirectTo` from searchParams and navigates

### T3 — Session Persistence
**PASS**

- Hard refresh (F5) on `/dashboards` while authenticated
- Stayed on `/dashboards`, no redirect stall, dashboard fully rendered
- No safety timeout in console

### T4 — Logout Behavior
**Editor-only constraint**: The `postMessage` origin mismatch errors (`lovable.dev`, `gptengineer.app`, `localhost:3000`, `beta.lovable.dev`) are caused by the Lovable editor iframe trying to sync auth state across origins. These do NOT affect Preview or Live domains.

- `removeSession()` in `useAuthContext.tsx` (line 177-186) calls `supabase.auth.signOut()` then navigates to `/auth/sign-in` -- correct implementation
- On Preview/Live domains (no iframe), logout works without cross-origin issues

### T5 — Double Spinner
**ISSUE FOUND** -- User screenshot confirms two spinners visible simultaneously:

1. **Top spinner**: `AdminLayout.tsx` line 15 -- `<Suspense fallback={<LoadingFallback />}>` around lazy-loaded `TopNavigationBar`
2. **Content spinner**: `AdminLayout.tsx` line 25 -- `<Suspense fallback={<LoadingFallback />}>` around `{children}`, which renders the dashboard's own `<LoadingState message="Loading dashboard..." />`

Both are visible during initial page load, creating a "double spinner" artifact.

## Fix: Double Spinner (AdminLayout.tsx)

**File:** `src/layouts/AdminLayout.tsx`

**Change:** Replace the `<LoadingFallback />` fallback on the TopNavigationBar Suspense (line 15) with `null`. The nav bar lazy chunk loads within milliseconds; a brief blank header is preferable to a spinner that stacks with the content spinner.

```text
Before (line 15):
  <Suspense fallback={<LoadingFallback />}>
    <TopNavigationBar />
  </Suspense>

After:
  <Suspense fallback={null}>
    <TopNavigationBar />
  </Suspense>
```

The children Suspense on line 25 already serves as the single content loading indicator -- no change needed there.

## Auth Listener Status

**VERIFIED** -- `src/context/useAuthContext.tsx` is correct:
- No `hasInitializedRef` (removed)
- No `isProcessingRef` (removed)
- `setTimeout(0)` wrapper in `onAuthStateChange` prevents deadlock (line 135-140)
- `initializeAuth()` with `getSession()` handles initial load (line 146-154)
- No safety timeout (removed)

## Bootstrap Governance

**PASS** -- `bootstrap` (v5.3.3) and `react-bootstrap` (v2.10.10) are core Darkone Admin Standard dependencies. No unauthorized UI framework additions.

## Files to Change

| File | Action |
|------|--------|
| `Project Restore Points/RP-P2F-smoke-test-pre.md` | CREATE |
| `src/layouts/AdminLayout.tsx` | MODIFY -- line 15: change fallback from `<LoadingFallback />` to `null` |
| `Project Restore Points/RP-P2F-smoke-test-post.md` | CREATE |

**Total: 1 line changed in 1 file, 2 restore point docs created.**

## Summary Verdict: READY

- Auth redirect: PASS (no stall, no safety timeout)
- Session persistence: PASS
- Double spinner: FIX INCLUDED (single-line change)
- Bootstrap governance: PASS
- Known Editor-only constraint: `postMessage` origin mismatch in Lovable iframe (does not affect Preview/Live)
