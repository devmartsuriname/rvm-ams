# Technical Architecture Document
## AMS – RVM Core (v1)

---

## 1. Document Purpose

This document translates the high-level **System Architecture – AMS RVM Core v1** into **Lovable-specific technical specifications** including:
- Component structure mapping
- State management patterns
- API design patterns
- Integration specifications

**Source Authority:**
- `system_architecture_ams_rvm_core_v_1.md`
- `erd_ams_rvm_core_v_1.md`
- `rls_role_matrix_ams_rvm_core_v_1.md`

**Scope Expansion:** None. This document provides implementation detail only.

---

## 2. Technology Stack

### 2.1 Frontend
- **Framework:** React 18+ (Vite)
- **UI Framework:** Darkone Admin Template (React Bootstrap + shadcn/ui)
- **Styling:** Tailwind CSS + SCSS (Darkone theme)
- **State Management:** React Query (TanStack Query) + React Context
- **Routing:** React Router DOM v6
- **Forms:** React Hook Form + Zod validation

### 2.2 Backend (External Supabase)
- **Database:** PostgreSQL (External Supabase — managed Supabase project)
- **Authentication:** Supabase Auth (email/password)
- **API:** Supabase Client (auto-generated from schema)
- **Storage:** Supabase Storage (documents)
- **Edge Functions:** Supabase Edge Functions (if required)

### 2.3 Development
- **Build:** Vite
- **Language:** TypeScript (strict mode)
- **Linting:** ESLint
- **Package Manager:** Bun

---

## 3. Architecture Layers (Lovable Implementation)

### 3.1 Presentation Layer

**Component Structure:**
```
src/
├── app/
│   └── (admin)/
│       └── rvm/
│           ├── dossiers/
│           │   ├── page.tsx              # Dossier list
│           │   ├── [id]/page.tsx         # Dossier detail
│           │   └── components/
│           │       ├── DossierList.tsx
│           │       ├── DossierForm.tsx
│           │       └── DossierDetail.tsx
│           ├── meetings/
│           │   ├── page.tsx
│           │   ├── [id]/page.tsx
│           │   └── components/
│           ├── decisions/
│           │   └── components/
│           ├── tasks/
│           │   └── components/
│           ├── documents/
│           │   └── components/
│           └── dashboards/
│               ├── chair/page.tsx
│               └── secretary/page.tsx
├── components/
│   └── rvm/                              # Shared RVM components
│       ├── StatusBadge.tsx
│       ├── UrgencyIndicator.tsx
│       ├── RoleGuard.tsx
│       └── AuditTrail.tsx
└── layouts/
    └── AdminLayout.tsx                   # Darkone layout (existing)
```

### 3.2 Application Layer

**Hooks Structure:**
```
src/hooks/
├── rvm/
│   ├── useDossiers.ts                    # Dossier CRUD operations
│   ├── useDossier.ts                     # Single dossier operations
│   ├── useMeetings.ts                    # Meeting operations
│   ├── useAgendaItems.ts                 # Agenda management
│   ├── useDecisions.ts                   # Decision operations
│   ├── useTasks.ts                       # Task operations
│   ├── useDocuments.ts                   # Document operations
│   └── useAudit.ts                       # Audit log access
└── auth/
    ├── useAuth.ts                        # Authentication
    └── useRole.ts                        # Role checking
```

**Services Structure:**
```
src/services/
├── rvm/
│   ├── dossierService.ts
│   ├── meetingService.ts
│   ├── decisionService.ts
│   ├── taskService.ts
│   └── documentService.ts
└── api/
    └── supabaseClient.ts                 # Configured Supabase client
```

### 3.3 Domain Layer

**Types Structure:**
```
src/types/
├── rvm/
│   ├── dossier.ts                        # Dossier types + enums
│   ├── meeting.ts                        # Meeting types + enums
│   ├── decision.ts                       # Decision types + enums
│   ├── task.ts                           # Task types + enums
│   ├── document.ts                       # Document types + enums
│   └── audit.ts                          # Audit event types
├── auth/
│   ├── user.ts                           # User types
│   └── role.ts                           # Role types + codes
└── database.ts                           # Generated Supabase types
```

### 3.4 Data Layer

**Database Access Pattern:**
- Direct Supabase client calls via services
- React Query for caching and state synchronization
- RLS enforced at database level (no client-side filtering)

---

## 4. State Management Strategy

### 4.1 Server State (React Query)

All data from Supabase is managed via React Query:

```typescript
// Query Keys Convention
const queryKeys = {
  dossiers: ['rvm', 'dossiers'] as const,
  dossier: (id: string) => ['rvm', 'dossiers', id] as const,
  meetings: ['rvm', 'meetings'] as const,
  decisions: (meetingId: string) => ['rvm', 'decisions', meetingId] as const,
  // ...
}
```

### 4.2 Client State (React Context)

Limited to:
- Current user/role context
- UI state (sidebar, modals)
- Form state (React Hook Form)

### 4.3 Auth Context

