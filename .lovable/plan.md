

# Phase 8C.1 — Audit Viewer Implementation Plan

## Governance Constraints Confirmed

- No schema changes
- No new RLS policies
- No trigger modifications
- No new dependencies or external libraries
- Backend remains authoritative enforcement layer
- JSON rendering via `<pre>` + `JSON.stringify(payload, null, 2)` only

---

## Column Name Mapping

The `audit_event` table uses these actual column names (not the spec aliases):

| Spec Name | Actual Column | Type |
|-----------|---------------|------|
| actor_id / changed_by | `actor_user_id` | uuid (nullable) |
| action | `event_type` | text |
| payload | `event_payload` | jsonb (nullable) |
| occurred_at | `occurred_at` | timestamptz |
| entity_type | `entity_type` | text |
| entity_id | `entity_id` | uuid |
| (extra) | `actor_role_code` | text (nullable) |

---

## Implementation Steps

### Step 0: Pre-Restore Point
Create `Project Restore Points/RP-P8C1-pre.md` documenting current state.

### Step 1: Add `canViewAudit` to `useUserRoles.ts`
- File: `src/hooks/useUserRoles.ts`
- Add: `canViewAudit: isSuperAdmin || hasRole('audit_readonly')`
- Mirrors RLS policy: `has_role('audit_readonly') OR is_super_admin()`

### Step 2: Create Audit Events Hook
- File: `src/hooks/useAuditEvents.ts` (NEW)
- Query: `supabase.from('audit_event').select('*').order('occurred_at', { ascending: false }).limit(50)`
- No pagination beyond LIMIT 50 (hard cap per governance)
- Optional filters: `entity_type`, `event_type` (applied via `.eq()`)
- Uses TanStack `useQuery` pattern (matches existing hooks)

### Step 3: Create Audit Log Page
- File: `src/app/(admin)/rvm/audit/page.tsx` (NEW)
- Components used: `Card`, `CardBody`, `CardHeader`, `Table`, `Form`, `Row`, `Col` from react-bootstrap (consistent with existing pages)
- Filter row: entity_type dropdown, event_type dropdown
- Table columns: `occurred_at` (formatted date), `entity_type`, `entity_id` (truncated), `event_type`, `actor_user_id` (or "System"), expand toggle
- Expandable row: `<pre>{JSON.stringify(event_payload, null, 2)}</pre>`
- Role gate: Show "Access Denied" if `!canViewAudit`
- Also display `actor_role_code` when available

### Step 4: Register Route
- File: `src/routes/index.tsx`
- Add lazy import for audit page
- Add route: `{ path: '/rvm/audit', name: 'Audit Log', element: <AuditLog /> }`

### Step 5: Add Menu Item
- File: `src/assets/data/menu-items.ts`
- Add under RVM CORE section: `{ key: 'rvm-audit', label: 'Audit Log', icon: 'bx:shield-quarter', url: '/rvm/audit' }`

### Step 6: Post-Restore Point
Create `Project Restore Points/RP-P8C1-post.md` with file list, evidence, and compliance confirmation.

---

## Files Changed (Complete List)

| File | Action |
|------|--------|
| `Project Restore Points/RP-P8C1-pre.md` | CREATE |
| `src/hooks/useUserRoles.ts` | MODIFY (add canViewAudit) |
| `src/hooks/useAuditEvents.ts` | CREATE |
| `src/app/(admin)/rvm/audit/page.tsx` | CREATE |
| `src/routes/index.tsx` | MODIFY (add route) |
| `src/assets/data/menu-items.ts` | MODIFY (add menu entry) |
| `Project Restore Points/RP-P8C1-post.md` | CREATE |

## No Database Changes
- No schema modifications
- No RLS policy changes
- No trigger modifications
- Existing `audit_event_select` RLS policy enforces access: `has_role('audit_readonly') OR is_super_admin()`

