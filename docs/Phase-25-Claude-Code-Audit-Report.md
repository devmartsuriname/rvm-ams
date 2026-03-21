# Phase 25 — Independent Code Audit Report

**Generated:** 2026-03-21
**Auditor:** Claude Code (Independent Review Agent)
**Type:** READ-ONLY audit — no code, schema, or policy changes
**Project:** RVM-AMS (RVM Agenda Management System)
**Audit trigger:** Pre-VPS migration review

---

## 1. Executive Summary

The RVM-AMS system has completed 25 documented development phases and is being evaluated for Hostinger VPS migration. This audit was conducted independently by reading all phase documentation first, then inspecting the codebase.

**Overall verdict: READY WITH CONDITIONS**

The system demonstrates mature security design, correct layered RLS enforcement, proper governance trigger architecture, and a well-structured service layer. However, 4 CRITICAL findings and 6 HIGH findings require attention before VPS migration can proceed safely. Two CRITICAL findings will break the VPS build pipeline entirely without remediation.

---

## 2. Documentation Context Reviewed

| Document | Content |
|----------|---------|
| `docs/architecture.md` | System architecture, component relationships |
| `docs/backend.md` | Supabase schema, RLS design, trigger patterns |
| `docs/Phase-20-Seeder-Guide.md` | Seed data strategy |
| `docs/Phase-20-Seed-Data-Report.md` | Seed data validation results |
| `docs/Phase-21-Role-Verification-Report.md` | RBAC role verification across 9 roles |
| `docs/Phase-22-Workflow-Simulation-Report.md` | End-to-end workflow simulation |
| `docs/Phase-23-Final-QA-Report.md` | Final QA including Phase 23B RESTRICTIVE→PERMISSIVE fix |
| `docs/Phase-24-Security-Review-Report.md` | Security review |
| `docs/Phase-25-Production-Readiness.md` | Production readiness assessment |
| `docs/Pre-Production-System-Status-Report.md` | Complete phase status overview |
| `docs/RVM-AMS_SYSTEM_IMPLEMENTATION_STATUS_REPORT.md` | Full system implementation status |
| `docs/Phase-19-Code-Health-Closure.md` | Code health closure report |
| `docs/phase8b_postclosure_verification_report.md` | Phase 8 verification |

**Key findings from documentation review:**

1. Phase 23B fixed a critical bug where all INSERT/UPDATE RLS policies were RESTRICTIVE-only (PostgreSQL requires at least one PERMISSIVE policy for writes). This was a breaking defect that prevented all writes until fixed.
2. Phase 16 unified all trigger violations to RETURN NULL + rvm_illegal_attempt_log pattern (correct design).
3. Phase 25 deactivated super_admin_bootstrap via migration (correct production hardening).
4. The documentation consistently marks the system as "READY FOR PRODUCTION" — but the VPS migration prerequisites are not all satisfied at code level.

---

## 3. Audit Scope

**Code inspected:**
- `src/integrations/supabase/client.ts`
- `src/context/useAuthContext.tsx`
- `src/app/(other)/auth/sign-in/useSignIn.ts`
- `src/hooks/` — all 13 hook files
- `src/services/` — all 8 service files
- `src/utils/rls-error.ts`
- `src/types/auth.ts`
- `vite.config.ts`
- `tsconfig.json`
- `package.json`
- `supabase/migrations/` — all 21 migration files (key RLS, trigger, storage migrations)

**Not inspected (out of scope):**
- Individual React component files (UI-only, no security surface)
- SCSS/styling files
- Route configuration (reviewed at directory level)

---

## 4. Findings

### CRITICAL

---

#### C1 — Non-Atomic Dossier Creation: Orphaned Dossier Risk

**Severity:** CRITICAL
**File:** [src/services/dossierService.ts](../src/services/dossierService.ts) lines 96–131
**Affects:** Current production usage, VPS migration, governance, data integrity

**Evidence:**

