
# Fix: Login Redirect Race Condition

## Problem Summary
After successful Supabase login, `useSignIn` navigates immediately before `onAuthStateChange` can update the auth state. The router then sees `isAuthenticated = false` and redirects back to sign-in.

## Solution: Reactive Navigation

Instead of navigating immediately after `signInWithPassword()`, wait for the auth context to confirm authentication, then navigate.

---

## Files to Modify

### 1. `src/app/(other)/auth/sign-in/useSignIn.ts`

**Current (broken):**
```typescript
const login = handleSubmit(async (values) => {
  const { error } = await supabase.auth.signInWithPassword(...)
  if (!error) {
    showNotification({ message: 'Successfully logged in. Redirecting...' })
    redirectUser() // ← IMMEDIATE navigation - auth state not ready!
  }
})
```

**Fixed (reactive):**
```typescript
import { useAuthContext } from '@/context/useAuthContext'

const useSignIn = () => {
  const { isAuthenticated } = useAuthContext()
  const [loginSuccess, setLoginSuccess] = useState(false)
  
  // Navigate ONLY when auth state confirms authentication
  useEffect(() => {
    if (loginSuccess && isAuthenticated) {
      redirectUser()
    }
  }, [loginSuccess, isAuthenticated])

  const login = handleSubmit(async (values) => {
    const { error } = await supabase.auth.signInWithPassword(...)
    if (!error) {
      showNotification({ message: 'Successfully logged in. Redirecting...' })
      setLoginSuccess(true) // ← Signal success, wait for auth context
      // Don't navigate here!
    }
  })
}
```

---

### 2. `src/context/useAuthContext.tsx` (Minor Enhancement)

Add a debug log to confirm auth state changes are being processed:

```typescript
const handleAuthChange = useCallback(async (session: Session | null) => {
  if (isProcessingRef.current) {
    console.info('[Auth] Skipping duplicate auth processing')
    return
  }
  
  isProcessingRef.current = true
  console.info('[Auth] Processing session:', !!session) // ← Add this
  
  try {
    if (session?.user && session.access_token) {
      console.info('[Auth] Fetching app_user for:', session.user.id) // ← Add this
      const appUser = await mapSupabaseUserToAppUser(session.user, session.access_token)
      // ... rest of code
    }
  }
})
```

---

## Technical Details

### Why This Fix Works

```text
Before (Race Condition):
┌─────────────┐    ┌──────────────┐    ┌───────────┐
│ signIn()    │───►│ navigate('/') │───►│ Router    │
│ succeeds    │    │ immediately  │    │ checks    │
└─────────────┘    └──────────────┘    │ isAuth=   │
                                       │ FALSE     │
                                       └───────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ Redirect to      │
                                   │ /auth/sign-in    │
                                   └──────────────────┘

After (Reactive):
┌─────────────┐    ┌──────────────┐    ┌───────────┐
│ signIn()    │───►│ setLoginSuc- │    │ onAuthSt- │
│ succeeds    │    │ cess(true)   │    │ ateChange │
└─────────────┘    └──────────────┘    │ fires     │
                          │            └───────────┘
                          │                  │
                          ▼                  ▼
                   ┌──────────────────────────────┐
                   │ useEffect watches:           │
                   │ loginSuccess && isAuth       │
                   │ ──────────────────────       │
                   │ When BOTH true → navigate()  │
                   └──────────────────────────────┘
```

### Changes Summary

| File | Change | Risk |
|------|--------|------|
| `useSignIn.ts` | Add reactive navigation via useEffect | Low - isolated to login flow |
| `useAuthContext.tsx` | Add debug logs (optional) | None - logging only |

---

## Governance Compliance

- ❌ NO auth logic changes (same Supabase flow)
- ❌ NO RLS changes
- ❌ NO schema changes
- ❌ NO UI changes (same form, same toast)
- ✅ Bug fix only - timing/sequencing improvement

---

## Verification Steps

1. Sign in with `info@devmart.sr`
2. Confirm success toast appears
3. Confirm redirect to `/dashboards` (not back to sign-in)
4. Confirm no console errors
5. Confirm no safety timeout warnings
