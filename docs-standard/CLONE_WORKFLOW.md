# How to Clone for New Projects

> **Purpose**: Step-by-step workflow for creating new Devmart projects from the Darkone Admin Standard baseline.

---

## Overview

This document provides the complete workflow for cloning this standardized baseline to start a new project while maintaining Darkone patterns and Guardian Rules.

---

## Clone Steps

### Option 1: Clone from Standardized Tag (Recommended)

```sh
# Clone from the standardized tag
git clone --branch darkone-admin-standard-v1.0 <REPO_HTTPS_URL> <new-project-name>

# Navigate to project
cd <new-project-name>

# Install dependencies
npm install

# Start development
npm run dev
```

> **Note**: Use the GitHub HTTPS URL of this repository as `<REPO_HTTPS_URL>`.

### Option 2: Clone from Latest Main

```sh
# Clone latest main branch
git clone <REPO_HTTPS_URL> <new-project-name>

# Navigate to project
cd <new-project-name>

# Install dependencies
npm install

# Start development
npm run dev
```

### Option 3: Fresh Git History (New Project)

```sh
# Clone the repository
git clone --branch darkone-admin-standard-v1.0 <REPO_HTTPS_URL> <new-project-name>

# Navigate to project
cd <new-project-name>

# Remove existing git history
rm -rf .git

# Initialize fresh repository
git init

# Create initial commit
git add .
git commit -m "Initial commit from Darkone Admin Standard v1.0"

# Install dependencies
npm install

# Start development
npm run dev
```

---

## Rename Project Steps

After cloning, rename the project for your specific use case:

### 1. Update package.json

Edit the `name` field in `package.json`:

```json
{
  "name": "your-project-name",
  ...
}
```

### 2. Update index.html Title (Optional)

Edit the `<title>` tag in `index.html`:

```html
<title>Your Project Name</title>
```

### 3. Update Application Title (Optional)

If the application displays a title in the UI, locate and update it in the relevant component or context.

---

## Replace Branding Steps

Replace the following assets with your project branding:

| Asset | Location | Dimensions | Notes |
|-------|----------|------------|-------|
| Logo (dark) | `src/assets/images/logo-dark.png` | Match original | For light backgrounds |
| Logo (light) | `src/assets/images/logo-light.png` | Match original | For dark backgrounds |
| Logo (small) | `src/assets/images/logo-sm.png` | Match original | Collapsed sidebar icon |
| Favicon | `public/favicon.ico` | 32x32 or 16x16 | Browser tab icon |

### Branding Checklist

- [ ] Logo (dark) replaced
- [ ] Logo (light) replaced
- [ ] Logo (small) replaced
- [ ] Favicon replaced
- [ ] Verify logos display correctly in sidebar
- [ ] Verify favicon appears in browser tab

---

## What Must Remain Darkone-Pure

These elements are the foundation of the Darkone template and **must not be modified**:

### SCSS Structure

| Path | Reason |
|------|--------|
| `src/assets/scss/structure/` | Core layout styles |
| `src/assets/scss/components/` | Component styling patterns |
| `src/assets/scss/config/` | Theme configuration |
| `src/assets/scss/custom/` | Custom overrides (use sparingly) |

### Bootstrap Usage

- Do not extend Bootstrap components
- Do not override Bootstrap classes
- Do not add custom Bootstrap variables
- Use React Bootstrap components as-is

### Icon System

- Use **Iconify** exclusively
- Do not add Font Awesome, Heroicons, or other icon libraries
- Reference existing icon usage patterns in components

### Layout Components

| Component | Path | Status |
|-----------|------|--------|
| Topbar | `src/layouts/Topbar/` | Fixed - do not modify |
| Sidebar | `src/layouts/LeftSidebar/` | Fixed - do not modify |
| Footer | `src/layouts/Footer.tsx` | Fixed - do not modify |
| AdminLayout | `src/layouts/AdminLayout.tsx` | Fixed - do not modify |

### Other Protected Elements

- PageTitle component usage pattern
- Card component patterns
- Table component patterns
- Form component patterns

---

## Guardian Rules Reminder