```typescript
// Step 1: Insert dossier record
const { data: dossier, error: dossierError } = await supabase
  .from('rvm_dossier').insert({...}).select().single()

if (dossierError) throw dossierError

// Step 2: Create linked rvm_item
const { error: itemError } = await supabase
  .from('rvm_item').insert({ dossier_id: dossier.id, ... })

if (itemError) {
  // Rollback dossier if item creation fails  ← COMMENT IS WRONG
  console.error('[DossierService] Failed to create item, dossier orphaned:', itemError)
  throw itemError  ← NO ROLLBACK CODE EXISTS
}
```

**Why it matters:** The code comment says "rollback dossier" but no rollback is performed. If `rvm_item` insert fails (network error, RLS violation, constraint failure), `rvm_dossier` is permanently orphaned with no `rvm_item` record. The client cannot delete it (no DELETE RLS policy). The error thrown is the raw Supabase error with no indication of which dossier ID is orphaned.

**Documentation vs code:** Documentation does not acknowledge this risk.

**Recommended action:** Phase 26A mitigation — surface orphan dossier ID in error message for admin cleanup. Full fix requires a DB-level stored procedure (out of scope for 26A).

---

#### C2 — Non-Atomic Document Creation: Orphaned DB Record Risk

**Severity:** CRITICAL
**File:** [src/services/documentService.ts](../src/services/documentService.ts) lines 58–120
**Affects:** Current production usage, VPS migration, governance, data integrity, storage integrity

**Evidence (original flow):**

```
Step 1: INSERT rvm_document → doc.id obtained
Step 2: supabase.storage.upload(storagePath, file)  ← IF THIS FAILS → doc is DB orphan
Step 3: INSERT rvm_document_version
Step 4: UPDATE rvm_document SET current_version_id
```

If step 2 (storage upload) fails, the `rvm_document` record from step 1 is permanently orphaned. No DELETE policy exists. The error message says "document orphaned" but does nothing about it.

**Recommended action:** Phase 26A fix — reorder to upload-first using pre-generated UUID (see Phase-26A-Remediation-Report.md).

---

#### C3 — Hardcoded Supabase Credentials Bypass Environment Variables

**Severity:** CRITICAL
**File:** [src/integrations/supabase/client.ts](../src/integrations/supabase/client.ts)
**Affects:** VPS migration (HIGH), CI/CD configuration management

**Evidence:**

```typescript
// This file is automatically generated. Do not edit it directly.
const SUPABASE_URL = "https://smjjpxhgnomucvmmllaj.supabase.co";  // ← hardcoded
const SUPABASE_PUBLISHABLE_KEY = "eyJ...";  // ← hardcoded
```

The `.env` file declares `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, but these are ignored. `import.meta.env.*` is not used. Any environment-specific deployment (staging vs production, VPS vs Lovable) requires manual code edits and a full rebuild.

**Note:** The anon/publishable key is technically safe to expose in client-side code by design. The security concern here is operational: hardcoded values prevent environment-variable-based deployment workflows.

**Recommended action:** Phase 26A fix — use `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` with fail-fast validation.

---

#### C4 — `lovable-tagger` Top-Level Import Breaks VPS Production Build

**Severity:** CRITICAL
**File:** [vite.config.ts](../vite.config.ts) line 4
**Affects:** VPS migration — WILL BREAK production build

**Evidence:**

```typescript
import { componentTagger } from "lovable-tagger";  // ← top-level import

plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
```

`lovable-tagger` is a `devDependency`. The conditional `mode === "development"` only prevents `componentTagger()` from being *called* in production builds. The `import` statement at line 4 executes unconditionally. Any VPS production build that installs only production dependencies (`npm ci --omit=dev`, `npm install --production`) will fail with `Cannot find module 'lovable-tagger'` at Vite config parse time.

**This will silently work on Lovable (which installs all dependencies) but fail on VPS.**

**Recommended action:** Phase 26A fix — remove the import and the plugin entirely.

---

### HIGH

---

#### H1 — No Pagination on Unbounded List Queries

**Severity:** HIGH
**Files:** `dossierService.fetchDossiers`, `meetingService.fetchMeetings`, `decisionService.fetchAllDecisions`, `taskService.fetchTasks`, `agendaItemService.fetchAgendaItemsByMeeting`
**Affects:** Performance scalability, current production (growing), VPS migration

**Evidence:**

```typescript
// dossierService.fetchDossiers — no .limit()
let query = supabase
  .from('rvm_dossier')
  .select('*, rvm_item(*)')  // fetches ALL columns from BOTH tables
  .order('created_at', { ascending: false })
  // ← no .limit() or cursor pagination
