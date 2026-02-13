# Restore Point: RP-P2F-smoke-test-pre

**Created:** 2026-02-13  
**Phase:** 2F — Smoke Test + Double Spinner Fix  
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Pre-Fix State

- Auth redirect: PASS (setTimeout(0) decoupling in useAuthContext.tsx)
- Double spinner: PRESENT — two `<Suspense fallback={<LoadingFallback />}>` in AdminLayout.tsx (lines 15 and 25)

## File to Modify

| File | Current State |
|------|---------------|
| `src/layouts/AdminLayout.tsx` | 36 lines, line 15: `<Suspense fallback={<LoadingFallback />}>` around TopNavigationBar |

## Domains Tested

- Preview: `https://id-preview--05409e90-adea-494b-a980-374b142fbf8b.lovable.app`
- Live: `https://rvmams.lovable.app`
