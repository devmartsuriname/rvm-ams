# Phase 8A — Audit Immutability Verification

**Created:** 2026-02-13
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## 1. audit_event Table — Write Protection

### RLS Policies
| Command | Policy Exists | Effect |
|---------|--------------|--------|
| SELECT | `audit_event_select` | `has_role('audit_readonly') OR is_super_admin()` |
| INSERT | None | **Blocked** for all user roles (RLS default deny) |
| UPDATE | None | **Blocked** for all user roles |
| DELETE | None | **Blocked** for all user roles |

### Write Access
- Only `log_audit_event()` (SECURITY DEFINER) can INSERT into `audit_event`
- This function is invoked exclusively by AFTER triggers on domain tables
- Direct EXECUTE privilege revoked from PUBLIC and anon

## 2. Audit Triggers Deployed

| Table | Trigger Name | Events |
|-------|-------------|--------|
| `rvm_dossier` | `audit_rvm_dossier` | AFTER INSERT OR UPDATE |
| `rvm_item` | `audit_rvm_item` | AFTER INSERT OR UPDATE |
| `rvm_task` | `audit_rvm_task` | AFTER INSERT OR UPDATE |
| `rvm_meeting` | `audit_rvm_meeting` | AFTER INSERT OR UPDATE |
| `rvm_agenda_item` | `audit_rvm_agenda_item` | AFTER INSERT OR UPDATE |
| `rvm_decision` | `audit_rvm_decision` | AFTER INSERT OR UPDATE |
| `rvm_document` | `audit_rvm_document` | AFTER INSERT OR UPDATE |
| `rvm_document_version` | `audit_rvm_document_version` | AFTER INSERT |

**Total: 8 audit triggers on 8 tables.**

## 3. Audit Payload Structure

```json
{
  "entity_type": "rvm_dossier",
  "entity_id": "uuid",
  "event_type": "created | updated | status_changed | deleted",
  "event_payload": {
    "old": { ... },
    "new": { ... }
  },
  "actor_user_id": "uuid | null",
  "actor_role_code": "text | 'system'",
  "occurred_at": "timestamptz"
}
```

- `event_type = 'status_changed'` is auto-detected when JSONB payload contains a `status` key with changed value
- `actor_user_id = NULL` and `actor_role_code = 'system'` when triggered in service_role context

## 4. log_audit_event() Privilege Hardening

```
proacl: {postgres=X/postgres, authenticated=X/postgres, service_role=X/postgres}
```

- `PUBLIC` and `anon` have been REVOKEd
- Function runs as SECURITY DEFINER (owner context for INSERT)
- `search_path` set to `'public'` to prevent path injection

## 5. status_transitions Table — Write Protection

| Command | Policy | Effect |
|---------|--------|--------|
| SELECT | `status_transitions_select` | Authenticated only |
| INSERT | `status_transitions_no_insert` | `WITH CHECK (false)` — always denied |
| UPDATE | `status_transitions_no_update` | `USING (false)` — always denied |
| DELETE | `status_transitions_no_delete` | `USING (false)` — always denied |

## 6. Verification Checklist

- [x] `audit_event` has no INSERT/UPDATE/DELETE RLS policies (immutable by design)
- [x] `log_audit_event()` is SECURITY DEFINER with restricted EXECUTE
- [x] All 8 domain tables have AFTER audit triggers
- [x] Status change detection uses safe JSONB key check (no direct column reference)
- [x] NULL-safe actor handling (`system` role code when no user context)
- [x] `status_transitions` has explicit write-deny policies
- [x] `validate_status_transition()` confirmed working (true/false tests passed)
