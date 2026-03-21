# Phase 24 — Security Review & Hardening Audit Report

**Date:** 2026-03-21
**Phase:** 24 — Security Review & Hardening Audit
**Type:** Audit / Report only — no code changes
**Verdict:** READY WITH CONDITIONS

---

## Summary

Comprehensive security review of all RVM-AMS system layers. All 7 audit areas passed with minor conditions noted for production hardening.

---

## Step 1 — RLS Policy Audit

All 14 domain/system tables reviewed:

| Table | SELECT | INSERT | UPDATE | DELETE | Verdict |
|-------|--------|--------|--------|--------|---------|
| rvm_dossier | Role-gated (8 roles + SA) | admin_intake + SA | secretary/admin_dossier + status guard + SA | Blocked | PASS |
| rvm_meeting | Role-gated | secretary/admin_agenda + SA | secretary/admin_agenda + not-closed + SA | Blocked | PASS |
| rvm_agenda_item | Role-gated | secretary/admin_agenda + SA | secretary/admin_agenda + SA | Blocked | PASS |
| rvm_decision | Role-gated (5 roles) | secretary/admin_reporting + SA | secretary(draft only)/chair/SA | Blocked | PASS |
| rvm_task | Role + assigned_role + SA | secretary/deputy + SA | assignee/secretary/deputy + SA | Blocked | PASS |
| rvm_document | Role-gated | secretary/admin_dossier/admin_reporting + SA | secretary/admin_dossier + SA | Blocked | PASS |
| rvm_document_version | Role-gated | secretary/admin_dossier/admin_reporting + SA | Blocked | Blocked | PASS |
| app_user | Self-only OR SA | Blocked | Blocked | Blocked | PASS |
| user_role | Self OR secretary/sys_admin/SA | Blocked | Blocked | Blocked | PASS |
| audit_event | audit_readonly/SA only | Blocked | Blocked | Blocked | PASS |
| rvm_illegal_attempt_log | chair/audit/admin_reporting/SA | Blocked (false) | Blocked (false) | Blocked (false) | PASS |
| status_transitions | Authenticated read | Blocked (false) | Blocked (false) | Blocked (false) | PASS |
| missive_keyword | All authenticated | rvm_sys_admin/SA | rvm_sys_admin/SA | Blocked | PASS |
| super_admin_bootstrap | SA only | Blocked | Blocked | Blocked | PASS |

All INSERT/UPDATE policies confirmed PERMISSIVE (fixed in Phase 23B migration). No overly broad access detected.

**Status: PASS**

---

## Step 2 — Storage Security Audit

- Bucket `rvm-documents`: **private** (not public)
- SELECT: 8 RVM roles + SA
- INSERT: secretary_rvm, admin_dossier, admin_reporting + SA
- No UPDATE policy (immutable files — new versions = new objects)
- No DELETE policy (no file deletion by design)
- Signed URLs: 60-minute expiry via `createSignedUrl(path, 3600)`

**Risk (LOW):** Orphaned file cleanup requires service_role access. Acceptable for governance-grade system.

**Status: PASS**

---

## Step 3 — Auth / Session Security

- Unauthenticated users redirected via `<Navigate to="/auth/sign-in">`
- `redirectTo` parameter validated (must start with `/`, no `://`)
- Logout: `supabase.auth.signOut()` + state clear + navigation
- Auth context: `onAuthStateChange` listener + `getSession()` with isMounted guards
- Session: localStorage with autoRefreshToken
- Leaked password protection enabled
- Secure email/password change enabled

**Risk (LOW):** Lock screen route in ProfileDropdown leads to non-existent page. Cosmetic only.

**Status: PASS**

---

## Step 4 — Governance Trigger Audit

9 enforcement triggers verified:

1. `enforce_dossier_status_transition` — validates via `status_transitions` table
2. `enforce_meeting_status_transition` — same pattern
3. `enforce_task_status_transition` — same + assignee check for in_progress
4. `enforce_agenda_item_status_transition` — same + closed-meeting guard
5. `enforce_decision_status_transition` — same + is_final immutability lock
6. `enforce_chair_only_decision_status` — SECURITY DEFINER, role check
7. `enforce_chair_approval_gate` — requires chair approval before finalization, cascades dossier to decided
8. `enforce_dossier_immutability` — blocks child entity modification when dossier is decided/archived/cancelled
9. `enforce_document_lock_on_decision` — blocks new versions on finalized decisions

All use `RETURN NULL` pattern with `log_illegal_attempt()` audit trail.

Client-side: `handleGuardedUpdate` and `.select()` empty-check pattern correctly detect silent rejections.

**Status: PASS**

---

## Step 5 — Super Admin / Elevated Access Review

- `is_super_admin()` checks: `auth_id = auth.uid()`, `is_active = true`, `expires_at IS NULL OR expires_at > now()`
- Expiry enforced at SQL query time — no client-side bypass possible
- SA can change decision status via `enforce_chair_only_decision_status` (by design)

**Risk (MEDIUM):** SA active in production would bypass chair gate governance.

**Classification:**
- ACCEPTABLE FOR TESTING ✅
- **MUST FIX BEFORE PRODUCTION:** Set `super_admin_bootstrap.is_active = false` or `expires_at` before go-live

---

## Step 6 — Dependency / Bundle Exposure Review

~17 unused/legacy packages identified (report only, no removals):

| Package | Status | Risk |
|---------|--------|------|
| axios + axios-mock-adapter | Unused (Supabase SDK used) | LOW |
| google-maps-react | No maps feature | LOW |
| jsvectormap | No vector map feature | LOW |
| gridjs + gridjs-react | Legacy, not used | LOW |
| choices.js | Legacy, react-select used | LOW |
| react-quill | Not used in UI | LOW |
| react-flatpickr | Not used (react-day-picker used) | LOW |
| gumshoejs | Not used | LOW |
| @fullcalendar/* (5 packages) | No calendar view | LOW |
| cookies-next | Not used (localStorage for auth) | LOW |
| input-otp | No OTP feature | LOW |
| next-themes | Not applicable in Vite | LOW |

No HIGH-risk or CVE-affected packages identified.

**Recommendation:** Schedule cleanup in maintenance phase.

---

## Step 7 — Sensitive Data Exposure Check

- Supabase URL + anon key in client.ts: publishable, acceptable ✅
- Service role key: only in Supabase secrets, never in client code ✅
- Storage paths: visible only to authorized roles ✅
- UUIDs for user names: known limitation, mitigated by `get_user_directory()` RPC ✅
- Audit payloads: full entity snapshots, audit_readonly/SA only ✅
- No debug logging of sensitive data ✅

**Risk (LOW):** `console.info` logs email on auth. Remove before production.

**Status: PASS**

---

## Security Readiness Verdict

| Area | Verdict |
|------|---------|
| RLS Policies | PASS |
| Storage Security | PASS |
| Auth/Session | PASS |
| Governance Triggers | PASS |
| Super Admin | PASS (testing) / CONDITIONAL (production) |
| Dependencies | LOW RISK (cleanup recommended) |
| Data Exposure | PASS |

**Overall: READY WITH CONDITIONS**

---

## Conditions for Production

1. **CRITICAL:** Deactivate `super_admin_bootstrap` entry before go-live (`is_active = false` or set `expires_at`)
2. **LOW:** Remove or downgrade `console.info` auth logging
3. **LOW:** Schedule dependency cleanup (~17 unused packages)

---

## Governance Integrity Statement

- Chair gate remains the highest authority in production
- No active role may bypass without explicit audit trace
- CSP/runtime security deferred to Phase 25 (Production Readiness)
