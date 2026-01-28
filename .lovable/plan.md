
# Route Hygiene — Remove Darkone Demo Routes, Keep RVM-Only

## Route Inventory Table

### ALLOWED Routes (RVM-ONLY Allowlist)

| Route | Status | Source |
|-------|--------|--------|
| `/` | KEEP | Redirects to `/dashboards` |
| `/dashboards` | KEEP | RVM Dashboard |
| `/rvm/dossiers` | KEEP | Dossier list |
| `/rvm/dossiers/:id` | KEEP | Dossier detail |
| `/rvm/meetings` | KEEP | Meeting list |
| `/rvm/meetings/:id` | KEEP | Meeting detail |
| `/rvm/tasks` | KEEP | Task list |
| `/auth/sign-in` | KEEP | Authentication |
| `*` (catch-all) | ADD | 404 handler with redirect |

### DEMO Routes (TO REMOVE from router)

| Route | Count | Action |
|-------|-------|--------|
| `/base-ui/*` | 21 routes | Remove from router registry |
| `/forms/*` | 5 routes | Remove from router registry |
| `/apex-chart` | 1 route | Remove from router registry |
| `/maps/*` | 2 routes | Remove from router registry |
| `/tables/*` | 2 routes | Remove from router registry |
| `/icons/*` | 2 routes | Remove from router registry |
| `/dark-sidenav`, `/dark-topnav`, `/small-sidenav`, `/hidden-sidenav`, `/dark-mode` | 5 routes | Remove from router registry |
| `/pages-404-alt` | 1 route | Keep file, use for catch-all |

**Total Demo Routes to Remove: 39**

---

## Sidebar/Menu Status

**ALREADY CLEAN** - Menu only contains RVM routes:
- Dashboard (`/dashboards`)
- Dossiers (`/rvm/dossiers`)
- Meetings (`/rvm/meetings`)
- Tasks (`/rvm/tasks`)

No changes needed to `src/assets/data/menu-items.ts`.

---

## Implementation Plan

### Step 0: Create Pre-Implementation Restore Point
**File**: `Project Restore Points/RP-P2C-routes-pre.md`

### Step 1: Clean Up Route Registry
**File**: `src/routes/index.tsx`

Changes:
1. Remove lazy imports for demo components (base-ui, forms, charts, maps, tables, icons, layouts)
2. Remove route array definitions: `baseUIRoutes`, `formsRoutes`, `chartsMapsRoutes`, `tableRoutes`, `iconRoutes`, `layoutsRoutes`
3. Update `appRoutes` export to include ONLY:
   - `initialRoutes` (root redirect)
   - `generalRoutes` (dashboards)
   - `rvmRoutes` (dossiers, meetings, tasks)
4. Keep `ErrorAlt` import for 404 page

### Step 2: Add Catch-All Route
**File**: `src/routes/router.tsx`

Add a catch-all route (`*`) that:
- If authenticated → Navigate to `/dashboards`
- If not authenticated → Navigate to `/auth/sign-in?redirectTo=<original-path>`

### Step 3: Keep Source Files (DO NOT DELETE)
The demo component files in `src/app/(admin)/base-ui/`, `src/app/(admin)/forms/`, etc. will be KEPT.

Rationale: These are Darkone reference components needed for 1:1 parity. They are just unregistered from the router, not deleted.

### Step 4: Create Post-Implementation Restore Point
**File**: `Project Restore Points/RP-P2C-routes-post.md`

---

## Files Changed Summary

| File | Action | Change |
|------|--------|--------|
| `src/routes/index.tsx` | MODIFY | Remove 39 demo routes from appRoutes |
| `src/routes/router.tsx` | MODIFY | Add catch-all route handler |
| `src/assets/data/menu-items.ts` | NO CHANGE | Already RVM-only |
| `Project Restore Points/RP-P2C-routes-pre.md` | CREATE | Pre-implementation snapshot |
| `Project Restore Points/RP-P2C-routes-post.md` | CREATE | Post-implementation snapshot |

---

## Technical Details

### Updated `src/routes/index.tsx` Structure

```text
KEEP:
- Dashboards lazy import
- RVM Core Routes lazy imports (DossierList, DossierDetail, etc.)
- AuthSignIn lazy import
- ErrorAlt lazy import (for 404)
- initialRoutes (root redirect)
- generalRoutes (dashboards)
- rvmRoutes
- authRoutes

REMOVE:
- All base-ui lazy imports (21)
- All forms lazy imports (5)
- Apex, GoogleMaps, VectorMaps imports
- BasicTable, GridjsTable imports
- BoxIcons, SolarIcons imports
- Layout demo imports (5)
- baseUIRoutes array
- formsRoutes array
- chartsMapsRoutes array (except ErrorAlt)
- tableRoutes array
- iconRoutes array
- layoutsRoutes array
```

### Catch-All Route Logic

```typescript
// In router.tsx - add after protected routes
<Route
  path="*"
  element={
    isAuthenticated ? (
      <Navigate to="/dashboards" replace />
    ) : (
      <Navigate
        to={{
          pathname: '/auth/sign-in',
          search: `redirectTo=${window.location.pathname}`,
        }}
        replace
      />
    )
  }
/>
```

---

## Verification Matrix

After implementation, test these scenarios:

| # | URL | Expected Behavior |
|---|-----|-------------------|
| 1 | `/auth/sign-in` (direct) | Shows sign-in page |
| 2 | `/auth/sign-in?redirectTo=/dashboards` | Login redirects to /dashboards |
| 3 | `/dashboards` (direct, authenticated) | Shows dashboard |
| 4 | `/base-ui/buttons` (demo route) | Redirects to /dashboards (if auth) or /auth/sign-in (if not) |
| 5 | `/forms/basic` (demo route) | Same redirect behavior |
| 6 | `/nonexistent-route` | Same redirect behavior |
| 7 | Refresh on `/dashboards` | Session persists |

Test on both:
- `rvmams.lovable.app`
- `preview--rvmams.lovable.app`

---

## Governance Compliance

| Rule | Status |
|------|--------|
| Darkone 1:1 parity | Compliant - Source files kept, just unregistered |
| No UI styling changes | Compliant |
| No new features | Compliant |
| No database/RLS changes | Compliant |
| No fake backend files | Compliant |
| Restore points created | Will create pre/post |

---

## Documentation Updates

No `/docs/backend.md` or `/docs/architecture.md` files exist. If needed, can document changes in:
- `Project Docs/AMS-RVM/` directory (existing documentation location)

---

## Expected Deliverable

After implementation:
1. Only 8 routes registered (/, /dashboards, /rvm/*, /auth/sign-in, *)
2. All demo routes return 404/redirect behavior
3. Menu unchanged (already RVM-only)
4. Verification matrix passes on live + preview
