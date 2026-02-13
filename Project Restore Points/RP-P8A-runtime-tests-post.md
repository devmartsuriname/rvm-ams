# Restore Point: RP-P8A-runtime-tests-post

**Created:** 2026-02-13  
**Phase:** 8A Runtime Verification — Post-Test  
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Test Execution Summary

| Test | Result |
|------|--------|
| TEST 1: Audit event on dossier create | ✅ PASS |
| TEST 2: Invalid transition blocked | ✅ PASS |
| TEST 3: Chair approval gate | ✅ PASS |
| TEST 4: Dossier immutability | ✅ PASS |

## Bug Fixed During Testing

`log_audit_event()` fallback `actor_role_code` changed from `'system'` (not in `app_role`) to `NULL` (nullable FK satisfied).

## Database State After Tests

| Table | Row Count |
|-------|-----------|
| audit_event | 9 |
| rvm_dossier | 1 |
| rvm_meeting | 1 |
| rvm_agenda_item | 1 |
| rvm_decision | 1 |
| rvm_item | 0 |
| app_user | 1 |

## Transient Record IDs

| Table | ID |
|-------|-----|
| rvm_dossier | 2b77a338-207f-4d67-bd9a-f3aedb99dde0 |
| rvm_meeting | 39a6aa8e-42ed-42ef-ab9b-db5f3ff4a88b |
| rvm_agenda_item | 19af8e18-4b83-43f9-b1d0-6d75c28f2542 |
| rvm_decision | 518ff6c0-c487-4010-89a8-739ab4ff8db5 |

## Edge Function

`phase8a-runtime-tests` was created for test execution and has been deleted post-test.

## Rollback

No schema changes were made (only a function body fix to `log_audit_event()`). Transient records serve as evidence and should not be deleted.
