# RP-P8B-remediation-pre

**Date:** 2026-02-13  
**Phase:** 8B UI Write Flows (Pre-Remediation)  
**Status:** BASELINE STATE CAPTURED

## Baseline Issues Identified

1. **Duplicate ToastContainer (react-toastify)**
   - Location 1: `src/layouts/AdminLayout.tsx` line 34
   - Location 2: `src/components/wrapper/AppProvidersWrapper.tsx` line 29
   - Impact: Double notifications on mutations

2. **Hidden Create Buttons on Empty State**
   - Dossier list: Button only renders when `dossiers.length > 0` (line 108)
   - Meeting list: Button only renders when `meetings.length > 0` (line 87)
   - Task list: Button only renders when `tasks.length > 0` (line 141)
   - Impact: New users cannot create initial records

3. **Super Admin Detection Missing**
   - Test account `info@devmart.sr` has:
     - `user_role`: `rvm_sys_admin` only
     - `super_admin_bootstrap`: active entry
   - `useUserRoles.ts` only checks `user.roles` array
   - Does NOT query `super_admin_bootstrap`
   - Impact: Super admin buttons remain hidden despite RLS allowing the action

4. **Bootstrap Governance Check**
   - `useNotificationContext.tsx` imports `ToastContainer` from `react-bootstrap`
   - This is a DIFFERENT `ToastContainer` than react-toastify
   - Status: Component exists but NOT integrated into active notification flows
   - Current usage: Isolated in `NotificationProvider` only
   - Recommendation: Deprecate in Phase 8C

## Current Architecture

- **Auth Context:** Fetches `app_user` + `user_role` table on init
- **Roles Hook:** Returns roles array from auth context, no super admin check
- **Notifications:** Two independent systems (react-bootstrap + react-toastify)

## Files Under Review

| File | Issue | Status |
|------|-------|--------|
| `src/layouts/AdminLayout.tsx` | Duplicate ToastContainer | TO FIX |
| `src/context/useAuthContext.tsx` | Missing super admin query | TO ENHANCE |
| `src/types/auth.ts` | Missing is_super_admin field | TO ENHANCE |
| `src/hooks/useUserRoles.ts` | No super admin override | TO ENHANCE |
| `src/app/(admin)/rvm/dossiers/page.tsx` | Button hidden on empty state | TO FIX |
| `src/app/(admin)/rvm/meetings/page.tsx` | Button hidden on empty state | TO FIX |
| `src/app/(admin)/rvm/tasks/page.tsx` | Button hidden on empty state | TO FIX |
| `src/context/useNotificationContext.tsx` | Bootstrap ToastContainer present | REVIEW ONLY |

## Database Schema (No Changes Required)

- `super_admin_bootstrap` table: EXISTS, RLS-protected
- `is_super_admin()` RPC function: EXISTS, `SECURITY DEFINER`
- `audit_event` table: EXISTS, auto-triggering on mutations
- All validation triggers: IN PLACE

## Test Account Profile

```
Email: info@devmart.sr
Auth ID: [Supabase auth.users.id]
Status: ACTIVE
Roles: ['rvm_sys_admin']
Super Admin: true (in super_admin_bootstrap)
```

## Remediation Scope

- Fix duplicate ToastContainer
- Add `is_super_admin` to UserType and populate via RPC
- Update `useUserRoles` to include super admin override
- Move Create buttons outside conditional rendering
- Verify audit logging works with test records
- NO database schema changes

---

*End of pre-implementation state snapshot.*
