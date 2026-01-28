
# Auth Consistency Fix — Deep Diagnosis & Implementation Plan

## Investigation Summary

### Evidence from Console Logs (Screenshot Image 39)
```
[Auth] Initializing auth listener
[Auth] State change: SIGNED_IN
[Auth] Processing session: present
[Auth] Safety timeout triggered - forcing loading complete
[SignIn] Supabase auth succeeded, waiting for auth context...
```

### Evidence from Screenshot Image 42 (Live URL Failure)
- URL: `preview--rvmams.lovable.app/dashboards`
- Shows: Infinite loading spinner
- Console: `[Auth] State change: SIGNED_IN` but page doesn't render

---

## ROOT CAUSE IDENTIFIED

**The redirect in `useSignIn.ts` is called BEFORE the auth context updates `isAuthenticated`.**

### Current Code Flow (BROKEN):
```
1. User clicks "Sign In"
2. signInWithPassword() succeeds
3. redirectUser() called IMMEDIATELY ← BUG
4. Navigation to /dashboards happens
5. Router checks: isLoading? isAuthenticated?
6. Auth context hasn't processed onAuthStateChange yet
7. isLoading = true → Shows loading spinner indefinitely
8. Safety timeout triggers → isLoading = false
9. isAuthenticated = false → Redirect loop back to /auth/sign-in
```

### Why Editor Works But Live Fails:
- Editor iframe has different timing/caching behavior
- Live URL has full page navigation with stricter timing
- The race condition is timing-dependent

---

## WHAT WAS FOUND

### File: `src/app/(other)/auth/sign-in/useSignIn.ts`
| Line | Issue |
|------|-------|
| 63 | `redirectUser()` called immediately after login success, without waiting for auth context |

### File: `src/context/useAuthContext.tsx`
| Line | Issue |
|------|-------|
| 168 | `isLoading` in useEffect dependency array causes potential re-runs |
| 104-107 | `isProcessingRef` guard may skip legitimate auth state changes |

---

## IMPLEMENTATION PLAN

### Step 1: Create Pre-Implementation Restore Point
- File: `Project Restore Points/RP-P2B-pre-20260128.md`
- Captures current working state

### Step 2: Fix `useSignIn.ts` — Remove Immediate Redirect
**Current (BROKEN):**
```typescript
// Line 58-63
showNotification({ 
  message: 'Successfully logged in. Redirecting...', 
  variant: 'success' 
})
redirectUser() // ← PROBLEM: Called before auth context updates
```

**Fixed:**
```typescript
// Remove direct redirectUser() call
// Return loginSuccess state instead
const [loginSuccess, setLoginSuccess] = useState(false)

// In login function:
setLoginSuccess(true)
showNotification({ 
  message: 'Successfully logged in. Redirecting...', 
  variant: 'success' 
})
// DO NOT call redirectUser() here

// Add useEffect that watches auth context:
const { isAuthenticated } = useAuthContext()

useEffect(() => {
  if (loginSuccess && isAuthenticated) {
    redirectUser()
  }
}, [loginSuccess, isAuthenticated])
```

### Step 3: Fix `useAuthContext.tsx` — Remove isLoading from Dependencies
**Current (line 168):**
```typescript
}, [handleAuthChange, isLoading])
```

**Fixed:**
```typescript
}, [handleAuthChange]) // Remove isLoading to prevent re-initialization
```

### Step 4: Delete `fake-backend.ts` (Governance Compliance)
- File to DELETE: `src/helpers/fake-backend.ts`
- Remove any imports referencing it

### Step 5: Create Post-Implementation Restore Point
- File: `Project Restore Points/RP-P2B-post-20260128.md`

---

## FILES TO MODIFY

| File | Action | Change |
|------|--------|--------|
| `src/app/(other)/auth/sign-in/useSignIn.ts` | MODIFY | Add useEffect for auth-context-aware redirect |
| `src/context/useAuthContext.tsx` | MODIFY | Remove `isLoading` from useEffect deps |
| `src/helpers/fake-backend.ts` | DELETE | Complete removal per governance |

---

## VERIFICATION CHECKLIST

After implementation, verify on BOTH Preview and Live URL:

| Check | Preview | Live |
|-------|---------|------|
| Login succeeds | ☐ | ☐ |
| Dashboard renders (no spinner) | ☐ | ☐ |
| Session persists after refresh | ☐ | ☐ |
| No redirect loop | ☐ | ☐ |
| No console auth errors | ☐ | ☐ |

---

## GOVERNANCE COMPLIANCE

| Rule | Status |
|------|--------|
| No new auth logic added | ✅ Minimal fix only |
| No workarounds | ✅ Proper fix of race condition |
| Darkone 1:1 UI preserved | ✅ No UI changes |
| fake-backend.ts removed | ✅ Will be deleted |
| RLS not modified | ✅ No database changes |

---

## EXPECTED DELIVERABLE

Final report with:
1. **What was found** — Race condition in redirect timing
2. **What was removed** — fake-backend.ts
3. **What was verified** — Login flow on both environments
4. **Final status** — Auth consistency: FIXED / NOT FIXED

---

## TECHNICAL DETAILS

### Corrected Login Flow (AFTER FIX):
```
1. User clicks "Sign In"
2. signInWithPassword() succeeds
3. setLoginSuccess(true) - flag set
4. onAuthStateChange fires with SIGNED_IN
5. handleAuthChange() processes session
6. setIsAuthenticated(true), setIsLoading(false)
7. useEffect in useSignIn detects: loginSuccess=true, isAuthenticated=true
8. NOW redirectUser() is called
9. Navigation to /dashboards
10. Router sees isAuthenticated=true → Renders dashboard
```

This ensures the redirect only happens AFTER the auth context has confirmed the authenticated state.
