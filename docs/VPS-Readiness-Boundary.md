# RVM-AMS — VPS Readiness Boundary

**Last updated:** 2026-03-21
**Maintainer:** Devmart Governance
**Based on:** Phase 25 Audit + Phase 26A + Phase 26B

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

These remain unresolved and should be addressed in Phase 26C or a dedicated pre-VPS phase.

### 🔴 Chair Approval Timestamp — DB-Level Hardening Required

**Severity:** HIGH
**Finding:** H3 from Phase 25 audit
**Current state:** `chair_approved_at` is set client-side in `decisionService.recordChairApproval()`. A user with the appropriate role could manipulate their system clock to backdate or future-date an approval.

**Why code-level fix is not valid:**
The trigger `enforce_chair_approval_gate()` checks that `chair_approved_at IS NOT NULL` before allowing finalization. It does NOT assign the value. There is no server-side mechanism that sets `chair_approved_at`. Removing it from the client update would leave the field permanently NULL, permanently blocking all decision finalization.

**Required implementation (Phase 26C or earlier):**

Add a new DB trigger (migration required):

```sql
CREATE OR REPLACE FUNCTION public.set_chair_approval_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set server-side timestamp when chair_approved_by is first assigned
  IF NEW.chair_approved_by IS NOT NULL AND OLD.chair_approved_by IS NULL THEN
    NEW.chair_approved_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE TRIGGER set_chair_approval_timestamp
  BEFORE UPDATE ON public.rvm_decision
  FOR EACH ROW
  EXECUTE FUNCTION public.set_chair_approval_timestamp();
```

After this migration is applied, **remove `chair_approved_at: new Date().toISOString()` from `decisionService.recordChairApproval()`** in application code.

**Risk until fixed:** Audit trail timestamp for chair approvals is not server-authoritative. In a government system, this is a governance integrity risk.

---

### 🔴 VPS Server Infrastructure — Manual Setup Required

These are infrastructure-level items that require manual VPS configuration. They are not application code changes.

| Item | Action Required |
|------|----------------|
| Process manager | Install PM2 or configure systemd service |
| Web server SPA routing | Configure nginx with `try_files $uri /index.html` fallback |
| SSL/TLS | Configure Let's Encrypt or Hostinger SSL |
| Build on VPS | Copy `.env`, run `npm install && npm run build` |
| Storage access | Verify Supabase Storage signed URL access from VPS origin |
| External font CDN | Verify `fonts.googleapis.com` accessible from server/client |

---

## SUMMARY TABLE

| Phase | Items | Status |
|-------|-------|--------|
| 26A | 5 critical code changes | ✅ COMPLETE |
| 26B | axios-mock-adapter move; chair timestamp analysis | ✅ COMPLETE |
| 26C (proposed) | Chair approval DB trigger + code cleanup | 🟡 PENDING |
| Post-VPS | Pagination, bundle cleanup, TypeScript strictness | 🔵 DEFERRED |
| Infrastructure | nginx, PM2, SSL, build pipeline | 🔴 MUST DO before go-live |

---

## CURRENT VPS READINESS VERDICT

**READY WITH CONDITIONS**

Application code is VPS-compatible after Phase 26A + 26B. The remaining blocker before go-live is:

1. Chair approval timestamp DB hardening (Phase 26C) — governance integrity risk
2. VPS infrastructure configuration — nginx, PM2, SSL, `.env` setup

After these two items are addressed, the system is fully ready for production on Hostinger VPS.
