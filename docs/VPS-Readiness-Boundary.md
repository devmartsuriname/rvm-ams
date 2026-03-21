# RVM-AMS — VPS Readiness Boundary

**Last updated:** 2026-03-21
**Maintainer:** Devmart Governance
**Based on:** Phase 25 Audit + Phase 26A + Phase 26B + Phase 26C + Phase 27

This document is the authoritative boundary between what has been fixed for VPS migration, what can wait until after VPS, and what still needs action.

---

## COLUMN DEFINITIONS

| Status | Meaning |
|--------|---------|
| ✅ FIXED | Implemented and verified |
| 🔵 DEFERRED | Intentionally deferred; system works without it |
| 🟡 PENDING | Needs a future phase to address |
| 🔴 BLOCKING | Must be resolved before VPS migration |

---

## FIXED IN PHASE 26A

| Item | File | Severity |
|------|------|----------|
| Hardcoded Supabase credentials → env vars | `src/integrations/supabase/client.ts` | CRITICAL |
| lovable-tagger breaks VPS production build | `vite.config.ts`, `package.json` | CRITICAL |
| Document creation: orphaned DB records on upload failure | `src/services/documentService.ts` | CRITICAL |
| Dossier creation: orphan ID not surfaced in error | `src/services/dossierService.ts` | CRITICAL |
| Missing `.env.example` reference file | `.env.example` | HIGH |

---

## FIXED IN PHASE 26B

| Item | File | Severity |
|------|------|----------|
| `axios-mock-adapter` in production dependencies | `package.json` | HIGH |

---

## FIXED IN PHASE 26C

| Item | File | Severity |
|------|------|----------|
| `chair_approved_at` set client-side — DB trigger added | `supabase/migrations/20260321210000_chair-approval-server-timestamp.sql`, `src/services/decisionService.ts` | HIGH |

---

## DEFERRED — CAN WAIT UNTIL AFTER VPS

These do not block VPS migration and are acceptable at current scale.

| Item | Severity | Why Deferred |
|------|----------|-------------|
| No pagination on list queries | HIGH | Functional at current data volume; address post-VPS as Phase 27 |
| `select('*')` over-fetching | MEDIUM | Performance, not security. Address after VPS. |
| Supabase access token in React context | MEDIUM | Not actively used; no known exploitation path |
| Production console logs expose email/auth_id | MEDIUM | Internal tool; acceptable short-term risk |
| `getErrorMessage` returns raw DB error strings | MEDIUM | Affects UX not security (authenticated users only) |
| Dashboard counts use `array.length` of limited results | MEDIUM | Misleading stat; correct in a future phase |
| Unescaped wildcards in ilike filter | MEDIUM | UX issue, not security. Supabase parameterizes. |
| Dual validation libraries (yup + zod) | MEDIUM | Bundle size only |
| Duplicate UI libraries (toasts, date pickers, charts, etc.) | MEDIUM | Bundle size; needs usage audit before removal |
| Non-atomic agenda reorder | HIGH | Requires DB stored procedure; low occurrence risk at current volume |
| TypeScript strict null checks disabled | HIGH | Phased enablement; requires dedicated testing phase |
| Stale "Phase 5" comments | LOW | Documentation cleanup only |
| Task timestamps set client-side (duplicate of trigger) | LOW | Trigger fires after client; minor redundancy |
| No debounce on search | LOW | React Query caches; not a hard error |
| No limit on document version history | LOW | Edge case at current scale |
| Vestigial Darkone UserType fields | LOW | Type cleanliness |
| `google-maps-react` deprecated | LOW | Assess actual usage first |

---

## PENDING — MUST BE DONE BEFORE VPS GO-LIVE

### ✅ Chair Approval Timestamp — RESOLVED in Phase 26C

**Finding:** H3 from Phase 25 audit
**Resolution:** DB trigger `set_chair_approval_timestamp` added via migration `20260321210000_chair-approval-server-timestamp.sql`. Client-side assignment removed from `decisionService.recordChairApproval()`.
**Migration status:** File committed. Must be applied to production Supabase project (`supabase db push` or SQL editor) before go-live.

---

### 🔴 VPS Server Infrastructure — Manual Setup Required

These are infrastructure-level items that require manual VPS configuration. They are not application code changes.

| Item | Action Required |
|------|----------------|
| nginx SPA routing | `try_files $uri $uri/ /index.html` — exact config in Phase 27 blueprint |
| SSL/TLS | Let's Encrypt via certbot — exact steps in Phase 27 blueprint |
| Build on VPS | Copy `.env`, run `npm install && npm run build` |
| Storage access | Verify Supabase Storage CORS allows VPS origin |
| External font CDN | Verify `fonts.googleapis.com` accessible from client |

**Note:** PM2 is NOT required. See Phase 27 for rationale (static files served by nginx; no Node.js runtime process).

**Migration blueprint:** See [Phase 27 — Hostinger VPS Migration Preparation](Phase-27-Hostinger-VPS-Migration-Preparation.md) for the complete 16-step migration sequence, rollback plan, and pre-migration checklist.

---

## SUMMARY TABLE

| Phase | Items | Status |
|-------|-------|--------|
| 26A | 5 critical code changes | ✅ COMPLETE |
| 26B | axios-mock-adapter move; chair timestamp analysis | ✅ COMPLETE |
| 26C | Chair approval DB trigger + code cleanup | ✅ COMPLETE |
| 27 | VPS migration blueprint | ✅ COMPLETE (documentation) |
| Post-VPS | Pagination, bundle cleanup, TypeScript strictness | 🔵 DEFERRED |
| Infrastructure | nginx, SSL, build, Supabase migration apply | 🔴 MUST EXECUTE before go-live |

---

## CURRENT VPS READINESS VERDICT

**READY — EXECUTE MIGRATION BLUEPRINT**

All application code blockers are resolved (Phase 26A + 26B + 26C). The migration blueprint is complete (Phase 27). Two execution steps remain before go-live:

1. Apply migration `20260321210000_chair-approval-server-timestamp.sql` to production Supabase
2. Execute VPS migration sequence — see [Phase 27 Blueprint](Phase-27-Hostinger-VPS-Migration-Preparation.md) Section 8 (Steps 1–16)

The Phase 27 document contains the exact nginx config, SSL setup, DNS switching procedure, validation criteria, and rollback plan. No additional planning is required before migration can begin.
