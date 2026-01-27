# Audit & Compliance Specification
## AMS – RVM Core (v1)

---

## 1. Document Purpose

This document defines the **audit requirements**, **event types**, **retention policies**, and **compliance verification procedures** for AMS – RVM Core (v1).

**Source Authority:**
- `rls_role_matrix_ams_rvm_core_v_1.md`
- `workflow_diagrams_ams_rvm_core_v_1.md`
- `ams_rvm_core_scope_governance_v_1.md`

**Scope Expansion:** None. Implementation of audit requirements from authoritative documents.

---

## 2. Audit Principles

### 2.1 Core Requirements

1. **Complete Traceability**  
   Every state change must be traceable to an actor, time, and action.

2. **Immutability**  
   Audit records cannot be modified or deleted.

3. **Non-Repudiation**  
   Audit data supports legal accountability.

4. **Accessibility**  
   Authorized auditors can access all audit data.

5. **Performance**  
   Audit logging must not impact system performance.

### 2.2 Legal Alignment

Audit implementation aligns with:
- Reglement van Orde Raad van Ministers (SB 2011 no. 76)
- Resolution on Cabinet Organization Structure (SB 2022 no. 75)

---

## 3. Audit Event Schema

### 3.1 Event Structure

```typescript
interface AuditEvent {
  id: UUID;                    // Unique event ID
  entity_type: string;         // Entity table name
  entity_id: UUID;             // Entity primary key
  event_type: string;          // Action type
  event_payload: Record;       // Change details (JSONB)
  actor_user_id: UUID;         // User who performed action
  actor_role_code: string;     // Role used for action
  occurred_at: Timestamp;      // Event timestamp (UTC)
}
```

### 3.2 Entity Types

| Entity Type | Table Name | Audit Level |
|-------------|------------|-------------|
| `rvm_dossier` | rvm_dossier | Full |
| `rvm_item` | rvm_item | Full |
| `rvm_task` | rvm_task | Full |
| `rvm_meeting` | rvm_meeting | Full |
| `rvm_agenda_item` | rvm_agenda_item | Full |
| `rvm_decision` | rvm_decision | Full (Critical) |
| `rvm_document` | rvm_document | Full |
| `rvm_document_version` | rvm_document_version | Full |
| `app_user` | app_user | Identity events |
| `user_role` | user_role | Role changes |

---

## 4. Event Types

### 4.1 Standard Events

| Event Type | Description | Entities |
|------------|-------------|----------|
| `created` | Entity created | All |
| `updated` | Entity modified | All |
| `deleted` | Entity deleted (if allowed) | Limited |
| `status_changed` | Status field changed | Dossier, Task, Meeting, Decision |
| `assigned` | Ownership assigned | Task |
| `reassigned` | Ownership changed | Task |

### 4.2 Workflow Events

| Event Type | Description | Entities |
|------------|-------------|----------|
| `registered` | Dossier registered | Dossier |
| `scheduled` | Dossier added to agenda | Agenda Item |
| `presented` | Item presented in meeting | Agenda Item |
| `deferred` | Decision deferred | Decision |
| `withdrawn` | Item withdrawn | Agenda Item |

### 4.3 Decision Events (Critical)

| Event Type | Description | Additional Data |
|------------|-------------|-----------------|
| `decision_drafted` | Decision text created | draft_text |
| `decision_updated` | Decision text modified | old_text, new_text |
| `chair_approved` | Chair RVM approval | approved_by, approval_time |
| `decision_finalized` | Decision marked final | is_final = true |

### 4.4 Document Events

| Event Type | Description | Additional Data |
|------------|-------------|-----------------|
| `document_uploaded` | New document created | file_name, file_size |
| `version_created` | New version uploaded | version_number |
| `document_linked` | Linked to decision | decision_id |
| `document_locked` | Locked after finalization | locked_reason |

### 4.5 Access Events

| Event Type | Description | Additional Data |
|------------|-------------|-----------------|
| `user_login` | User authenticated | ip_address, user_agent |
| `user_logout` | User session ended | session_duration |
| `role_assigned` | Role granted to user | role_code |
| `role_revoked` | Role removed from user | role_code |

---

## 5. Event Payload Specifications

### 5.1 Status Change Payload

```json
{
  "field": "status",
  "old_value": "in_preparation",
  "new_value": "scheduled",
  "trigger": "agenda_item_created"
}
```

### 5.2 Decision Approval Payload

