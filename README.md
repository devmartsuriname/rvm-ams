# Devmart Darkone Admin Standard

> **A clean, standardized Darkone 1:1 admin template baseline for Devmart projects**

| Status | Version | Last Updated |
|--------|---------|--------------|
| ✅ Standardized | 1.0 | 2026-01-06 |

---

## What This Repo IS and IS NOT

| This Repo IS | This Repo IS NOT |
|--------------|------------------|
| A standardized Darkone admin baseline | A finished production application |
| A clean starting point for new projects | A customization playground |
| A reference for Darkone patterns | A place for experimental features |
| A source of truth for admin structure | A demo/showcase site |

---

## Current Baseline State

This section documents the **deliberate baseline behavior** of this repository:

| Area | State | Purpose |
|------|-------|---------|
| **Dashboard** | Original Darkone demo dashboard with KPI cards, charts, and widgets | Provides working reference for chart/widget patterns |
| **Navigation** | Simplified to Dashboard + Authentication only | Removes demo clutter from baseline |
| **Admin Routes** | All non-dashboard routes display "Coming Soon" placeholder | Clean slate for real module development |
| **Authentication** | Login, Sign Up, Reset Password, Lock Screen fully functional | End-to-end auth flow works (Login → Dashboard) |

**Why This Baseline?**
- Ensures clean project clones without demo content confusion
- Preserves dashboard as a pattern reference for charts and widgets
- Provides clear extension points for real project modules

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Build Tool | Vite | 5.4.19 |
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.8.3 |
| UI Framework | Bootstrap | 5.3.3 |
| React UI | React Bootstrap | 2.10.10 |
| Styling | SCSS (sass) | 1.95.0 |
| CSS Utility | Tailwind CSS | 3.4.17 |
| Icons | Iconify React | 5.2.1 |
| Charts | ApexCharts | 4.7.0 |
| Maps | JSVectorMap | 1.3.2 |
| Fonts | Play | Google Fonts CDN |

---

## Project Structure

```
/
├── src/                          # Active application root
│   ├── app/                      # Route-based pages
│   │   ├── (admin)/              # Admin dashboard pages
│   │   └── (other)/              # Auth & error pages
│   ├── assets/                   # Static assets (images, SCSS, data)
│   ├── components/               # Reusable components
│   ├── context/                  # React contexts (auth, theme)
│   ├── helpers/                  # Helper functions
│   ├── hooks/                    # Custom React hooks
│   ├── layouts/                  # Page layout wrappers
│   ├── routes/                   # Router configuration
│   ├── types/                    # TypeScript declarations
│   └── utils/                    # Utility functions
├── docs-standard/                # Standardization documentation
├── archive/                      # Legacy reference (do not use)
├── DARKONE_ASSET_MAP.md          # Asset governance document
└── README.md                     # This file
```

---

## Usage Rules - Cloning for New Projects

### Step 1: Clone the Repository

```sh
git clone <REPO_URL> <NEW_PROJECT_NAME>
cd <NEW_PROJECT_NAME>
```

> **Note**: Use the GitHub HTTPS URL of this repository as `<REPO_URL>`.

### Step 2: Install Dependencies

```sh
npm install
```

### Step 3: Start Development Server

```sh
npm run dev
```

### Step 4: Customize for Your Project

1. Update project name in `package.json`
2. Replace logo files in `src/assets/images/`
3. Update theme colors in `src/assets/scss/config/_variables.scss` (use existing token names)
4. Add real modules to replace "Coming Soon" placeholders
5. Update navigation in `src/assets/data/menu-items.ts`

---

## Customization Guidelines

### Parts That MAY Be Customized Per Project

| Area | Location | What to Change |
|------|----------|----------------|
| Branding | `src/assets/images/logo-*.png` | Replace with project logos |
| Colors | `src/assets/scss/config/_variables.scss` | Update theme colors (use existing token names) |
| Dashboard | `src/app/(admin)/dashboards/` | Replace with real project data/widgets |
| Menu Items | `src/assets/data/menu-items.ts` | Add real navigation items |
| Page Content | `src/app/(admin)/*/page.tsx` | Replace ComingSoon with real features |