```typescript
interface AuthContext {
  user: AppUser | null;
  roles: RoleCode[];
  hasRole: (role: RoleCode) => boolean;
  isChairRVM: boolean;
  isSecretaryRVM: boolean;
  // ...
}
```

---

## 5. Security Implementation

### 5.1 Authentication Flow

1. User navigates to `/auth/sign-in`
2. Email/password submitted to Supabase Auth
3. Session established (JWT token)
4. User profile + roles fetched from `app_user` + `user_role`
5. AuthContext populated
6. Redirect to dashboard based on primary role

### 5.2 Authorization Pattern

**Route Guards:**
```typescript
// RoleGuard component wraps protected routes
<RoleGuard allowedRoles={['chair_rvm', 'secretary_rvm']}>
  <DecisionApprovalPage />
</RoleGuard>
```

**RLS Enforcement:**
- All database queries filtered by RLS policies
- No client-side role filtering for security
- Client-side guards are UX-only (RLS is the true gate)

### 5.3 Role Hierarchy

No inheritance. Roles are independent:
- `chair_rvm` - Decision approval only
- `secretary_rvm` - Full operational authority
- `admin_*` - Task-specific permissions
- `audit_readonly` - Read-only access

---

## 6. API Design Patterns

### 6.1 Supabase Client Configuration

```typescript
// src/services/api/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### 6.2 Service Pattern

```typescript
// src/services/rvm/dossierService.ts
export const dossierService = {
  async getAll(filters?: DossierFilters) {
    const query = supabase
      .from('rvm_dossier')
      .select('*, rvm_item(*), missive_keyword(*)');
    
    // Apply filters...
    return query;
  },
  
  async getById(id: string) {
    return supabase
      .from('rvm_dossier')
      .select('*, rvm_item(*), rvm_task(*), rvm_document(*)')
      .eq('id', id)
      .single();
  },
  
  async create(data: DossierInsert) {
    return supabase.from('rvm_dossier').insert(data).select().single();
  },
  
  // ...
};
```

### 6.3 Hook Pattern

```typescript
// src/hooks/rvm/useDossiers.ts
export function useDossiers(filters?: DossierFilters) {
  return useQuery({
    queryKey: ['rvm', 'dossiers', filters],
    queryFn: () => dossierService.getAll(filters),
  });
}

export function useCreateDossier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dossierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rvm', 'dossiers'] });
    },
  });
}
```

---

## 7. Storage Integration (DMS-Light)

### 7.1 Bucket Structure

```
rvm-documents/
├── dossiers/
│   └── {dossier_id}/
│       └── {document_id}/
│           └── v{version_number}_{filename}
└── reports/
    └── {meeting_id}/
        └── decision_list_{date}.pdf
```

### 7.2 Upload Pattern

```typescript
async function uploadDocument(
  dossierId: string,
  documentId: string,
  file: File,
  versionNumber: number
) {
  const path = `dossiers/${dossierId}/${documentId}/v${versionNumber}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('rvm-documents')
    .upload(path, file);
  
  return { path, error };
}
```

---

## 8. Audit Implementation

### 8.1 Audit Event Creation

Audit events are created via database triggers (preferred) or application-level:

```typescript
async function logAuditEvent(
  entityType: string,
  entityId: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  await supabase.from('audit_event').insert({
    entity_type: entityType,
    entity_id: entityId,
    event_type: eventType,
    event_payload: payload,
    actor_user_id: getCurrentUserId(),
    actor_role_code: getCurrentRoleCode(),
    occurred_at: new Date().toISOString(),
  });
}
```

### 8.2 Trigger-Based Audit (Preferred)

```sql
-- Example: Trigger for dossier status changes
CREATE OR REPLACE FUNCTION log_dossier_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_event (
      entity_type, entity_id, event_type, event_payload,
      actor_user_id, occurred_at
    ) VALUES (
      'rvm_dossier', NEW.id, 'status_changed',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status),
      auth.uid(), NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 9. Darkone Integration Points

### 9.1 Layout Reuse

- `AdminLayout.tsx` - Primary layout (unchanged)
- `TopNavigationBar` - User profile, notifications (extended)
- `VerticalNavigationBar` - RVM menu items (extended)

### 9.2 Component Reuse

From Darkone:
- Cards, Tables, Forms, Modals
- Dropdowns, Badges, Alerts
- Date pickers, File uploads

### 9.3 Menu Structure Addition

```typescript
// New menu items for RVM
{
  key: 'rvm',
  label: 'RVM Core',
  icon: 'solar:document-text-bold',
  children: [
    { key: 'dossiers', label: 'Dossiers', url: '/rvm/dossiers' },
    { key: 'meetings', label: 'Meetings', url: '/rvm/meetings' },
    { key: 'tasks', label: 'Tasks', url: '/rvm/tasks' },
    { key: 'reports', label: 'Reports', url: '/rvm/reports' },
    { key: 'dashboard', label: 'Dashboard', url: '/rvm/dashboard' },
  ]
}
```

---

## 10. Document Status

**Status:** Technical Architecture v1
**Source Compliance:** 100% aligned with System Architecture doc
**Scope Expansion:** None
