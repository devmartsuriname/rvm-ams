-- Phase 26C — Chair Approval Server-Side Timestamp
-- Migration: set_chair_approval_timestamp
--
-- Purpose:
--   Ensures chair_approved_at is set by the database server (using now()) rather than
--   the client's system clock. This closes audit finding H3 from the Phase 25 audit:
--   a user with the chair_rvm role could previously manipulate their system clock to
--   backdate or future-date an approval timestamp.
--
-- Trigger fires BEFORE UPDATE on rvm_decision.
-- Condition: chair_approved_by transitions from NULL to a non-NULL value.
-- Effect: NEW.chair_approved_at is overwritten with now() (server clock, UTC).
--
-- After this migration is deployed, chair_approved_at is removed from the application
-- code in src/services/decisionService.ts — the field must NOT be sent in the UPDATE
-- payload or it will overwrite this trigger's value.
--
-- Compatible with: enforce_chair_approval_gate() (Phase 16 trigger).
--   That trigger checks NEW.chair_approved_at IS NOT NULL before allowing finalization.
--   This trigger ensures the value is always present when chair_approved_by is set,
--   so finalization is never blocked by a missing timestamp.

CREATE OR REPLACE FUNCTION public.set_chair_approval_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Set server-side timestamp when chair approval is first recorded.
  -- Fires when chair_approved_by transitions from NULL to a non-NULL value.
  IF NEW.chair_approved_by IS NOT NULL AND OLD.chair_approved_by IS NULL THEN
    NEW.chair_approved_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_chair_approval_timestamp
  BEFORE UPDATE ON public.rvm_decision
  FOR EACH ROW
  EXECUTE FUNCTION public.set_chair_approval_timestamp();
