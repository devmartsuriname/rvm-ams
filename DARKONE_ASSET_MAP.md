# Darkone Asset Governance Map

> **Document Version**: 1.0  
> **Created**: Phase 2 - Asset Governance  
> **Status**: COMPLETE  
> **Last Updated**: 2026-01-06

---

## 1. Purpose & Governance Rules

### Single Source of Truth Policy
- All assets exist in ONE canonical location only
- `/src/assets/` is the authoritative asset root
- `Darkone-React_v1.0/` assets are NOT referenced (legacy/archive)

### No Duplication Policy
- Assets must not be duplicated across folders
- Before adding new assets, check this document
- Duplicates must be documented and flagged for cleanup

### Naming Conventions
- Images: kebab-case (e.g., `logo-dark.png`, `avatar-1.jpg`)
- SCSS files: underscore prefix for partials (e.g., `_variables.scss`)
- Components: PascalCase (e.g., `IconifyIcon.tsx`)

### Asset Addition Process
1. Check this map for existing similar assets
2. Add to appropriate Darkone-native folder
3. Update this document with new asset entry
4. Update component imports to use centralized path

---

## 2. Asset Inventory

### 2.1 Images

| Location | File | Classification | Usage |
|----------|------|----------------|-------|
| `/src/assets/images/` | `logo-dark.png` | CORE | Brand logo (dark theme) |
| `/src/assets/images/` | `logo-light.png` | CORE | Brand logo (light theme) |
| `/src/assets/images/` | `logo-sm.png` | CORE | Small/collapsed sidebar logo |
| `/src/assets/images/` | `favicon.ico` | CORE | Browser tab icon |
| `/src/assets/images/` | `404.svg` | CORE | Error page illustration |
| `/src/assets/images/` | `maintenance.svg` | CORE | Maintenance page illustration |
| `/src/assets/images/` | `bg-pattern.svg` | CORE | Background decorative pattern |
| `/src/assets/images/` | `bg-pattern-1.png` | CORE | Alternative background pattern |
| `/src/assets/images/users/` | `avatar-1.jpg` to `avatar-10.jpg` | DEMO | User avatar placeholders (10 files) |
| `/src/assets/images/small/` | `img-1.jpg` to `img-10.jpg` | DEMO | Thumbnail/card images (10 files) |
| `/src/assets/images/brands/` | `bitbucket.svg`, `dribbble.svg`, `dropbox.svg`, `github.svg`, `slack.svg` | DEMO | Brand/integration logos (5 files) |

---

### 2.2 Icons

| Library | Package | Loading Method | Primary Usage |
|---------|---------|----------------|---------------|
| Iconify | `@iconify/react` | React component | Primary icon system |
| Boxicons | Via Iconify `bx:*` prefix | Iconify integration | UI elements, buttons |
| Solar Icons | Via Iconify `solar:*` prefix | Iconify integration | Dashboard cards, widgets |
| Mingcute | Via Iconify `mingcute:*` prefix | Iconify integration | Menu icons, navigation |

**Icon Wrapper Component**: `src/components/wrapper/IconifyIcon.tsx`

**Legacy Boxicons SCSS**: `src/assets/scss/icons/_boxicons.scss` (7028 lines) - LEGACY, not actively used

---

### 2.3 Fonts

| Font Family | Source | Weights | Usage |
|-------------|--------|---------|-------|
| Play | Google Fonts CDN | 400, 700 | Primary UI font |

**Loading**: `src/assets/scss/config/_variables.scss` line 5

---

### 2.4 Charts (ApexCharts)

| Package | Config Location |
|---------|-----------------|
| `apexcharts` | Inline in components |
| `react-apexcharts` | Inline in components |

**Chart Components**:

| File | Classification |
|------|----------------|
| `src/app/(admin)/dashboards/components/Cards.tsx` | CORE |
| `src/app/(admin)/dashboards/components/Chart.tsx` | CORE |
| `src/app/(admin)/dashboards/components/SaleChart.tsx` | CORE |
| `src/app/(admin)/apex-chart/component/AllApexChart.tsx` | DEMO |

**Chart Styling**: `src/assets/scss/plugins/_apexcharts.scss`

---

### 2.5 Maps (JSVectorMap)

| Package | Data Source |
|---------|-------------|
| `jsvectormap` | Built-in map data |

**Map Components**:

| File | Classification |
|------|----------------|
| `src/components/VectorMap/WorldMap.tsx` | CORE |
| `src/components/VectorMap/BaseVectorMap.tsx` | CORE |
| `src/components/VectorMap/CanadaMap.tsx` | DEMO |
| `src/components/VectorMap/RussiaMap.tsx` | DEMO |
| `src/components/VectorMap/SpainMap.tsx` | DEMO |
| `src/components/VectorMap/IraqVectorMap.tsx` | DEMO |

