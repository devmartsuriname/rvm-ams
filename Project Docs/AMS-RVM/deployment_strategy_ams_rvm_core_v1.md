# Deployment & Environment Strategy
## AMS – RVM Core (v1)

---

## 1. Document Purpose

This document defines the **environment configuration**, **deployment workflow**, and **backup/recovery procedures** for AMS – RVM Core (v1).

**Source Authority:**
- `system_architecture_ams_rvm_core_v_1.md`
- External Supabase operational model

**Platform:** External Supabase (managed Supabase project)
**Future Deployment Target:** Hostinger VPS (acknowledged, no deployment work in current phases)

**Scope Expansion:** None. Operationalization of deployment assumptions.

---

## 2. Environment Architecture

### 2.1 Environment Types

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| **Test** | Development and testing | Test data only | Development team |
| **Live** | Production serving users | Real data | All authorized users |

### 2.2 Environment Isolation

- **Database:** Separate schemas per environment
- **Storage:** Separate buckets per environment
- **Auth:** Separate user pools per environment
- **Secrets:** Environment-specific secrets

---

## 3. Deployment Model

### 3.1 External Supabase Deployment Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Develop   │ ──► │    Test     │ ──► │   Publish   │
│  (Editor)   │     │  (Preview)  │     │   (Live)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
   Code changes      Verification       Production
   SQL migrations    RLS testing        User access
   UI updates        Data validation    Audit active
```

### 3.2 External Supabase Project Configuration

| Requirement | Description |
|-------------|-------------|
| Project Reference | To be provided by project owner |
| Region | Select based on user location (recommended: closest to Suriname) |
| Supabase URL | `https://<project-ref>.supabase.co` |
| Anon Key | Public API key for frontend |
| Service Role Key | Server-only (never exposed in frontend) |

### 3.3 Environment Variable Strategy

| Environment | Configuration Method | Variables |
|-------------|---------------------|-----------|
| Local Development | `.env.local` (gitignored) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Development/Staging | Supabase project settings | Same as above |
| Production (Hostinger VPS) | VPS environment variables | Same + `SUPABASE_SERVICE_ROLE_KEY` (server-side only) |

### 3.4 Migration Discipline

| Rule | Enforcement |
|------|-------------|
| All schema changes tracked | Versioned SQL files in `/supabase/migrations/` |
| No ad-hoc console-only changes | All production changes via migration files |
| Migration naming | `YYYYMMDDHHMMSS_description.sql` |
| Review requirement | Each migration requires review before execution |
| Rollback preparation | Each migration should have corresponding rollback SQL |

### 3.2 Deployment Phases

| Phase | Environment | Actions |
|-------|-------------|---------|
| Development | Test | Code changes, schema updates |
| Verification | Test | Functional testing, RLS verification |
| Staging Review | Test | Final approval check |
| Publish | Live | Deploy to production |
| Post-Deploy | Live | Monitoring, verification |

---

## 4. Schema Deployment Procedure

### 4.1 New Table Deployment

1. Write SQL in backend design document
2. Deploy to Test environment
3. Verify constraints and RLS
4. Test with sample data
5. Obtain phase approval
6. Publish to Live

### 4.2 Schema Migration Rules

| Change Type | Procedure |
|-------------|-----------|
| New table | Direct deployment |
| New column | Add with default or nullable |
| Column removal | Verify no Live data dependencies first |
| Constraint change | Test with Live data copy |
| Enum modification | Add new values only (never remove) |

### 4.3 Destructive Change Protocol

Before removing columns/tables in Live:
1. Query Live for existing data
2. If data exists, provide migration SQL
3. User runs migration in Cloud View > Run SQL (Live)
4. Verify migration complete
5. Then publish schema change

---

## 5. RLS Deployment

### 5.1 RLS Testing Protocol

