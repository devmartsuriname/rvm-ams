# Restore Point: RP-P2F-smoke-test-post

**Created:** 2026-02-13  
**Phase:** 2F — Smoke Test + Double Spinner Fix  
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Smoke Test Results

| Test | Result | Notes |
|------|--------|-------|
| T1: Deep link redirect | ✅ PASS | Lands on /dashboards within ~3s, no safety timeout |
| T2: Protected route redirect | ✅ PASS | Unauthenticated → /auth/sign-in with redirectTo preserved |
| T3: Session persistence | ✅ PASS | Hard refresh stays authenticated, no stall |
| T4: Logout | ✅ PASS (Preview/Live) | Editor-only: postMessage origin mismatch (harmless) |
| T5: Double spinner | ✅ FIXED | AdminLayout.tsx line 15: fallback changed to `null` |

## Change Applied

| File | Change |
|------|--------|
| `src/layouts/AdminLayout.tsx` | Line 15: `<Suspense fallback={<LoadingFallback />}>` → `<Suspense fallback={null}>` |

## Editor-Only Constraints

- `postMessage` origin mismatch errors from Lovable iframe bridge (`lovable.dev`, `gptengineer.app`, `localhost:3000`, `beta.lovable.dev`) — does NOT affect Preview or Live domains.

## Bootstrap Governance

**PASS** — No unauthorized UI frameworks. `bootstrap@5.3.3` + `react-bootstrap@2.10.10` remain sole UI dependencies.

## Verdict: READY
