Phase 8A Revised Plan — Schema-Safe Migration

## Blockers Resolution Summary


| Blocker | Issue                                                                                      | Resolution                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | `log_audit_event()` references `OLD.status`/`NEW.status` on tables without `status` column | Use `to_jsonb(OLD)` and `to_jsonb(NEW)` generically; detect `status` key in JSONB                                                                                     |
| 2       | Actor role lookup table unclear                                                            | Confirmed: `user_role` IS the canonical table (`user_id`, `role_code`). Use existing `get_user_roles()` helper                                                        |
| 3       | Document version lock assumes `rvm_document.decision_id`                                   | Confirmed: `rvm_document` DOES have `decision_id` (nullable uuid). Chain: `rvm_document_version.document_id` -> `rvm_document.decision_id` -> `rvm_decision.is_final` |
| 4       | `validate_status_transition()` uses fragile JSONB/array cast                               | Replace with a `status_transitions` lookup table + `EXISTS` validation                                                                                                |


---

## Schema Proof

### Tables with triggers and referenced columns


| Table                  | Trigger                                 | Columns Referenced                                                                                           | Confirmed |
| ---------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------- |
| `rvm_dossier`          | `enforce_dossier_status_transition`     | `status` (dossier_status enum)                                                                               | Yes       |
| `rvm_dossier`          | `audit_rvm_dossier`                     | `id` (uuid)                                                                                                  | Yes       |
| `rvm_meeting`          | `enforce_meeting_status_transition`     | `status` (meeting_status enum)                                                                               | Yes       |
| `rvm_meeting`          | `audit_rvm_meeting`                     | `id` (uuid)                                                                                                  | Yes       |
| `rvm_task`             | `enforce_task_status_transition`        | `status` (task_status enum), `assigned_user_id` (uuid), `started_at`, `completed_at`                         | Yes       |
| `rvm_task`             | `audit_rvm_task`                        | `id` (uuid)                                                                                                  | Yes       |
| `rvm_agenda_item`      | `enforce_agenda_item_status_transition` | `status` (agenda_item_status enum), `meeting_id` (uuid)                                                      | Yes       |
| `rvm_agenda_item`      | `audit_rvm_agenda_item`                 | `id` (uuid)                                                                                                  | Yes       |
| `rvm_decision`         | `enforce_chair_approval_gate`           | `is_final` (boolean), `chair_approved_at` (timestamptz), `chair_approved_by` (uuid), `agenda_item_id` (uuid) | Yes       |
| `rvm_decision`         | `audit_rvm_decision`                    | `id` (uuid)                                                                                                  | Yes       |
| `rvm_item`             | `enforce_dossier_immutability_item`     | `dossier_id` (uuid)                                                                                          | Yes       |
| `rvm_item`             | `audit_rvm_item`                        | `id` (uuid)                                                                                                  | Yes       |
| `rvm_document`         | `enforce_dossier_immutability_document` | `dossier_id` (uuid)                                                                                          | Yes       |
| `rvm_document`         | `audit_rvm_document`                    | `id` (uuid)                                                                                                  | Yes       |
| `rvm_document_version` | `enforce_document_lock_on_decision`     | `document_id` (uuid) -> `rvm_document.decision_id` -> `rvm_decision.is_final`                                | Yes       |
| `rvm_document_version` | `audit_rvm_document_version`            | `id` (uuid)                                                                                                  | Yes       |


### Enum values confirmed


| Enum                 | Values                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| `dossier_status`     | draft, registered, in_preparation, scheduled, decided, archived, cancelled |
| `meeting_status`     | draft, published, closed                                                   |
| `task_status`        | todo, in_progress, blocked, done, cancelled                                |
| `agenda_item_status` | scheduled, presented, withdrawn, moved                                     |
| `decision_status`    | pending, approved, deferred, rejected                                      |


### Role system confirmed

- Table: `user_role` with columns `user_id` (uuid), `role_code` (text), `assigned_at`
- Existing helper: `get_user_roles()` returns `text[]` for current auth user
- Existing helper: `get_current_user_id()` returns uuid

---

## Revised Migration SQL

### Part 1: Status Transition Table (replaces fragile JSONB approach)

```sql
CREATE TABLE public.status_transitions (
  entity_type TEXT NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  PRIMARY KEY (entity_type, from_status, to_status)
);

-- Dossier transitions
INSERT INTO status_transitions VALUES
  ('dossier','draft','registered'),
  ('dossier','registered','in_preparation'),
  ('dossier','registered','cancelled'),
  ('dossier','in_preparation','scheduled'),
  ('dossier','in_preparation','cancelled'),
  ('dossier','scheduled','decided'),
  ('dossier','scheduled','cancelled'),
  ('dossier','decided','archived');

-- Meeting transitions
INSERT INTO status_transitions VALUES
  ('meeting','draft','published'),
  ('meeting','published','closed');

-- Task transitions
INSERT INTO status_transitions VALUES
  ('task','todo','in_progress'),
  ('task','todo','blocked'),
  ('task','todo','cancelled'),
  ('task','in_progress','done'),
  ('task','in_progress','blocked'),
  ('task','in_progress','cancelled'),
  ('task','blocked','in_progress'),
  ('task','blocked','cancelled');

-- Agenda item transitions
INSERT INTO status_transitions VALUES
  ('agenda_item','scheduled','presented'),
  ('agenda_item','scheduled','withdrawn'),
  ('agenda_item','scheduled','moved'),
  ('agenda_item','presented','withdrawn');

-- RLS: read-only for authenticated, no writes
ALTER TABLE status_transitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY status_transitions_select ON status_transitions
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

### Part 2: Transition Validation Function

```sql
CREATE OR REPLACE FUNCTION public.validate_status_transition(
  p_entity_type TEXT, p_old_status TEXT, p_new_status TEXT
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.status_transitions
    WHERE entity_type = p_entity_type
      AND from_status = p_old_status
      AND to_status = p_new_status
  );