All new development must follow these non-negotiable rules:

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **No Custom UI** | Use only existing Darkone components | Do not create new base components |
| **No Custom Bootstrap** | Do not extend or override Bootstrap | Use React Bootstrap as-is |
| **No Custom Icons** | Use Iconify with existing icon sets only | No new icon libraries |
| **No New SCSS Files** | Add styles within existing structure | Modify existing files only |
| **No Layout Changes** | Topbar, sidebar, footer are fixed | Structure is immutable |

---

## Project Auth Integration (Conceptual)

When ready to implement real authentication, here is the conceptual approach:

### Current State

- **Location**: `src/context/useAuthContext.tsx`
- **Type**: Mock authentication with local storage
- **Flow**: Login form → Mock validation → Dashboard redirect

### Integration Points

| File | Purpose |
|------|---------|
| `src/context/useAuthContext.tsx` | Replace mock methods with real auth provider |
| `src/routes/router.tsx` | Protected route configuration |
| `src/app/(other)/auth/` | Auth page components |

### Conceptual Steps (Not Implementation)

1. Choose auth provider (Supabase, Auth0, Firebase, etc.)
2. Install provider SDK
3. Replace mock methods in `useAuthContext.tsx`
4. Update environment variables
5. Test full auth flow

> **Note**: This is conceptual guidance only. Actual implementation requires separate authorization and planning.

---

## How to Enable New Modules Safely

Follow these steps to add new functionality while respecting Guardian Rules:

### Step 1: Plan the Module

Before coding, document:
- Module purpose and user stories
- Required routes and navigation structure
- Components needed (using existing Darkone patterns)
- Data requirements

### Step 2: Create Route Structure

Add new routes in `src/app/(admin)/`:

```
src/app/(admin)/
├── your-module/
│   ├── page.tsx          # Main module page
│   ├── SubPage/
│   │   └── page.tsx      # Sub-page if needed
│   └── components/       # Module-specific components
```

### Step 3: Update Navigation

Edit `src/assets/data/menu-items.ts` to add menu items:

```typescript
{
  key: 'your-module',
  label: 'Your Module',
  icon: 'ri:your-icon-line', // Use Iconify icon
  url: '/your-module',
  parentKey: 'menu', // or appropriate parent
}
```

### Step 4: Replace Coming Soon Placeholders

Locate the relevant Coming Soon component and replace with your implementation:

```tsx
// Before
import { ComingSoon } from '@/components/ComingSoon';

const YourPage = () => <ComingSoon />;

// After
import { PageTitle } from '@/components/PageTitle';
import { Card } from 'react-bootstrap';

const YourPage = () => (
  <>
    <PageTitle title="Your Page" />
    <Card>
      {/* Your content using Darkone patterns */}
    </Card>
  </>
);
```

### Step 5: Follow Component Patterns

Use established Darkone patterns:

```tsx
// Standard page structure
import { PageTitle } from '@/components/PageTitle';
import { Card, Row, Col } from 'react-bootstrap';

const ModulePage = () => {
  return (
    <>
      <PageTitle title="Module Title" />
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <Card.Title>Section Title</Card.Title>
            </Card.Header>
            <Card.Body>
              {/* Content */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
```

---

## Module Creation Checklist

Use this checklist for every new module:

### Planning
- [ ] Module purpose documented
- [ ] Route structure planned
- [ ] Navigation updates identified
- [ ] Components identified (existing patterns only)

### Implementation
- [ ] Uses existing Darkone components only
- [ ] No new SCSS files created
- [ ] No Bootstrap extensions
- [ ] No new icon libraries added
- [ ] No layout modifications
- [ ] PageTitle used correctly

### Verification
- [ ] Navigation displays correctly
- [ ] Page renders without errors
- [ ] Responsive design works
- [ ] No console errors
- [ ] Guardian Rules verified

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [Release Tag Guide](./RELEASE_TAG_GUIDE.md) | How to create release tags |
| [README](../README.md) | Project overview and usage |
| [Asset Map](../DARKONE_ASSET_MAP.md) | Complete asset inventory |
| [Standardization Plan](./DARKONE_STANDARDIZATION_PLAN.md) | Project structure decisions |
