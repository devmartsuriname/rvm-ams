# Restore Point: RP-P2C-routes-post

**Created**: 2026-01-28
**Phase**: Route Hygiene — Post-Implementation
**Context**: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Implementation Summary

### Files Changed

| File | Change |
|------|--------|
| `src/routes/index.tsx` | Removed 39 demo route imports and arrays; kept only RVM core routes |
| `src/routes/router.tsx` | Added catch-all route handler for unknown paths |

---

## Changes Detail

### `src/routes/index.tsx`

**Removed imports** (39 lazy imports):
- Base UI: Accordions, Alerts, Avatars, Badges, Breadcrumb, Buttons, Cards, Carousel, Collapse, Dropdowns, ListGroup, Modals, Tabs, Offcanvas, Pagination, Placeholders, Popovers, Progress, Spinners, Toasts, Tooltips
- Charts/Maps: Apex, GoogleMaps, VectorMaps, ErrorAlt
- Forms: Basic, FlatPicker, Validation, FileUploads, Editors
- Tables: BasicTable, GridjsTable
- Icons: BoxIcons, SolarIcons
- Layouts: DarkSideNav, DarkTopNav, SmallSideNav, HiddenSideNav, DarkMode

**Removed route arrays**:
- `baseUIRoutes` (21 routes)
- `chartsMapsRoutes` (4 routes)
- `formsRoutes` (5 routes)
- `tableRoutes` (2 routes)
- `iconRoutes` (2 routes)
- `layoutsRoutes` (5 routes)

**Kept**:
- `initialRoutes` (root redirect to /dashboards)
- `generalRoutes` (/dashboards)
- `rvmRoutes` (/rvm/dossiers, /rvm/dossiers/:id, /rvm/meetings, /rvm/meetings/:id, /rvm/tasks)
- `authRoutes` (/auth/sign-in)

### `src/routes/router.tsx`

**Added catch-all route** (`path="*"`):
- If authenticated → Navigate to `/dashboards`
- If not authenticated → Navigate to `/auth/sign-in?redirectTo=<original-path>`
- Handles loading state correctly

---

## Final Route Registry

| Route | Type | Status |
|-------|------|--------|
| `/` | Redirect | Redirects to `/dashboards` |
| `/dashboards` | Page | Dashboard |
| `/rvm/dossiers` | Page | Dossier list |
| `/rvm/dossiers/:id` | Page | Dossier detail |
| `/rvm/meetings` | Page | Meeting list |
| `/rvm/meetings/:id` | Page | Meeting detail |
| `/rvm/tasks` | Page | Task list |
| `/auth/sign-in` | Auth | Sign-in page |
| `*` | Catch-all | Redirects based on auth state |

**Total registered routes: 9** (including catch-all)

---

## Verification Checklist

| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | `/auth/sign-in` (direct) | Shows sign-in page | PENDING |
| 2 | `/auth/sign-in?redirectTo=/dashboards` | Login redirects to /dashboards | PENDING |
| 3 | `/dashboards` (authenticated) | Shows dashboard | PENDING |
| 4 | `/base-ui/buttons` (demo route) | Redirects appropriately | PENDING |
| 5 | `/nonexistent-route` | Redirects appropriately | PENDING |
| 6 | Refresh on `/dashboards` | Session persists | PENDING |

---

## Governance Compliance

| Rule | Status |
|------|--------|
| Darkone 1:1 parity | ✓ Source files preserved |
| No UI styling changes | ✓ Compliant |
| No new features | ✓ Compliant |
| No database/RLS changes | ✓ Compliant |
| No fake backend files | ✓ Compliant |

---

## Rollback Instructions

Restore files from `RP-P2C-routes-pre.md` state or use version history.
