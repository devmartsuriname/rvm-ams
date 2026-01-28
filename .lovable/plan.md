
# Fix Plan: Add Missing QueryClientProvider

## Problem Summary
The application is stuck on an infinite loading spinner when navigating to RVM modules (Dossiers, Meetings, Tasks). The root cause is a **missing `QueryClientProvider`** in the application's provider hierarchy.

## Root Cause Analysis
- **Issue**: React Query hooks (`useDossiers`, `useMeetings`, `useTasks`) require a `QueryClientProvider` ancestor
- **Current State**: `AppProvidersWrapper.tsx` does NOT include `QueryClientProvider`
- **Effect**: When hooks call `useQuery`, they fail silently, and the component remains in loading state indefinitely
- **Scope**: Affects ALL pages using React Query hooks (all RVM modules)

## RLS Analysis (Not the Issue)
Row-Level Security policies were verified and are correctly configured:
- Super admin user `info@devmart.sr` has:
  - `app_user` record with `is_active: true`
  - `super_admin_bootstrap` record with `is_active: true`
  - `user_role` with `rvm_sys_admin`
- The `is_super_admin()` function returns `true` for this user when authenticated
- All RVM tables include `OR is_super_admin()` in their SELECT policies

## Fix Required

### File: `src/components/wrapper/AppProvidersWrapper.tsx`

Add the following changes:

1. Import React Query dependencies:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
```

2. Create a QueryClient instance (outside component or with useState):
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})
```

3. Wrap children with `QueryClientProvider`:
```typescript
<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>
```

### Updated File Structure
```text
<HelmetProvider>
  <QueryClientProvider client={queryClient}>   // <-- ADD THIS
    <AuthProvider>
      <LayoutProvider>
        <NotificationProvider>
          {children}
          <ToastContainer theme="colored" />
        </NotificationProvider>
      </LayoutProvider>
    </AuthProvider>
  </QueryClientProvider>                        // <-- ADD THIS
</HelmetProvider>
```

## Verification Steps
After the fix:
1. Navigate to `/rvm/dossiers` - should show empty state (no data) or data if present
2. Navigate to `/rvm/meetings` - should show empty state or meeting list
3. Navigate to `/rvm/tasks` - should show empty state or task list
4. No infinite loading spinners
5. Console should not show React Query errors

## Governance Compliance
- **No schema changes**: ✅
- **No RLS changes**: ✅
- **No new components**: ✅ (using existing React Query)
- **No UI changes**: ✅ (Darkone 1:1 preserved)
- **Darkone compliance**: ✅

## Technical Details

| Aspect | Status |
|--------|--------|
| Dependencies | `@tanstack/react-query` v5.83.0 already installed |
| Files Modified | 1 file (`AppProvidersWrapper.tsx`) |
| Lines Changed | ~10 lines added |
| Risk Level | Low - standard React Query setup |
