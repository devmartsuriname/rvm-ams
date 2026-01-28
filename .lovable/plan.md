
# Fix: Login Redirect Race Condition (Production Build)

## Root Cause
The `useSignIn` hook navigates immediately when Supabase's `SIGNED_IN` event fires, but `AuthContext.handleAuthChange()` is async and hasn't finished fetching `app_user`/`user_role` from the database. When the router checks `isAuthenticated`, it's still `false`, causing a redirect loop.

## Solution
Re-integrate with `useAuthContext` and wait for the context to confirm authentication before navigating. Remove the duplicate `onAuthStateChange` listener from `useSignIn`.

---

## File Changes

### 1. `src/app/(other)/auth/sign-in/useSignIn.ts`

**Changes:**
- Re-add `useAuthContext` import
- Remove the duplicate `onAuthStateChange` listener
- Navigate only when `loginSuccess && isAuthenticated` are both true
- Add redirect-away logic if user is already authenticated

```typescript
import { yupResolver } from '@hookform/resolvers/yup'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { supabase } from '@/integrations/supabase/client'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthContext } from '@/context/useAuthContext'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showNotification } = useNotificationContext()
  const { isAuthenticated } = useAuthContext()
  const hasRedirectedRef = useRef(false)

  // ... form schema ...

  const redirectUser = useCallback(() => {
    if (hasRedirectedRef.current) return
    hasRedirectedRef.current = true
    
    const redirectLink = searchParams.get('redirectTo')
    if (redirectLink) navigate(redirectLink)
    else navigate('/dashboards')
  }, [searchParams, navigate])

  // Redirect if already authenticated (page refresh while logged in)
  useEffect(() => {
    if (isAuthenticated && !loginSuccess) {
      redirectUser()
    }
  }, [isAuthenticated, loginSuccess, redirectUser])

  // Wait for BOTH loginSuccess AND isAuthenticated before navigating
  useEffect(() => {
    if (loginSuccess && isAuthenticated) {
      console.info('[SignIn] Auth context confirmed, redirecting...')
      redirectUser()
    }
  }, [loginSuccess, isAuthenticated, redirectUser])

  const login = handleSubmit(async (values) => {
    setLoading(true)
    hasRedirectedRef.current = false
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        showNotification({ message: error.message, variant: 'danger' })
        return
      }

      showNotification({ message: 'Successfully logged in...', variant: 'success' })
      setLoginSuccess(true)
      // Navigation handled by useEffect watching isAuthenticated
      
    } catch (e) {
      showNotification({ message: 'Unexpected error', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  return { loading, login, control }
}
```

---

## Technical Details

### Why This Works

```text
FIXED TIMELINE:

T0: User clicks "Sign In"
T1: signInWithPassword() returns success
T2: setLoginSuccess(true)
T3: useEffect runs: loginSuccess=true, isAuthenticated=false → NO navigation
    ↓
T4: AuthContext's onAuthStateChange fires (async DB queries)
T5: AuthContext completes, sets isAuthenticated=true
T6: useEffect runs again: loginSuccess=true, isAuthenticated=true → NAVIGATE
T7: Router checks isAuthenticated → TRUE ✓
T8: Dashboard renders successfully
```

### Changes Summary

| Change | Purpose |
|--------|---------|
| Re-add `useAuthContext` | Access `isAuthenticated` state |
| Remove `onAuthStateChange` listener | Eliminate duplicate/racing listener |
| Watch `loginSuccess && isAuthenticated` | Wait for AuthContext to confirm |
| Add already-authenticated check | Handle page refresh while logged in |
| Navigate to `/dashboards` by default | Explicit default instead of `/` |

---

## Why Previous Fix Failed

The previous fix tried to avoid `useAuthContext` by creating a separate `onAuthStateChange` listener in `useSignIn`. This caused:

1. **Two competing listeners**: Both `useSignIn` and `AuthContext` subscribed to the same event
2. **Different timing**: `useSignIn` navigated immediately, `AuthContext` did async work
3. **Race condition**: Navigation happened before auth state was fully updated

---

## Governance Compliance

- NO auth logic changes (same Supabase flow)
- NO RLS changes
- NO schema changes
- NO UI changes
- Bug fix only - proper state synchronization

---

## Verification Steps

1. Clear browser cache/cookies on live URL
2. Navigate to `https://rvmams.lovable.app/auth/sign-in`
3. Enter credentials and click Sign In
4. Verify success toast appears
5. Verify redirect to `/dashboards` occurs (not back to sign-in)
6. Verify no console errors
7. Test logout and re-login flow