$$;
```

### Part 3: Workflow Enforcement Triggers

Each trigger uses the validated transition table and only references columns confirmed to exist.

**Dossier** -- references: `status` (dossier_status)

```sql
CREATE OR REPLACE FUNCTION enforce_dossier_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT validate_status_transition('dossier', OLD.status::TEXT, NEW.status::TEXT) THEN
      RAISE EXCEPTION 'Invalid dossier transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Meeting** -- references: `status` (meeting_status)

```sql
CREATE OR REPLACE FUNCTION enforce_meeting_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT validate_status_transition('meeting', OLD.status::TEXT, NEW.status::TEXT) THEN
      RAISE EXCEPTION 'Invalid meeting transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Task** -- references: `status` (task_status), `assigned_user_id`, `started_at`, `completed_at`

```sql
CREATE OR REPLACE FUNCTION enforce_task_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT validate_status_transition('task', OLD.status::TEXT, NEW.status::TEXT) THEN
      RAISE EXCEPTION 'Invalid task transition: % -> %', OLD.status, NEW.status;
    END IF;
    IF NEW.status = 'in_progress' THEN
      NEW.started_at := COALESCE(NEW.started_at, now());
    ELSIF NEW.status = 'done' THEN
      NEW.completed_at := COALESCE(NEW.completed_at, now());
    END IF;
  END IF;
  IF NEW.status = 'in_progress' AND NEW.assigned_user_id IS NULL THEN
    RAISE EXCEPTION 'Task cannot be in_progress without assigned_user_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Agenda Item** -- references: `status` (agenda_item_status), `meeting_id`

```sql
CREATE OR REPLACE FUNCTION enforce_agenda_item_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  v_meeting_status meeting_status;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT status INTO v_meeting_status FROM rvm_meeting WHERE id = NEW.meeting_id;
    IF v_meeting_status = 'closed' THEN
      RAISE EXCEPTION 'Cannot modify agenda item in closed meeting';
    END IF;
    IF NOT validate_status_transition('agenda_item', OLD.status::TEXT, NEW.status::TEXT) THEN
      RAISE EXCEPTION 'Invalid agenda item transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Part 4: Chair Approval Gate

References: `is_final`, `chair_approved_at`, `chair_approved_by`, `agenda_item_id` -- all confirmed on `rvm_decision`.

```sql
CREATE OR REPLACE FUNCTION enforce_chair_approval_gate()
RETURNS TRIGGER AS $$
DECLARE
  v_dossier_id uuid;
BEGIN
  IF NEW.is_final = true AND OLD.is_final = false THEN
    IF NEW.chair_approved_at IS NULL OR NEW.chair_approved_by IS NULL THEN
      RAISE EXCEPTION 'Decision cannot be finalized without chair approval';
    END IF;
    -- Cascade: set parent dossier to decided
    SELECT dossier_id INTO v_dossier_id
    FROM rvm_agenda_item WHERE id = NEW.agenda_item_id;
    IF v_dossier_id IS NOT NULL THEN
      UPDATE rvm_dossier SET status = 'decided', updated_at = now()
      WHERE id = v_dossier_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Part 5: Dossier Immutability Guard

References: `dossier_id` -- confirmed on both `rvm_item` and `rvm_document`.

```sql
CREATE OR REPLACE FUNCTION enforce_dossier_immutability()
RETURNS TRIGGER AS $$
DECLARE
  v_status dossier_status;
BEGIN
  SELECT status INTO v_status FROM rvm_dossier WHERE id = NEW.dossier_id;
  IF v_status IN ('decided', 'archived', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot modify entities in locked dossier (status: %)', v_status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Part 6: Document Version Lock

Chain confirmed: `rvm_document_version.document_id` -> `rvm_document.decision_id` (nullable) -> `rvm_decision.is_final`.

```sql
CREATE OR REPLACE FUNCTION enforce_document_lock_on_decision()
RETURNS TRIGGER AS $$
DECLARE
  v_decision_id uuid;
  v_is_final boolean;
BEGIN
  SELECT decision_id INTO v_decision_id
  FROM rvm_document WHERE id = NEW.document_id;

  IF v_decision_id IS NOT NULL THEN
    SELECT is_final INTO v_is_final
    FROM rvm_decision WHERE id = v_decision_id;
    IF v_is_final = true THEN
      RAISE EXCEPTION 'Cannot add versions to document linked to finalized decision';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Part 7: Generic Audit Logging (Schema-Safe)

