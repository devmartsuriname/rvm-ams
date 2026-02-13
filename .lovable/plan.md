

# Fix: Login Succeeds But Redirect Fails

## Root Cause

React 18 `StrictMode` (enabled in `src/main.tsx`) mounts, unmounts, then remounts components. In `src/context/useAuthContext.tsx`, the `hasInitializedRef` guard prevents the auth listener from being re-created after StrictMode's remount cycle:

1. **First mount:** `hasInitializedRef.current = false` -- sets to `true`, creates `onAuthStateChange` listener
2. **StrictMode unmount:** cleanup runs, **unsubscribes** the listener
3. **Second mount:** `hasInitializedRef.current` is still `true` (refs persist) -- **skips everything**

Result: No auth listener exists. When the user logs in, `SIGNED_IN` events are never processed. `isAuthenticated` stays `false`. The redirect never fires. The safety timeout fires after 10 seconds but only forces `isLoading = false`, not authentication.

Additionally, `isProcessingRef` can get stuck at `true` if the first mount's async processing was interrupted by StrictMode unmount.

## Fix (Single File)

**File:** `src/context/useAuthContext.tsx`

**Changes:**

1. **Remove `hasInitializedRef`** -- The cleanup function already handles unsubscribing. React's effect lifecycle (setup + cleanup) is designed for exactly this pattern. No manual guard is needed.

2. **Reset `isProcessingRef` at effect start** -- Ensures a clean state on each mount, preventing stale `true` values from a previous StrictMode cycle.

3. **Keep everything else identical** -- No changes to `handleAuthChange`, `mapSupabaseUserToAppUser`, `saveSession`, `removeSession`, or any other logic.

### Before (broken)

```typescript
useEffect(() => {
  if (hasInitializedRef.current) return  // <-- BLOCKS re-init after StrictMode remount
  hasInitializedRef.current = true

  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
  supabase.auth.getSession().then(...)
  const safetyTimeout = setTimeout(...)

  return () => {
    subscription.unsubscribe()
    clearTimeout(safetyTimeout)
  }
}, [handleAuthChange])
```

### After (fixed)

```typescript
useEffect(() => {
  // Reset processing flag on each mount (fixes StrictMode stale ref)
  isProcessingRef.current = false

  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
  supabase.auth.getSession().then(...)
  const safetyTimeout = setTimeout(...)

  return () => {
    subscription.unsubscribe()
    clearTimeout(safetyTimeout)
  }
}, [handleAuthChange])
```

Also remove the `hasInitializedRef` declaration (line 96) since it is no longer used.

## Impact

- **No schema changes**
- **No new dependencies**
- **Single file edit** (`src/context/useAuthContext.tsx`)
- Fixes login redirect on both Preview and Live environments
- Compatible with React StrictMode (development) and production builds

