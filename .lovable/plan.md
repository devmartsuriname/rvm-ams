

# Bugfix Plan: Live URL Login Redirect Not Working

## Problem Summary

The login shows "Successfully logged in. Redirecting..." but never redirects to the dashboard on the live URL (`preview--rvmams.lovable.app`). The same code works in the editor view.

## Root Cause

**Timing/Race Condition between navigate() and onAuthStateChange:**

1. User submits login form
2. `signInWithPassword()` succeeds (Supabase auth returns success)
3. `redirectUser()` is called immediately → navigates to `/`
4. `/` route checks `isAuthenticated` from `useAuthContext`
5. **`isAuthenticated` is still `false`** because:
   - `onAuthStateChange` fires asynchronously
   - `handleAuthChange()` makes async DB calls to `app_user` and `user_role`
   - These haven't completed yet
6. Router sees `isAuthenticated = false` → redirects back to `/auth/sign-in`
7. User is stuck in a redirect loop

**Why it works in the editor but not on live:**
- The editor preview may have different timing characteristics
- Network latency to Supabase differs between environments
- React StrictMode double-rendering may affect timing

## Solution

Add authentication-based redirect logic directly in the `SignIn` component that watches for `isAuthenticated` changes and redirects when true.

### Files to Modify

#### 1. `src/app/(other)/auth/sign-in/components/SignIn.tsx`

Add a `useEffect` that monitors `isAuthenticated` and redirects when the user becomes authenticated:

```typescript
import { useAuthContext } from '@/context/useAuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'

// Inside SignIn component:
const { isAuthenticated } = useAuthContext()
const navigate = useNavigate()
const [searchParams] = useSearchParams()

useEffect(() => {
  if (isAuthenticated) {
    const redirectTo = searchParams.get('redirectTo') || '/dashboards'
    navigate(redirectTo, { replace: true })
  }
}, [isAuthenticated, navigate, searchParams])
```

#### 2. `src/app/(other)/auth/sign-in/useSignIn.ts`

Remove the `redirectUser()` call and let the component handle the redirect. The sign-in handler should only:
- Call `signInWithPassword()`
- Show success/error notifications
- Not attempt navigation (let auth state change trigger it)

```typescript
// Remove the redirectUser() call from the login function
// Just show the success notification - redirect will happen via SignIn component

const login = handleSubmit(async (values: LoginFormFields) => {
  setLoading(true)
  try {
    const { error } = await supabase.auth.signInWithPassword({...})
    
    if (error) {
      showNotification({ message: error.message, variant: 'danger' })
      return
    }

    // Success - auth context will handle session via onAuthStateChange
    // SignIn component will handle redirect when isAuthenticated becomes true
    showNotification({ 
      message: 'Successfully logged in. Redirecting...', 
      variant: 'success' 
    })
    // DO NOT call redirectUser() here - let the component handle it

  } catch (e: unknown) {
    // ... error handling
  } finally {
    setLoading(false)
  }
})
```

## Technical Details

### Why This Fix Works

1. **Reactive redirect**: The SignIn component watches `isAuthenticated` from context
2. **Guaranteed timing**: The redirect only happens AFTER the auth context has fully processed the session
3. **No race condition**: The `useEffect` runs whenever `isAuthenticated` changes to `true`
4. **Prevents stuck state**: If the user refreshes on `/auth/sign-in` while already logged in, they get redirected immediately

### What This Does NOT Change

- No changes to Darkone UI/styling
- No changes to RLS policies or database
- No changes to auth architecture (still uses Supabase Auth + onAuthStateChange)
- Not Phase 6 work (this is a minimal bugfix)

## Scope Compliance

| Allowed | Not Allowed |
|---------|-------------|
| Fix redirect timing issue | UI redesign |
| Modify 2 files only | New components |
| Minimal logic change | Phase 6 auth replacement |
| Bug fix within current architecture | RLS changes |

## Expected Behavior After Fix

1. User enters credentials and clicks "Sign In"
2. Toast shows "Successfully logged in. Redirecting..."
3. `onAuthStateChange` fires and `handleAuthChange()` completes
4. `isAuthenticated` becomes `true`
5. `SignIn` component's `useEffect` triggers
6. User is navigated to `/dashboards` (or `redirectTo` parameter)

## Verification Steps

1. Navigate to `preview--rvmams.lovable.app/auth/sign-in`
2. Login with `info@devmart.sr`
3. Confirm redirect to `/dashboards` within 2-3 seconds
4. Confirm session persists on page refresh
5. Navigate to `/rvm/dossiers`, `/rvm/meetings`, `/rvm/tasks` - all should load

