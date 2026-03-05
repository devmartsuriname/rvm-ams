# RP-P19C — Auth Logout UX Fix — PRE

**Created:** 2026-03-05
**Phase:** 19C — Targeted Auth UX Fix + Micro Cleanup
**Status:** PRE-EXECUTION

## Scope
1. Fix logout click target in ProfileDropdown.tsx (move onClick to DropdownItem, remove Link/to)
2. Delete duplicate FallbackLoading.tsx, update AuthLayout.tsx import to LoadingFallback

## Files to Modify
- `src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx` — logout handler fix
- `src/layouts/AuthLayout.tsx` — import update
- `src/components/FallbackLoading.tsx` — DELETE

## Pre-State
- ProfileDropdown: onClick on inner `<span>`, DropdownItem uses `as={Link} to="/auth/sign-in"`
- FallbackLoading.tsx and LoadingFallback.tsx are identical components
- AuthLayout imports FallbackLoading

## Constraints
- Zero schema/RLS/trigger changes
- Zero new dependencies
- ≤25 file operations