```json
{
  "decision_id": "uuid",
  "agenda_item_id": "uuid",
  "dossier_id": "uuid",
  "decision_status": "approved",
  "approved_by_role": "chair_rvm",
  "approval_timestamp": "2024-01-15T10:30:00Z"
}
```

### 5.3 Document Version Payload

```json
{
  "document_id": "uuid",
  "version_number": 2,
  "file_name": "proposal_v2.pdf",
  "file_size": 1048576,
  "uploaded_by": "uuid",
  "previous_version": 1
}
```

---

## 6. Audit Implementation

### 6.1 Trigger-Based Logging (Preferred)

```sql
-- Generic audit trigger function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  event_type TEXT;
  payload JSONB;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type := 'created';
    payload := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    event_type := 'updated';
    payload := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW),
      'changed_fields', (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(OLD) -> key IS DISTINCT FROM value
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    event_type := 'deleted';
    payload := to_jsonb(OLD);
  END IF;

  -- Special handling for status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    event_type := 'status_changed';
  END IF;

  -- Insert audit event
  INSERT INTO audit_event (
    entity_type, entity_id, event_type, event_payload,
    actor_user_id, actor_role_code, occurred_at
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    event_type,
    payload,
    auth.uid(),
    current_setting('app.current_role', true),
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6.2 Entity Trigger Attachment

```sql
-- Attach to all audited tables
CREATE TRIGGER audit_rvm_dossier
  AFTER INSERT OR UPDATE OR DELETE ON rvm_dossier
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_rvm_decision
  AFTER INSERT OR UPDATE OR DELETE ON rvm_decision
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Repeat for all audited entities...
```

---

## 7. Retention Policy

### 7.1 Retention Requirements

| Data Category | Retention Period | Justification |
|---------------|------------------|---------------|
| Decision records | Permanent | Legal requirement |
| Dossier records | Permanent | Legal requirement |
| Audit events | Permanent | Traceability |
| Document versions | Permanent | Version history |
| Session logs | 2 years | Security compliance |

### 7.2 Archive Strategy

- Primary database: Active records (last 5 years)
- Archive: Historical records (older than 5 years)
- No automatic purging of RVM-related data

---

## 8. Access Control

### 8.1 Audit Read Access

| Role | Access Level |
|------|--------------|
| `audit_readonly` | Full read access to all audit data |
| `secretary_rvm` | Full read access to all audit data |
| `rvm_sys_admin` | Full read access to all audit data |
| `chair_rvm` | Read access to decision audit events |
| Other roles | No direct audit access |

### 8.2 Audit Write Access

- **System only** — No user can directly create/modify audit events
- All audit writes are via database triggers
- Edge functions use `SECURITY DEFINER` for audit inserts

---

## 9. Compliance Verification Procedures

### 9.1 Pre-Deployment Verification

| Check | Method | Acceptance |
|-------|--------|------------|
| All entities have audit triggers | Query pg_trigger | 100% coverage |
| Audit table is append-only | Attempt UPDATE/DELETE | Blocked |
| Event payloads are complete | Sample review | All required fields present |
| Actor identification works | Test with multiple roles | Correct actor captured |

### 9.2 Periodic Verification

| Check | Frequency | Method |
|-------|-----------|--------|
| Audit gap analysis | Weekly | Query for entities without recent events |
| Timestamp accuracy | Monthly | Compare with external time source |
| Access log review | Monthly | Review audit_readonly access patterns |
| Decision trail completeness | Per meeting | Verify all decisions have approval events |

### 9.3 Incident Response

1. **Detection:** Automated monitoring for anomalies
2. **Investigation:** Full audit trail review
3. **Reporting:** Incident report with timeline
4. **Remediation:** Policy updates if needed

---

## 10. Audit Reports

### 10.1 Standard Reports

| Report | Frequency | Audience |
|--------|-----------|----------|
| Decision Audit Trail | Per decision | Chair RVM, Audit |
| Dossier Lifecycle Report | On archive | Secretary RVM |
| User Activity Summary | Monthly | rvm_sys_admin |
| Access Anomaly Report | Weekly | rvm_sys_admin |

### 10.2 Report Contents

**Decision Audit Trail:**
- Decision creation timestamp and actor
- All modifications with diffs
- Chair approval event with timestamp
- Finalization event
- Related dossier status changes

---

## 11. Document Status

**Status:** Audit & Compliance Specification v1
**Source Compliance:** 100% aligned with RLS Matrix and Governance docs
**Scope Expansion:** None
**Implementation Status:** NOT STARTED (documentation only)