```

```typescript
// dashboardService.fetchStats — fetches ALL status rows for client aggregation
supabase.from('rvm_dossier').select('status'),  // ALL rows, no limit
supabase.from('rvm_task').select('status'),     // ALL rows, no limit
// → passed to aggregateByStatus() function
```

For a government archive system with indefinite data retention, unbounded queries will degrade linearly as records accumulate.

**Recommended action:** Fix before VPS migration (Phase 26B or separate pagination phase).

---

#### H2 — `reorderAgendaItems` Is Non-Atomic

**Severity:** HIGH
**File:** [src/services/agendaItemService.ts](../src/services/agendaItemService.ts) lines 75–97
**Affects:** Governance, data consistency

**Evidence:**

```typescript
const updates = itemOrder.map(item =>
  supabase.from('rvm_agenda_item')
    .update({ agenda_number: item.agenda_number })
    .eq('id', item.id)
    .select()
)
const results = await Promise.all(updates)  // N independent DB calls — no transaction
```

If any of the N updates fail mid-way (network interruption, RLS trigger block), the agenda_number fields become inconsistent. The subsequent error detection loop correctly identifies failures, but the already-committed updates cannot be rolled back. For a government meeting system, inconsistent agenda ordering is a governance integrity issue.

**Recommended action:** Requires a DB stored procedure for atomic reorder. Fix in a future phase.

---

#### H3 — Chair Approval Timestamp Set Client-Side

**Severity:** HIGH
**File:** [src/services/decisionService.ts](../src/services/decisionService.ts) lines 136–143
**Affects:** Governance integrity, audit trail

**Evidence:**

```typescript
async recordChairApproval(id: string, chairUserId: string) {
  const result = await supabase
    .from('rvm_decision')
    .update({
      chair_approved_by: chairUserId,
      chair_approved_at: new Date().toISOString(),  // ← CLIENT-SIDE TIMESTAMP
    })
    .eq('id', id)
    .select()
```

`chair_approved_at` is set from the browser clock. A user with the required role could manipulate their system clock to backdate or future-date a chair approval. For a government audit trail, the approval timestamp must be authoritative (set by the database server via a trigger using `now()`).

**Documentation vs code:** The audit trail is described as immutable in documentation. The `chair_approved_at` timestamp does not match this guarantee.

**Recommended action:** Requires a DB trigger to set this server-side. Fix before VPS.

---

#### H4 — TypeScript Strict Null Checks Disabled Globally

**Severity:** HIGH
**File:** [tsconfig.json](../tsconfig.json) lines 12–13
**Affects:** Code quality, potential runtime errors in governance paths

**Evidence:**

```json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

Multiple service files use `unknown as ExpectedType` casts that would fail TypeScript strict mode:

```typescript
// dashboardService.ts lines 208-210
const pendingDecisions = (pendingDecisionsResult.data ?? []) as unknown as ChairDecisionRow[]
```

These casts silently absorb null/undefined values that could cause runtime errors in governance-critical rendering paths.

**Recommended action:** Phased enablement of strict null checks before VPS.

---

#### H5 — `axios-mock-adapter` in Production Dependencies

**Severity:** HIGH
**File:** [package.json](../package.json) line 21
**Affects:** Bundle size, professional code quality

**Evidence:**

```json
"dependencies": {
  "axios-mock-adapter": "^2.1.0",  // ← test mock library in production deps
```

`axios-mock-adapter` is a library for mocking HTTP requests in tests. It has no place in production `dependencies`. It will be bundled into the production build, adding unnecessary weight and exposing test tooling surface.

**Recommended action:** Move to `devDependencies` before VPS.

---

#### H6 — `get_latest_violation` RPC Accessible to All Authenticated Users

**Severity:** HIGH (minor information disclosure)
**File:** [src/utils/rls-error.ts](../src/utils/rls-error.ts) lines 27–41
**Affects:** Security (principle of least privilege)

**Evidence:**

```typescript
// Comment in rls-error.ts:
// "Uses the get_latest_violation RPC (SECURITY DEFINER, accessible to all)."
export async function fetchViolationReason(entityType: string, entityId: string) {
  const { data } = await supabase.rpc('get_latest_violation', {
    p_entity_type: entityType,
    p_entity_id: entityId,
  })
```

Any authenticated user can call `get_latest_violation` for any entity they can guess an ID for. The function returns `rule, reason, created_at` from `rvm_illegal_attempt_log`. This leaks the access violation history of other users' actions. The data is governance-focused text, not highly sensitive, but violates principle of least privilege.

**Recommended action:** Acceptable for now; document as known limitation. Full fix requires restricting the RPC to specific roles.

---

### MEDIUM

---

#### M1 — `select('*')` Over-Fetching in Core List Queries

**Severity:** MEDIUM
**File:** [src/services/dossierService.ts](../src/services/dossierService.ts) lines 37, 64
**Affects:** Performance (grows over time)

`select('*, rvm_item(*)')` fetches all columns from both `rvm_dossier` and `rvm_item` for every list view. This includes large text fields like `summary`. As records accumulate, list page load times increase proportionally.

**Recommended action:** Specify only needed columns in list queries. Fix after VPS.

---

#### M2 — Supabase Access Token Stored Unnecessarily in UserType

**Severity:** MEDIUM
**Files:** [src/types/auth.ts](../src/types/auth.ts), [src/context/useAuthContext.tsx](../src/context/useAuthContext.tsx)
**Affects:** Security (minor token exposure)

```typescript
return {
  ...
  token: accessToken,  // Supabase JWT in React context — unnecessary
}
```

Supabase manages its own token via localStorage. Storing it in React context makes it accessible to every component, React DevTools, and any component logging. No code was found that actually uses `user.token`.

**Recommended action:** Remove `token` from UserType and context. Fix after VPS.

---

#### M3 — Production Console Logs Expose User Email and Auth ID

**Severity:** MEDIUM
**File:** [src/context/useAuthContext.tsx](../src/context/useAuthContext.tsx) lines 43, 109, 113
**Affects:** Security (PII in browser console)

```typescript
console.info('[Auth] User authenticated successfully:', appUser.email)  // email in console
console.error('[Auth] No app_user found for auth_id:', authUser.id)     // UUID in console
```

These logs are visible in browser DevTools to anyone with access to the browser session. Government systems should not log PII or internal IDs to the browser console in production.

**Recommended action:** Remove or suppress production console logs. Fix after VPS.

---

#### M4 — `getErrorMessage` Falls Back to Raw Database Error String

**Severity:** MEDIUM
**File:** [src/utils/rls-error.ts](../src/utils/rls-error.ts) line 100
**Affects:** Security (schema information disclosure)

```typescript
if (msg) return msg  // ← raw DB error if no pattern matched
```

If an error message doesn't match any of the defined patterns, the raw database error (which can contain table names, column names, constraint names, SQL fragments) is returned directly to the UI and displayed to the user.

**Recommended action:** Replace the fallback with a generic message. Fix after VPS.

---

#### M5 — Unescaped Wildcard Characters in `ilike` Filter

**Severity:** MEDIUM
**File:** [src/services/searchService.ts](../src/services/searchService.ts) line 59
**Affects:** Search correctness

```typescript
q = q.ilike('sender_ministry', `%${filters.dossierMinistry}%`)
```

User-provided `dossierMinistry` is interpolated directly into the ilike pattern. SQL injection is not possible (Supabase client handles parameterization), but PostgreSQL wildcard characters `%` and `_` in the input will behave as wildcards rather than literals, causing unexpected search results.

**Recommended action:** Escape `%` and `_` in filter values before passing to `.ilike()`. Fix after VPS.

---

#### M6 — Dashboard Count Metrics Use `array.length` of Limited Results

**Severity:** MEDIUM
**File:** [src/services/dashboardService.ts](../src/services/dashboardService.ts) lines 256–258, 290–295
**Affects:** Governance (misleading statistics)

```typescript
// Query uses .limit(10) but count uses array.length
const upcomingMeetings = upcomingMeetingsResult.data  // limited to 10
return {
  upcomingMeetingsCount: upcomingMeetings.length,  // shows ≤10, not actual count
}
```

`fetchStats()` correctly uses `{ count: 'exact', head: true }` for counts. But `fetchSecretaryStats()` and `fetchAnalystStats()` use `array.length` of `.limit(10)` result sets. If 20 meetings exist, the dashboard shows "10 upcoming meetings" — a misleading metric for a decision-maker.

**Recommended action:** Use separate `count: 'exact'` queries for all dashboard count metrics. Fix after VPS.

---

#### M7 — Dual Validation Schema Libraries

**Severity:** MEDIUM
**File:** [package.json](../package.json)
**Affects:** Bundle size

Both `yup` (sign-in form) and `zod` (Supabase type utilities) are production dependencies. Two schema validation libraries with overlapping functionality inflate the bundle.

**Recommended action:** Consolidate to one library. Fix after VPS.

---

#### M8 — Duplicate UI Libraries Causing Bundle Bloat

**Severity:** MEDIUM
**File:** [package.json](../package.json)
**Affects:** Bundle size, load performance

Duplicated categories found in production dependencies:
- **Toast:** `react-toastify` AND `sonner`
- **Date picker:** `react-day-picker` AND `react-flatpickr`
- **Select:** `choices.js` AND `react-select`
- **Charts:** `apexcharts`+`react-apexcharts` AND `recharts`
- **Theme:** `next-themes` (designed for Next.js, wrong framework)

These are likely Darkone template dependencies never cleaned up. This pattern significantly increases bundle size and initial load time — relevant for government VPS deployment.

**Recommended action:** Audit actual usage; remove unused libraries. Fix after VPS.

---

### LOW

---

#### L1 — Stale "Phase 5" Comments in `decisionService.ts`

**Severity:** LOW
**File:** [src/services/decisionService.ts](../src/services/decisionService.ts) lines 8–10, 143–144

```typescript
// NOTE: This service handles decision RECORDING only.
// Decision automation and Chair RVM approval gate are deferred to Phase 5.
```

The system is at Phase 25. The Chair gate IS implemented via triggers. This comment is incorrect and misleading to future developers.

---

#### L2 — Task Timestamps Set Both Client-Side and by Trigger

**Severity:** LOW
**File:** [src/services/taskService.ts](../src/services/taskService.ts) lines 64–68

```typescript
if (status === 'in_progress') {
  statusData.started_at = new Date().toISOString()  // ← client-side
} else if (status === 'done') {
  statusData.completed_at = new Date().toISOString()  // ← client-side
}
```

Database triggers (Phase 16) also set these timestamps. The client value may overwrite the trigger value, or vice versa. Audit timestamps should be authoritative (server-side only).

---

#### L3 — No Debounce on Search Input

**Severity:** LOW
**File:** [src/hooks/useSearch.ts](../src/hooks/useSearch.ts)

Each keystroke (2+ chars) triggers 5 parallel Supabase queries. Without debounce at the input component level, rapid typing generates bursts of parallel requests.

---

#### L4 — `fetchVersionHistory` Has No Limit

**Severity:** LOW
**File:** [src/services/documentService.ts](../src/services/documentService.ts) lines 189–197

No `.limit()` on version history query. Active documents may accumulate many versions over time.

---

#### L5 — Vestigial Darkone Template Fields in `UserType`

**Severity:** LOW
**File:** [src/types/auth.ts](../src/types/auth.ts)

`username`, `password`, `firstName`, `lastName` are marked "Darkone compat". The `password` field on a UserType is semantically incorrect and confusing.

---

#### L6 — `google-maps-react` Is Deprecated

**Severity:** LOW
**File:** [package.json](../package.json)

`google-maps-react` is unmaintained. Usage should be assessed and replaced if active.

---

### ACCEPTED / BY DESIGN

---

#### A1 — RETURN NULL Pattern for Silent Trigger Rejection

Intentional. Phase 16 explicitly unified all governance triggers to use `RETURN NULL` instead of `RAISE EXCEPTION`. Violations are logged to `rvm_illegal_attempt_log`. The frontend uses `handleGuardedUpdate()` to detect silent blocks and surface reasons. This is a documented, deliberate design choice that improves UX.

---

#### A2 — RLS as Security Source of Truth; UI Permissions as Hints

Correct layered security architecture. `useUserRoles.ts` explicitly states: "UI hints only. RLS remains the source of truth for access control." This is the correct pattern.

---

#### A3 — Super Admin Bootstrap Deactivated in Production

Phase 25 migration (`20260321201917_4befba9c-5fcb-4b00-924c-9169d51b788c.sql`) confirmed: `UPDATE public.super_admin_bootstrap SET is_active = false, expires_at = now() WHERE is_active = true`. Correct production hardening.

---

#### A4 — No DELETE Policies on Any Table

Government data retention requires no deletion. All tables are append-only. Correct by design.

---

#### A5 — Signed URL 60-Minute Expiry for Documents

Storage bucket `rvm-documents` is private. Download URLs are signed with 60-minute expiry. This is a reasonable balance between security and usability for a government internal system.

---

#### A6 — Audit Event Access Restricted to Specific Roles

`audit_event` SELECT is restricted to `audit_readonly`, `chair_rvm`, `admin_reporting`, `super_admin`. This is correct role-based access control.

---

#### A7 — Dossier Creation Sends Empty String for `dossier_number`

`dossier_number: ''` in `createDossier` is intentional — a database trigger auto-generates the sequential number. The empty string is the correct sentinel value.

---

## 5. Performance Observations

1. **Unbounded list queries (H1)** are the most critical performance risk. No pagination exists on any of the main entity list pages.
2. **Dashboard `aggregateByStatus()`** fetches all dossier and task rows client-side for status aggregation. This will become expensive as records grow.
3. **`select('*')` in dossierService** fetches all columns including large text fields for every list view.
4. **Duplicate charting and UI libraries (M8)** significantly inflate bundle size, affecting initial load time on VPS.
5. **Search (5 parallel queries per keystroke, no debounce)** creates request bursts during typing.

---

## 6. Security Observations

**Strengths:**
- RLS enabled and enforced on all 12 tables (verified via migration inspection)
- SECURITY DEFINER functions properly scoped (`get_current_user_id`, `has_role`, `has_any_role`, `is_super_admin`)
- `rvm_illegal_attempt_log` has no INSERT policy for authenticated users (only trigger functions can write)
- Document storage is private; access via signed URLs only
- No DELETE policies (data immutability by design)
- Open redirect prevented in sign-in flow
- Super admin bootstrap deactivated

**Weaknesses:**
- `chair_approved_at` set client-side (H3) — governance integrity risk
- `get_latest_violation` RPC accessible to all authenticated users (H6) — minor info disclosure
- Raw DB error messages returned to UI (M4) — schema leak
- Access token in React context (M2) — unnecessary exposure surface
- User email/auth_id in production console logs (M3) — PII leak
- `axios-mock-adapter` in production bundle (H5) — test tooling in production

---

## 7. Governance Consistency Observations

**Correct patterns observed:**
- All triggers use RETURN NULL + logging (Phase 16 unification confirmed)
- `handleGuardedUpdate()` correctly detects silent blocks via 0-row response
- `fetchViolationReason()` surfaces human-readable governance messages
- RLS SELECT/INSERT/UPDATE roles match documented governance matrix
- `rvm_document_version` has no UPDATE policy (immutability correct)
- Status transition validation table exists and is enforced by triggers
- Chair approval gate enforced via `enforce_chair_approval_gate()` trigger

**Discrepancies found:**
- `decisionService.ts` comment says "Chair gate deferred to Phase 5" — INCORRECT, chair gate IS implemented
- `dossierService.ts` comment says "rollback dossier if item creation fails" — INCORRECT, no rollback code exists
- `taskService.ts` sets client-side timestamps that duplicate trigger behavior

---

## 8. VPS Migration Risks

| Risk | Severity | Status |
|------|----------|--------|
| `lovable-tagger` top-level import breaks production build | **CRITICAL** | Fixed in Phase 26A |
| Hardcoded Supabase credentials — environment-specific builds impossible | **HIGH** | Fixed in Phase 26A |
| No `.env.example` for VPS configuration reference | **HIGH** | Fixed in Phase 26A |
| No process manager config (PM2/systemd) | **HIGH** | Not in scope — manual VPS setup required |
| No web server config (nginx/caddy) for SPA routing | **HIGH** | Not in scope — manual VPS setup required |
| Unbounded queries will degrade on real production data | **HIGH** | Phase 26B |
| Google Fonts CDN may be blocked on government networks | **MEDIUM** | Assess post-VPS |
| Storage bucket `rvm-documents` tied to cloud Supabase | **MEDIUM** | Remains on Supabase Cloud |
| `localStorage` session persistence (XSS surface) | **LOW** | Accepted for SPA pattern |

**VPS setup items NOT covered by Phase 26A (require manual configuration):**

1. Install Node.js 20+ on Hostinger VPS
2. Configure nginx/Apache with SPA fallback (`try_files $uri /index.html`)
3. Set up PM2 or systemd service for the Vite preview server (or serve static build via nginx)
4. Copy `.env` with real values before build
5. Run `npm install && npm run build`
6. Configure SSL/TLS via Let's Encrypt or Hostinger

---

## 9. Recommended Priority Order

### Must fix before VPS

| Priority | Finding | Action |
|----------|---------|--------|
| 1 | C4 — lovable-tagger breaks build | Remove import from vite.config.ts |
| 2 | C3 — hardcoded credentials | Use `import.meta.env.*` |
| 3 | C2 — document creation orphan risk | Reorder to upload-first |
| 4 | C1 — dossier creation orphan risk | Surface orphan ID; full fix via DB function |
| 5 | H5 — axios-mock-adapter in prod deps | Move to devDependencies |

### Fix after VPS but before heavy usage

| Priority | Finding | Action |
|----------|---------|--------|
| 6 | H1 — no pagination | Add cursor/offset pagination to all list queries |
| 7 | H3 — client-side chair approval timestamp | DB trigger for server-side timestamp |
| 8 | H2 — non-atomic agenda reorder | DB stored procedure for atomic reorder |
| 9 | M6 — misleading dashboard counts | Use `count: 'exact'` queries |
| 10 | M4 — raw DB error to UI | Generic fallback message |

### Low priority / cleanup

| Priority | Finding | Action |
|----------|---------|--------|
| 11 | M3 — PII in console logs | Remove production console.info/error |
| 12 | M2 — token in UserType | Remove token field |
| 13 | H4 — TypeScript strictness | Enable phased strict mode |
| 14 | M8 — duplicate libraries | Audit and remove unused deps |
| 15 | L1–L6 — low-severity items | As bandwidth permits |

---

## 10. Final Verdict

### READY WITH CONDITIONS

The RVM-AMS system has a solid foundation: correct RLS architecture, proper governance enforcement, immutable audit trail, documented workflows, and a well-structured service layer. The system is functional and secure for the Lovable Cloud environment.

**VPS migration is blocked by:**

1. ~~C4 — lovable-tagger import breaks production build~~ ✅ Fixed in Phase 26A
2. ~~C3 — hardcoded credentials~~ ✅ Fixed in Phase 26A
3. C1 — dossier orphan risk (mitigated in Phase 26A, full fix pending)
4. C2 — document orphan risk (fixed in Phase 26A)
5. H1 — unbounded queries (will cause issues under load; fix before heavy usage)
6. VPS server configuration (nginx, process manager, SSL) — manual setup required

**After completing Phase 26A remediation and VPS server configuration, the system is conditionally ready for migration.**

---

*Report generated by Claude Code independent audit, 2026-03-21*
*No code, schema, policies, or triggers were modified during this audit.*
