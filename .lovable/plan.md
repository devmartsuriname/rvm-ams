
# Final UI Demo Cleanup Plan — Pre-Phase 0

## Executive Summary

This plan details the minimal, cosmetic changes required to clear demo notifications and remove the "Pricing" option from the profile dropdown. All changes preserve Darkone 1:1 layout structure.

---

## Task 1: Demo Notifications Cleanup

### Current State
- **File:** `src/assets/data/topbar.ts`
- Contains 5 demo notification items (Sally Bieber, Gloria Chambers, Jacob Gines, system update, Shawn Bunch)
- These are displayed in the notifications dropdown

### Required Change
- Clear the `notificationsData` array to an empty array `[]`
- This removes all demo notification content while preserving the notification system structure

### File to Modify
| File | Change |
|------|--------|
| `src/assets/data/topbar.ts` | Set `notificationsData` to empty array `[]` |

### Result
- Notification dropdown will show empty state
- Bell icon, dropdown component, and "View All Notification" button remain functional
- Badge count will need to reflect zero (handled by component logic or can be addressed separately)

---

## Task 2: Profile Dropdown — Remove "Pricing" Option

### Current State
- **File:** `src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx`
- Lines 35-38 contain the "Pricing" dropdown item
- Current menu structure:
  - Welcome! (header)
  - My Account
  - **Pricing** ← TO BE REMOVED
  - Help
  - Lock screen
  - Logout

### Required Change
- Remove lines 35-38 (the Pricing DropdownItem)

### File to Modify
| File | Change |
|------|--------|
| `ProfileDropdown.tsx` | Remove the Pricing menu item (lines 35-38) |

### Result
- Profile dropdown will show: Welcome!, My Account, Help, Lock screen, Logout
- No structural changes to dropdown logic

---

## Technical Implementation Summary

| Task | File | Action | Lines Affected |
|------|------|--------|----------------|
| 1. Clear notifications | `src/assets/data/topbar.ts` | Replace array with `[]` | Lines 6-30 |
| 2. Remove Pricing | `src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx` | Delete Pricing item | Lines 35-38 |

---

## Files to be Modified (2 total)

1. `src/assets/data/topbar.ts`
2. `src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx`

---

## Files NOT Touched

- No layout files
- No routing files
- No auth logic or auth pages
- No Notifications component structure (`Notifications.tsx` remains unchanged)
- No ProfileDropdown logic (only content removal)
- No backend/schema changes
- No new UI elements introduced

---

## Governance Compliance

| Rule | Status |
|------|--------|
| Darkone 1:1 layout preserved | ✓ Confirmed |
| /src as authoritative root | ✓ Maintained |
| No Phase 0 started | ✓ Confirmed |
| No scope expansion | ✓ Confirmed |
| Minimal cosmetic changes only | ✓ Confirmed |

---

## Expected Visual Result

After implementation:
- Notifications dropdown will be empty (no demo items)
- Profile dropdown will show: Welcome! → My Account → Help → Lock screen → Logout
- All other UI elements unchanged

---

## Post-Execution Deliverable

Upon approval and execution, a report will confirm:
- Demo notifications cleared
- "Pricing" removed from profile dropdown
- List of files changed
- Explicit statement: "Phase 0 has NOT started"
