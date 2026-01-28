
# Auth Consistency Fix — Live URL Deadlock Resolution

## A) ROOT CAUSE IDENTIFICATION (Evidence-Based)

### Evidence from Console Logs (image-33.png)
```
[Auth] State change: SIGNED_IN
[Auth] Skipping duplicate auth processing  
[Auth] Safety timeout triggered - forcing loading complete
```

### Failure Sequence (Deterministic)
```text
1. SIGNED_IN event fires (auth succeeded)
2. handleAuthChange() is called
3. isProcessingRef.current === true (blocking)
4. "Skipping duplicate auth processing" logged
5. handleAuthChange returns WITHOUT setting state
6. 10-second safety timeout fires
7. isLoading = false, but isAuthenticated = false (never set)
8. Route guard redirects to /auth/sign-in
```

### Root Cause (Single Statement)
**The `getSession()` call races with `onAuthStateChange`, causing the SIGNED_IN event to be skipped when `isProcessingRef` is already true from the initial session check.**

### Why Preview Works, Live Fails
| Environment | Behavior |
|-------------|----------|
| Preview | Lovable's preview iframe has session state injected, faster initialization |
| Live | Cold start, `getSession()` and `onAuthStateChange` compete, race condition triggers |

---

## B) Technical Analysis

### Current Code (src/context/useAuthContext.tsx lines 140-154)
```typescript
// Problem: Both fire simultaneously and race
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    await handleAuthChange(session)  // Fires INITIAL_SESSION + SIGNED_IN
  }
)

supabase.auth.getSession().then(({ data: { session } }) => {
  if (!isProcessingRef.current) {
    handleAuthChange(session)  // Also tries to process session
  }
})
```

### Bug: Concurrent Processing Guard Drops Valid Sessions
```typescript
const handleAuthChange = useCallback(async (session: Session | null) => {
  if (isProcessingRef.current) {
    console.info('[Auth] Skipping duplicate auth processing')
    return  // BUG: Returns without processing the new SIGNED_IN session
  }
  // ...
}, [])
```

When `getSession()` fires first:
1. Sets `isProcessingRef = true`
2. `SIGNED_IN` fires, hits the guard, returns early
3. `getSession()` completes (possibly with stale/null session)
4. `isAuthenticated = false`

---

## C) FIX IMPLEMENTATION

### Fix Strategy
Per Supabase documentation:
> "With Supabase Auth SDK, it's recommended to listen to changes using `onAuthStateChange`, which fires with the initial session, too. If you already do that, `getSession` is no longer needed on app start."

### Changes to src/context/useAuthContext.tsx

#### Change 1: Remove redundant getSession() call
**Remove lines 148-154** (the manual `getSession()` call that races with `onAuthStateChange`)

#### Change 2: Improve concurrent processing to queue latest session
Instead of skipping, track the latest session and process after current completes

#### Change 3: Add better logging for debugging

### Exact Code Changes

**File: src/context/useAuthContext.tsx**

```typescript
// REMOVE this entire block (lines 148-154):
// Check initial session
supabase.auth.getSession().then(({ data: { session } }) => {
  // Only process if not already handled by onAuthStateChange
  if (!isProcessingRef.current) {
    handleAuthChange(session)
  }
})

// MODIFY handleAuthChange to queue latest session instead of skipping:
const pendingSessionRef = useRef<Session | null>(null)

const handleAuthChange = useCallback(async (session: Session | null) => {
  // If already processing, queue this session for after
  if (isProcessingRef.current) {
    console.info('[Auth] Queuing session for processing')
    pendingSessionRef.current = session
    return
  }
  
  isProcessingRef.current = true
  
  try {
    if (session?.user && session.access_token) {
      const appUser = await mapSupabaseUserToAppUser(session.user, session.access_token)
      if (appUser) {
        setUser(appUser)
        setIsAuthenticated(true)
      } else {
        setUser(undefined)
        setIsAuthenticated(false)
      }
    } else {
      setUser(undefined)
      setIsAuthenticated(false)
    }
  } finally {
    isProcessingRef.current = false
    setIsLoading(false)
    
    // Process queued session if any
    if (pendingSessionRef.current !== null) {
      const pendingSession = pendingSessionRef.current
      pendingSessionRef.current = null
      // Use setTimeout to allow state to settle
      setTimeout(() => handleAuthChange(pendingSession), 0)
    }
  }
}, [])
```

---

## D) FILES TO MODIFY

| File | Change |
|------|--------|
| `src/context/useAuthContext.tsx` | Remove getSession() race, add session queuing |

---

## E) VERIFICATION PLAN

After implementation:
1. Test login on LIVE URL (`rvmams.lovable.app`)
2. Verify SIGNED_IN event is NOT skipped
3. Verify session persistence after redirect
4. Verify no redirect loop
5. Verify preview still works

---

## F) CHECKLIST COMPLETION

### 1) CODE CLEANUP (Previous)
| Item | Status |
|------|--------|
| Removed sign-up auth pages | DONE |
| Removed reset-password auth pages | DONE |
| Removed lock-screen page | DONE |
| Removed template-only auth routes | DONE |
| Cleaned SignIn dead links | DONE |
| Fake-backend.ts fully removed | SKIPPED (inert, Darkone template parity) |

### 2) SUPABASE CONFIG
| Item | Status |
|------|--------|
| Redirect URLs updated | DONE (verified in screenshot) |
| Site URL updated to live domain | DONE (`https://rvmams.lovable.app` confirmed) |

### 3) VERIFICATION (Current Issue)
| Item | Status |
|------|--------|
| Preview login | DONE |
| Preview session persistence | DONE |
| Live login auth event fires | DONE (SIGNED_IN observed) |
| Live session available after redirect | **FAILED** (race condition) |
| Live dashboard renders successfully | **FAILED** (redirect loop) |

---

## G) EXPECTED OUTCOME

After this fix:
- `onAuthStateChange` is the ONLY session handler (no race with `getSession`)
- If multiple auth events fire, latest session is queued and processed
- LIVE login will work identically to PREVIEW

---

## H) HARD RULES COMPLIANCE

- No new auth architecture
- No scope expansion  
- No Phase 8 work
- Darkone 1:1 UI preserved
- Single file change only
