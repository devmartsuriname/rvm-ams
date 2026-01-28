# Phase 6: DMS-Light (Document Management)
## AMS – RVM Core (v1)

---

## 1. Objective

Implement **RVM-supporting document management** including upload, versioning, and linking to dossiers, agenda items, and decisions.

**Note:** This is DMS-Light — supporting RVM workflows only, not a standalone document archive.

---

## 2. Scope — Included

### 2.1 Document Schema
- [ ] `document_type` enum
- [ ] `rvm_document` table
- [ ] `rvm_document_version` table
- [ ] `current_version_id` tracking

### 2.2 Storage
- [ ] `rvm-documents` storage bucket
- [ ] Bucket access policies
- [ ] File upload handling

### 2.3 RLS Policies (Document)
- [ ] Document read policies (role-based)
- [ ] Document create policies
- [ ] Document update policies
- [ ] **Document lock on finalized decisions** (immutability)

### 2.4 Service Layer
- [ ] `documentService.ts` with CRUD + upload operations
- [ ] Version management logic
- [ ] `useDocuments` hook

### 2.5 UI Components
- [ ] Document list (per dossier/decision)
- [ ] Document upload form
- [ ] Version history viewer
- [ ] Document viewer/download

### 2.6 Immutability
- [ ] Documents linked to finalized decisions are locked
- [ ] New versions blocked after decision finalization

---

## 3. Scope — Excluded

- ❌ Standalone DMS workflows
- ❌ External department access
- ❌ Cross-departmental document sharing
- ❌ Cabinet-wide archive functionality
- ❌ OCR or content extraction

---

## 4. Entry Criteria

- [ ] Phase 5 completed and approved
- [ ] **Chair RVM Gate verified**
- [ ] Decision management functional
- [ ] Explicit authorization for Phase 6 received

---

## 5. Exit Criteria

| Criterion | Verification |
|-----------|--------------|
| Document tables exist | Tables with correct structure |
| Storage bucket configured | Bucket accessible with policies |
| Document RLS active | Role-based access enforced |
| Upload functional | Files upload to storage |
| Version control works | New versions increment correctly |
| Document-dossier linking works | Documents attached to dossiers |
| Document-decision linking works | Documents attached to decisions |
| **Finalized decision lock works** | Cannot add versions after finalization |
| All Phase 6 tests pass | Verification checklist complete |

---

## 6. Restore Point Requirement

| Restore Point | Timing | Naming |
|---------------|--------|--------|
| Pre-Phase 6 | Before any Phase 6 work | `RP-P6-pre-YYYYMMDD` |
| Post-Phase 6 | After Phase 6 completion | `RP-P6-post-YYYYMMDD` |

---

## 7. Verification Checklist

### RLS Tests
- [ ] **RLS-DOC-001:** Read access by authorized roles
- [ ] **RLS-DOC-002:** Create access by authorized roles
- [ ] **RLS-DOC-003:** Version creation blocked for finalized decisions

### Immutability Tests
- [ ] **IMMUTABLE-006:** Cannot add version to locked document (linked to finalized decision)

### Functional Tests
- [ ] **DOC-001:** File upload succeeds
- [ ] **DOC-002:** Version history displays correctly
- [ ] **DOC-003:** Document download works

---

## 8. Governance Gate

**Gate Name:** DMS Approval

**Requirements:**
- All verification tests passed
- Post-phase restore point created
- Phase 6 completion report submitted
- Explicit approval for Phase 7 obtained

---

## 9. Task Breakdown

| Task ID | Description | Est. |
|---------|-------------|------|
| P6-001 | Create Document Schema | 2 |
| P6-002 | Configure Storage Bucket | 2 |
| P6-003 | Document RLS Policies | 2 |
| P6-004 | Document Service Layer | 3 |
| P6-005 | Document Hooks | 2 |
| P6-006 | Document List Component | 2 |
| P6-007 | Document Upload Form | 2 |
| P6-008 | Version History Viewer | 2 |
| P6-009 | Document Lock on Finalization | 2 |
| P6-010 | Phase 6 Verification | 1 |

**Total Estimated Points:** 20

---

## 10. Hard Stop Statement

**Phase 6 implementation may NOT proceed until:**
- All Phase 5 exit criteria met
- **Chair RVM Gate verification complete**
- Phase 5 approval confirmed
- Explicit Phase 6 authorization received

---

**Document Status:** Planning Only — Implementation NOT Started
