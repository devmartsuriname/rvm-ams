

# Phase 19C — Auth UX Fix + Micro Cleanup

## Changes (4 file edits + 1 file delete + 2 restore points = 7 ops)

### 1. Logout click target fix
**File:** `src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx`

**Problem:** `onClick={removeSession}` is on the inner `<span>` (line 46), not the `<DropdownItem>` (line 44). Clicking the icon or padding area misses the handler. The item also navigates via `as={Link} to="/auth/sign-in"` which races with `removeSession()`.

**Fix:** Move `onClick` to the `<DropdownItem>`, remove `as={Link}` and `to` (since `removeSession()` already calls `navigate('/auth/sign-in')` after sign-out), and prevent default to avoid href navigation:

```tsx
<DropdownItem className="text-danger" onClick={(e) => { e.preventDefault(); removeSession(); }}>
  <IconifyIcon icon="solar:logout-3-outline" className="align-middle me-2 fs-18" />
  <span className="align-middle">Logout</span>
</DropdownItem>
```

### 2. Duplicate loading component cleanup
**Delete:** `src/components/FallbackLoading.tsx`
**Edit:** `src/layouts/AuthLayout.tsx` — change import from `FallbackLoading` to `LoadingFallback` (already identical component, used by `router.tsx` and `AdminLayout.tsx`)

### 3. Restore points + docs
- Create `Project Restore Points/RP-P19C-auth-logout-pre.md`
- Create `Project Restore Points/RP-P19C-auth-logout-post.md`
- Update `docs/architecture.md` and `docs/backend.md` with Phase 19C status

**Total: 7 operations (well under 25 limit)**

### Verification
- Login → dashboard → profile menu → single click logout → redirect to `/auth/sign-in`
- Attempt `/dashboards` after logout → must redirect back
- Build passes (apexcharts TS1540 only)

