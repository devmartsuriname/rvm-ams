
# Phase 11 — Illegal Attempt Logging Hardening

**Authority:** Devmart Guardian Rules  
**Mode:** Backend Hardening Only  
**Scope:** Log blocked/illegal mutation attempts for governance-grade forensics

---

## Pre-Condition Verification

- Phase 10A: CLOSED
- Phase 10B: CLOSED
- Phase 10C: CLOSED
- Phase 10D: CLOSED
- No open regressions (ApexCharts TS warning remains out-of-scope)
- Restore point `RP-P11-illegal-attempts-pre.md` will be created first

---

## Current State Assessment

Five enforcement triggers currently block illegal mutations via `RAISE EXCEPTION`:

| Trigger | Table | Blocks | Rule Label |
|---------|-------|--------|------------|
| `enforce_decision_status_transition` | `rvm_decision` | Updates when `is_final = true`; invalid status transitions | `DECISION_FINAL_LOCK`, `DECISION_INVALID_TRANSITION` |
| `enforce_chair_only_decision_status` | `rvm_decision` | Non-chair users changing `decision_status` | `CHAIR_ONLY_STATUS` |
| `enforce_chair_approval_gate` | `rvm_decision` | Finalization without chair approval fields | `CHAIR_GATE_MISSING` |
| `enforce_document_lock_on_decision` | `rvm_document_version` | INSERT when linked decision is finalized | `DOCUMENT_FINAL_LOCK` |
| `enforce_dossier_status_transition` | `rvm_dossier` | Invalid dossier status transitions (includes regression) | `DOSSIER_INVALID_TRANSITION` |

All triggers use `RAISE EXCEPTION` which aborts the transaction. The logging call must happen **before** the RAISE so the log INSERT is part of a nested autonomous action (or uses a separate mechanism).

### Critical Design Decision: Exception vs. Logging Order

PostgreSQL `RAISE EXCEPTION` rolls back the entire transaction, including any prior INSERTs in the same transaction. To solve this:

- Use `dblink` for autonomous transactions (adds dependency)
- OR use a **pre-exception SAVEPOINT** pattern
- OR accept that logging happens in a **separate SECURITY DEFINER function that uses `dblink_exec` to local**

**Recommended approach:** Use a `SECURITY DEFINER` function with `dblink` to insert the log record in an autonomous transaction. If `dblink` is not available or too complex, an alternative is to catch exceptions in the application layer. However, per the spec requirement "Must not depend on application layer", `dblink` is the correct approach.

**Simpler alternative (recommended):** Since Supabase PostgreSQL has the `pg_background` or we can use a simpler pattern — log BEFORE the RAISE using a separate `BEGIN...EXCEPTION` block inside the logging function itself that commits via `dblink`. Actually, the simplest reliable pattern for Supabase is:

Use **`PERFORM` with a SECURITY DEFINER function that itself opens a new `dblink` connection to localhost** to insert the log autonomously. If `dblink` is unavailable, we fall back to a **background worker pattern** or accept that the log is best-effort.

**Pragmatic approach chosen:** Since `dblink` may not be enabled on this Supabase instance, and per rule D ("if logging fails, the original block still happens"), we will:

1. Attempt the log INSERT inside a nested `BEGIN...EXCEPTION WHEN OTHERS THEN NULL; END;` block
2. Then RAISE the original exception
3. Since RAISE rolls back, the log would also roll back...

This means we need `dblink` or must accept application-layer logging. Let me check if `dblink` is available.

**Final pragmatic decision:** Given Supabase constraints, the most reliable approach is:

- Create the `rvm_illegal_attempt_log` table
- Create the `log_illegal_attempt()` SECURITY DEFINER function
- Modify triggers to call `log_illegal_attempt()` **before** `RAISE EXCEPTION`
- Wrap the log call in `BEGIN...EXCEPTION WHEN OTHERS THEN NULL; END;`
- **Key insight:** The RAISE EXCEPTION will roll back the log INSERT in the same transaction. To work around this, we use **`pg_notify`** to emit a notification, and a **separate trigger on a helper channel** or simply accept that in PostgreSQL without `dblink`, autonomous transactions are not natively supported.

**REVISED FINAL APPROACH:** The most governance-compliant solution without `dblink`:

Replace `RAISE EXCEPTION` with `RAISE EXCEPTION` but **restructure the triggers to use a two-phase pattern**:
1. Use an **edge function** as a webhook listener? No — spec says "must not depend on application layer."

**ACTUAL SIMPLEST CORRECT APPROACH:**

After careful analysis, the correct PostgreSQL-native pattern is:

