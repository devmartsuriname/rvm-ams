# Phase 8A — Role-Write Matrix Evidence

**Created:** 2026-02-13
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## RLS Write Policies (INSERT/UPDATE)

### rvm_dossier

| Role | INSERT | UPDATE | Conditions |
|------|--------|--------|------------|
| `admin_intake` | ✅ | ❌ | — |
| `secretary_rvm` | ❌ | ✅ | `status NOT IN (decided, archived, cancelled)` |
| `admin_dossier` | ❌ | ✅ | `status NOT IN (decided, archived, cancelled)` |
| `super_admin` | ✅ | ✅ | — |

### rvm_meeting

| Role | INSERT | UPDATE | Conditions |
|------|--------|--------|------------|
| `secretary_rvm` | ✅ | ✅ | `status != closed` |
| `admin_agenda` | ✅ | ✅ | `status != closed` |
| `super_admin` | ✅ | ✅ | — |

### rvm_task

| Role | INSERT | UPDATE | Conditions |
|------|--------|--------|------------|
| `secretary_rvm` | ✅ | ✅ | — |
| `deputy_secretary` | ✅ | ✅ | — |
| Assigned user | ❌ | ✅ | `assigned_user_id = self` |
| `super_admin` | ✅ | ✅ | — |

### rvm_agenda_item

| Role | INSERT | UPDATE | Conditions |
|------|--------|--------|------------|
| `secretary_rvm` | ✅ | ✅ | — |
| `admin_agenda` | ✅ | ✅ | — |
| `super_admin` | ✅ | ✅ | — |

### rvm_decision

| Role | INSERT | UPDATE | Conditions |
|------|--------|--------|------------|
| `secretary_rvm` | ✅ | ✅ | `is_final = false` |
| `admin_reporting` | ✅ | ❌ | — |
| `chair_rvm` | ❌ | ✅ | Approval gate (can set `chair_approved_at/by`, `is_final`) |
| `super_admin` | ✅ | ✅ | — |

### rvm_item

| Role | INSERT | UPDATE | Conditions |
|------|--------|--------|------------|
| `admin_intake` | ✅ | ❌ | Parent dossier NOT locked |
| `secretary_rvm` | ❌ | ✅ | Parent dossier NOT locked |
| `admin_dossier` | ❌ | ✅ | Parent dossier NOT locked |
| `super_admin` | ✅ | ✅ | Parent dossier NOT locked |

### rvm_document

| Role | INSERT | UPDATE | Conditions |
|------|--------|--------|------------|
| `secretary_rvm` | ✅ | ✅ | Parent dossier NOT locked |
| `admin_dossier` | ✅ | ✅ | Parent dossier NOT locked |
| `admin_reporting` | ✅ | ❌ | Parent dossier NOT locked |
| `super_admin` | ✅ | ✅ | Parent dossier NOT locked |

### rvm_document_version

| Role | INSERT | UPDATE | Conditions |
|------|--------|--------|------------|
| `secretary_rvm` | ✅ | ❌ | Decision NOT finalized |
| `admin_dossier` | ✅ | ❌ | Decision NOT finalized |
| `admin_reporting` | ✅ | ❌ | Decision NOT finalized |
| `super_admin` | ✅ | ❌ | Decision NOT finalized |

### audit_event

| Role | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|
| All users | ❌ | ❌ | ❌ |
| `log_audit_event()` (SECURITY DEFINER) | ✅ (via trigger) | ❌ | ❌ |

### status_transitions

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Authenticated | ✅ | ❌ | ❌ | ❌ |
| Anonymous | ❌ | ❌ | ❌ | ❌ |

---

## Workflow Enforcement Triggers

| Entity | Trigger | Guard |
|--------|---------|-------|
| `rvm_dossier` | `enforce_dossier_status_transition` | Valid transitions only via `status_transitions` table |
| `rvm_meeting` | `enforce_meeting_status_transition` | Valid transitions only |
| `rvm_task` | `enforce_task_status_transition` | Valid transitions + `assigned_user_id` required for `in_progress` |
| `rvm_agenda_item` | `enforce_agenda_item_status_transition` | Valid transitions + closed meeting guard |
| `rvm_decision` | `enforce_chair_approval_gate` | `is_final` requires `chair_approved_at` + `chair_approved_by` |
| `rvm_item` | `enforce_dossier_immutability_item` | Blocks if parent dossier locked |
| `rvm_document` | `enforce_dossier_immutability_document` | Blocks if parent dossier locked |
| `rvm_document_version` | `enforce_document_lock_on_decision` | Blocks if linked decision finalized |
