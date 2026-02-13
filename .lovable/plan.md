

# Fix Auth Redirect Stall — Evidence-Based Diagnosis and Minimal Fix

## Root Cause Analysis (Evidence-Based)

The console log sequence from the screenshot tells the full story:

```text
1. [Auth] State change: SIGNED_IN          -- onAuthStateChange fires
2. [Auth] Skipping duplicate auth processing -- isProcessingRef.current is TRUE
3. [SignIn] Supabase auth succeeded, waiting for auth context...
4. [Auth] Safety timeout triggered - forcing loading complete  (10s later)
```

**What happens:**

1. On mount, the `useEffect` in `useAuthContext.tsx` sets up `onAuthStateChange` AND calls `getSession()`.
2. `onAuthStateChange` fires `INITIAL_SESSION` (no user) -- `handleAuthChange` starts, sets `isProcessingRef = true`, makes async DB calls.
3. User clicks Sign In. `signInWithPassword` succeeds.
4. Supabase fires `SIGNED_IN` event via `onAuthStateChange`.
5. `handleAuthChange` checks `isProcessingRef.current` -- it is still `true` from step 2 (or from the `getSession().then()` call that raced in).
6. **The SIGNED_IN event is dropped** ("Skipping duplicate auth processing").
7. `isAuthenticated` never becomes `true`. The `useEffect` in `useSignIn.ts` (line 52) never fires the redirect.
8. After 10 seconds, safety timeout forces `isLoading = false`, but `isAuthenticated` is still `false` -- user stays on sign-in page.

**The `postMessage` error** (`target origin 'https://lovable.dev'`) is Lovable's auth-bridge trying to sync state with the editor. It is cosmetic and NOT the cause of the redirect failure. The real cause is the `isProcessingRef` guard dropping the `SIGNED_IN` event.

## Fix — 2 Changes in 1 File

**File:** `src/context/useAuthContext.tsx`

### Change 1: Remove `isProcessingRef` guard

The guard was meant to prevent "duplicate processing" but it drops critical events. Processing the same session twice is harmless (idempotent state updates). Dropping a `SIGNED_IN` event is fatal.

```text
Before (line 108-113):
  const handleAuthChange = useCallback(async (session: Session | null) => {
    if (isProcessingRef.current) {
      console.info('[Auth] Skipping duplicate auth processing')
      return
    }
    isProcessingRef.current = true

After:
  const handleAuthChange = useCallback(async (session: Session | null) => {
    // No guard - processing same session twice is idempotent;
    // dropping SIGNED_IN events causes redirect failure.
```

Remove `isProcessingRef` declaration (line 95), the reset in the effect (line 146), and the `finally` block reference (line 136).

### Change 2: Remove redundant `getSession()` call

In Supabase v2, `onAuthStateChange` fires `INITIAL_SESSION` immediately on setup, which already covers the initial session check. The manual `getSession().then()` call (lines 157-162) creates a race condition where two calls to `handleAuthChange` overlap. Remove it entirely.

```text
Before (lines 156-162):
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isProcessingRef.current) {
        handleAuthChange(session)
      }
    })

After:
    // Removed: onAuthStateChange INITIAL_SESSION already handles this
```

### What stays the same

- `handleAuthChange` logic (session mapping, user/role fetch) -- unchanged.
- `saveSession`, `removeSession` -- unchanged.
- Safety timeout -- kept as a last-resort fallback (but should never trigger now).
- `isLoadingRef` for the safety timeout -- kept.
- `useSignIn.ts` -- no changes needed; redirect logic is correct (waits for `loginSuccess && isAuthenticated`).
- `router.tsx` -- no changes; route-aware loading gate is correct.

## Double Spinner Status

**Already fixed.** The route-aware loading gate in `router.tsx` (line 20) shows a single `<LoadingFallback />` for protected routes during auth resolution. The `<Suspense>` boundaries in `AdminLayout.tsx` are for lazy-loaded navigation components (TopNav, SideNav), not auth loading -- this is standard Darkone behavior and correct.

## Bootstrap Governance

**PASS.** `bootstrap` (v5.3.3) and `react-bootstrap` (v2.10.10) are core Darkone Admin template dependencies. No unauthorized UI framework additions.

## Files Changed

| File | Action |
|------|--------|
| `Project Restore Points/RP-P2E-auth-redirect-pre.md` | CREATE |
| `src/context/useAuthContext.tsx` | MODIFY -- remove isProcessingRef, remove getSession() |
| `Project Restore Points/RP-P2E-auth-redirect-post.md` | CREATE |

**Total: 1 file modified, 2 files created. No schema changes. No new dependencies.**

## Runtime Verification Plan

After applying the fix:

1. Navigate to preview domain `/auth/sign-in?redirectTo=%2Fdashboards`
2. Sign in with valid credentials
3. Verify redirect to `/dashboards` within 2 seconds
4. Check console: no "Skipping duplicate auth processing", no "Safety timeout triggered"
5. Repeat on live domain after publish

## Technical Diff Preview

```text
src/context/useAuthContext.tsx:
- Remove: isProcessingRef declaration (line 94-95)
- Remove: isProcessingRef guard in handleAuthChange (lines 110-113, 115, 136)
- Remove: isProcessingRef reset in useEffect (line 146)
- Remove: getSession().then() block (lines 156-162)
  Net: ~15 lines removed, 0 lines added
```