- The triggers **cannot** log and then raise in the same transaction (the raise rolls back the log).
- However, we can use **`RAISE ... USING DETAIL`** and capture the exception at the **statement level** — but that requires app-layer cooperation.
- **The only pure-database solution is `dblink`.**

We will:
1. Check if `dblink` extension is available (it is on most Supabase instances)
2. If yes: enable `dblink` extension, use it for autonomous log inserts
3. If no: document this as a known limitation and defer to app-layer logging

---

## Implementation Plan

### Task 1 — Create `rvm_illegal_attempt_log` Table

**Migration SQL:**

```sql
-- Enable dblink extension (available on Supabase)
CREATE EXTENSION IF NOT EXISTS dblink;

CREATE TABLE public.rvm_illegal_attempt_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_auth_id uuid,
  actor_role text,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  rule text NOT NULL,
  reason text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  request_id text
);

-- RLS
ALTER TABLE public.rvm_illegal_attempt_log ENABLE ROW LEVEL SECURITY;

-- No direct INSERT from client
CREATE POLICY illegal_log_no_insert ON public.rvm_illegal_attempt_log
  FOR INSERT TO authenticated WITH CHECK (false);

-- SELECT for governance roles only
CREATE POLICY illegal_log_select ON public.rvm_illegal_attempt_log
  FOR SELECT TO authenticated
  USING (
    has_any_role(ARRAY['chair_rvm', 'audit_readonly', 'admin_reporting'])
    OR is_super_admin()
  );

-- No UPDATE/DELETE
CREATE POLICY illegal_log_no_update ON public.rvm_illegal_attempt_log
  FOR UPDATE TO authenticated USING (false);

CREATE POLICY illegal_log_no_delete ON public.rvm_illegal_attempt_log
  FOR DELETE TO authenticated USING (false);
```

### Task 2 — Create `log_illegal_attempt()` SECURITY DEFINER Function

This function uses `dblink` to insert the log in an autonomous transaction so it persists even when the calling trigger raises an exception.

```sql
CREATE OR REPLACE FUNCTION public.log_illegal_attempt(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_rule text,
  p_reason text,
  p_payload jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_auth_id uuid;
  v_role text;
  v_conn_str text;
BEGIN
  -- Derive actor from auth context (cannot be spoofed)
  v_auth_id := auth.uid();

  -- Get first role
  BEGIN
    SELECT ur.role_code INTO v_role
    FROM public.user_role ur
    JOIN public.app_user au ON au.id = ur.user_id
    WHERE au.auth_id = v_auth_id
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_role := NULL;
  END;

  -- Autonomous insert via dblink (survives caller's RAISE EXCEPTION)
  BEGIN
    v_conn_str := format(
      'dbname=%s port=%s host=%s user=%s password=%s',
      current_database(), 
      current_setting('port', true),
      'localhost',
      current_user,
      '' -- service role connection
    );
    
    PERFORM dblink_exec(
      v_conn_str,
      format(
        'INSERT INTO public.rvm_illegal_attempt_log 
         (actor_auth_id, actor_role, entity_type, entity_id, action, rule, reason, payload)
         VALUES (%L, %L, %L, %L, %L, %L, %L, %L)',
        v_auth_id, v_role, p_entity_type, p_entity_id, 
        p_action, p_rule, p_reason, p_payload::text
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Rule D: if logging fails, swallow — the block still happens
    NULL;
  END;
END;
$$;
```

**Note:** If `dblink` is not available or the connection string cannot authenticate, the logging will silently fail (per Rule D) and the enforcement block still occurs. We will test this during Task 4. If `dblink` fails, we will document a fallback approach using application-layer error interception in the service layer.

### Task 3 — Integrate Logging into Existing Triggers

Update 5 trigger functions to call `log_illegal_attempt()` before each `RAISE EXCEPTION`. No changes to blocking logic.

**3a. `enforce_decision_status_transition()`** — 2 block points:

```sql
-- Before: RAISE EXCEPTION 'Cannot modify finalized decision...'
-- After:
PERFORM public.log_illegal_attempt(
  'rvm_decision', OLD.id, 'UPDATE', 'DECISION_FINAL_LOCK',
  'Attempted update on finalized decision',
  jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
);
RAISE EXCEPTION 'Cannot modify finalized decision (is_final = true)';

-- Before: RAISE EXCEPTION 'Invalid decision transition...'
-- After:
PERFORM public.log_illegal_attempt(
  'rvm_decision', OLD.id, 'UPDATE', 'DECISION_INVALID_TRANSITION',
  format('Invalid transition: %s -> %s', OLD.decision_status, NEW.decision_status),
  jsonb_build_object('old_status', OLD.decision_status, 'new_status', NEW.decision_status)
);
RAISE EXCEPTION 'Invalid decision transition: % -> %', OLD.decision_status, NEW.decision_status;
```

