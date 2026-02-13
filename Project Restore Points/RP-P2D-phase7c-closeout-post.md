# Restore Point: RP-P2D-phase7c-closeout-post

## Phase Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 7C Closeout Gate
- **Type:** Post-Change Checkpoint
- **Created:** 2026-02-13
- **Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Changes Applied

### Migration: Tighten `app_user` + Create Directory Function
1. **`app_user_select`** policy tightened to: `auth_id = auth.uid() OR is_super_admin()`
2. **`get_user_directory()`** SECURITY DEFINER function created for admin-only directory lookups

### Security Scan Findings Disposition
| Finding | Level | Disposition |
|---------|-------|------------|
| `app_user` personal data exposed | ERROR | MITIGATED (self-only + directory function) |
| `super_admin_bootstrap` minimal access | WARN | BY DESIGN (implicit denial) |
| `audit_event` sensitive payload | WARN | DEFERRED to Phase 8 |
| `user_role` enumeration | WARN | BY DESIGN (self-read required) |
| `app_role` visible to all | INFO | BY DESIGN (reference data) |
| `missive_keyword` public | INFO | ACCEPTED RISK |
| Leaked Password Protection | INFO | CLOSED (enabled in Dashboard) |

### Current RLS State

#### app_user
| Policy | Command | Expression |
|--------|---------|------------|
| `app_user_select` | SELECT | `auth_id = auth.uid() OR is_super_admin()` |

#### super_admin_bootstrap
| Policy | Command | Expression |
|--------|---------|------------|
| `super_admin_select` | SELECT | `is_super_admin()` |

#### audit_event
| Policy | Command | Expression |
|--------|---------|------------|
| `audit_event_select` | SELECT | `has_role('audit_readonly') OR is_super_admin()` |

### New Database Functions
- `get_user_directory()` → Returns `(id, full_name, email)` for active users, accessible only by secretary_rvm, deputy_secretary, rvm_sys_admin, or super_admin

## Documentation Created
- `docs/security-scan-phase7c.md` — Formal disposition report
- `Project Restore Points/RP-P2D-phase7c-closeout-pre.md` — Pre-change snapshot
- `Project Restore Points/RP-P2D-phase7c-closeout-post.md` — This file

## Phase 7C Status: **COMPLETE** ✅
Phase 8 gate cleared. Ready for Phase 8A: CRUD write flows + workflow enforcement + audit readiness.