Uses `to_jsonb()` generically. Detects `status` via JSONB key check -- never references `OLD.status` directly.

```sql
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_payload JSONB;
  v_user_id uuid;
  v_role_code TEXT;
  v_old_json JSONB;
  v_new_json JSONB;
BEGIN
  v_user_id := public.get_current_user_id();

  -- Get first role code from canonical user_role table
  SELECT ur.role_code INTO v_role_code
  FROM public.user_role ur
  WHERE ur.user_id = v_user_id
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    v_event_type := 'created';
    v_payload := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);
    -- Detect status change via JSONB key (safe for all tables)
    IF (v_old_json ? 'status') AND (v_new_json ? 'status')
       AND (v_old_json->>'status') IS DISTINCT FROM (v_new_json->>'status') THEN
      v_event_type := 'status_changed';
    ELSE
      v_event_type := 'updated';
    END IF;
    v_payload := jsonb_build_object('old', v_old_json, 'new', v_new_json);
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'deleted';
    v_payload := to_jsonb(OLD);
  END IF;

  INSERT INTO public.audit_event (
    entity_type, entity_id, event_type, event_payload,
    actor_user_id, actor_role_code, occurred_at
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_event_type,
    v_payload,
    v_user_id,
    v_role_code,
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';
```

### Part 8: Attach All Triggers

```text
BEFORE UPDATE triggers (workflow enforcement):
  rvm_dossier       -> enforce_dossier_status_transition()
  rvm_meeting       -> enforce_meeting_status_transition()
  rvm_task          -> enforce_task_status_transition()
  rvm_agenda_item   -> enforce_agenda_item_status_transition()
  rvm_decision      -> enforce_chair_approval_gate()

BEFORE INSERT OR UPDATE triggers (immutability):
  rvm_item          -> enforce_dossier_immutability()
  rvm_document      -> enforce_dossier_immutability()

BEFORE INSERT trigger (lock):
  rvm_document_version -> enforce_document_lock_on_decision()

AFTER INSERT OR UPDATE triggers (audit):
  rvm_dossier, rvm_item, rvm_task, rvm_meeting,
  rvm_agenda_item, rvm_decision, rvm_document -> log_audit_event()

AFTER INSERT trigger (audit):
  rvm_document_version -> log_audit_event()
```

### Part 9: Privilege Hardening

```sql
-- status_transitions: read-only reference data
-- No INSERT/UPDATE/DELETE policies = blocked for all non-service_role

-- log_audit_event: SECURITY DEFINER, restrict EXECUTE
REVOKE ALL ON FUNCTION log_audit_event() FROM PUBLIC;
REVOKE ALL ON FUNCTION log_audit_event() FROM anon;
-- Note: trigger functions are invoked by the trigger system,
-- not directly by users, so no GRANT needed
```

---

## Deliverables


| #   | Deliverable                                     | File                                                                  |
| --- | ----------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Pre-restore point                               | `Project Restore Points/RP-P8A-pre-20260213.md`                       |
| 2   | Migration script (single file, all parts above) | `supabase/migrations/20260213HHMMSS_phase8a_workflow_enforcement.sql` |
| 3   | Role-write matrix evidence                      | `docs/phase8a_role_write_matrix.md`                                   |
| 4   | Audit immutability verification                 | `docs/phase8a_audit_immutability_verification.md`                     |
| 5   | Post-restore point                              | `Project Restore Points/RP-P8A-post-20260213.md`                      |
| 6   | Updated backend docs                            | `docs/security-scan-phase7c.md` (add Phase 8A controls reference)     |


## No Frontend Changes

The only app_user query is the self-lookup in `useAuthContext.tsx`. No service layer changes are required for Phase 8A -- the triggers enforce rules at the database level. Service layer write helpers will be added in Phase 8B when CRUD UI is built.

## Post-Implementation Verification

1. Insert a dossier -> verify `audit_event` row created with `entity_type = 'rvm_dossier'`, `event_type = 'created'`
2. Update dossier `draft` -> `registered` -> verify success + audit event with `status_changed`
3. Update dossier `draft` -> `decided` -> verify EXCEPTION raised (invalid transition)
4. Finalize decision without chair approval -> verify EXCEPTION raised
5. Insert item into decided dossier -> verify EXCEPTION raised
6. Verify `audit_event` has no INSERT/UPDATE/DELETE policies (immutable)  
  
**Make audit resilient when** `get_current_user_id()` **is NULL**
  - In `log_audit_event()`, if `v_user_id` is NULL (service role or unexpected context), set:
    - `actor_user_id = NULL`
    - `actor_role_code = 'system'` (or NULL)  
    This prevents hard failures and preserves audit continuity.
7. **Explicitly ensure status_transitions is write-locked**
  - Add explicit policies to block writes (belt-and-suspenders), or at minimum:
    - confirm no INSERT/UPDATE/DELETE policies exist for authenticated.  
    Since RLS default is deny, it’s likely fine, but we want **explicit audit-ready proof**.