# Restore Point: RP-P2C-routes-pre

**Created**: 2026-01-28
**Phase**: Route Hygiene — Pre-Implementation
**Context**: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Current State Summary

### Issue
- 39 demo/library routes from Darkone template are registered in the router
- These routes are accessible in production but not needed for RVM-AMS
- Need to implement RVM-ONLY route policy

### Files to Modify
| File | Action |
|------|--------|
| `src/routes/index.tsx` | Remove demo route imports and arrays |
| `src/routes/router.tsx` | Add catch-all route handler |

### Current Route Count
- **Total registered routes**: 47
- **RVM routes to keep**: 8 (/, /dashboards, /rvm/*, /auth/sign-in)
- **Demo routes to remove**: 39

### Demo Routes Being Removed
- `/base-ui/*` (21 routes)
- `/forms/*` (5 routes)
- `/apex-chart` (1 route)
- `/maps/*` (2 routes)
- `/tables/*` (2 routes)
- `/icons/*` (2 routes)
- `/dark-sidenav`, `/dark-topnav`, `/small-sidenav`, `/hidden-sidenav`, `/dark-mode` (5 routes)
- `/pages-404-alt` (1 route - keep import for potential future use)

### Menu Status
Already clean - contains only RVM routes (Dashboard, Dossiers, Meetings, Tasks)

### Test URLs
1. `https://rvmams.lovable.app/auth/sign-in`
2. `https://rvmams.lovable.app/dashboards`
3. `https://preview--rvmams.lovable.app/auth/sign-in`
4. `https://preview--rvmams.lovable.app/dashboards`

---

## Rollback Instructions

If issues occur, revert to this commit state or restore files from version history.
