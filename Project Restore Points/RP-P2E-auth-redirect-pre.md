# Restore Point: RP-P2E-auth-redirect-pre

**Created:** 2026-02-13  
**Phase:** 2E — Auth Redirect Stall Fix  
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Problem Description

Login succeeds but redirect stalls on both preview and live domains. Console evidence:

1. `[Auth] State change: SIGNED_IN` fires
2. `[Auth] Skipping duplicate auth processing` — SIGNED_IN event dropped by `isProcessingRef` guard
3. `[SignIn] Supabase auth succeeded, waiting for auth context...` — redirect never fires
4. `[Auth] Safety timeout triggered - forcing loading complete` — 10s later

## Root Cause

Race condition: `isProcessingRef` guard in `handleAuthChange` drops the `SIGNED_IN` event because `INITIAL_SESSION` processing (or redundant `getSession()` call) is still in-flight.

## URLs Tested

- Preview: `https://id-preview--05409e90-adea-494b-a980-374b142fbf8b.lovable.app/auth/sign-in?redirectTo=%2Fdashboards`
- Live: `https://rvmams.lovable.app/auth/sign-in?redirectTo=%2Fdashboards`

## Files to Modify

| File | Action |
|------|--------|
| `src/context/useAuthContext.tsx` | Remove `isProcessingRef` guard + redundant `getSession()` |

## Current State (Pre-Fix)

- `src/context/useAuthContext.tsx`: 215 lines, contains `isProcessingRef` (line 95), guard (lines 110-113), and `getSession().then()` (lines 157-162)
