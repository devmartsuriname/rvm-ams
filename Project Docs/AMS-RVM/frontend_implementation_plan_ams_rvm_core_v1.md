# Frontend / Admin Implementation Plan
## AMS – RVM Core (v1)

---

## 1. Document Purpose

This document defines the **UI implementation order**, **component inventory**, and **Darkone mapping** for AMS – RVM Core (v1).

**Source Authority:**
- `prd_ams_rvm_core_v_1.md`
- `system_architecture_ams_rvm_core_v_1.md`
- `workflow_diagrams_ams_rvm_core_v_1.md`
- Darkone Admin Template (existing codebase)

**Scope Expansion:** None. UI realization of PRD functional requirements only.

---

## 2. Implementation Phases

### Phase 1: Foundation Layer (UI Shell)

**Objective:** Establish navigation structure and authentication UI

**Components:**
| Component | Darkone Mapping | Priority |
|-----------|-----------------|----------|
| RVM Menu Section | `menu-items.ts` extension | High |
| Placeholder Pages | `/app/(admin)/rvm/*` | High |
| Login Page | Existing `/auth/sign-in` | Existing |
| Role-Based Navigation | New `RoleGuard.tsx` | High |

**Routes Created:**
```
/rvm/dossiers          → Placeholder
/rvm/meetings          → Placeholder
/rvm/tasks             → Placeholder
/rvm/reports           → Placeholder
/rvm/dashboard/chair   → Placeholder
/rvm/dashboard/secretary → Placeholder
```

---

### Phase 2: Dossier Management

**Objective:** Core dossier CRUD and classification

**Components:**
| Component | Location | Darkone Base |
|-----------|----------|--------------|
| DossierListPage | `/rvm/dossiers/page.tsx` | DataTables |
| DossierDetailPage | `/rvm/dossiers/[id]/page.tsx` | Card layout |
| DossierForm | `components/rvm/DossierForm.tsx` | Form components |
| IntakeWizard | `components/rvm/IntakeWizard.tsx` | Multi-step form |
| ClassificationSelector | `components/rvm/ClassificationSelector.tsx` | Dropdowns |
| UrgencyBadge | `components/rvm/UrgencyBadge.tsx` | Badge variant |
| StatusBadge | `components/rvm/StatusBadge.tsx` | Badge variant |

**Darkone Components Used:**
- `ComponentContainerCard` → Layout wrapper
- `Form` (React Bootstrap) → Form structure
- `Badge` → Status/urgency display
- `DataTable` (GridJS) → Dossier list
- `Dropdown` → Classification selection
- `Modal` → Confirmations

---

### Phase 3: Task Management

**Objective:** Task assignment and tracking per dossier

**Components:**
| Component | Location | Darkone Base |
|-----------|----------|--------------|
| TaskList | `components/rvm/TaskList.tsx` | List Group |
| TaskCard | `components/rvm/TaskCard.tsx` | Card |
| TaskAssignmentForm | `components/rvm/TaskAssignmentForm.tsx` | Form + Select |
| TaskStatusButton | `components/rvm/TaskStatusButton.tsx` | Button Group |
| OverdueIndicator | `components/rvm/OverdueIndicator.tsx` | Alert variant |
| TaskTimeline | `components/rvm/TaskTimeline.tsx` | Custom |

**Darkone Components Used:**
- `ListGroup` → Task listing
- `Card` → Task detail
- `Button` → Status transitions
- `Select` (React Select) → Role/user assignment
- `Alert` → Overdue warnings
- `Progress` → SLA tracking

---

### Phase 4: Meeting & Agenda

**Objective:** Meeting creation and agenda building

