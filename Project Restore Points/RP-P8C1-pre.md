# Restore Point: RP-P8C1-pre

**Created:** 2026-02-13  
**Phase:** 8C.1 — Audit Viewer (Pre-Implementation)  
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Pre-Implementation State

- Phase 8B: Formally closed
- Audit event table: Exists with RLS (audit_readonly / super_admin SELECT only)
- Audit viewer: Not yet implemented
- No `/rvm/audit` route exists

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/hooks/useUserRoles.ts` | MODIFY (add canViewAudit) |
| `src/hooks/useAuditEvents.ts` | CREATE |
| `src/app/(admin)/rvm/audit/page.tsx` | CREATE |
| `src/routes/index.tsx` | MODIFY (add route) |
| `src/assets/data/menu-items.ts` | MODIFY (add menu entry) |

## Governance Constraints

- No schema changes
- No new RLS policies
- No trigger modifications
- No new dependencies
- JSON via `<pre>` + `JSON.stringify` only
