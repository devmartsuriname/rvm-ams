# Restore Point — Phase 26A Post-Implementation

**Date:** 2026-03-21
**Phase:** 26A — Critical + VPS Blockers Remediation
**Type:** POST-IMPLEMENTATION snapshot
**Author:** Claude Code (Audit + Remediation Agent)

---

## Summary of Changes Applied

All Phase 26A changes have been applied. This restore point documents the final state.

---

## Files Modified

### 1. `src/integrations/supabase/client.ts` — AFTER

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    '[Supabase] Missing environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
    'Ensure your .env file is present and correctly configured. See .env.example for reference.'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

**Change:** Credentials moved from hardcoded strings to `import.meta.env.*` with fail-fast validation.

---

### 2. `vite.config.ts` — AFTER

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

**Change:** `lovable-tagger` import removed. `mode` parameter removed (no longer needed).

---

### 3. `package.json` — AFTER

`lovable-tagger` entry removed from `devDependencies`. All other entries unchanged.

---

### 4. `src/services/documentService.ts` — createDocument() AFTER

New operation order with upload-first and storage cleanup on failure:
1. Pre-generate document UUID (`crypto.randomUUID()`)
2. Upload file to final path `{dossierId}/{docId}/v1/{filename}` — if fails, no DB write, clean failure
3. Insert `rvm_document` with explicit `id: docId` — if fails, remove storage file
4. Insert `rvm_document_version` — if fails, remove storage file
5. Link `current_version_id`

---

### 5. `src/services/dossierService.ts` — createDossier() AFTER

On `rvm_item` insert failure:
```typescript
if (itemError) {
  console.error('[DossierService] rvm_item creation failed. Orphaned dossier ID:', dossier.id, itemError)
  throw new Error(
    `Dossier was created but the supplementary record failed to save. ` +
    `Orphaned dossier ID: ${dossier.id}. ` +
    `Please contact your administrator to resolve this incomplete record.`
  )
}
```

**Change:** Error surfaces the orphaned dossier.id so admins can identify and clean up via Supabase dashboard.

---

## Files Created

| File | Purpose |
|------|---------|
| `docs/restore-points/RP-Phase-26A-pre.md` | Pre-change state documentation |
| `docs/restore-points/RP-Phase-26A-post.md` | This file |
| `.env.example` | VPS deployment environment variable reference |
| `docs/Phase-25-Claude-Code-Audit-Report.md` | Full audit findings from Phase 25 |
| `docs/Phase-26A-Remediation-Report.md` | Phase 26A implementation report |

---

## No Schema/RLS/Trigger Changes

Confirmed: no migrations, no policy changes, no trigger modifications were made in Phase 26A.

---

## State at Restore Point

| Item | Before | After |
|------|--------|-------|
| Supabase credentials | Hardcoded strings | `import.meta.env.*` with fail-fast |
| lovable-tagger | Imported at top-level (build blocker) | Removed |
| Document creation order | DB-first (orphan on upload fail) | Upload-first (storage cleanup on DB fail) |
| Dossier creation error | Generic Supabase error | Explicit orphan ID surfaced |
| .env.example | Missing | Created |

---

## To Revert

See `RP-Phase-26A-pre.md` for the exact BEFORE state of each file.
Replace modified files with pre-change content. Delete `.env.example` if unwanted.