**Map Styling**: `src/assets/scss/plugins/_vector-map.scss`

---

### 2.6 SCSS Tokens / Variables

#### Config (3 files)
| File | Responsibility |
|------|----------------|
| `_variables.scss` | Master variables (1796 lines) |
| `_variables-dark.scss` | Dark theme overrides |
| `_theme-mode.scss` | Theme switching logic |

#### Structure (5 files)
| File | Purpose |
|------|---------|
| `_general.scss` | Base layout |
| `_topbar.scss` | Top navigation |
| `_sidebar.scss` | Side navigation |
| `_footer.scss` | Footer layout |
| `_page-title.scss` | Page header/breadcrumb |

#### Components (24 files)
All Bootstrap component overrides in `src/assets/scss/components/`

#### Plugins (8 files)
| File | Classification |
|------|----------------|
| `_apexcharts.scss` | CORE |
| `_simplebar.scss` | CORE |
| `_vector-map.scss` | CORE |
| `_dropzone.scss` | DEMO |
| `_editors.scss` | DEMO |
| `_flatpicker.scss` | DEMO |
| `_google-map.scss` | DEMO |
| `_gridjs.scss` | DEMO |

#### Pages (2 files)
| File | Classification |
|------|----------------|
| `_authentication.scss` | CORE |
| `_icon-demo.scss` | DEMO |

---

## 3. Route-to-Asset Mapping

| Route | Images | Icons | Charts | Maps |
|-------|--------|-------|--------|------|
| `/dashboards` | avatar-2 to avatar-6 | solar:*, mingcute:* | ApexCharts | WorldVectorMap |
| `/auth/sign-in` | logo-dark, logo-light | — | — | — |
| `/auth/sign-up` | logo-dark, logo-light | — | — | — |
| `/auth/reset-password` | logo-dark, logo-light | — | — | — |
| `/auth/lock-screen` | logo-dark, logo-light | — | — | — |
| `/error-pages/pages-404` | 404.svg, logos | — | — | — |
| `/apex-chart` | — | — | AllApexChart | — |
| `/maps/vector` | — | — | — | All maps |
| `/base-ui/*` | Various | bx:* | — | — |
| `/tables/*` | Avatars | bx:* | — | — |
| `/icons/*` | — | All icons | — | — |

---

## 4. Core vs Demo Classification

### CORE Assets (Must Never Remove)

**Images**: logo-dark.png, logo-light.png, logo-sm.png, favicon.ico, 404.svg, maintenance.svg, bg-pattern.svg, bg-pattern-1.png

**SCSS**: All config/*, structure/*, components/*, plus _apexcharts.scss, _simplebar.scss, _vector-map.scss, _authentication.scss

**Components**: IconifyIcon.tsx, LogoBox.tsx, BaseVectorMap.tsx, WorldVectorMap.tsx, Dashboard chart components

### DEMO Assets (Eligible for Cleanup After Approval)

**Images**: users/avatar-*.jpg (10), small/img-*.jpg (10), brands/*.svg (5)

**SCSS**: _dropzone.scss, _editors.scss, _flatpicker.scss, _google-map.scss, _gridjs.scss, _icon-demo.scss, _boxicons.scss (legacy)

**Components**: CanadaMap, RussiaMap, SpainMap, IraqVectorMap, AllApexChart.tsx

---

## 5. Centralization Status

### Current State: ✅ ALREADY CENTRALIZED

All assets are in Darkone-native locations:
- Images: `src/assets/images/`
- SCSS: `src/assets/scss/`
- Data: `src/assets/data/`
- VectorMaps: `src/components/VectorMap/`
- Wrappers: `src/components/wrapper/`

### Duplicate Check Result: ✅ NO DUPLICATES IN `/src`

No duplicate assets were found within the active `/src` directory.

### Legacy Folder Status

`Darkone-React_v1.0/src/assets/` contains parallel structure but is NOT referenced by build system. Pending Phase 3 decision.

---

## 6. Archive Candidates

| Asset | Location | Status |
|-------|----------|--------|
| `Darkone-React_v1.0/` | Root | Pending Phase 3 approval |

---

## 7. Phase 2 Verification

- [x] Asset map complete
- [x] Centralization verified (already centralized)
- [x] No code changes made
- [x] No duplicates found in `/src`
- [x] Auth flow intact
- [x] No UI/routing/navigation changes
