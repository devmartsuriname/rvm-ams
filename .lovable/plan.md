# Plan: Phase 26 Baseline Lock & Documentation Update

## What

Update `docs/architecture.md` and `docs/backend.md` to reflect Phase 26 closure, including summaries of all applied changes and the official baseline lock declaration.

## Changes

### 1. `docs/architecture.md`

**Line 3** — Update timestamp:

```
**Last Updated:** 2026-03-22 (Phase 26 Complete — Remediation & Baseline Lock)
```

**Line 54** — Append Phase 26 to Phase Completion Status paragraph:

```
**Phase 26 (Remediation & Baseline Lock) CLOSED** — Supabase client migrated to environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) with fail-fast validation. `lovable-tagger` removed from dependencies and Vite config. Document service hardened with storage cleanup on failed version inserts. Dossier service hardened with orphan rollback on failed `rvm_item` creation. `.env.example` added. See `docs/Phase-25-Claude-Audit-Report.md` and `docs/Phase-26-Remediation-Report.md`.
```

**After line 158** — Add new section:

```markdown
### Phase 26 — Remediation & Baseline Lock

- Environment variable migration: Supabase URL and anon key read from `import.meta.env` with fail-fast on missing values
- `lovable-tagger` fully removed (devDependency + Vite plugin)
- Document service: storage file cleanup on failed version record insert (both create and upload-new-version paths)
- Dossier service: orphan dossier rollback on failed `rvm_item` insert (best-effort, RLS-aware)
- `.env.example` added with required variable placeholders
- Governance artifacts: Phase 25 Claude Audit Report, Phase 26 Remediation Report, restore points RP-P26-pre/post

See [Phase 25 Claude Audit Report](Phase-25-Claude-Audit-Report.md) and [Phase 26 Remediation Report](Phase-26-Remediation-Report.md).

---

## Phase 26 Baseline

**This version is the official stable baseline for the AMS-RVM system.**

Future changes must not break:
- **Environment configuration** — Supabase credentials must remain environment-variable-driven with fail-fast validation. No hardcoded URLs or keys.
- **Rollback logic** — Document storage cleanup and dossier orphan rollback patterns must be preserved in all service layer mutations.
- **Audit chain** — The append-only audit trail, immutability triggers, illegal attempt logging, and governance enforcement triggers must remain intact and unmodified.
```

### 2. `docs/backend.md`

**Line 3** — Update timestamp:

```
**Last Updated:** 2026-03-22 (Phase 26 Complete — Remediation & Baseline Lock)
```

**After line 47** — Add Phase 26 row to the phase table:

```
| 26 | Remediation & Baseline Lock — Env var migration (fail-fast), lovable-tagger removal, document storage cleanup on failure, dossier orphan rollback, `.env.example`. See [Claude Audit Report](Phase-25-Claude-Audit-Report.md), [Remediation Report](Phase-26-Remediation-Report.md) | CLOSED |
```

**After line 209** (end of file) — Add new section:

```markdown

## Phase 26 — Remediation & Baseline Lock (CLOSED)

### Changes Applied

| Change | File | Description |
|--------|------|-------------|
| Env var migration | `src/integrations/supabase/client.ts` | Supabase URL/key from `import.meta.env` with fail-fast |
| Tagger removal | `vite.config.ts`, `package.json` | `lovable-tagger` fully removed |
| Storage cleanup | `src/services/documentService.ts` | Failed version insert triggers storage file removal |
| Orphan rollback | `src/services/dossierService.ts` | Failed `rvm_item` insert triggers dossier delete (best-effort) |
| Env template | `.env.example` | Variable placeholders for deployment |

### Governance Artifacts

- `docs/Phase-25-Claude-Audit-Report.md` — Full codebase audit by Claude Code
- `docs/Phase-26-Remediation-Report.md` — Remediation execution report
- `Project Restore Points/RP-P26-remediation-pre.md`
- `Project Restore Points/RP-P26-remediation-post.md`

---

## Phase 26 Baseline

**This version is the official stable baseline for the AMS-RVM system.**

Future changes must not break:
- **Environment configuration** — Supabase credentials must remain environment-variable-driven with fail-fast validation. No hardcoded URLs or keys.
- **Rollback logic** — Document storage cleanup and dossier orphan rollback patterns must be preserved in all service layer mutations.
- **Audit chain** — The append-only audit trail, immutability triggers, illegal attempt logging, and governance enforcement triggers must remain intact and unmodified.
```

## Summary


| #   | File                   | Action                                                                                           |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | `docs/architecture.md` | Update timestamp, add Phase 26 to completion status, add Phase 26 section + Baseline declaration |
| 2   | `docs/backend.md`      | Update timestamp, add Phase 26 row, add Phase 26 section + Baseline declaration                  |


**Total: 2 files updated, 0 code changes**  
  
NOTE — DOCUMENT INTEGRITY

When updating documentation:

- Do NOT duplicate existing Phase 26 sections

- Do NOT overwrite unrelated content

- Append only in the specified locations

- Preserve existing formatting and structure

If structure conflict is detected:

- STOP and report instead of modifying layout