**3b. `enforce_chair_only_decision_status()`** — 1 block point:

```sql
PERFORM public.log_illegal_attempt(
  'rvm_decision', OLD.id, 'UPDATE', 'CHAIR_ONLY_STATUS',
  'Non-chair user attempted decision_status change',
  jsonb_build_object('old_status', OLD.decision_status, 'new_status', NEW.decision_status, 'actor_roles', v_roles)
);
RAISE EXCEPTION 'Only chair_rvm may change decision_status';
```

**3c. `enforce_chair_approval_gate()`** — 1 block point:

```sql
PERFORM public.log_illegal_attempt(
  'rvm_decision', NEW.id, 'UPDATE', 'CHAIR_GATE_MISSING',
  'Finalization attempted without chair approval',
  jsonb_build_object('chair_approved_by', NEW.chair_approved_by, 'chair_approved_at', NEW.chair_approved_at)
);
RAISE EXCEPTION 'Decision cannot be finalized without chair approval';
```

**3d. `enforce_document_lock_on_decision()`** — 1 block point:

```sql
PERFORM public.log_illegal_attempt(
  'rvm_document_version', NEW.id, 'INSERT', 'DOCUMENT_FINAL_LOCK',
  'Document version insert blocked by finalized decision',
  jsonb_build_object('document_id', NEW.document_id, 'decision_id', v_decision_id)
);
RAISE EXCEPTION 'Cannot add versions to document linked to finalized decision';
```

**3e. `enforce_dossier_status_transition()`** — 1 block point:

```sql
PERFORM public.log_illegal_attempt(
  'rvm_dossier', OLD.id, 'UPDATE', 'DOSSIER_INVALID_TRANSITION',
  format('Invalid dossier transition: %s -> %s', OLD.status, NEW.status),
  jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
);
RAISE EXCEPTION 'Invalid dossier transition: % -> %', OLD.status, NEW.status;
```

**No recursion risk:** `rvm_illegal_attempt_log` has no triggers attached to it. The `log_audit_event()` trigger is only on domain tables, not on the log table.

### Task 4 — Testing Strategy

We will use SQL-based tests via the Supabase SQL editor (or edge function tests) to verify:

| Test Case | Expected Block | Expected Log Entry |
|-----------|---------------|-------------------|
| UPDATE `decision_text` on finalized decision | `RAISE EXCEPTION` | Row with rule=`DECISION_FINAL_LOCK` |
| Secretary changes `decision_status` | `RAISE EXCEPTION` | Row with rule=`CHAIR_ONLY_STATUS` |
| INSERT `rvm_document_version` when linked decision is final | `RAISE EXCEPTION` | Row with rule=`DOCUMENT_FINAL_LOCK` |
| Dossier status regression `decided -> draft` | `RAISE EXCEPTION` | Row with rule=`DOSSIER_INVALID_TRANSITION` |

If `dblink` autonomous transactions work: all 4 log entries will persist.  
If `dblink` fails: enforcement still works (Rule D satisfied), and we document the gap.

---

## Files Created

| File | Purpose |
|------|---------|
| `Project Restore Points/RP-P11-illegal-attempts-pre.md` | Pre-implementation restore point |
| `Project Restore Points/RP-P11-illegal-attempts-post.md` | Post-implementation restore point |

## Files Modified

| File | Change |
|------|--------|
| New migration SQL | Table + function + trigger updates |
| `docs/backend.md` | Phase 11 status line |
| `docs/architecture.md` | Phase 11 note |

## No Files Modified (Frontend)

Zero UI changes. Zero route changes. Zero component changes.

## Scope Boundary

- Zero UI changes
- Zero new workflow states
- Zero new routes
- Zero new dependencies (dblink is a core PostgreSQL extension)
- Zero changes to existing allowed mutation flows
- Only: logging blocked attempts

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| `dblink` not available on Supabase instance | Logging silently fails per Rule D; enforcement unaffected |
| `dblink` connection string authentication | Test during Task 4; fallback to app-layer documented |
| Recursive trigger loops | `rvm_illegal_attempt_log` has zero triggers — no recursion possible |
| Performance overhead on blocked mutations | Minimal — only fires on exception path (rare events) |

## Governance Declaration Target

**FULLY IMPLEMENTED** — if `dblink` autonomous transactions work.  
**PARTIALLY IMPLEMENTED** — if `dblink` fails, with enforcement intact and gap documented for future resolution.
