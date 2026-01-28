# Restore Point: RP-P2B-auth-deeplink-pre

**Created**: 2026-01-28  
**Phase**: Auth Deep-Link Hardening  
**Status**: Pre-Implementation Snapshot

---

## Current Issue Summary

Deep-link sign-in URLs were inconsistent earlier on custom domains:
- `/auth/sign-in?redirectTo=/` and `/auth/sign-in?redirectTo=/dashboards` sometimes did not redirect
- Direct access to `/dashboards` worked fine
- Incognito tests now pass, but hardening is needed to prevent browser-state deadlocks

## URLs Under Test

### Custom Domains (Primary Focus)
1. `https://rvmams.lovable.app/auth/sign-in?redirectTo=/`
2. `https://rvmams.lovable.app/auth/sign-in?redirectTo=/dashboards`
3. `https://rvmams.lovable.app/dashboards`
4. `https://preview--rvmams.lovable.app/auth/sign-in?redirectTo=/`
5. `https://preview--rvmams.lovable.app/auth/sign-in?redirectTo=/dashboards`
6. `https://preview--rvmams.lovable.app/dashboards`

### Project Fallback Domains (Baselines)
7. `https://05409e90-adea-494b-a980-374b142fbf8b.lovableproject.com/`
8. `https://id-preview--05409e90-adea-494b-a980-374b142fbf8b.lovable.app/`

## Current Behavior Notes

### What's Working
- All domains render correctly in Incognito mode
- Direct access to `/dashboards` works on all domains
- Baseline project domains work correctly

### Identified Issues
1. **Stale Closure Bug**: Safety timeout in `useAuthContext.tsx` captures stale `isLoading` value
2. **No redirectTo Validation**: Open redirect vulnerability exists
3. **No Auto-Redirect**: Already-authenticated users see sign-in page unnecessarily
4. **Missing Logging**: No deterministic markers for auth flow debugging

## Files to Modify

| File | Change Type |
|------|-------------|
| `src/context/useAuthContext.tsx` | Fix stale closure, add logging |
| `src/app/(other)/auth/sign-in/useSignIn.ts` | Validate redirectTo, add auto-redirect |

## Pre-Implementation State

### useAuthContext.tsx (lines 156-162)
```typescript
const safetyTimeout = setTimeout(() => {
  if (isLoading) {  // <-- Stale closure bug
    console.warn('[Auth] Safety timeout triggered - forcing loading complete')
    setIsLoading(false)
  }
}, 10000)
```

### useSignIn.ts (lines 34-38)
```typescript
const redirectUser = () => {
  const redirectLink = searchParams.get('redirectTo')
  if (redirectLink) navigate(redirectLink)  // <-- No validation
  else navigate('/')  // <-- Should default to /dashboards
}
```

---

**Next Step**: Apply targeted fixes for auth deep-link hardening
