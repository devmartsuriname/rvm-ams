# Restore Point: RP-P2D-phase7c-closeout-pre

## Phase Reference
- **Project:** AMS–RVM Core (v1)
- **Phase:** 7C Closeout Gate
- **Type:** Pre-Change Checkpoint
- **Created:** 2026-02-13
- **Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Security Scan Findings (Pre-Change)

| Finding | Level | Internal ID | Current State |
|---------|-------|-------------|---------------|
| User Email Addresses and Personal Data Exposed | ERROR | `app_user_table_public_exposure` | `auth_id = auth.uid() OR has_any_role([secretary_rvm, deputy_secretary, rvm_sys_admin]) OR is_super_admin()` |
| Super Admin Bootstrap Minimal Access Control | WARN | `super_admin_bootstrap_limited_protection` | `is_super_admin()` SELECT only; no INSERT/UPDATE/DELETE policies |

## Current RLS Policies

### app_user
| Policy | Command | Expression |
|--------|---------|------------|
| `app_user_select` | SELECT | `auth_id = auth.uid() OR has_any_role(['secretary_rvm','deputy_secretary','rvm_sys_admin']) OR is_super_admin()` |
| (none) | INSERT | Blocked |
| (none) | UPDATE | Blocked |
| (none) | DELETE | Blocked |

### super_admin_bootstrap
| Policy | Command | Expression |
|--------|---------|------------|
| `super_admin_select` | SELECT | `is_super_admin()` |
| (none) | INSERT | Blocked |
| (none) | UPDATE | Blocked |
| (none) | DELETE | Blocked |

### audit_event
| Policy | Command | Expression |
|--------|---------|------------|
| `audit_event_select` | SELECT | `has_role('audit_readonly') OR is_super_admin()` |
| (none) | INSERT | Blocked (service_role only) |
| (none) | UPDATE | Blocked (service_role only) |
| (none) | DELETE | Blocked (service_role only) |

## Deployed Domains
- Preview: `https://id-preview--05409e90-adea-494b-a980-374b142fbf8b.lovable.app`
- Published: `https://rvmams.lovable.app`

## Rollback Instructions
If issues occur after migration:
1. Drop `get_user_directory()` function
2. Restore `app_user_select` policy to include `has_any_role()` check
3. Re-run security scan to verify rollback