### Parts That MUST Remain Darkone-Pure

| Area | Location | Rule |
|------|----------|------|
| SCSS Structure | `src/assets/scss/structure/` | Do NOT modify layout SCSS |
| Component SCSS | `src/assets/scss/components/` | Do NOT add custom component styles |
| Bootstrap Usage | All components | Use existing Bootstrap patterns only |
| Icon System | `src/components/wrapper/IconifyIcon.tsx` | Do NOT add new icon libraries |
| Layout Components | `src/layouts/` | Do NOT create new layout patterns |
| Page Wrapper | `src/components/PageTitle.tsx` | Use as-is for all pages |

---

## Guardian Rules Summary

These rules are **NON-NEGOTIABLE** for any work on this baseline:

| Rule | Description |
|------|-------------|
| **No Custom UI** | Use only existing Darkone components and patterns |
| **No Custom Bootstrap** | Do not extend or override Bootstrap behavior |
| **No Custom Icons** | Use only Iconify with existing icon sets (bx:*, solar:*, mingcute:*) |
| **No New SCSS Files** | Add styles only within existing SCSS structure |
| **No Layout Changes** | Topbar, sidebar, footer structure is fixed |
| **Documentation First** | Document changes before implementing |
| **Approval Required** | Major changes require explicit approval |

---

## Extension Strategy - Adding New Modules

### How to Add a New Admin Module

**1. Plan the Module**
- Document purpose and scope
- Identify which existing Darkone patterns to use
- Map required routes

**2. Create Route Structure**
- Add directory in `src/app/(admin)/your-module/`
- Create `page.tsx` using existing component patterns

**3. Update Navigation**
- Add menu item to `src/assets/data/menu-items.ts`
- Follow existing menu structure (key, label, icon, url/children)

**4. Replace "Coming Soon" Placeholder**
- Remove `ComingSoon` component import
- Add real module content using Darkone components

### Component Usage Pattern

```tsx
import { Card, Col, Row } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

const YourModulePage = () => {
  return (
    <>
      <PageTitle subName="Your Category" title="Module Name" />
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Section Title</h5>
            </Card.Header>
            <Card.Body>
              {/* Your content using Darkone patterns */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default YourModulePage
```

---

## Demo Routes Replacement Guide

Current "Coming Soon" routes to replace with real modules:

| Route Category | Count | Recommended Action |
|----------------|-------|-------------------|
| Base UI (`/base-ui/*`) | 21 | Replace with project-specific UI pages or remove |
| Forms (`/forms/*`) | 5 | Replace with real form implementations |
| Tables (`/tables/*`) | 2 | Replace with real data tables |
| Charts (`/apex-chart`) | 1 | Replace with project-specific dashboards |
| Maps (`/maps/*`) | 2 | Replace with project-specific maps or remove |
| Icons (`/icons/*`) | 2 | Remove (reference only) |

---

## Future Integration Notes

### Supabase Auth Integration (Conceptual)

When ready to integrate Supabase authentication:

| Aspect | Detail |
|--------|--------|
| **Location** | `src/context/useAuthContext.tsx` |
| **Current State** | Local mock authentication |
| **Integration Points** | Replace mock login/signup with Supabase methods |
| **Status** | Conceptual only - not implemented |

**Note**: This is documentation only. No Supabase integration is currently implemented or authorized.

---

## Documentation References

| Document | Location | Purpose |
|----------|----------|---------|
| Asset Map | `/DARKONE_ASSET_MAP.md` | Complete asset inventory and governance |
| Standardization Plan | `/docs-standard/DARKONE_STANDARDIZATION_PLAN.md` | Project structure decisions |
| Standardization Tasks | `/docs-standard/DARKONE_STANDARDIZATION_TASKS.md` | Execution history and phase status |
| Archive README | `/archive/README.md` | Legacy folder documentation |

---

## Quick Start Commands

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## License

This is a standardized baseline derived from the Darkone admin template. Refer to original Darkone license terms for usage rights.