1. Deploy policies to Test
2. Create test users for each role
3. Verify positive access (can access what they should)
4. Verify negative access (cannot access what they shouldn't)
5. Document test results
6. Publish to Live

### 5.2 RLS Rollback

If RLS issue detected in Live:
1. Identify affected policies
2. Prepare corrected policies
3. Deploy to Test, verify
4. Publish immediately (security priority)

---

## 6. Backup & Recovery

### 6.1 Automated Backups

| Component | Frequency | Retention |
|-----------|-----------|-----------|
| Database | Daily | 30 days |
| Point-in-time | Continuous | 7 days |
| Storage (documents) | Daily | 30 days |

### 6.2 Manual Backup Triggers

Create manual backup before:
- Major schema changes
- Phase transitions
- Bulk data operations

### 6.3 Recovery Procedures

| Scenario | Procedure |
|----------|-----------|
| Data corruption | Restore from point-in-time |
| Schema rollback | Apply reverse migration |
| Document loss | Restore from storage backup |
| Complete failure | Full environment restore |

---

## 7. Monitoring & Alerts

### 7.1 Health Checks

| Check | Frequency | Alert Threshold |
|-------|-----------|-----------------|
| Database connectivity | 1 min | 2 failures |
| API response time | 1 min | > 2 seconds |
| Storage availability | 5 min | Any failure |
| Auth service | 1 min | Any failure |

### 7.2 Audit Monitoring

| Metric | Alert Condition |
|--------|-----------------|
| Failed auth attempts | > 10 per hour per IP |
| Unusual data access | Outside normal hours |
| RLS policy violations | Any occurrence |
| Audit gap | > 1 hour without events |

---

## 8. Security Configuration

### 8.1 Environment Variables

| Variable | Environment | Description |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | All | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | All | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin access (never exposed) |

### 8.2 Secret Management

- Secrets stored in External Supabase project settings
- Never committed to repository
- Rotated on schedule or incident
- Separate secrets per environment
- Service role key: server-side only (edge functions)

### 8.3 Network Security

- HTTPS only (enforced)
- CORS restricted to allowed origins
- API rate limiting enabled
- Bot protection active

---

## 9. Release Process

### 9.1 Pre-Release Checklist

| Item | Verification |
|------|--------------|
| All phase tasks complete | Execution plan review |
| RLS policies tested | Test results documented |
| Audit logging verified | Sample events checked |
| Backup current | Manual backup created |
| Rollback plan ready | Documented procedure |
| Approval obtained | Phase sign-off |

### 9.2 Release Steps

1. Final Test environment verification
2. Create pre-release backup
3. Publish via Lovable
4. Verify Live deployment
5. Run smoke tests
6. Monitor for 24 hours
7. Document release

### 9.3 Post-Release Verification

| Check | Timing | Method |
|-------|--------|--------|
| Application loads | Immediate | Manual navigation |
| Auth works | Immediate | Login test |
| Data accessible | Immediate | Query test data |
| Audit logging | 1 hour | Verify new events |
| Performance | 24 hours | Response time monitoring |

---

## 10. Rollback Procedure

### 10.1 Decision Criteria

Rollback if:
- Critical functionality broken
- Data corruption detected
- Security vulnerability found
- Unacceptable performance degradation

### 10.2 Rollback Steps

1. Notify stakeholders
2. Identify rollback point
3. Restore database (if needed)
4. Revert code deployment
5. Verify restoration
6. Investigate root cause
7. Document incident

---

## 11. Phase-Specific Deployment Notes

### Phase 1: Foundation
- External Supabase project connection
- Initial schema deployment via SQL migrations
- Auth configuration (email/password)
- Environment variable setup for all environments

### Phase 5: Decision Management (Critical)
- Chair RVM gate must be verified before publish
- Extended testing period required
- Governance approval mandatory

### Phase 8: Final Deployment
- Full system verification
- Compliance documentation
- Go-live readiness review

---

## 12. Document Status

**Status:** Deployment Strategy v1
**Source Compliance:** 100% aligned with System Architecture
**Scope Expansion:** None
**Implementation Status:** NOT STARTED (documentation only)
