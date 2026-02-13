# Restore Point: RP-P2E-auth-redirect-post

**Created:** 2026-02-13  
**Phase:** 2E — Auth Redirect Stall Fix  
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Changes Applied

### File: `src/context/useAuthContext.tsx`

| Change | Lines Removed | Rationale |
|--------|--------------|-----------|
| Removed `isProcessingRef` declaration | 2 lines | Guard was dropping `SIGNED_IN` events, causing redirect stall |
| Removed `isProcessingRef` guard in `handleAuthChange` | 5 lines | Same session processing is idempotent; dropping events is fatal |
| Removed `isProcessingRef` reset in `finally` block | 1 line | No longer needed |
| Removed `getSession().then()` call in `useEffect` | 7 lines | Redundant — `onAuthStateChange` fires `INITIAL_SESSION` immediately |

**Net diff:** ~15 lines removed, 0 added. File went from 215 → 196 lines.

## Root Cause Analysis

Race condition between `onAuthStateChange` listener and manual `getSession()` call. Both invoked `handleAuthChange`, but the `isProcessingRef` guard caused the second invocation (the critical `SIGNED_IN` event) to be silently dropped. Result: `isAuthenticated` never became `true`, redirect never fired, and the 10-second safety timeout masked the failure.

## What Was NOT Changed

- `handleAuthChange` session mapping logic — unchanged
- `saveSession`, `removeSession` — unchanged
- Safety timeout (10s) — kept as last-resort fallback
- `useSignIn.ts` — no changes needed
- `router.tsx` — no changes needed
- Database schema — no changes
- No new dependencies

## Verification Status

| Test | Status |
|------|--------|
| Console: no "Skipping duplicate auth processing" | PENDING — requires login test |
| Console: no safety timeout | PENDING |
| Redirect within 2s | PENDING |
| Single spinner during boot | PASS (route-aware gate in router.tsx) |
| Bootstrap governance | PASS (Darkone baseline) |
