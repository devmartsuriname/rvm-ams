# Plan: Re-apply Phase 26 Git Changes in Lovable

Strict parity sync of 5 code changes. Documentation and restore points are **blocked** pending exact Git content.

---

## Changes to Apply

### 1. Supabase client — env var migration + fail-fast

**File:** `src/integrations/supabase/client.ts`

- Replace hardcoded URL and key with `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`
- Add fail-fast validation: throw if either variable is missing
- **Deviation risk:** File is Lovable-managed ("automatically generated"). May be overwritten on Supabase sync. Will be reported.

### 2. Remove lovable-tagger

**File:** `vite.config.ts` — Remove `import { componentTagger } from "lovable-tagger"` and its usage in plugins array
**File:** `package.json` line 105 — Remove `"lovable-tagger": "^1.1.11"` from devDependencies

### 3. Add `.env.example`

**File:** `.env.example` (new) — Placeholder variable names only:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

### 4. Document service — storage cleanup on failure

**File:** `src/services/documentService.ts`

- **createDocument** (around line 104): If version insert fails, call `supabase.storage.from('rvm-documents').remove([storagePath])` before throwing
- **uploadNewVersion** (around line 167): Same pattern — clean up uploaded file if version record creation fails

### 5. Dossier service — orphan rollback

**File:** `src/services/dossierService.ts`

- **createDossier** (line 116–120): When `rvm_item` insert fails, attempt `supabase.from('rvm_dossier').delete().eq('id', dossier.id)` before throwing. Best-effort with error logging (RLS may block delete).

---

## Blocked Items — STOP AND REPORT

### 6. Phase 25/26 documentation files

- `docs/Phase-25-Claude-Audit-Report.md`
- `docs/Phase-26-Remediation-Report.md`

**Status: BLOCKED.** Exact Git content is not available in the Lovable environment. Per governance correction, no stubs or inferred versions will be created.

### 7. Phase 26 restore points

- `Project Restore Points/RP-P26-remediation-pre.md`
- `Project Restore Points/RP-P26-remediation-post.md`

**Status: BLOCKED.** Same reason. Exact Git content required.

---

## Summary


| #   | File                                  | Action                        | Status      |
| --- | ------------------------------------- | ----------------------------- | ----------- |
| 1   | `src/integrations/supabase/client.ts` | Env var migration + fail-fast | Ready       |
| 2a  | `vite.config.ts`                      | Remove tagger import/usage    | Ready       |
| 2b  | `package.json`                        | Remove tagger dependency      | Ready       |
| 3   | `.env.example`                        | Create with placeholders      | Ready       |
| 4   | `src/services/documentService.ts`     | Storage cleanup on failure    | Ready       |
| 5   | `src/services/dossierService.ts`      | Orphan dossier rollback       | Ready       |
| 6   | `docs/Phase-25-*`, `docs/Phase-26-*`  | Exact Git copy                | **BLOCKED** |
| 7   | `Project Restore Points/RP-P26-*`     | Exact Git copy                | **BLOCKED** |


**Total: 6 files modified/created, 4 files blocked pending exact Git content**  
  
NOTE — PHASE COMPLETION CONDITION

Items 6 and 7 (documentation and restore points) remain mandatory for Phase 26 completion.

Phase 26 is NOT considered fully complete until:

- Exact Git versions of these files are applied in Lovable

- Audit trail is fully restored

Current execution is limited to code parity only.

**Required user action for items 6–7:** Provide exact file content from Git, or confirm these should be skipped for now.