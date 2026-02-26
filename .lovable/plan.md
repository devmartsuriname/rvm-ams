

# PHASE 9B — MODAL XL STANDARDIZATION

**Authority:** Devmart Guardian Rules
**Classification:** Zero Business Logic Expansion
**Date:** 2026-02-26

---

## Current State Analysis

| Modal | `size` | `centered` | Header Pattern | Footer Pattern | Grid (`Row g-3`) |
|---|---|---|---|---|---|
| CreateDossierModal | `"lg"` | Yes | `Modal.Title` | Cancel + Primary w/ Spinner | Yes |
| CreateMeetingModal | **(none — default/medium)** | Yes | `Modal.Title` | Cancel + Primary w/ Spinner | Yes |
| CreateTaskModal | `"lg"` | Yes | `Modal.Title` | Cancel + Primary w/ Spinner | Yes |

**Only one change needed:** `CreateMeetingModal` line 60 — add `size="lg"`.

CreateDossierModal and CreateTaskModal already fully conform to the standard. No spacing or layout normalization required — all three use identical `Row className="g-3"` with `Col md={6|12}` patterns, identical footer structure, and identical header structure.

---

## Execution Plan

### Step 1: Create Restore Point
- `Project Restore Points/RP-P9B-pre-modal-standardization.md`

### Step 2: Fix CreateMeetingModal
- **File:** `src/components/rvm/CreateMeetingModal.tsx`
- **Line 60:** Change `<Modal show={show} onHide={handleClose} centered>` to `<Modal show={show} onHide={handleClose} size="lg" centered>`
- This is a single-attribute addition. Zero logic changes.

### Step 3: Verify Dossier and Task Modals
- Both already use `size="lg"`, `centered`, consistent header/footer. No changes needed.

### Step 4: Create Documentation
- `docs/Phase-9B-Modal-Standardization.md` — Standardization report with before/after
- Update `docs/backend.md` — Add Phase 9B status line
- Update `docs/architecture.md` — Add Phase 9B status line

### Step 5: Create Post Restore Point
- `Project Restore Points/RP-P9B-post-modal-standardization.md`

---

## Files Modified (Code)
- `src/components/rvm/CreateMeetingModal.tsx` — Add `size="lg"` prop (1 attribute, 1 line)

## Files Created (Documentation)
- `Project Restore Points/RP-P9B-pre-modal-standardization.md`
- `Project Restore Points/RP-P9B-post-modal-standardization.md`
- `docs/Phase-9B-Modal-Standardization.md`

## Files Updated (Documentation)
- `docs/backend.md`
- `docs/architecture.md`

## Governance Declaration
- Zero validation logic changes
- Zero submit handler changes
- Zero role gating changes
- Zero schema/RLS/trigger changes
- Zero new routes or modules
- Zero scope expansion