**Components:**
| Component | Location | Darkone Base |
|-----------|----------|--------------|
| MeetingListPage | `/rvm/meetings/page.tsx` | DataTables |
| MeetingDetailPage | `/rvm/meetings/[id]/page.tsx` | Card layout |
| MeetingForm | `components/rvm/MeetingForm.tsx` | Form |
| AgendaBuilder | `components/rvm/AgendaBuilder.tsx` | Sortable List |
| AgendaItemCard | `components/rvm/AgendaItemCard.tsx` | Card |
| DossierSelector | `components/rvm/DossierSelector.tsx` | Search + Select |
| MeetingCalendar | `components/rvm/MeetingCalendar.tsx` | FullCalendar |

**Darkone Components Used:**
- `FullCalendar` → Meeting calendar view
- `Card` → Agenda items
- `Form` → Meeting creation
- `Dropdown` → Meeting type selection
- `Modal` → Agenda item editing
- `Flatpickr` → Date selection

---

### Phase 5: Decision Management

**Objective:** Decision recording with Chair RVM approval

**Components:**
| Component | Location | Darkone Base |
|-----------|----------|--------------|
| DecisionPanel | `components/rvm/DecisionPanel.tsx` | Card |
| DecisionForm | `components/rvm/DecisionForm.tsx` | Form + Editor |
| ApprovalButton | `components/rvm/ApprovalButton.tsx` | Button (Chair only) |
| DecisionStatusBadge | `components/rvm/DecisionStatusBadge.tsx` | Badge |
| ImmutabilityLock | `components/rvm/ImmutabilityLock.tsx` | Icon + Tooltip |
| DecisionHistory | `components/rvm/DecisionHistory.tsx` | Timeline |

**Darkone Components Used:**
- `Card` → Decision container
- `Quill Editor` → Decision text
- `Button` → Approval action
- `Badge` → Status display
- `Tooltip` → Immutability indicator
- `Alert` → Finalization warning

**Special Requirements:**
- Chair RVM approval button only visible to `chair_rvm` role
- Finalized decisions display lock icon
- No edit controls after `is_final = true`

---

### Phase 6: Document Management (DMS-Light)

**Objective:** Document upload, versioning, and linking

**Components:**
| Component | Location | Darkone Base |
|-----------|----------|--------------|
| DocumentList | `components/rvm/DocumentList.tsx` | Table |
| DocumentUpload | `components/rvm/DocumentUpload.tsx` | Dropzone |
| VersionHistory | `components/rvm/VersionHistory.tsx` | Accordion |
| DocumentViewer | `components/rvm/DocumentViewer.tsx` | Modal + iframe |
| ConfidentialityBadge | `components/rvm/ConfidentialityBadge.tsx` | Badge |
| DocumentTypeIcon | `components/rvm/DocumentTypeIcon.tsx` | Icon |

**Darkone Components Used:**
- `Dropzone` → File upload
- `Table` → Document listing
- `Accordion` → Version history
- `Modal` → Document preview
- `Badge` → Confidentiality level
- `IconifyIcon` → Document type icons

---

### Phase 7: Reporting & Dashboards

**Objective:** Decision lists, reports, and role-based dashboards

**Components:**
| Component | Location | Darkone Base |
|-----------|----------|--------------|
| ChairDashboard | `/rvm/dashboard/chair/page.tsx` | Dashboard |
| SecretaryDashboard | `/rvm/dashboard/secretary/page.tsx` | Dashboard |
| DecisionListGenerator | `components/rvm/DecisionListGenerator.tsx` | Form + Preview |
| ReportPreview | `components/rvm/ReportPreview.tsx` | Card |
| DashboardWidget | `components/rvm/DashboardWidget.tsx` | Card + Stats |
| BottleneckAlert | `components/rvm/BottleneckAlert.tsx` | Alert |
| ProcessingMetrics | `components/rvm/ProcessingMetrics.tsx` | Chart |

**Darkone Components Used:**
- `ApexCharts` → Metrics visualization
- `Card` → Widget containers
- `Badge` → Counts and indicators
- `Alert` → Bottleneck warnings
- `Button` → Export actions
- `Modal` → Report preview

---

### Phase 8: Audit & Finalization

**Objective:** Audit log viewer and system verification

