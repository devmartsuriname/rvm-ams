
# Phase 0 — Project Initialization & Context Lock

## Executive Summary

This plan establishes the authoritative documentation baseline for **AMS – RVM Core (v1)** by creating the required folder structure and placing all 7 governance documents exactly as provided. No code changes, no implementation, no planning beyond file operations.

---

## Objective

Lock the project context by placing the 7 authoritative markdown files into the repository as the single source of truth for all subsequent phases.

---

## Folder Structure to Create

```text
/Project Docs/
  └── AMS-RVM/
        ├── README.md (to be created)
        ├── ams_rvm_core_scope_governance_v_1.md
        ├── ams_rvm_bestuurlijke_validatievragen_definitive_short.md
        ├── prd_ams_rvm_core_v_1.md
        ├── system_architecture_ams_rvm_core_v_1.md
        ├── erd_ams_rvm_core_v_1.md
        ├── rls_role_matrix_ams_rvm_core_v_1.md
        └── workflow_diagrams_ams_rvm_core_v_1.md
```

---

## Files to be Created (8 total)

### 1. Folder README

**Path:** `Project Docs/AMS-RVM/README.md`

**Content:**
```text
# AMS – RVM Core (v1) — Authoritative Documentation

This folder contains the **7 authoritative documents** for AMS – RVM Core v1.

## Scope Lock
- **RVM-only.** No VP workflow outside the Chair RVM role as defined.
- No other Cabinet departments or directorates.

## Execution Model
- Documentation-first, phase-gated.
- No implementation may proceed without explicit phase authorization.

## Change Control
- Any modification to these documents requires explicit new phase authorization.
- These documents are the **single source of truth** for all design and implementation.

## Document List
1. ams_rvm_core_scope_governance_v_1.md
2. ams_rvm_bestuurlijke_validatievragen_definitive_short.md
3. prd_ams_rvm_core_v_1.md
4. system_architecture_ams_rvm_core_v_1.md
5. erd_ams_rvm_core_v_1.md
6. rls_role_matrix_ams_rvm_core_v_1.md
7. workflow_diagrams_ams_rvm_core_v_1.md
```

### 2-8. The 7 Authoritative Documents

Each document will be copied from `user-uploads://` to `Project Docs/AMS-RVM/` with:
- **Exact filename preservation**
- **Exact content preservation** (no edits, no formatting changes)

| # | Source File | Target Path |
|---|-------------|-------------|
| 1 | `user-uploads://ams_rvm_core_scope_governance_v_1.md` | `Project Docs/AMS-RVM/ams_rvm_core_scope_governance_v_1.md` |
| 2 | `user-uploads://ams_rvm_bestuurlijke_validatievragen_definitive_short.md` | `Project Docs/AMS-RVM/ams_rvm_bestuurlijke_validatievragen_definitive_short.md` |
| 3 | `user-uploads://prd_ams_rvm_core_v_1.md` | `Project Docs/AMS-RVM/prd_ams_rvm_core_v_1.md` |
| 4 | `user-uploads://system_architecture_ams_rvm_core_v_1.md` | `Project Docs/AMS-RVM/system_architecture_ams_rvm_core_v_1.md` |
| 5 | `user-uploads://erd_ams_rvm_core_v_1.md` | `Project Docs/AMS-RVM/erd_ams_rvm_core_v_1.md` |
| 6 | `user-uploads://rls_role_matrix_ams_rvm_core_v_1.md` | `Project Docs/AMS-RVM/rls_role_matrix_ams_rvm_core_v_1.md` |
| 7 | `user-uploads://workflow_diagrams_ams_rvm_core_v_1.md` | `Project Docs/AMS-RVM/workflow_diagrams_ams_rvm_core_v_1.md` |

---

## What Will NOT Be Done

- No code generation
- No UI changes
- No refactors
- No schema, RLS, or Supabase work
- No planning or task breakdown
- No assumptions beyond the 7 documents
- Phase 1 will NOT be started

---

## Post-Execution Deliverable

After completion, a Phase 0 completion report will confirm:
- Folder `/Project Docs/AMS-RVM/` exists
- 7/7 authoritative documents placed with exact paths
- README.md created
- Explicit statement: "No other changes were made. Phase 1 not started."

---

## Governance Compliance

| Rule | Status |
|------|--------|
| Devmart Hard Governance | Active |
| Guardian Rules | Active |
| Documentation-first | Enforced |
| Phase-gated execution | Enforced |
| /src as application root | Unchanged |
| Darkone 1:1 parity | Preserved |