**Components:**
| Component | Location | Darkone Base |
|-----------|----------|--------------|
| AuditLogViewer | `/rvm/audit/page.tsx` | DataTables |
| AuditEventCard | `components/rvm/AuditEventCard.tsx` | Card |
| AuditFilters | `components/rvm/AuditFilters.tsx` | Form |
| EntityAuditTrail | `components/rvm/EntityAuditTrail.tsx` | Timeline |

**Darkone Components Used:**
- `DataTable` → Log listing
- `Card` → Event detail
- `Flatpickr` → Date filtering
- `Dropdown` → Entity type filtering
- Custom timeline → Audit trail per entity

---

## 3. Shared Component Inventory

### 3.1 RVM-Specific Components

| Component | Purpose | Reused In |
|-----------|---------|-----------|
| `RoleGuard` | Route/component protection | All pages |
| `StatusBadge` | Dossier/task/meeting status | All lists |
| `UrgencyBadge` | Urgency indicator | Dossier views |
| `ConfidentialityBadge` | Confidentiality level | Documents |
| `UserAvatar` | User display with role | Tasks, audit |
| `AuditTrail` | Entity change history | Detail pages |
| `EmptyState` | No data placeholder | All lists |
| `LoadingState` | Loading indicator | All pages |

### 3.2 Form Components

| Component | Purpose |
|-----------|---------|
| `RoleSelector` | Select from available roles |
| `UserSelector` | Select user (filtered by role) |
| `DossierSelector` | Search and select dossier |
| `MeetingSelector` | Select meeting for scheduling |
| `DateRangePicker` | Date range filtering |
| `ConfirmationModal` | Destructive action confirmation |

---

## 4. Menu Structure

```typescript
// Addition to src/assets/data/menu-items.ts
{
  key: 'rvm-section',
  label: 'RVM Core',
  isTitle: true,
},
{
  key: 'rvm-dossiers',
  label: 'Dossiers',
  icon: 'solar:folder-with-files-bold',
  url: '/rvm/dossiers',
  badge: { variant: 'primary', text: 'New' },
},
{
  key: 'rvm-meetings',
  label: 'Meetings',
  icon: 'solar:calendar-bold',
  url: '/rvm/meetings',
},
{
  key: 'rvm-tasks',
  label: 'Tasks',
  icon: 'solar:checklist-minimalistic-bold',
  url: '/rvm/tasks',
},
{
  key: 'rvm-reports',
  label: 'Reports',
  icon: 'solar:document-text-bold',
  url: '/rvm/reports',
},
{
  key: 'rvm-dashboard',
  label: 'Dashboard',
  icon: 'solar:widget-2-bold',
  children: [
    { key: 'chair-dashboard', label: 'Chair RVM', url: '/rvm/dashboard/chair' },
    { key: 'secretary-dashboard', label: 'Secretary', url: '/rvm/dashboard/secretary' },
  ],
},
{
  key: 'rvm-audit',
  label: 'Audit Log',
  icon: 'solar:history-bold',
  url: '/rvm/audit',
  // Only visible to audit_readonly role
},
```

---

## 5. Responsive Design Requirements

| Breakpoint | Layout Behavior |
|------------|-----------------|
| Desktop (≥1200px) | Full sidebar, multi-column layouts |
| Tablet (768-1199px) | Collapsible sidebar, responsive tables |
| Mobile (<768px) | Bottom navigation, single-column, card-based |

**Critical Mobile Views:**
- Dossier list → Card stack
- Task list → Swipeable cards
- Decision approval → Full-screen modal
- Dashboard → Stacked widgets

---

## 6. Accessibility Requirements

- All interactive elements keyboard accessible
- ARIA labels on custom components
- Color contrast AA compliant
- Screen reader support for status changes
- Focus management in modals

---

## 7. Document Status

**Status:** Frontend Implementation Plan v1
**Source Compliance:** 100% aligned with PRD and Darkone baseline
**Scope Expansion:** None
**Implementation Status:** NOT STARTED (documentation only)
